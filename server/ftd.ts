// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

// const express = require("express");
// const { Pool } = require("pg");
import express, { query } from "express";
import { Pool } from "pg";
let port = 25566; // TODO: Change to 8000
let app = express();

const pool = new Pool({
	user: 'webdbuser',
	host: 'localhost',
	database: 'webdb',
	password: 'password',
	port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

// function isObject(o) { return typeof o === 'object' && o !== null; }
// function isNaturalNumber(value: string) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got here" });
});

app.get('/api/topten', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No table speicifc sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let table = m ? m[1] : "";

		if (table === "") {
			return res.status(401).json({ error: 'Please select a table.' });
		}

		let query = 'SELECT username, score FROM $1 ORDER BY score DESC LIMIT 10;';
		let result = await pool.query(query, [table]);
		
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
	res.status(200).json({ "message": "Top 10 listed!" });
});

app.use('/api/check', async (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No username sent!' });
	}
	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";

		console.log(username);

		let query = 'SELECT * FROM ftduser WHERE username=$1';
		pool.query(query, [username], (err, pgRes) => {
			if (err) {
				res.status(500).json({ error: 'Database error occured' });
			} else if (pgRes.rowCount == 1) {
				next();
			} else {
				res.status(401).json({ error: 'Username does not exist.' });
			}
		});
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
});

app.get('/api/check/userinfo', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";

		console.log(username);

		let query = 'SELECT difficulty FROM ftduser WHERE username=$1';
		let result = await pool.query(query, [username]);

		query = 'SELECT score FROM easyScore WHERE username=$1';
		result = await pool.query(query, [username]);

		query = 'SELECT score FROM mediumScore WHERE username=$1';
		result = await pool.query(query, [username]);

		query = 'SELECT score FROM hardScore WHERE username=$1';
		result = await pool.query(query, [username]);
		
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
	res.status(200).json({ "message": "Registration complete" });
});

app.post('/api/check/register', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";
		let password = m ? m[2] : "";
		let difficulty = m ? m[3] : "";

		console.log(username + " " + password);

		if (password.length < 8 || password.match(/^[a-zA-Z0-9]+$/) === null) {
			return res.status(401).json({ error: 'Passwords should be betweeen at least 8 characters or numbers.' });
		}
		if (username.length < 3 || username.length > 20 || username.match(/^[a-zA-Z0-9]+$/) === null) {
			return res.status(401).json({ error: 'Username should be between 3-20 characters or numbers.' });
		}
		if (difficulty === "") {
			return res.status(401).json({ error: 'Please select preferred difficulty.' });
		}
		else {

			let query = 'INSERT INTO ftduser (username, password, difficulty) VALUES ($1, sha512($2), $3)';
			let result = await pool.query(query, [username, password, difficulty]);

			let zero = 0;

			query = 'INSERT INTO easyScore (username, score) VALUES ($1, $2)';
			result = await pool.query(query, [username, zero]);

			query = 'INSERT INTO mediumScore (username, score) VALUES ($1, $2)';
			result = await pool.query(query, [username, zero]);

			query = 'INSERT INTO hardScore (username, score) VALUES ($1, $2)';
			result = await pool.query(query, [username, zero]);
		}

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Registration complete" });
});


/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', async (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
	}
	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";
		let password = m ? m[2] : "";

		console.log(username + " " + password);

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
		pool.query(sql, [username, password], (err, pgRes) => {
			if (err) {
				res.status(500).json({ error: 'Database error occured' });
			} else if (pgRes.rowCount == 1) {
				next();
			} else {
				res.status(401).json({ error: 'Incorrect credentials.' });
			}
		});
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200);
	res.json({ "message": "authentication success" });
});

app.put('/api/auth/updateuser', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*):(.*):(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";
		let newpassword = m ? m[3] : "";
		let difficulty = m ? m[4] : "";

		console.log(username + " " + newpassword);

		if (newpassword.length < 8 || newpassword.match(/^[a-zA-Z0-9]+$/) === null) {
			return res.status(401).json({ error: 'Passwords should be betweeen at least 8 characters or numbers.' });
		}
		if (difficulty === "") {
			return res.status(401).json({ error: 'Please select preferred difficulty.' });
		}
		else {

			let query = 'UPDATE ftduser SET password=sha512($2), difficulty=$3 WHERE username=$1';
			let result = await pool.query(query, [username, newpassword, difficulty]);

		}

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Update complete" });
});

app.delete('/api/auth/delete', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";

		console.log(username);

		let query = 'DELETE FROM hardScore WHERE username=$1';
		let result = await pool.query(query, [username]);

		query = 'DELETE FROM mediumScore WHERE username=$1';
		result = await pool.query(query, [username]);

		query = 'DELETE FROM easyScore WHERE username=$1';
		result = await pool.query(query, [username]);

		query = 'DELETE FROM ftduser WHERE username=$1';
		result = await pool.query(query, [username]);

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Deletion complete" });
});

app.post('/api/auth/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got to /api/auth/test" });
});

app.use('/', express.static('../docs'));

app.listen(port, "localhost", function () {
	console.log('Example app listening on port ' + port);
});

