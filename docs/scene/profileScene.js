import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";
export class ProfileScene extends Scene {
    constructor() {
        super(...arguments);
        this.userInfo = { "username": "" };
        this.credentials = { "username": "", "password": "" };
        this.errors = [];
    }
    async displayFields() {
        this.errors = [];
        const myNode = document.getElementById("loginErr");
        myNode.innerHTML = '';
        this.userInfo = {
            "username": SceneManager.user.getUser()
        };
        if (this.userInfo.username === "") {
            this.errors.push("Error displaying user information.");
        }
        if (this.errors.length === 0) {
            try {
                const result = await $.ajax({
                    method: "GET",
                    url: "/api/userinfo",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.userInfo.username) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                // SET FIELDS
            }
            catch (error) {
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
        // $("#updateSubmit").on('click', () => { SceneManager.setScene(4); });
        // $("#deleteSubmit").on('click', () => { SceneManager.setScene(3); });
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
