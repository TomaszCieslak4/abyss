import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";
export class RegisterScene extends Scene {
    constructor() {
        super(...arguments);
        this.credentials = { "username": "", "password": "", "password2": "", "difficulty": "" };
        this.errors = [];
    }
    register() {
        this.errors = [];
        const myNode = document.getElementById("registerErr");
        myNode.innerHTML = '';
        if (!$("#tos").prop("checked"))
            this.errors.push("Please select the terms of service.");
        this.credentials = {
            "username": $("#regUsername").val(),
            "password": $("#regPassword").val(),
            "password2": $("#regPasswordConfirm").val(),
            "difficulty": $(".difficulty:checked").val()
        };
        if (this.credentials.password !== this.credentials.password2) {
            this.errors.push("Passwords are not the same.");
        }
        if (this.credentials.password.length < 8 || this.credentials.password.match(/^[a-zA-Z0-9]+$/) === null) {
            this.errors.push("Passwords should be betweeen at least 8 characters or numbers.");
        }
        if (this.credentials.username.length < 3 || this.credentials.username.length > 20 ||
            this.credentials.username.match(/^[a-zA-Z0-9]+$/) === null) {
            this.errors.push("Username should be between 3-20 characters or numbers.");
        }
        if (this.credentials.difficulty === undefined) {
            this.errors.push("Please select preferred difficulty.");
        }
        if (this.errors.length === 0) {
            $.ajax({
                method: "POST",
                url: "/api/register",
                data: JSON.stringify({}),
                headers: { "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.password + ":" + this.credentials.difficulty) },
                processData: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done((data, text_status, jqXHR) => {
                console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
                SceneManager.setScene(0);
            }).fail((err) => {
                console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
                this.errors.push(JSON.stringify(err.responseJSON.error)); // TODO: Pushing after running stuff below??
            });
        }
        var myDiv = $("#registerErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
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
        const myNode = document.getElementById("registerErr");
        myNode.innerHTML = '';
    }
}