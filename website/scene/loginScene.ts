import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";

export class LoginScene extends Scene {
    credentials = { "username": "", "password": "" };
    errors: string[] = [];

    login() {
        this.errors = [];
        const myNode = document.getElementById("loginErr")!;
        myNode.innerHTML = '';

        this.credentials = {
            "username": $("#username").val() as string,
            "password": $("#password").val() as string
        };
        if (this.credentials.username === "") {
            this.errors.push("Please enter a username.");
        }
        if (this.credentials.password === "") {
            this.errors.push("Please enter a password.");
        }
        if (this.errors.length === 0) {
            $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
                headers: { "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.password) },
                processData: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done((data, text_status, jqXHR) => {
                console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
                SceneManager.setScene(2);
            }).fail((err) => {
                console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
                this.errors.push(JSON.stringify(err.responseJSON.error)); // TODO: Pushing after running stuff below??
            });
        }
        var myDiv = $("#loginErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
        }
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
        const myNode = document.getElementById("loginErr")!;
        myNode.innerHTML = '';
    }
}