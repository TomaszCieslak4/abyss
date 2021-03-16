import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";
export class LoginScene extends Scene {
    constructor() {
        super(...arguments);
        this.credentials = { "username": "", "password": "" };
    }
    login() {
        this.credentials = {
            "username": $("#username").val(),
            "password": $("#password").val()
        };
        $.ajax({
            method: "POST",
            url: "/api/auth/login",
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
    onLoad() {
        $("#loginSubmit").on('click', () => { this.login(); });
        $("#registerPage").on('click', () => { SceneManager.setScene(1); });
        $("#ui_login").show();
    }
    onUnLoad() {
        $("#loginSubmit").off('click');
        $("#registerPage").off('click');
        $("#ui_login").hide();
    }
}
