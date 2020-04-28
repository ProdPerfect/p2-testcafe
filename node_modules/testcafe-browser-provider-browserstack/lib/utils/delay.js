'use strict';

exports.__esModule = true;

exports.default = function (ms) {
    return new _pinkie2.default(function (resolve) {
        return setTimeout(resolve, ms);
    });
};

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];