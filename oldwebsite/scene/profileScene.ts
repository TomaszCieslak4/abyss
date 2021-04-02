import { Scene } from "../engine/core/scene.js";
import { SceneManager } from "../engine/core/sceneManager.js";
import { LoggedUser } from "../loggedUser.js";

export class ProfileScene extends Scene {
    credentials = { "newpassword": "", "difficulty": "", "username": "", "currpassword": "" };

    errors: string[] = [];

    async displayFields() {
        this.errors = [];
        this.credentials["username"] = LoggedUser.getUser();
        if (this.credentials.username === "") {
            this.errors.push("Error displaying user information.");
        }
        if (this.errors.length === 0) {
            try {
                const result = await $.ajax({
                    method: "GET",
                    url: "/api/user/userinfo",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                // SET FIELDS
                $("#updateUsername").val(this.credentials.username);
                this.credentials.difficulty = result["difficulty"];
                if (this.credentials.difficulty === "easy" || this.credentials.difficulty === "medium" ||
                    this.credentials.difficulty === "hard") {
                    $("#".concat(this.credentials.difficulty)).prop("checked", true);
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

        if (!$("#confirm").prop("checked")) this.errors.push("Please accept the changes to update.");
        this.credentials["newpassword"] = $("#newPasswordUpdate").val() as string;
        this.credentials["currpassword"] = $("#currPasswordUpdate").val() as string;
        this.credentials["username"] = LoggedUser.getUser();

        let password2 = $("#newPasswordUpdateConfirm").val() as string

        if (this.credentials.username === "") {
            this.errors.push("Cannot update user (invalid name).");
        }
        if (this.credentials.newpassword !== password2) {
            this.errors.push("Passwords are not the same.");
        }
        if (this.credentials.currpassword.length === 0) {
            this.errors.push("Enter password to update account.");
        }
        if (this.credentials.newpassword.length > 0 && (this.credentials.newpassword.length < 8 ||
            this.credentials.newpassword.match(/^[a-zA-Z0-9]+$/) === null)) {
            this.errors.push("Passwords should be betweeen at least 8 characters or numbers.");
        }
        if (this.credentials.difficulty === undefined) {
            this.errors.push("Error: No preferred difficulty.");
        }
        if (this.errors.length === 0) { 
            try {
                let newDifficulty = $(".updateDifficulty:checked").val() as string;
                if (this.credentials["difficulty"] !== newDifficulty) {
                    const result = await $.ajax({
                        method: "PUT",
                        url: "/api/auth/updatedifficulty",
                        data: JSON.stringify({}),
                        headers: {
                            "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.currpassword +
                                ":" + newDifficulty)
                        },
                        processData: false,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    });
                    this.credentials["difficulty"] = newDifficulty;
                    LoggedUser.setDifficulty(newDifficulty);
                    this.errors.push("Difficulty updated!"); // Not actually an error but a response to client
                } else {
                    this.errors.push("Difficulty not changed.");// Not actually an error but a response to client
                }
                if (this.credentials.newpassword.length === 0) {
                    this.errors.push("Password not changed.");// Not actually an error but a response to client
                } else {
                    const result = await $.ajax({
                        method: "PUT",
                        url: "/api/auth/updatepassword",
                        data: JSON.stringify({}),
                        headers: {
                            "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.currpassword +
                                ":" + this.credentials.newpassword)
                        },
                        processData: false,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    });
                    this.errors.push("Password updated!"); // Not actually an error but a response to client
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

    async deleteAccount() {
        this.errors = [];
        const myNode = document.getElementById("updateErr")!;
        myNode.innerHTML = '';
        if (!$("#confirm").prop("checked")) this.errors.push("Please accept the changes to delete.");
        this.credentials["username"] = LoggedUser.getUser();
        this.credentials["currpassword"] = $("#currPasswordUpdate").val() as string;
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
                    headers: { "Authorization": "Basic " + btoa(this.credentials.username + ":" + this.credentials.currpassword) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                LoggedUser.setUser("");
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
        $("#updateSubmit").on('click', () => {
            this.updateAccount();
        });
        $("#deleteSubmit").on('click', () => { this.deleteAccount(); });
        $("#backToMenu").on('click', () => { SceneManager.setScene(2); });
        $("#ui_profile").show();
    }

    onUnLoad() {
        $("#updateSubmit").off('click');
        $("#deleteSubmit").off('click');
        $("#backToMenu").off('click');
        $("#ui_profile").hide();

        //Set text fields to empty
        $("#updateUsername").val("");
        $("#newPasswordUpdate").val("");
        $("#newPasswordUpdateConfirm").val("");
        $("#currPasswordUpdate").val("");
        $("#confirm").prop("checked", false);
        $("#easy").prop("checked", false);
        $("#medium").prop("checked", false);
        $("#hard").prop("checked", false);
    }
}