import { EntityManager } from "./entity.js";
export class IJob {
    execute(index, ...args) { }
    schedule() {
        // if (this.constructor.name === "SpriteRendererJob")
        //     // @ts-ignore
        //     console.log("DEPENDENCIES", EntityManager.getComponents(this.constructor.dependencies));
        // @ts-ignore
        let dependencies = EntityManager.getComponents(this.constructor.dependencies);
        if (dependencies.length === 0)
            return;
        for (let i = 0; i < dependencies[0].length; i++) {
            this.execute(i, ...dependencies);
        }
    }
}
export const Job = (...args) => {
    return (target, propertyKey, descriptor) => {
        target.constructor.dependencies = args;
    };
};
