import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";
export class RegisterScene extends Scene {
    constructor() {
        super(...arguments);
        this.credentials = { "username": "", "password": "", "password2": "" };
    }
    register() {
        if ($("#tos").prop("checked")) {
            this.credentials = {
                "username": $("#regUsername").val(),
                "password": $("#regPassword").val(),
                "password2": $("#regPasswordConfirm").val()
            };
            if (this.credentials.password === this.credentials.password2) {
                $.ajax({
                    method: "POST",
                    url: "/api/auth/register",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.password) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data, text_status, jqXHR) {
                    console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
                    SceneManager.setScene(2);
                }).fail(function (err) {
                    console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
                });
            }
        }
    }
    onLoad() {
        $("#registerSubmit").on('click', () => { this.register(); });
        $("#loginPage").on('click', () => { SceneManager.setScene(0); });
        $("#ui_register").show();
    }
    onUnLoad() {
        $("#loginPage").off('click');
        $("#ui_register").hide();
    }
}
