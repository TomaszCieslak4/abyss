import { Scene } from "../engine/core/scene.js";
import { SceneManager } from "../engine/core/sceneManager.js";
import { LoggedUser } from "../loggedUser.js";

export class MainMenuScene extends Scene {

    stats = { "difficulty": "" };
    errors: string[] = [];

    async getStats() {
        this.errors = [];
        const myNode = document.getElementById("menuErr")!;
        myNode.innerHTML = '';

        // Get user info
        try {
            const result = await $.ajax({
                method: "GET",
                url: "/api/user/userinfo",
                data: JSON.stringify({}),
                headers: { "Authorization": "Basic " + btoa(LoggedUser.getUser()) },
                processData: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });

            let resultDifficulty = result["difficulty"];
            if (resultDifficulty !== "easy" && resultDifficulty !== "medium" && resultDifficulty !== "hard") {
                this.errors.push("Error obtaining user difficulty.");
            }
            else {
                this.stats["difficulty"] = resultDifficulty;
                LoggedUser.setDifficulty(resultDifficulty);
                $('#mystats').append('<tr><td class="middle">' + result.easyScore +
                    '</td><td class="middle">' + result.mediumScore + '</td><td class="middle">' +
                    result.hardScore + '</td></tr>');
            }
            $("#boardTitle").html(resultDifficulty.toUpperCase() + " Leaderboard");
        } catch (error) {
            console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
            this.errors.push(error.responseJSON.error);
        }

        if (this.errors.length === 0) {
            // Get top ten leaderboards for user's difficulty
            try {
                const result = await $.ajax({
                    method: "GET",
                    url: "/api/topten",
                    data: JSON.stringify({}),
                    headers: { "Authorization": "Basic " + btoa(this.stats["difficulty"]) },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
                for (let index = 0; index < result.topten.rows.length; index++) {
                    $('#leaderboard').append('<tr><td class="middle">' +
                        result.topten.rows[index]['username'] + '</td><td class="middle">' +
                        result.topten.rows[index]['score'] + '</td></tr>');
                }
            } catch (error) {
                console.log("fail " + error.status + " " + JSON.stringify(error.responseJSON));
                this.errors.push(error.responseJSON.error);
            }
        }

        var myDiv = $("#menuErr");
        var paragraph = document.createElement("p");
        for (let index = 0; index < this.errors.length; index++) {
            paragraph.textContent = this.errors[index];
            myDiv.append(paragraph);
            paragraph = document.createElement("p");
        }
    }

    onLoad() {
        $("#start").on('click', () => { SceneManager.setScene(4); });
        $("#update").on('click', () => { SceneManager.setScene(3); });
        $("#logout").on('click', () => {
            LoggedUser.setUser('');
            SceneManager.setScene(0);
        });
        $("#ui_menu").show();
        this.getStats();
    }

    onUnLoad() {
        $("#start").off('click');
        $("#update").off('click');
        $("#logout").off('click');
        $("#ui_menu").hide();

        //Set text fields to empty
        $("#gameState").val("");
        $("#leaderboard tbody tr td").remove();
        $("#mystats tbody tr td").remove();
    }
}