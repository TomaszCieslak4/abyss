#ifndef SCENE_H
#define SCENE_H

#include <bitset>
#include <vector>
#include "network.cpp"

namespace World
{
constexpr int MAX_COMPONENTS = 32;
constexpr int MAX_ENTITIES = 3000;
constexpr int MAX_CLIENT_SIDE_ENTITIES = 10;

typedef unsigned int EntityIndex;
typedef unsigned int EntityVersion;
typedef unsigned long long EntityID;
typedef unsigned int ComponentID;
typedef std::bitset<MAX_COMPONENTS> ComponentMask;

#define INVALID_ENTITY World::CreateEntityId(World::EntityIndex(-1), 0)

constexpr EntityID ROOT_ENTITY = 0;

template <class T>
constexpr World::ComponentID GetId() { return T::id; }

inline EntityID CreateEntityId(EntityIndex index, EntityVersion version) { return ((EntityID)index << 32) | ((EntityID)version); }
inline EntityIndex GetEntityIndex(EntityID id) { return id >> 32; }
inline EntityVersion GetEntityVersion(EntityID id) { return (EntityVersion)id; }
inline bool IsEntityValid(EntityID id) { return (id >> 32) != EntityIndex(-1); }

struct ComponentPool
{
    ComponentPool(size_t elementsize)
    {
        elementSize = elementsize;
        pData = new char[elementSize * MAX_ENTITIES * MAX_CLIENT_SIDE_ENTITIES];
    }

    ~ComponentPool()
    {
        delete[] pData;
    }

    inline void *get(size_t index) { return pData + index * elementSize; }

    char *pData{nullptr};
    size_t elementSize{0};
};

struct Scene
{
    struct EntityDesc
    {
        EntityID id;
        ComponentMask mask;
    };

    std::vector<EntityDesc> entities;
    std::vector<EntityIndex> freeEntities;
    // std::vector<std::vector<uint8_t>> componentData;
    std::vector<ComponentPool *> componentPools;

    template <typename T>
    T *Get(EntityID id)
    {
        ComponentID componentId = GetId<T>();
        if (!entities[GetEntityIndex(id)].mask.test(componentId))
            return nullptr;

        T *pComponent = static_cast<T *>(componentPools[componentId]->get(GetEntityIndex(id)));
        return pComponent;
    }

    void *Get(EntityID id, ComponentID componentId)
    {
        if (!entities[GetEntityIndex(id)].mask.test(componentId))
            return nullptr;

        return componentPools[componentId]->get(GetEntityIndex(id));
    }

    template <typename T>
    void Remove(EntityID id)
    {
        // ensures you're not accessing an entity that has been deleted
        if (entities[GetEntityIndex(id)].id != id)
            return;

        ComponentID componentId = GetId<T>();
        entities[GetEntityIndex(id)].mask.reset(componentId);

#ifdef SERVER
        reinterpret_cast<EntityID &>(packets[packetsSize]) = id;
        packetsSize += sizeof(EntityID);

        reinterpret_cast<ComponentID &>(packets[packetsSize]) = componentId | (NetworkOp::destroy << 30);
        packetsSize += sizeof(ComponentID);
#endif
    }

    void Remove(EntityID id, ComponentID componentId)
    {
        // ensures you're not accessing an entity that has been deleted
        if (entities[GetEntityIndex(id)].id != id)
            return;

        entities[GetEntityIndex(id)].mask.reset(componentId);
    }

    template <typename T>
    T *Assign(EntityID id)
    {
        ComponentID componentId = GetId<T>();

        if (componentPools.size() <= componentId) // Not enough component pool
        {
            componentPools.resize(componentId + 1, nullptr);
        }
        if (componentPools[componentId] == nullptr) // New component, make a new pool
        {
            componentPools[componentId] = new ComponentPool(sizeof(T));
        }

        // Looks up the component in the pool, and initializes it with placement new
        T *pComponent = new (componentPools[componentId]->get(GetEntityIndex(id))) T();

        // Set the bit for this component to true and return the created component
        entities[GetEntityIndex(id)].mask.set(componentId);

#ifdef SERVER
        reinterpret_cast<EntityID &>(packets[packetsSize]) = id;
        packetsSize += sizeof(EntityID);

        reinterpret_cast<ComponentID &>(packets[packetsSize]) = componentId | (NetworkOp::create << 30);
        packetsSize += sizeof(ComponentID);
#endif

        return pComponent;
    }

    size_t GetComponentSize(ComponentID componentId)
    {
        return componentPools[componentId]->elementSize;
    }

    EntityID NewEntity(EntityID id)
    {
        EntityIndex ind = GetEntityIndex(id);

        if (ind >= entities.size())
        {
            entities.resize(ind + 1, {INVALID_ENTITY, ComponentMask()});
        }

        entities[ind].id = id;
        return id;
    }

    void DestroyEntity(EntityID id)
    {
        EntityID newID = CreateEntityId(EntityIndex(-1), GetEntityVersion(id) + 1);
        entities[GetEntityIndex(id)].id = newID;
        entities[GetEntityIndex(id)].mask.reset();
        freeEntities.push_back(GetEntityIndex(id));

#ifdef SERVER
        reinterpret_cast<EntityID &>(packets[packetsSize]) = id;
        packetsSize += sizeof(EntityID);

        reinterpret_cast<ComponentID &>(packets[packetsSize]) = 0 | (NetworkOp::destroy << 30);
        packetsSize += sizeof(ComponentID);
#endif
    }

    EntityID NewEntity(bool clientSide = false)
    {
#ifndef SERVER
        clientSide = true;
#endif

        if (!freeEntities.empty())
        {
            EntityIndex newIndex = freeEntities.back();
            freeEntities.pop_back();
            EntityID newID = CreateEntityId(newIndex, GetEntityVersion(entities[newIndex].id));
            entities[newIndex].id = newID;
            return entities[newIndex].id;
        }
        entities.push_back({CreateEntityId(EntityIndex(entities.size()), 0), ComponentMask()});
        EntityID newId = entities.back().id;

#ifdef SERVER
        reinterpret_cast<EntityID &>(packets[packetsSize]) = newId;
        packetsSize += sizeof(EntityID);

        reinterpret_cast<ComponentID &>(packets[packetsSize]) = 0 | (NetworkOp::create << 30);
        packetsSize += sizeof(ComponentID);
#endif
        return newId;
    }
};

} // namespace World

#endif