'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.default = function (apiPath) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!process.env['BROWSERSTACK_USERNAME'] || !process.env['BROWSERSTACK_ACCESS_KEY']) throw new Error(ERROR_MESSAGES.BROWSERSTACK_AUTHENTICATION_FAILED());

    var body = params.body,
        executeImmediately = params.executeImmediately,
        queryParams = (0, _objectWithoutProperties3.default)(params, ['body', 'executeImmediately']);


    var opts = {
        url: apiPath.url,
        auth: {
            user: process.env['BROWSERSTACK_USERNAME'],
            pass: process.env['BROWSERSTACK_ACCESS_KEY']
        },

        headers: {
            'user-agent': 'testcafe-browserstack'
        },

        qs: (0, _extends3.default)({}, queryParams),

        method: apiPath.method || 'GET',
        json: apiPath.encoding === void 0
    };

    var proxy = process.env['BROWSERSTACK_PROXY'];

    if (proxy) opts.proxy = 'http://' + proxy;

    if (body) opts.body = body;

    if (apiPath.encoding !== void 0) opts.encoding = apiPath.encoding;

    var chainPromise = executeImmediately ? _pinkie2.default.resolve(null) : apiRequestPromise;

    var currentRequestPromise = chainPromise.then(function () {
        return (0, _requestPromise2.default)(opts);
    }).catch(function (error) {
        if (error.statusCode === 401) throw new Error(ERROR_MESSAGES.BROWSERSTACK_AUTHENTICATION_FAILED());

        throw error;
    });

    return currentRequestPromise;
};

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _errorMessages = require('../templates/error-messages');

var ERROR_MESSAGES = _interopRequireWildcard(_errorMessages);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiRequestPromise = _pinkie2.default.resolve(null);

module.exports = exports['default'];