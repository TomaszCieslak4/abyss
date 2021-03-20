import { SceneManager } from "../engine/core/sceneManager.js";
import { Script } from "../engine/core/script.js";
import { LoggedUser } from "../loggedUser.js";
import { HumanPlayer } from "./humanPlayer.js";
export class GameManager extends Script {
    constructor() {
        super(...arguments);
        this._playerCount = 0;
        this.errors = [];
    }
    get playerCount() { return this._playerCount; }
    set playerCount(value) {
        this.remainingPlayersElm.textContent = value.toString();
        this._playerCount = value;
        if (value === 0) {
            this.onGameWon();
        }
    }
    start() {
        this.remainingPlayersElm = $("#players").get()[0];
        super.start();
    }
    onGameLost(player) {
        let score = player.score;
        $("#gameState").html("You Lost :(");
        this.endGame(score).then(() => { });
    }
    onGameWon() {
        let player = SceneManager.activeScene.findComponents(HumanPlayer).next().value;
        let score = player.score;
        $("#gameState").html("You Won :)");
        this.endGame(score).then(() => { });
    }
    async endGame(score) {
        this.errors = [];
        const myNode = document.getElementById("menuErr");
        myNode.innerHTML = '';
        let difficulty = LoggedUser.getDifficulty();
        if (LoggedUser.getUser() === "") {
            this.errors.push("User not found.");
        }
        if (difficulty === "") {
            this.errors.push("Difficulty not found.");
        }
        if (score < 0) {
            this.errors.push("Score is invalid.");
        }
        if (this.errors.length === 0) {
            // Update score for the gamemode
            try {
                const result = await $.ajax({
                    method: "PUT",
                    url: "/api/auth/updatescore",
                    data: JSON.stringify({}),
                    headers: {
                        "Authorization": "Basic " + btoa(LoggedUser.getUser() + ":" + LoggedUser.getPassword() + ":" +
                            difficulty + ":" + score)
                    },
                    processData: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
            }
            catch (error) {
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
        SceneManager.setScene(2);
    }
}
