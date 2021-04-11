#ifndef SCENE_VIEW_H
#define SCENE_VIEW_H

#include "scene.cpp"

template <typename... ComponentTypes>
struct SceneView
{
    Scene *pScene = nullptr;
    ComponentMask componentMask;
    bool all = false;
    std::vector<Scene::EntityInfo> *entities = nullptr;

    SceneView(Scene &scene, bool clientSide = false)
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
            ComponentID componentIds[] = {0, GetId<ComponentTypes>()...};
            for (int i = 1; i < (sizeof...(ComponentTypes) + 1); i++)
                componentMask.set(componentIds[i]);
        }
    }

    struct Iterator
    {
        Iterator(Scene *pScene, EntityIndex index, ComponentMask mask, bool all, std::vector<Scene::EntityInfo> *entities)
        {
            this->pScene = pScene;
            this->index = index;
            this->mask = mask;
            this->all = all;
            this->entities = entities;
        }

        EntityID operator*() const
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
                IsEntityIdValid((*entities)[index].id) &&
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

        EntityIndex index;
        Scene *pScene;
        ComponentMask mask;
        bool all = false;
        std::vector<Scene::EntityInfo> *entities;
    };

    const Iterator begin() const
    {
        int firstIndex = 0;
        while (firstIndex < (*entities).size() &&
               (componentMask != (componentMask & (*entities)[firstIndex].compMask) || !IsEntityIdValid((*entities)[firstIndex].id)))
        {
            firstIndex++;
        }
        return Iterator(pScene, firstIndex, componentMask, all, entities);
    }

    const Iterator end() const
    {
        return Iterator(pScene, EntityIndex((*entities).size()), componentMask, all, entities);
    }
};

#endif