#!/usr/bin/env node
// @flow

/**
 * Module dependencies.
 */
require("dotenv").config();
var app = require("../app").default;
var io = require("config/socket").default;
var http = require("http");
var debug = require("debug")("app:express:server");
var constants = require("constants");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.APP_PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Config Socket.IO
 */
io.attach(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port + constants.NODE_APP_INSTANCE);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind =
    typeof port === "string"
      ? "Pipe " + port
      : typeof port === "number"
      ? "Port " + port
      : "Port false";

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind + " with NODE_ENV " + process.env.NODE_ENV);
}
