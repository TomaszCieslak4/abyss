import { SceneManager } from "../sceneManager.js";
export class EntityManager {
    static getComponents(dependencies) {
        var _a, _b, _c;
        let entities = new Map();
        for (const dep of dependencies) {
            for (const comp of (_a = EntityManager.components.get(dep.name)) !== null && _a !== void 0 ? _a : []) {
                entities.set(comp[0], ((_b = entities.get(comp[0])) !== null && _b !== void 0 ? _b : 0) + 1);
            }
        }
        let output = [];
        for (const dep of dependencies) {
            let temp = [];
            for (const comp of (_c = EntityManager.components.get(dep.name)) !== null && _c !== void 0 ? _c : []) {
                if (entities.get(comp[0]) === dependencies.length) {
                    temp.push(comp[1]);
                }
            }
            output.push(temp);
        }
        return output;
    }
    static createEntity() {
        return EntityManager.entityInd++;
    }
    static addComponent(entity, component) {
        let components = EntityManager.components.get(component.name);
        if (!components) {
            components = [];
            EntityManager.components.set(component.name, components);
        }
        components.push([entity, new component()]);
    }
    static setComponentData(entity, component) {
        let components = EntityManager.components.get(component.constructor.name);
        if (!components)
            return;
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
    static registerComponentSystem(system) {
        EntityManager.systems.push(system);
    }
}
EntityManager.systems = [];
EntityManager.entityInd = 0;
EntityManager.components = new Map();
