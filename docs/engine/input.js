export class Input {
    static init(mappings, buttons) {
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
            if (axis)
                buttons.push({ axis: axis, value: button.value });
        }
        document.addEventListener('keydown', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings)
                return;
            for (const mapping of mappings) {
                mapping.axis.immediateValue = mapping.value;
            }
        });
        document.addEventListener('keyup', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings)
                return;
            for (const mapping of mappings) {
                mapping.axis.immediateValue = 0;
            }
        });
    }
    static getAxis(name) {
        return Input.nameMap.get(name).value;
    }
    static getButtonDown(name) {
        return Input.nameMap.get(name).isDown;
    }
    static getButtonUp(name) {
        return Input.nameMap.get(name).isUp;
    }
    static getButton(name) {
        return Input.nameMap.get(name).isPressed;
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
Input.buttonMap = new Map();
Input.nameMap = new Map();
