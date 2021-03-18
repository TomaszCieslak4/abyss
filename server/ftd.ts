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

		let query = 'SELECT difficulty FROM ftduser WHERE username=$1';
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


// app.post('/api/check', async (req, res) => {
// 	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

// 	try {
// 		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
// 		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

// 		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
// 		m = /^(.*)$/.exec(user_pass); // probably should do better than this

// 		let username = m ? m[1] : "";

// 		console.log(username);

// 		let query = 'SELECT difficulty FROM ftduser WHERE username=$1';

// 		let result = await pool.query(query, [username]);
// 		if (result.rowCount !== 1) return res.status(401).json({ error: 'User does not exist!' });

// 	} catch (err) {
// 		return res.status(500).json({ error: 'Server error' });
// 	}

// 	res.status(200).json({ "message": "Registration complete" });
// });

app.post('/api/userinfo', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";

		console.log(username);

		let query = 'SELECT difficulty FROM ftduser WHERE username=$1';
		pool.query(query, [username], (err, pgRes) => {
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

app.post('/api/register', async (req, res) => {
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
			let query = 'SELECT * FROM ftduser WHERE username=$1';

			let result = await pool.query(query, [username]);
			if (result.rowCount > 0) return res.status(401).json({ error: 'User already exists!' });

			query = 'INSERT INTO ftduser (username, password, difficulty) VALUES ($1, sha512($2), $3)';
			result = await pool.query(query, [username, password, difficulty]);

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

