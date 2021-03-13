// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var express = require('express');
var app = express();

/**
 * Middleware applies to all sub routes
 **/
app.use('/', function (req, res,next) {
	console.log("one");
	next(); // go to next middleware
}, function (req, res,next) {
        console.log("two");
        next("route"); // go to next middleware
}, function (req, res,next) {
        console.log("three");
        next(); // go to next middleware
});

/**
 * Middleware applies to all sub routes
 **/
app.use('/', function (req, res,next) {
	console.log("four");
	next(); // go to next middleware
}, function (req, res,next) {
        console.log("five");
        next("route"); // go to next middleware
}, function (req, res,next) {
        console.log("six");
        next(); // go to next middleware
});

/**
 * Route as middlewhare
 **/
app.get('/zzz', function (req,res,next) {
	console.log("(1)");
	next(); // go to next middleware
}, function (req, res,next) {
        console.log("(2)");
        next("route"); // go to next middleware
}, function (req, res,next) {
        console.log("(3)");
        next(); // go to next middleware
});

app.get('/zzz', function (req,res,next) {
	console.log("(4)");
	next(); // go to next middleware
}, function (req, res,next) {
        console.log("(5)");
        next("route"); // go to next middleware
}, function (req, res,next) {
        console.log("(6)");
        next(); // go to next middleware
});

app.get('/zzz', function (req,res,next) {
	res.status(200).json({"success":"got here!"});
});

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

