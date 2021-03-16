export class EntityManager {
    // static getComponents(dependencies: Type<IComponentData>[]) {
    //     let entities = new Map<EntityID, number>();
    //     for (const dep of dependencies) {
    //         for (const comp of EntityManager.components.get(dep.name) ?? []) {
    //             entities.set(comp[0], (entities.get(comp[0]) ?? 0) + 1);
    //         }
    //     }
    //     let output: IComponentData[][] = [];
    //     for (const dep of dependencies) {
    //         let temp: IComponentData[] = [];
    //         for (const comp of EntityManager.components.get(dep.name) ?? []) {
    //             if (entities.get(comp[0])! === dependencies.length) {
    //                 temp.push(comp[1]);
    //             }
    //         }
    //         output.push(temp);
    //     }
    //     return output;
    // }
    static *getEntitiesWithComponents(components) {
        let mask = [];
        for (let i = 0; i < EntityManager.numComponents >> 5; i++) {
            mask.push(0);
        }
        for (const comp of components) {
            mask[(comp.index >> 5)] |= 1 << (comp.index % 32);
        }
        for (let i = 0; i < EntityManager.entities.length; i++) {
            if (EntityManager.entities[i][0] === -1)
                continue;
            let valid = true;
            for (let j = 0; j < mask.length; j++) {
                if ((EntityManager.entities[i][2 + j] & mask[j]) != mask[j]) {
                    valid = false;
                    break;
                }
            }
            if (!valid)
                continue;
            yield { index: i, version: EntityManager.entities[i][1] };
        }
    }
    static getComponents(component) {
        if (EntityManager.components.length <= component.index)
            return [];
        return EntityManager.components[component.index];
    }
    // static createEntity(): EntityID {
    //     return EntityManager.entityInd++;
    // }
    // static addComponent(entity: EntityID, component: Type<IComponentData>) {
    //     let components = EntityManager.components.get(component.name);
    //     if (!components) {
    //         components = []
    //         EntityManager.components.set(component.name, components);
    //     }
    //     components.push([entity, new component()]);
    // }
    static isValidEntity(entity) {
        return entity.index > -1 && entity.index < EntityManager.entities.length &&
            EntityManager.entities[entity.index][1] === entity.version &&
            EntityManager.entities[entity.index][0] === entity.index;
    }
    static addComponent(entity, component) {
        if (!EntityManager.isValidEntity(entity))
            return false;
        // Set component BitField bit
        EntityManager.entities[entity.index][2 + (component.index >> 5)] |= 1 << (component.index % 32);
        // Extend components array to fit component
        while (EntityManager.components.length <= component.index) {
            EntityManager.components.push([]);
        }
        // Extend components array to fit entity
        while (EntityManager.components[component.index].length <= entity.index) {
            EntityManager.components[component.index].push(null);
        }
        EntityManager.components[component.index][entity.index] = new component();
        return true;
    }
    static createEntity() {
        if (EntityManager.freeEntities.length > 0) {
            let index = EntityManager.freeEntities.pop();
            // Reset component BitField
            for (let i = 0; i < EntityManager.numComponents >> 5; i++) {
                EntityManager.entities[index][2 + i] = 0;
            }
            return { index: EntityManager.entities[index][0] = index, version: ++EntityManager.entities[index][1] };
        }
        let index = EntityManager.entities.length;
        // Setup component BitField
        let temp = [index, 0];
        for (let i = 0; i < EntityManager.numComponents >> 5; i++) {
            temp.push(0);
        }
        EntityManager.entities.push(temp);
        return { index: index, version: 0 };
    }
    static destroyEntity(entity) {
        if (!EntityManager.isValidEntity(entity))
            return false;
        EntityManager.freeEntities.push(entity.index);
        EntityManager.entities[entity.index][0] = -1;
        return true;
    }
    static hasComponent(entity, component) {
        return EntityManager.isValidEntity(entity) &&
            ((EntityManager.entities[entity.index][2 + (component.index >> 5)] &
                (1 << (component.index % 32))) !== 0);
    }
    static setComponentData(entity, component) {
        // Check for valid component and entity
        if (!EntityManager.hasComponent(entity, component.constructor))
            return false;
        EntityManager.components[component.constructor.index][entity.index] = component;
        return true;
    }
    static getComponent(entity, component) {
        // Check for valid component and entity
        if (!EntityManager.hasComponent(entity, component))
            return null;
        return EntityManager.components[component.index][entity.index];
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
    static registerComponentSystem(system) {
        EntityManager.systems.push(system);
    }
    static isSameEntity(entity, other) {
        return entity.index === other.index && entity.version === other.version;
    }
}
EntityManager.numComponents = 0;
EntityManager.systems = [];
// private static entityInd: number = 0;
// public static components: Map<string, [EntityID, IComponentData][]> = new Map();
EntityManager.freeEntities = [];
EntityManager.entities = []; // id, version, BitField...
EntityManager.components = [];
