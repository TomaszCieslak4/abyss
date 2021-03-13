import { Stage } from './model.js';
import { Vec2 } from './util.js';
let stage = null;
let interval = 0;
let credentials = { "username": "", "password": "" };
let lastTime = 0;
let lastFixedUpdate = 0;
const FIXED_DELTA_TIME = 1 / 60;
const setupGame = () => {
    stage = new Stage(document.getElementById('stage'));
    // https://javascript.info/keyboard-events
    document.addEventListener('keydown', moveByKey);
};
const update = (timestamp) => {
    if (!stage)
        return;
    // for (let index = 0; index < 100000000; index++) { }
    let dt = (timestamp - lastTime) / 1000;
    // console.log(dt);
    while (timestamp - lastFixedUpdate >= FIXED_DELTA_TIME * 1000) {
        stage.fixedUpdate();
        lastFixedUpdate += FIXED_DELTA_TIME * 1000;
    }
    stage.update(dt);
    stage.draw();
    lastTime = timestamp;
    interval = requestAnimationFrame(update);
};
const startGame = () => {
    lastTime = performance.now();
    lastFixedUpdate = lastTime;
    interval = requestAnimationFrame(update);
};
const pauseGame = () => {
    cancelAnimationFrame(interval);
    interval = 0;
};
const moveByKey = (event) => {
    let key = event.key;
    let moveMap = {
        'a': new Vec2(-5, 0),
        's': new Vec2(0, 5),
        'd': new Vec2(5, 0),
        'w': new Vec2(0, -5)
    };
    if (key in moveMap) {
        if (!stage || !stage.player)
            return;
        stage.player.velocity = moveMap[key];
    }
};
const login = () => {
    credentials = {
        "username": $("#username").val(),
        "password": $("#password").val()
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
};
// Using the /api/auth/test route, must send authorization header
const test = () => {
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
};
$(() => {
    // Setup all events here and display the appropriate UI
    $("#loginSubmit").on('click', function () { login(); });
    $("#ui_login").show();
    $("#ui_play").hide();
    // TODO: Remove this
    $("#ui_login").hide();
    $("#ui_play").show();
    setupGame();
    startGame();
});
