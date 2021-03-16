import { Vec2 } from "./util/vector.js";

export class Input {
    private static buttonMap: Map<string, AxisValue[]> = new Map();
    private static nameMap: Map<string, Axis> = new Map();
    private static immediateMousePos: Vec2 = Vec2.one();
    static mousePos: Vec2 = Vec2.one();

    static init(mappings: string[], buttons: Button[]) {
        Input.buttonMap = new Map();
        Input.nameMap = new Map();

        for (const mapping of mappings) {
            Input.nameMap.set(mapping, {
                name: mapping,
                isDown: false,
                isUp: false,
                isPressed: false,
                value: 0,
                immediateValue: 0
            });
        }

        // Input.nameMap.set("mousePosY", {
        //     name: "mousePosY",
        //     isDown: false,
        //     isUp: false,
        //     isPressed: false,
        //     value: 0,
        //     immediateValue: 0
        // });

        // Input.nameMap.set("mousePosX", {
        //     name: "mousePosX",
        //     isDown: false,
        //     isUp: false,
        //     isPressed: false,
        //     value: 0,
        //     immediateValue: 0
        // });

        for (const button of buttons) {
            let buttons = Input.buttonMap.get(button.key);

            if (!buttons) {
                buttons = [];
                Input.buttonMap.set(button.key, buttons);
            }

            let axis = Input.nameMap.get(button.axis);
            if (axis) buttons.push({ axis: axis, value: button.value });
        }

        document.addEventListener("keydown", (evt) => {
            Input.setMappingValue(evt.key);
        });

        document.addEventListener("keyup", (evt) => {
            Input.setMappingValue(evt.key, 0);
        });

        document.addEventListener("mousemove", (evt) => {
            Input.immediateMousePos.set_s(evt.pageX, evt.pageY);
            // Input.nameMap.get("mousePosX")!.immediateValue = evt.pageX * 2 / SceneManager.width - 1;
            // Input.nameMap.get("mousePosY")!.immediateValue = evt.pageY * 2 / SceneManager.height - 1;
        });

        document.addEventListener("mousedown", (evt) => {
            Input.setMappingValue(`mouse${evt.button}`);
        });

        document.addEventListener("mouseup", (evt) => {
            Input.setMappingValue(`mouse${evt.button}`, 0);
        });
    }

    private static setMappingValue(name: string, value?: number) {
        let mappings = Input.buttonMap.get(name);
        if (!mappings) return;

        for (const mapping of mappings) {
            mapping.axis.immediateValue = value ?? mapping.value;
        }
    }

    static getAxis(name: string) {
        return Input.nameMap.get(name)!.value;
    }

    static getButtonDown(name: string) {
        return Input.nameMap.get(name)!.isDown;
    }

    static getButtonUp(name: string) {
        return Input.nameMap.get(name)!.isUp;
    }

    static getButton(name: string) {
        return Input.nameMap.get(name)!.isPressed;
    }

    static update() {
        for (const [key, axis] of Input.nameMap) {
            axis.isDown = axis.value === 0 && axis.immediateValue === 1;
            axis.isUp = axis.value === 1 && axis.immediateValue === 0;
            axis.isPressed = axis.value === 1 && axis.immediateValue === 1;
            axis.value = axis.immediateValue;
        }

        Input.mousePos.set(Input.immediateMousePos);
    }
}

export interface Button {
    key: string;
    value: number;
    axis: string;
}

interface AxisValue {
    axis: Axis;
    value: number;
}

interface Axis {
    name: string;
    isDown: boolean;
    isPressed: boolean;
    isUp: boolean;
    value: number;
    immediateValue: number;
}