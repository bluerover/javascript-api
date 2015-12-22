var urlUtil = require('url');
var crypto = require('crypto');

function oauthEscape(val) {
    return encodeURIComponent(val);
}

function hmacSha1(key, data) {
    return crypto.createHmac('sha1', key).update(data).digest('base64');
}

function oauthHmacSha1(key, str) {
    return hmacSha1(key, str).toString("base64");
}

function ksort(obj) {
    var sortedKeys = Object.keys(obj).sort(function(a, b) {
        if (a == b) {
            return 0;
        }
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
    });

    result = {};

    for (var key in sortedKeys) {
        result[sortedKeys[key]] = obj[sortedKeys[key]];
    }

    return result;
}

function generateSignature(key, method, url, params) {
    params = params || {};

    var decomposedUrl = urlUtil.parse(url);
    var protocol = decomposedUrl['protocol'],
        hostname = decomposedUrl['hostname'],
        path = decomposedUrl['path'];

    var normalizedUrl = protocol.toLowerCase() + "//" + hostname.toLowerCase() + path;

    var baseElements = [method.toUpperCase(), normalizedUrl];
    params = ksort(params);

    var combinedParams = [];
    for (var k in params) {
        combinedParams.push(k + "=" + params[k]);
    }
    var combinedParamString = combinedParams.join('&');
    baseElements.push(combinedParamString);

    var escapedBase = [];
    for(var element in baseElements) {
        escapedBase.push(oauthEscape(baseElements[element]));
    }

    var baseString = escapedBase.join('&');

    return oauthHmacSha1(key, baseString);
}

module.exports = {
    oauthEscape: oauthEscape,
    hmacSha1: hmacSha1,
    oauthHmacSha1: oauthHmacSha1,
    ksort: ksort,
    generateSignature: generateSignature
};