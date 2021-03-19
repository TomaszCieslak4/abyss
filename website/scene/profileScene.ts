import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";

export class ProfileScene extends Scene {
    credentials = {"newpassword": "", "difficulty": "" , "username": "", "currpassword": ""};

    errors: string[] = [];

    async displayFields() {
        this.errors = [];
        const myNode = document.getElementById("updateErr")!;
        myNode.innerHTML = '';
        this.credentials["username"]= SceneManager.user.getUser();
        if (this.credentials.username === "") {
            this.errors.push("Error displaying user information.");
        }
        if (this.errors.length === 0) {
            try {
                const result = await $.ajax({
                    method: "GET",
                    url: "/api/userinfo",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                // SET FIELDS
                $("#updateUsername").val(this.credentials.username);
                let difficulty = result.headers.difficulty;
                if (difficulty==="easy" || difficulty==="medium" || difficulty==="hard") {
                    $("#".concat(difficulty)).prop("checked", true);
                }
                else {
                    this.errors.push("Retrieving difficulty failed.");
                }
            } catch (error) {
                console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
                this.errors.push(error.responseJSON.error);
            }
        }
        var myDiv = $("#updateErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
        }
    }

    async updateAccount() {
        this.errors = [];
        const myNode = document.getElementById("updateErr")!;
        myNode.innerHTML = '';

        if (!$("#confirm").prop("checked")) this.errors.push("Please accept the changes to update or delete.");
        this.credentials = {
            "newpassword": $("#newPasswordUpdate").val() as string,
            "difficulty": $(".updateDifficulty:checked").val() as string,
            "currpassword": $("#currPasswordUpdate").val() as string,
            "username": SceneManager.user.getUser()
        };
        let password2 = $("#newPasswordUpdateConfirm").val() as string
        if (this.credentials.username === "") {
            this.errors.push("Cannot update user (invalid name).");
        }
        if (this.credentials.newpassword !== password2) {
            this.errors.push("Passwords are not the same.");
        }
        if (this.credentials.newpassword.length < 8 || this.credentials.newpassword.match(/^[a-zA-Z0-9]+$/) === null) {
            this.errors.push("Passwords should be betweeen at least 8 characters or numbers.");
        }
        if (this.credentials.difficulty === undefined) {
            this.errors.push("Please select preferred difficulty.");
        }
        if (this.errors.length === 0) {
            try {
                const result = await $.ajax({
                    method: "PUT",
                    url: "/api/auth/updateuser",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " +btoa(this.credentials.username + ":" + this.credentials.currpassword +
                     ":" + this.credentials.newpassword + ":" + this.credentials.difficulty) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                this.errors.push("Profile successfully updated!"); // Not actually an error but a response to client
            } catch (error) {
                console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
                this.errors.push(error.responseJSON.error);
            }
        }
        var myDiv = $("#updateErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
        }
    }

    async deleteAccount() {
        this.errors = [];
        const myNode = document.getElementById("updateErr")!;
        myNode.innerHTML = '';
        this.credentials["username"]= SceneManager.user.getUser();
        this.credentials["currpassword"]= $("#currPasswordUpdate").val() as string;
        if (this.credentials.username === "") {
            this.errors.push("Error Username is invalid.");
        }
        if (this.credentials.currpassword === "") {
            this.errors.push("Please enter your existing password.");
        }
        if (this.errors.length === 0) {
            try {
                const result = await $.ajax({
                    method: "DELETE",
                    url: "/api/auth/delete",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                SceneManager.user.setUser("");
                SceneManager.setScene(0);
            } catch (error) {
                console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
                this.errors.push(error.responseJSON.error);
            }
        }
        var myDiv = $("#updateErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
        }
    }

    onLoad() {
        this.displayFields();
        $("#updateSubmit").on('click', () => { this.updateAccount(); });
        $("#deleteSubmit").on('click', () => { this.deleteAccount(); });
        $("#backToMenu").on('click', () => { SceneManager.setScene(2); });
        $("#ui_profile").show();
    }

    onUnLoad() {
        $("#updateSubmit").off('click');
        $("#deleteSubmit").off('click');
        $("#backToMenu").off('click');
        $("#ui_profile").hide();
    }
}