#ifndef SCENE_VIEW_H
#define SCENE_VIEW_H

#include "scene.cpp"

template <typename... ComponentTypes>
struct SceneView
{
    World::Scene *pScene = nullptr;
    World::ComponentMask componentMask;
    bool all = false;
    std::vector<World::Scene::EntityDesc> *entities = nullptr;

    SceneView(World::Scene &scene, bool clientSide = false)
    {
        this->pScene = &scene;
        this->entities = clientSide ? &scene.clientEntities : &scene.networkedEntities;

        if (sizeof...(ComponentTypes) == 0)
        {
            all = true;
        }
        else
        {
            // Unpack the template parameters into an initializer list
            World::ComponentID componentIds[] = {0, World::GetId<ComponentTypes>()...};
            for (int i = 1; i < (sizeof...(ComponentTypes) + 1); i++)
                componentMask.set(componentIds[i]);
        }
    }

    struct Iterator
    {
        Iterator(World::Scene *pScene, World::EntityIndex index, World::ComponentMask mask, bool all, std::vector<World::Scene::EntityDesc> *entities)
        {
            this->pScene = pScene;
            this->index = index;
            this->mask = mask;
            this->all = all;
            this->entities = entities;
        }

        World::EntityID operator*() const
        {
            return (*entities)[index].id;
        }

        bool operator==(const Iterator &other) const
        {
            return index == other.index || index == (*entities).size();
        }

        bool operator!=(const Iterator &other) const
        {
            return index != other.index && index != (*entities).size();
        }

        bool ValidIndex()
        {
            return
                // It's a valid entity ID
                World::IsEntityIdValid((*entities)[index].id) &&
                // It has the correct component mask
                (all || mask == (mask & (*entities)[index].compMask));
        }

        Iterator &operator++()
        {
            do
            {
                index++;
            } while (index < (*entities).size() && !ValidIndex());
            return *this;
        }

        World::EntityIndex index;
        World::Scene *pScene;
        World::ComponentMask mask;
        bool all = false;
        std::vector<World::Scene::EntityDesc> *entities;
    };

    const Iterator begin() const
    {
        int firstIndex = 0;
        while (firstIndex < (*entities).size() &&
               (componentMask != (componentMask & (*entities)[firstIndex].compMask) || !World::IsEntityIdValid((*entities)[firstIndex].id)))
        {
            firstIndex++;
        }
        return Iterator(pScene, firstIndex, componentMask, all, entities);
    }

    const Iterator end() const
    {
        return Iterator(pScene, World::EntityIndex((*entities).size()), componentMask, all, entities);
    }
};

#endif