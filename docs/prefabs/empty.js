import { GameObject } from "../core/gameObject.js";
export class EmptyPrefab extends GameObject {
    constructor() {
        super();
        this._start();
    }
}
