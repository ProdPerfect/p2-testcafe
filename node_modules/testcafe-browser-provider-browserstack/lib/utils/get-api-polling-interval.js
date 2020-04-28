'use strict';

exports.__esModule = true;

exports.default = function () {
    var pollingInterval = (0, _lodash.toInteger)(process.env.TESTCAFE_BROWSERSTACK_API_POLLING_INTERVAL) || DEFAULT_API_POLLING_INTERVAL;

    if (pollingInterval > MAX_API_POLLING_INTERVAL) process.emitWarning((0, _warningMessages.API_POLLING_INTERVAL_IS_TOO_LARGE)({ actual: pollingInterval, expected: MAX_API_POLLING_INTERVAL }));

    return pollingInterval;
};

var _lodash = require('lodash');

var _warningMessages = require('../templates/warning-messages');

// NOTE: We need to continuously poll BrowserStack APIs in Automate sessions to avoid the idle timeout.
// The value can be reduced for unstable network connections if there is a high risk of random request failures.
var DEFAULT_API_POLLING_INTERVAL = 80000;

// NOTE: the max value is capped at the BrowserStack idle timeout.
// https://www.browserstack.com/automate/timeouts
var MAX_API_POLLING_INTERVAL = 90000;

module.exports = exports['default'];