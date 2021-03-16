import { EntityManager } from "./entity.js";
import { Type } from "../util.js";

export class IComponentData {
}

export const Component = (constructor: Type<IComponentData>) => {
    (constructor as any).index = EntityManager.numComponents++;
}
