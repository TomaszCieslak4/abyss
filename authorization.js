// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var express = require('express');
var app = express();

// Non authenticated route. Can visit this without credentials
app.get('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});
app.use('/',express.static('static_content')); 

/**
 * middleware function used to intercept non authorized requests
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
 **/
function authorize(req, res, next){
        if (!req.headers.authorization) {
                return res.status(403).json({ error: 'No credentials sent!' });
        }
        try {
                // var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
                var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

                var user_pass = Buffer.from(m[1], 'base64').toString()
                m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

                var username = m[1];
                var password = m[2];

                if(username=="arnold" && password=="spiderman"){
                        next();
                } else {
                        res.status(403).json({ error: 'Not authorized'});
                }
        } catch(err) {
                res.status(403).json({ error: 'Not authorized'});
        }
}

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ and /content/auth/
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
**/
app.use('/api/auth', authorize);
app.use('/content/auth/',authorize); 

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.get('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

app.use('/content/auth/',express.static('static_content_auth')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

