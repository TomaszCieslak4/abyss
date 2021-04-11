#ifndef SCENE_H
#define SCENE_H

#include <bitset>
#include <vector>
#include "network.cpp"
#include <iostream>

typedef unsigned int EntityIndex;
typedef unsigned int EntityVersion;
typedef unsigned long long EntityID;
typedef unsigned int ComponentID;

constexpr int MAX_COMPONENTS = 32;
constexpr int MAX_ENTITIES = 3000;
constexpr int MAX_CLIENT_SIDE_ENTITIES = 100;
constexpr EntityID ROOT_ENTITY = 0;

typedef std::bitset<MAX_COMPONENTS> ComponentMask;

#define INVALID_ENTITY CreateEntityId(EntityIndex(-1), 0)

template <class T>
constexpr ComponentID GetId()
{
    return T::id;
}
inline bool IsClientEntity(EntityID id) { return (id >> 32) >= MAX_ENTITIES; }
inline EntityID CreateEntityId(EntityIndex index, EntityVersion version) { return ((EntityID)index << 32) | ((EntityID)version); }
inline EntityIndex GetEntityIndex(EntityID id) { return IsClientEntity(id) ? (id >> 32) - MAX_ENTITIES : id >> 32; }
inline EntityIndex GetEntityComponentIndex(EntityID id) { return id >> 32; }
inline EntityVersion GetEntityVersion(EntityID id) { return (EntityVersion)id; }
inline bool IsEntityIdValid(EntityID id) { return (id >> 32) != EntityIndex(-1); }

struct ComponentData
{
    ComponentData(size_t elementsize)
    {
        elementSize = elementsize;
        pData = new char[elementSize * MAX_ENTITIES * MAX_CLIENT_SIDE_ENTITIES];
    }

    ~ComponentData()
    {
        delete[] pData;
    }

    inline void *get(size_t index) { return pData + index * elementSize; }

    char *pData{nullptr};
    size_t elementSize{0};
};

struct Scene
{
    struct EntityInfo
    {
        EntityID id;
        ComponentMask compMask;
        ComponentMask dirtyMask;
        ComponentMask updateMask;
    };

    std::vector<EntityInfo> networkedEntities;
    std::vector<EntityInfo> clientEntities;
    std::vector<EntityIndex> freeClientEntities;
    std::vector<EntityIndex> freeNetworkedEntities;
    std::vector<ComponentData *> componentPools;

    template <typename T>
    T *Get(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return nullptr;
        T *pComponent = static_cast<T *>(componentPools[componentId]->get(GetEntityComponentIndex(id)));
        return pComponent;
    }

    void *Get(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return nullptr;
        return componentPools[componentId]->get(GetEntityComponentIndex(id));
    }

    template <typename T>
    void Remove(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if ((*entities)[GetEntityIndex(id)].id != id) return; // Deleted
        ComponentID componentId = GetId<T>();
        (*entities)[GetEntityIndex(id)].compMask.reset(componentId);

#ifdef SERVER
        if (!IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, componentId | (NetworkOp::destroy << 30));
        }
#endif
    }

    void Remove(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if ((*entities)[GetEntityIndex(id)].id != id) return; // Deleted
        (*entities)[GetEntityIndex(id)].compMask.reset(componentId);
    }

    template <typename T>
    void SetClean(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return;
        (*entities)[GetEntityIndex(id)].dirtyMask.reset(componentId);
    }

    void SetClean(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return;
        (*entities)[GetEntityIndex(id)].dirtyMask.reset(componentId);
    }

    template <typename T>
    T *DirtyGet(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return nullptr;
        (*entities)[GetEntityIndex(id)].dirtyMask.set(componentId);
        return static_cast<T *>(componentPools[componentId]->get(GetEntityComponentIndex(id)));
    }

    void *DirtyGet(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return nullptr;
        (*entities)[GetEntityIndex(id)].dirtyMask.set(componentId);
        return componentPools[componentId]->get(GetEntityComponentIndex(id));
    }

    template <typename T>
    bool IsDirty(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return false;
        return (*entities)[GetEntityIndex(id)].dirtyMask.test(componentId);
    }

    bool IsDirty(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return false;
        return (*entities)[GetEntityIndex(id)].dirtyMask.test(componentId);
    }

    template <typename T>
    bool IsSendingUpdates(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        ComponentID componentId = GetId<T>();
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return false;
        return (*entities)[GetEntityIndex(id)].updateMask.test(componentId);
    }

    bool IsSendingUpdates(EntityID id, ComponentID componentId)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        if (!(*entities)[GetEntityIndex(id)].compMask.test(componentId)) return false;
        return (*entities)[GetEntityIndex(id)].updateMask.test(componentId);
    }

    template <typename T>
    void Assign(EntityID id, bool sendUpdates = true)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;

        ComponentID componentId = GetId<T>();

        if (componentPools.size() <= componentId)
            componentPools.resize(componentId + 1, nullptr);

        if (componentPools[componentId] == nullptr)
            componentPools[componentId] = new ComponentData(sizeof(T));

        T *pComponent = new (componentPools[componentId]->get(GetEntityComponentIndex(id))) T();

        (*entities)[GetEntityIndex(id)].compMask.set(componentId);

        if (sendUpdates)
            (*entities)[GetEntityIndex(id)].updateMask.set(componentId);

#ifdef SERVER
        if (!IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, componentId | (NetworkOp::create << 30));
        }
#endif
    }

    template <typename T>
    T *DirtyAssign(EntityID id, bool sendUpdates = true)
    {
        Assign<T>(id, sendUpdates);
        return DirtyGet<T>(id);
    }

    size_t GetComponentSize(ComponentID componentId)
    {
        return componentPools[componentId]->elementSize;
    }

    void DestroyEntity(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
        std::vector<EntityIndex> *freeEntities = IsClientEntity(id) ? &freeClientEntities : &freeNetworkedEntities;
        EntityID newID = CreateEntityId(EntityIndex(-1), GetEntityVersion(id) + 1);
        (*entities)[GetEntityIndex(id)].id = newID;
        (*entities)[GetEntityIndex(id)].compMask.reset();
        (*entities)[GetEntityIndex(id)].dirtyMask.reset();
        (*entities)[GetEntityIndex(id)].updateMask.reset();
        (*freeEntities).push_back(GetEntityIndex(id));

#ifdef SERVER
        if (!IsClientEntity(id))
        {
            bufferInsert<EntityID>(outBuffer, id);
            bufferInsert<ComponentID>(outBuffer, 0 | (NetworkOp::destroy << 30));
        }
#endif
    }

    EntityID NewEntity(EntityID id)
    {
        std::vector<EntityInfo> *entities = IsClientEntity(id) ? &clientEntities : &networkedEntities;
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
        std::vector<EntityInfo> *entities = clientSide ? &clientEntities : &networkedEntities;
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

#endif