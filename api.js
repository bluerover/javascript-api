/**
 * BlueRover Stream API Module for Node.js
 *
 * Written By: Andrew Hassan
 * January 12, 2013
 */

var urlUtil = require('url'),
    querystring = require('querystring'),
    http = require('http'),
    BlueRoverStream = require('./stream'),
    utils = require('./utils');

function isEmpty(str) {
    return str === "";
}

function isNull(str) {
    return str === null || typeof(str) === 'undefined';
}

function isNullOrEmpty(str) {
    return isNull(str) || isEmpty(str);
}

module.exports = BlueRoverApi;

function BlueRoverApi(key, token, baseUrl) {
    if (isNullOrEmpty(key) || isNullOrEmpty(token) || isNullOrEmpty(baseUrl)) {
        throw new Error("BlueRover API: key, token, and base URL must contain valid values.");
    }
    this.key = key;
    this.token = token;
    this.baseUrl = baseUrl;
}

BlueRoverApi.prototype.setCredentials = function (credentials) {
    key = credentials['key'];
    token = credentials['token'];
    baseUrl = credentials['baseUrl'];

    if (isNullOrEmpty(key) || isNullOrEmpty(token) || isNullOrEmpty(baseUrl)) {
        throw new Error("BlueRover API: key, token, and base URL must contain valid values.");
    }

    this.key = key;
    this.token = token;
    this.baseUrl = baseUrl;
}

BlueRoverApi.prototype.createStream = function(relativeUrl) {
    relativeUrl = relativeUrl || '/eventstream';
    var stream = new BlueRoverStream(
        this.key,
        this.token,
        this.baseUrl + relativeUrl
    );
    return stream;
}

BlueRoverApi.prototype.call = function (relativeUrl, params, callback, post) {
    // The BlueRover API doesn't support POST requests yet
    if (post) console.log("The BlueRover API doesn't support POST requests yet");
    post = false;

    params = params || {};
    callback = callback || function(){};

    params = utils.ksort(params);

    var url = this.baseUrl + relativeUrl;
    var method = "GET";

    if (post) {
        method = "POST";
    }

    var signature = utils.generateSignature(this.key, method, url, params);

    if (!post) {
        var qs = querystring.encode(params);

        if (!isEmpty(qs)) {
            qs = "?" + qs;
        }


        var endpoint = url + qs;
        var parsedUrl = urlUtil.parse(endpoint);
        var options = {
            host: parsedUrl['host'],
            path: parsedUrl['path'],
            headers: {
                "Authorization": "BR " + this.token + ":" + signature
            }
        };

        var request = http.request(options, function(response) {
            var strData = "";

            response.on('data', function(data) {
                //console.log(strData);
                strData += data.toString('utf-8');
            });

            response.on('end', function() {
                callback(strData);
            })
        });

        request.end();
    }
    else {
        throw new Error("BlueRover API: POST is not supported yet.");
    }
}
