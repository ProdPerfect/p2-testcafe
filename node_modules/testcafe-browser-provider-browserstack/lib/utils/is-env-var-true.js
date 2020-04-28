'use strict';

exports.__esModule = true;

exports.default = function (envVar) {
    return process.env[envVar] && process.env[envVar] !== '0';
};

module.exports = exports['default'];