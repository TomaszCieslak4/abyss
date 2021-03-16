import { IComponentData } from "./component.js";
import { EntityID, EntityManager } from "./entity.js";
import { Type } from "../util.js";

export class IJob {
    protected execute(): void { }

    // Main thread
    public run() {
        this.execute();
    }

    // Single worker thread
    public schedule() {
        this.execute();
    }

    // Multiple worker thread
    public scheduleParallel() {
        this.execute();
    }
}

export class IJobFor {
    protected execute(index: number): void { }

    // Main thread
    public run(iterations: number) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i)
        }
    }

    // Single worker thread
    public schedule(iterations: number) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i)
        }
    }

    // Multiple worker thread
    public scheduleParallel(iterations: number) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i)
        }
    }
}

export class IJobForEach {
    protected execute(...args: IComponentData[]): void { }

    // Main thread
    public run() {
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(...components);
        }
    }

    // Single worker thread
    public schedule() {
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(...components);
        }
    }

    // Multiple worker thread
    public scheduleParallel() {
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(...components);
        }
    }
}

export class IJobForEachWithEntity {
    protected execute(entity: EntityID, index: number, ...args: IComponentData[]): void { }

    // Main thread
    public run() {

        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(entity, i++, ...components);
        }
    }

    // Single worker thread
    public schedule() {

        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(entity, i++, ...components);
        }
    }

    // Multiple worker thread
    public scheduleParallel() {

        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents((this.constructor as any).dependencies)) {
            let components: IComponentData[] = [];

            for (const dep of (this.constructor as any).dependencies as Type<IComponentData>[]) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }

            this.execute(entity, i++, ...components);
        }
    }
}

export const JobForEach = (...args: Type<IComponentData>[]) => {
    return (constructor: Type<IJobForEach | IJobForEachWithEntity>) => {
        (constructor as any).dependencies = args;
    }
}
