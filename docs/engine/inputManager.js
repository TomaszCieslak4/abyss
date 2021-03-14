export class Input {
    static init(mappings) {
        Input.buttonMap = new Map();
        Input.nameMap = new Map();
        for (const mapping of mappings) {
            let mappingState = {
                name: mapping.name,
                buttons: mapping.buttons,
                isDown: false,
                isUp: false,
                isPressed: false,
                value: 0,
                immediateValue: 0
            };
            for (const button of mapping.buttons) {
                let buttons = Input.buttonMap.get(button);
                if (!buttons) {
                    buttons = [];
                    Input.buttonMap.set(button, buttons);
                }
                buttons.push(mappingState);
            }
            Input.nameMap.set(mapping.name, mappingState);
        }
        document.addEventListener('keydown', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings)
                return;
            for (const mapping of mappings) {
                mapping.immediateValue = 1;
            }
        });
        document.addEventListener('keyup', (evt) => {
            let mappings = Input.buttonMap.get(evt.key);
            if (!mappings)
                return;
            for (const mapping of mappings) {
                mapping.immediateValue = 0;
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
        for (const [key, mapping] of Input.nameMap) {
            mapping.isDown = mapping.value === 0 && mapping.immediateValue === 1;
            mapping.isUp = mapping.value === 1 && mapping.immediateValue === 0;
            mapping.isPressed = mapping.value === 1 && mapping.immediateValue === 1;
            mapping.value = mapping.immediateValue;
        }
    }
}
Input.buttonMap = new Map();
Input.nameMap = new Map();
