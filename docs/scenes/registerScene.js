import { Scene } from "../scene.js";
export class RegisterScene extends Scene {
    onLoad() {
        $("#ui_register").show();
    }
    onUnLoad() {
        $("#ui_register").hide();
    }
}
