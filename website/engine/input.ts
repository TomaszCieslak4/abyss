export class Input {
    private static buttonMap: Map<string, AxisValue[]> = new Map();
    private static nameMap: Map<string, Axis> = new Map();

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

        for (const button of buttons) {
            let buttons = Input.buttonMap.get(button.key);

            if (!buttons) {
                buttons = [];
                Input.buttonMap.set(button.key, buttons);
            }

            let axis = Input.nameMap.get(button.axis);
            if (axis) buttons.push({ axis: axis, value: button.value });
        }

        document.addEventListener('keydown', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings) return;

            for (const mapping of mappings) {
                mapping.axis.immediateValue = mapping.value;
            }
        });

        document.addEventListener('keyup', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings) return;

            for (const mapping of mappings) {
                mapping.axis.immediateValue = 0;
            }
        });
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