import { IComponentData } from "../component.js";
import { IComponentSystem } from "./componentSystem.js";
import { SceneManager } from "../sceneManager.js";
import { Type } from "../util.js";

export type EntityID = number;

export class EntityManager {
    private static systems: IComponentSystem[] = [];
    private static entityInd: number = 0;
    public static components: Map<string, [EntityID, IComponentData][]> = new Map();

    static getComponents(dependencies: Type<IComponentData>[]) {
        let entities = new Map<EntityID, number>();

        for (const dep of dependencies) {
            for (const comp of EntityManager.components.get(dep.name) ?? []) {
                entities.set(comp[0], (entities.get(comp[0]) ?? 0) + 1);
            }
        }

        let output: IComponentData[][] = [];

        for (const dep of dependencies) {
            let temp: IComponentData[] = [];
            for (const comp of EntityManager.components.get(dep.name) ?? []) {
                if (entities.get(comp[0])! === dependencies.length) {
                    temp.push(comp[1]);
                }
            }
            output.push(temp);
        }

        return output;
    }

    static createEntity(): EntityID {
        return EntityManager.entityInd++;
    }

    static addComponent(entity: EntityID, component: Type<IComponentData>) {
        let components = EntityManager.components.get(component.name);
        if (!components) {
            components = []
            EntityManager.components.set(component.name, components);
        }
        components.push([entity, new component()]);
    }

    static setComponentData(entity: EntityID, component: IComponentData) {
        let components = EntityManager.components.get(component.constructor.name);
        if (!components) return;

        for (let i = 0; i < components.length; i++) {
            if (components[i][0] === entity) {
                components[i][1] = component;
                break;
            }
        }
    }

    static update() {
        for (const system of EntityManager.systems) {
            system.onUpdate();
        }
    }

    static fixedUpdate() {
        for (const system of EntityManager.systems) {
            system.onFixedUpdate();
        }
    }

    static draw() {
        SceneManager.context.clearRect(0, 0, SceneManager.width, SceneManager.height);
        for (const system of EntityManager.systems) {
            system.onDraw();
        }
    }

    static registerComponentSystem(system: IComponentSystem) {
        EntityManager.systems.push(system);
    }
}
