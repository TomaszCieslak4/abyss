import { Stage, Pair } from './model.js';

var stage: Stage | null = null;
var view = null;
var interval: number | null = null;
var credentials = { "username": "", "password": "" };
function setupGame() {
        stage = new Stage(document.getElementById('stage') as HTMLCanvasElement);

        // https://javascript.info/keyboard-events
        document.addEventListener('keydown', moveByKey);
}
function step() {
        if (!stage) return;
        stage.step(); stage.draw();
        requestAnimationFrame(step);
}
function startGame() {
        // interval=setInterval(function(){  },100);
        requestAnimationFrame(step);
}
function pauseGame() {
        if (interval)
                clearInterval(interval);
        interval = null;
}
function moveByKey(event: KeyboardEvent) {
        var key = event.key;
        var moveMap = {
                'a': new Pair(-5, 0),
                's': new Pair(0, 5),
                'd': new Pair(5, 0),
                'w': new Pair(0, -5)
        };
        if (key in moveMap) {
                if (!stage || !stage.player) return;
                stage.player.velocity = moveMap[key as 'a'] as Pair;
        }
}

function login() {
        credentials = {
                "username": $("#username").val() as string,
                "password": $("#password").val() as string
        };

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
        }).done(function (data, text_status, jqXHR) {
                console.log(jqXHR.status + " " + text_status + JSON.stringify(data));

                $("#ui_login").hide();
                $("#ui_play").show();

                setupGame();
                startGame();

        }).fail(function (err) {
                console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
        });
}

// Using the /api/auth/test route, must send authorization header
function test() {
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType: "json"
        }).done(function (data, text_status, jqXHR) {
                console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
        }).fail(function (err) {
                console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
        });
}

$(function () {
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click', function () { login(); });
        $("#ui_login").show();
        $("#ui_play").hide();
});
