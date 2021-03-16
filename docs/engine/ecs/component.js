import { EntityManager } from "./entity.js";
export class IComponentData {
}
export const Component = (constructor) => {
    constructor.index = EntityManager.numComponents++;
};
