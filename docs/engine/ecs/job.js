import { EntityManager } from "./entity.js";
export class IJob {
    execute() { }
    // Main thread
    run() {
        this.execute();
    }
    // Single worker thread
    schedule() {
        this.execute();
    }
    // Multiple worker thread
    scheduleParallel() {
        this.execute();
    }
}
export class IJobFor {
    execute(index) { }
    // Main thread
    run(iterations) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i);
        }
    }
    // Single worker thread
    schedule(iterations) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i);
        }
    }
    // Multiple worker thread
    scheduleParallel(iterations) {
        for (let i = 0; i < iterations; i++) {
            this.execute(i);
        }
    }
}
export class IJobForEach {
    execute(...args) { }
    // Main thread
    run() {
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(...components);
        }
    }
    // Single worker thread
    schedule() {
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(...components);
        }
    }
    // Multiple worker thread
    scheduleParallel() {
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(...components);
        }
    }
}
export class IJobForEachWithEntity {
    execute(entity, index, ...args) { }
    // Main thread
    run() {
        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(entity, i++, ...components);
        }
    }
    // Single worker thread
    schedule() {
        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(entity, i++, ...components);
        }
    }
    // Multiple worker thread
    scheduleParallel() {
        let i = 0;
        for (let entity of EntityManager.getEntitiesWithComponents(this.constructor.dependencies)) {
            let components = [];
            for (const dep of this.constructor.dependencies) {
                components.push(EntityManager.getComponents(dep)[entity.index]);
            }
            this.execute(entity, i++, ...components);
        }
    }
}
export const JobForEach = (...args) => {
    return (constructor) => {
        constructor.dependencies = args;
    };
};
