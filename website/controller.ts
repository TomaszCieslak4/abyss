import { SceneManager } from './engine/sceneManager.js';
import { GameScene } from './gameScene.js';
import { Time } from './engine/time.js';
import { Input } from './engine/input.js';
import { EntityManager } from './engine/ecs/entity.js';

let interval: number = 0;
let credentials = { "username": "", "password": "" };
let lastTime: number = 0;
let lastFixedUpdate: number = 0;
let canvas = document.getElementById('stage') as HTMLCanvasElement;

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const setupGame = () => {
    SceneManager.init([GameScene])
    Input.init(["x", "y", "fire"], [
        { axis: "y", key: "w", value: 1 },
        { axis: "y", key: "s", value: -1 },
        { axis: "x", key: "a", value: 1 },
        { axis: "x", key: "d", value: -1 },
        { axis: "fire", key: "mouse0", value: 1 }
    ]);

    SceneManager.setCanvas(canvas);
    SceneManager.setScene(0);
};

const update = (timestamp: number) => {
    SceneManager.width = canvas.width;
    SceneManager.height = canvas.height;
    SceneManager.context.clearRect(0, 0, canvas.width, canvas.height);

    Time.deltaTime = (timestamp - lastTime) / 1000;
    Input.update();

    while (timestamp - lastFixedUpdate >= Time.fixedDeltaTime * 1000) {
        EntityManager.fixedUpdate();
        lastFixedUpdate += Time.fixedDeltaTime * 1000;
    }

    EntityManager.update();
    lastTime = timestamp;
    interval = requestAnimationFrame(update);
};

const startGame = () => {
    lastTime = performance.now();
    lastFixedUpdate = lastTime;
    interval = requestAnimationFrame(update);
};

const login = () => {
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

