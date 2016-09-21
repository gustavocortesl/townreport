// Define database connection string and
// use it to open Mongoose connection
var mongoose = require( 'mongoose' );
var gracefulShutdown;
var dbURI = 'mongodb://localhost/TownReport';
if (process.env.NODE_ENV === 'production') {
  //dbURI = 'mongodb://gustavocortesl:xto2la22@ds046549.mlab.com:29635/townreport'
  dbURI = process.env.MONGOLAB_URI;
}
mongoose.connect(dbURI);

/* 
// Listening for SIGINT on Windows
// To emulate this behavior on Windows you first
// add 'readline' npm package to your application
var readLine = require ("readline");
if (process.platform === "win32"){
  var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ("SIGINT", function (){
    process.emit ("SIGINT");
  });
}
*/

// Listen for Mongoose connection events
// and output statuses to console
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

// Reusable function to close Mongoose connection
var gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

// Listen to Node processes for termination or restart signals,
// and call gracefulShutdown function when appropriate,
// passing a continuation callback
// For nodemon restarts
process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function () {
  gracefulShutdown('app termination', function () {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
  });
});

// use schemas
require('./locations');
require('./problems');
require('./users');
