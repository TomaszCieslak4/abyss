// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

import express, { query } from "express";
import { Pool } from "pg";

const port = 8000;
let app = express();

var cors = require('cors')
app.use(cors())

const pool = new Pool({
	user: 'webdbuser',
	host: 'localhost',
	database: 'webdb',
	password: 'password',
	port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies
app.use(bodyParser.json());

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200);
	res.json({ "message": "got here" });
});

app.get('/api/topten', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No table speicifc sent!' });
	let returnRes = { "message": "", "topten": {} };

	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let table = m ? m[1] : "";

		console.log("table", table)

		if (table === "") {
			return res.status(401).json({ error: 'Please select valid table.' });
		}
		if (table === "easy") {
			let query = 'SELECT username, score FROM easyScore ORDER BY score DESC LIMIT 10;';
			let result = await pool.query(query, []);
			returnRes["topten"] = result;
		} else if (table === "medium") {
			let query = 'SELECT username, score FROM mediumScore ORDER BY score DESC LIMIT 10;';
			let result = await pool.query(query, []);
			returnRes["topten"] = result;
		} else if (table === "hard") {
			let query = 'SELECT username, score FROM hardScore ORDER BY score DESC LIMIT 10;';
			let result = await pool.query(query, []);
			returnRes["topten"] = result;
		}

	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
	returnRes["message"] = "Top 10 obtained!";
	res.status(200).json(returnRes);
});

app.use('/api/user', async (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No username sent!' });
	}
	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";

		let query = 'SELECT * FROM ftduser WHERE username=$1';
		pool.query(query, [username], (err, pgRes) => {
			if (err) {
				res.status(500).json({ error: 'Database error occured' });
			} else if (pgRes.rowCount == 1) {
				next();
			} else {
				res.status(401).json({ error: 'No such user exists.' });
			}
		});
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
});

app.use('/api/nouser', async (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No username sent!' });
	}
	try {
		// let credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		let vals = user_pass.split(':');

		let username = vals ? vals[0] : "";

		console.log(username);

		let query = 'SELECT * FROM ftduser WHERE username=$1';
		pool.query(query, [username], (err, pgRes) => {
			if (err) {
				res.status(500).json({ error: 'Database error occured' });
			} else if (pgRes.rowCount == 0) {
				next();
			} else {
				res.status(401).json({ error: 'Username already exists.' });
			}
		});
	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
});

app.get('/api/user/userinfo', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });
	let returnRes = { "message": "", "difficulty": "", "easyScore": "", "mediumScore": "", "hardScore": "" };
	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*)$/.exec(user_pass);

		let username = m ? m[1] : "";

		let query = 'SELECT difficulty FROM ftduser WHERE username=$1';
		let result = await pool.query(query, [username]);
		returnRes["difficulty"] = result.rows[0]["difficulty"];

		query = 'SELECT score FROM easyScore WHERE username=$1';
		result = await pool.query(query, [username]);
		returnRes["easyScore"] = result.rows[0]["score"];

		query = 'SELECT score FROM mediumScore WHERE username=$1';
		result = await pool.query(query, [username]);
		returnRes["mediumScore"] = result.rows[0]["score"];

		query = 'SELECT score FROM hardScore WHERE username=$1';
		result = await pool.query(query, [username]);
		returnRes["hardScore"] = result.rows[0]["score"];

	} catch (err) {
		res.status(500).json({ error: 'Server error occured' });
	}
	returnRes["message"] = "User info obtained!";
	res.status(200).json(returnRes);
});

app.post('/api/nouser/register', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*)$/.exec(user_pass); // probably should do better than this

		let username = m ? m[1] : "";
		let password = m ? m[2] : "";
		let difficulty = m ? m[3] : "";

		if (password.length < 8 || password.match(/^[a-zA-Z0-9]+$/) === null) {
			return res.status(401).json({ error: 'Password should be betweeen at least 8 characters or numbers.' });
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
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		let vals = user_pass.split(':');

		let username = vals ? vals[0] : "";
		let password = vals ? vals[1] : "";

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

app.put('/api/auth/updatepassword', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*)$/.exec(user_pass);

		let username = m ? m[1] : "";
		let newpassword = m ? m[3] : "";

		if (newpassword.length < 8 || newpassword.match(/^[a-zA-Z0-9]+$/) === null) {
			return res.status(401).json({ error: 'Password should be betweeen at least 8 characters or numbers.' });
		}

		else {

			let query = 'UPDATE ftduser SET password=sha512($2) WHERE username=$1';
			let result = await pool.query(query, [username, newpassword]);

		}

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Update newpassword complete" });
});

app.put('/api/auth/updatescore', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });
	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);
		
		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*):(.*)$/.exec(user_pass);
		
		let username = m ? m[1] : "";
		let table = m ? m[3] : "";
		let score = m ? m[4] : "";
		
		console.log(username, " ", table, " ", score)
		
		let addnum = Number(score);
		if (addnum === NaN || addnum < 0) {
			return res.status(401).json({ error: 'Score is invalid.' });
		}
		if (table === "") {
			return res.status(401).json({ error: 'Please select valid table.' });
		}
		//TODO: Only update Score if larger than previous
		if (table === "easy") {
			let query = 'UPDATE easyScore SET score=$2 WHERE username=$1;';
			let result = await pool.query(query, [username, addnum]);
		} else if (table === "medium") {
			let query = 'UPDATE mediumScore SET score=$2 WHERE username=$1;';
			let result = await pool.query(query, [username, addnum]);
		} else if (table === "hard") {
			let query = 'UPDATE hardScore SET score=$2 WHERE username=$1;;';
			let result = await pool.query(query, [username, addnum]);
		}

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Update score complete" });
});

app.put('/api/auth/updatedifficulty', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*):(.*)$/.exec(user_pass);

		let username = m ? m[1] : "";
		let difficulty = m ? m[3] : "";

		if (difficulty === "") {
			return res.status(401).json({ error: 'Please select preferred difficulty.' });
		}
		else {

			let query = 'UPDATE ftduser SET difficulty=$2 WHERE username=$1';
			let result = await pool.query(query, [username, difficulty]);

		}

	} catch (err) {
		return res.status(500).json({ error: 'Server error' });
	}

	res.status(200).json({ "message": "Update difficulty complete" });
});

app.delete('/api/auth/delete', async (req, res) => {
	if (!req.headers.authorization) return res.status(403).json({ error: 'No credentials sent!' });

	try {
		let m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		let user_pass = Buffer.from(m ? m[1] : "", 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass);

		let username = m ? m[1] : "";

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

app.use('/', express.static('../abyss'));

app.listen(port, function () {
	console.log('Example app listening on port ' + port);
});

