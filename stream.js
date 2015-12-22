var _ = require('lodash');
var utils = require('./utils');
var http = require('http');
var urlUtil = require('url');

/**
 * BlueRoverStream
 * JavaScript client to connect to the BlueRover Stream API
 *
 * Usage:
 * 1. Create an instance of the BlueRoverStream object
 * 2. Register callbacks with the 'on' method
 * 3. Call 'start' to create the connection
 *
 * @param {string} key: API key
 * @param {string} token: API token
 * @param {string} url: URL
 * @param {object} options
 * @param {number} options.reconnectTimeout: The number of milliseconds to wait
 *   before reconnecting to the API
 */
function BlueRoverStream(key, token, url, options) {
  this.key = key;
  this.token = token;
  this.url = url || '';
  this.callbacks = {
    'data': [],
    'error': []
  };
  this.options = options || {};
  this.request = null;

  // Default is 10 minutes
  this.options.reconnectTimeout = this.options.reconnectTimeout || 600000;
  this.options.reconnectOnError = this.options.reconnectOnError || false;
  this.timeoutInterval = null;
};

/**
 * Registers a callback for a specific event
 *
 * @param {string} event: Only 'data' and 'error' are supported right now
 * @param {function} callback
 */
BlueRoverStream.prototype.on = function(event, callback) {
  if (!(event in this.callbacks)) {
    return console.error('[BlueRoverStream] Invalid event type registered');
  }

  var callbacks = this.callbacks[event];
  callbacks.push(callback);
};

/**
 * This method starts the BlueRover Stream API connection
 */
BlueRoverStream.prototype.start = function() {
  if (this.request) {
    this.close();
  }

  var signature = utils.generateSignature(this.key, 'GET', this.url, {});

  // Parse the URL and generate the http request options
  var parsedUrl = urlUtil.parse(this.url);
  var options = {
      host: parsedUrl['host'],
      path: parsedUrl['path'],
      headers: {
          "Authorization": "BR " + this.token + ":" + signature,
          'Connection': 'keep-alive'
      }
  };

  // Create the request
  this.request = http.request(options, function(response) {
    console.log('[BlueRoverStream] Connected');

    // Set timeout interval
    this._setTimeout();

    // On data, call the callback function
    response.on('data', function(data) {
      // Reset timeout interval
      this._setTimeout();

      _.forEach(this.callbacks['data'], function(callback) {
        callback(data);
      });
    }.bind(this));
  }.bind(this));

  this.request.on('error', function(e) {
    console.log('[BlueRoverStream] Request had an error');
    _.forEach(this.callbacks['error'], function(callback) {
      callback(data);
    });

    if (this.options.reconnectOnError) {
      this.close();
      this.start();
    }
  }.bind(this));

  this.request.end();
};

/**
 * @private
 */
BlueRoverStream.prototype._setTimeout = function() {
  clearInterval(this.timeoutInterval);
  this.timeoutInterval = setInterval(function() {
    // If the timeout occurs, then close the connection, and start a new one
    console.log('[BlueRoverStream] Connection timeout reached...reconnecting');
    this.close();
    this.start();
  }.bind(this), this.options.reconnectTimeout);
};

/**
 * This method will close the active connection
 */
BlueRoverStream.prototype.close = function() {
  if (this.request) {
    this.request.abort();
    clearInterval(this.timeoutInterval);
    this.request = null;
    console.log('[BlueRoverStream] Closed connection');
  }
  else {
    console.log('[BlueRoverStream] Attempting to close a stream that isn\'t open');
  }
};


module.exports = BlueRoverStream;