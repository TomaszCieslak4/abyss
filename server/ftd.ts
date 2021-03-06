import express, { query } from "express";
import { Pool } from "pg";

const websocketServer = require("./game.js");

// Configure this port for production
const port = 8000;
let app = express();

var cors = require('cors')
app.use(cors())

// Session tokens to track user when logging in
var session = require('express-session')
app.use(session({
    secret: 'secret-key',
}));

// Connect to a PSQL instance
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

// Middleware to parse POST bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
    res.status(200);
    res.json({ "message": "got here" });
});

app.get('/api/topten', async (req, res) => {
    let returnRes = { "message": "", "topten": {} };
    try {
        let query = 'SELECT username, highScore FROM scores ORDER BY highScore DESC LIMIT 10;';
        let result = await pool.query(query, []);
        returnRes["topten"] = result;
    }
    catch (err) {
        res.status(500).json({ error: 'Server error occured' });
    }
    returnRes["message"] = "Top 10 obtained!";
    res.status(200).json(returnRes);
});

app.use('/api/nouser', async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No username sent!' });
    }
    try {
        let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
        let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString();
        let vals = user_pass.split(':');
        let username = vals ? vals[0] : "";
        let query = 'SELECT * FROM ftduser WHERE username=$1';
        pool.query(query, [username], (err, pgRes) => {
            if (err) {
                res.status(500).json({ error: 'Database error occured' });
            }
            else if (pgRes.rowCount == 0) {
                next();
            }
            else {
                res.status(404).json({ error: 'Username already exists.' });
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error occured' });
    }
});

app.get('/api/user/userscores', async (req, res) => {
    let returnRes = { "message": "", "lastScore": "", "highScore": "" };
    try {
        let query = 'SELECT lastScore, highScore FROM scores WHERE username=$1';
        //@ts-ignore
        let result = await pool.query(query, [req.session.username]);
        returnRes["lastScore"] = result.rows[0]["lastscore"];
        returnRes["highScore"] = result.rows[0]["highscore"];
    }
    catch (err) {
        res.status(500).json({ error: 'Server error occured' });
    }
    returnRes["message"] = "User info obtained!";
    res.status(200).json(returnRes);
});

app.post('/api/nouser/register', async (req, res) => {
    if (!req.headers.authorization)
        return res.status(401).json({ error: 'No credentials sent!' });
    try {
        let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
        let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString();
        m = /^(.*):(.*)$/.exec(user_pass);
        let username = m ? m[1] : "";
        let password = m ? m[2] : "";
        if (password.length < 8 || password.match(/^[a-zA-Z0-9]+$/) === null) {
            return res.status(401).json({ error: 'Password should be betweeen at least 8 characters or numbers.' });
        }
        if (username.length < 3 || username.length > 20 || username.match(/^[a-zA-Z0-9]+$/) === null) {
            return res.status(401).json({ error: 'Username should be between 3-20 characters or numbers.' });
        }
        else {
            let query = 'INSERT INTO ftduser (username, password) VALUES ($1, sha512($2))';
            let result = await pool.query(query, [username, password]);
            query = 'INSERT INTO scores (username, lastScore, highScore) VALUES ($1, 0, 0)';
            result = await pool.query(query, [username]);
        }
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json({ "message": "Registration complete" });
});


/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials.
**/
app.use('/api/auth', async (req, res, next) => {
    //@ts-ignore
    if (req.session.username) {
        next();
        return;
    }
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No credentials sent!' });
    }
    try {
        let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
        let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString();
        let vals = user_pass.split(':');
        let username = vals ? vals[0] : "";
        let password = vals ? vals[1] : "";

        let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        pool.query(sql, [username, password], (err, pgRes) => {
            if (err) {
                res.status(500).json({ error: 'Database error occured' });
            }
            else if (pgRes.rowCount == 1) {
                //@ts-ignore
                req.session.username = username;
                next();
            }
            else {
                res.status(404).json({ error: 'Incorrect credentials.' });
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error occured' });
    }
});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
    res.status(200);
    res.json({ "message": "authentication success" });
});
app.post('/api/auth/logout', function (req, res) {
    //@ts-ignore
    delete req.session.username;
    res.status(200);
    res.json({ "message": "logout success" });
});

app.put('/api/auth/updatepassword', async (req, res) => {
    if (!req.headers.authorization)
        return res.status(401).json({ error: 'No credentials sent!' });
    try {
        let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
        let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString();
        m = /^(.*)$/.exec(user_pass);
        let newpassword = m ? m[1] : "";
        if (newpassword.length < 8 || newpassword.match(/^[a-zA-Z0-9]+$/) === null) {
            return res.status(401).json({ error: 'Password should be betweeen at least 8 characters or numbers.' });
        }
        else {
            let query = 'UPDATE ftduser SET password=sha512($2) WHERE username=$1';
            //@ts-ignore
            let result = await pool.query(query, [req.session.username, newpassword]);
        }
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json({ "message": "Update newpassword complete" });
});

app.put('/api/auth/updatescore', async (req, res) => {
    //@ts-ignore
    if (req.body.score===undefined)
        return res.status(401).json({ error: 'No score sent!' });
    try {
        let newScore = Number(req.body.score);
        if (newScore === NaN || newScore < 0) {
            return res.status(404).json({ error: 'Score is invalid.' });
        }

        let query = 'SELECT highScore FROM scores WHERE username=$1;';
        //@ts-ignore
        let result = await pool.query(query, [req.session.username]);
        let highScore = Number(result.rows[0]["highscore"]);

        if (highScore < newScore) {
            let query = 'UPDATE scores SET highScore=$1, lastScore=$2 WHERE username=$3;';
            //@ts-ignore
            let result = await pool.query(query, [newScore, newScore, req.session.username]);
        } else {
            let query = 'UPDATE scores SET lastScore=$1 WHERE username=$2;';
            //@ts-ignore
            let result = await pool.query(query, [newScore, req.session.username]);
        }

    }
    catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json({ "message": "Update score complete" });
});

app.delete('/api/auth/delete', async (req, res) => {

    try {

        let query = 'DELETE FROM ftduser WHERE username=$1';
        //@ts-ignore
        let result = await pool.query(query, [req.session.username]);
        //@ts-ignore
        delete req.session.username;

    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }

    res.status(200).json({ "message": "Deletion complete" });
});

app.post('/api/auth/test', function (req, res) {
    res.status(200);
    res.json({ "message": "got to /api/auth/test" });
});

app.use('/', express.static('../abyss/build'));

app.use(function (req, res, next) {
    res.redirect("/");
});

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

