import { Scene } from "../engine/core/scene.js";
import { SceneManager } from "../engine/core/sceneManager.js";
export class RegisterScene extends Scene {
    constructor() {
        super(...arguments);
        this.credentials = { "username": "", "password": "", "difficulty": "" };
        this.errors = [];
    }
    async register() {
        this.errors = [];
        const myNode = document.getElementById("registerErr");
        myNode.innerHTML = '';
        if (!$("#tos").prop("checked"))
            this.errors.push("Please select the terms of service.");
        this.credentials = {
            "username": $("#regUsername").val(),
            "password": $("#regPassword").val(),
            "difficulty": $(".difficulty:checked").val()
        };
        let password2 = $("#regPasswordConfirm").val();
        if (this.credentials.password !== password2) {
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
            try {
                const result = await $.ajax({
                    method: "POST",
                    url: "/api/nouser/register",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.password + ":" + this.credentials.difficulty) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                SceneManager.setScene(0);
            }
            catch (error) {
                console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
                this.errors.push(error.responseJSON.error);
            }
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
        //Set text fields to empty
        $("#regUsername").val("");
        $("#regPassword").val("");
        $("#regPasswordConfirm").val("");
        $("#tos").prop("checked", false);
        $("#regEasy").prop("checked", false);
        $("#regMedium").prop("checked", false);
        $("#regHard").prop("checked", false);
    }
}
