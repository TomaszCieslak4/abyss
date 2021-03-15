import { IComponentData } from "../component.js";
import { EntityManager } from "./entity.js";
import { Type } from "../util.js";

export class IJob {
    public execute(index: number, ...args: IComponentData[]): void { }

    public schedule() {
        // if (this.constructor.name === "SpriteRendererJob")
        //     // @ts-ignore
        //     console.log("DEPENDENCIES", EntityManager.getComponents(this.constructor.dependencies));
        // @ts-ignore
        let dependencies = EntityManager.getComponents(this.constructor.dependencies);
        if (dependencies.length === 0) return;
        for (let i = 0; i < dependencies[0].length; i++) {
            this.execute(i, ...dependencies);
        }
    }
}

export const Job = (...args: Type<IComponentData>[]) => {
    return (target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor) => {
        target.constructor.dependencies = args;
    }
}
