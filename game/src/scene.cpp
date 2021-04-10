#ifndef SCENE_H
#define SCENE_H

#include <bitset>
#include <vector>
#include "network.cpp"
#include <iostream>
namespace World
{
constexpr int MAX_COMPONENTS = 32;
constexpr int MAX_ENTITIES = 3000;
constexpr int MAX_CLIENT_SIDE_ENTITIES = 100;

typedef unsigned int EntityIndex;
typedef unsigned int EntityVersion;
typedef unsigned long long EntityID;
typedef unsigned int ComponentID;
typedef std::bitset<MAX_COMPONENTS> ComponentMask;

#define INVALID_ENTITY World::CreateEntityId(World::EntityIndex(-1), 0)

constexpr EntityID ROOT_ENTITY = 0;

template <class T>
constexpr World::ComponentID GetId() { return T::id; }

inline bool IsClientEntity(EntityID id) { return (id >> 32) >= MAX_ENTITIES; }
inline EntityID CreateEntityId(EntityIndex index, EntityVersion version) { return ((EntityID)index << 32) | ((EntityID)version); }
inline EntityIndex GetEntityIndex(EntityID id) { return IsClientEntity(id) ? (id >> 32) - MAX_ENTITIES : id >> 32; }
inline EntityIndex GetEntityComponentIndex(EntityID id) { return id >> 32; }
inline EntityVersion GetEntityVersion(EntityID id) { return (EntityVersion)id; }
inline bool IsEntityIdValid(EntityID id) { return (id >> 32) != EntityIndex(-1); }

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

    std::vector<EntityDesc> networkedEntities;
    std::vector<EntityDesc> clientEntities;
    std::vector<EntityIndex> freeClientEntities;
    std::vector<EntityIndex> freeNetworkedEntities;
    std::vector<ComponentPool *> componentPools;

    template <typename T>
    T *Get(EntityID id)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].mask.test(componentId)) return nullptr;
        T *pComponent = static_cast<T *>(componentPools[componentId]->get(GetEntityComponentIndex(id)));
        return pComponent;
    }

    void *Get(EntityID id, ComponentID componentId)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].mask.test(componentId)) return nullptr;
        return componentPools[componentId]->get(GetEntityComponentIndex(id));
    }

    template <typename T>
    void Remove(EntityID id)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if ((*entities)[GetEntityIndex(id)].id != id) return; // Deleted
        ComponentID componentId = GetId<T>();
        (*entities)[GetEntityIndex(id)].mask.reset(componentId);

#ifdef SERVER
        if (!World::IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, componentId | (NetworkOp::destroy << 30));
        }
#endif
    }

    void Remove(EntityID id, ComponentID componentId)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if ((*entities)[GetEntityIndex(id)].id != id) return; // Deleted
        (*entities)[GetEntityIndex(id)].mask.reset(componentId);
    }

    template <typename T>
    T *Assign(EntityID id)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;

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
        T *pComponent = new (componentPools[componentId]->get(GetEntityComponentIndex(id))) T();

        // Set the bit for this component to true and return the created component
        (*entities)[GetEntityIndex(id)].mask.set(componentId);

#ifdef SERVER
        if (!World::IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, componentId | (NetworkOp::create << 30));
        }
#endif

        return pComponent;
    }

    size_t GetComponentSize(ComponentID componentId)
    {
        return componentPools[componentId]->elementSize;
    }

    void DestroyEntity(EntityID id)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        std::vector<EntityIndex> *freeEntities = World::IsClientEntity(id) ? &freeClientEntities : &freeNetworkedEntities;
        EntityID newID = CreateEntityId(EntityIndex(-1), GetEntityVersion(id) + 1);
        (*entities)[GetEntityIndex(id)].id = newID;
        (*entities)[GetEntityIndex(id)].mask.reset();
        (*freeEntities).push_back(GetEntityIndex(id));

#ifdef SERVER
        if (!World::IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, 0 | (NetworkOp::destroy << 30));
        }
#endif
    }

    EntityID NewEntity(EntityID id)
    {
        std::vector<EntityDesc> *entities = World::IsClientEntity(id) ? &clientEntities : &networkedEntities;
        EntityIndex ind = GetEntityIndex(id);

        if (ind >= (*entities).size())
            (*entities).resize(ind + 1, {INVALID_ENTITY, ComponentMask()});

        (*entities)[ind].id = id;
        return id;
    }

    EntityID NewEntity(bool clientSide = false)
    {
#ifndef SERVER
        clientSide = true;
#endif
        std::vector<EntityDesc> *entities = clientSide ? &clientEntities : &networkedEntities;
        std::vector<EntityIndex> *freeEntities = clientSide ? &freeClientEntities : &freeNetworkedEntities;

        if (!(*freeEntities).empty())
        {
            EntityIndex newIndex = (*freeEntities).back();
            (*freeEntities).pop_back();
            EntityID newID = CreateEntityId(clientSide ? newIndex + MAX_ENTITIES : newIndex, GetEntityVersion((*entities)[newIndex].id));
            (*entities)[newIndex].id = newID;

#ifdef SERVER
            if (!clientSide)
            {
                bufferInsert<EntityID>(outBuffer, newID);
                bufferInsert<ComponentID>(outBuffer, 0 | (NetworkOp::create << 30));
            }
#endif

            return (*entities)[newIndex].id;
        }

        EntityIndex ind = EntityIndex((*entities).size());
        if (clientSide) ind += MAX_ENTITIES;
        (*entities).push_back({CreateEntityId(ind, 0), ComponentMask()});
        EntityID newId = (*entities).back().id;

#ifdef SERVER
        if (!clientSide)
        {
            bufferInsert<EntityID>(outBuffer, newId);
            bufferInsert<ComponentID>(outBuffer, 0 | (NetworkOp::create << 30));
        }
#endif
        return newId;
    }
};

} // namespace World

#endif