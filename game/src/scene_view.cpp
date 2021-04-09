#ifndef SCENE_VIEW_H
#define SCENE_VIEW_H

#include "scene.cpp"

template <typename... ComponentTypes>
struct SceneView
{
    World::Scene *pScene{nullptr};
    World::ComponentMask componentMask;
    bool all{false};

    SceneView(World::Scene &scene) : pScene(&scene)
    {
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
        Iterator(World::Scene *pScene, World::EntityIndex index, World::ComponentMask mask, bool all)
            : pScene(pScene), index(index), mask(mask), all(all) {}

        World::EntityID operator*() const
        {
            return pScene->entities[index].id;
        }

        bool operator==(const Iterator &other) const
        {
            return index == other.index || index == pScene->entities.size();
        }

        bool operator!=(const Iterator &other) const
        {
            return index != other.index && index != pScene->entities.size();
        }

        bool ValidIndex()
        {
            return
                // It's a valid entity ID
                World::IsEntityValid(pScene->entities[index].id) &&
                // It has the correct component mask
                (all || mask == (mask & pScene->entities[index].mask));
        }

        Iterator &operator++()
        {
            do
            {
                index++;
            } while (index < pScene->entities.size() && !ValidIndex());
            return *this;
        }

        World::EntityIndex index;
        World::Scene *pScene;
        World::ComponentMask mask;
        bool all{false};
    };

    const Iterator begin() const
    {
        int firstIndex = 0;
        while (firstIndex < pScene->entities.size() &&
               (componentMask != (componentMask & pScene->entities[firstIndex].mask) || !World::IsEntityValid(pScene->entities[firstIndex].id)))
        {
            firstIndex++;
        }
        return Iterator(pScene, firstIndex, componentMask, all);
    }

    const Iterator end() const
    {
        return Iterator(pScene, World::EntityIndex(pScene->entities.size()), componentMask, all);
    }
};

#endif