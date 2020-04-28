'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _util = require('util');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _requestApi = require('../utils/request-api');

var _requestApi2 = _interopRequireDefault(_requestApi);

var _createBrowserstackStatus = require('../utils/create-browserstack-status');

var _createBrowserstackStatus2 = _interopRequireDefault(_createBrowserstackStatus);

var _getApiPollingInterval = require('../utils/get-api-polling-interval');

var _getApiPollingInterval2 = _interopRequireDefault(_getApiPollingInterval);

var _errorMessages = require('../templates/error-messages');

var ERROR_MESSAGES = _interopRequireWildcard(_errorMessages);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_POLLING_INTERVAL = (0, _getApiPollingInterval2.default)();

var BROWSERSTACK_API_PATHS = {
    browserList: {
        url: 'https://api.browserstack.com/automate/browsers.json'
    },

    newSession: {
        url: 'http://hub-cloud.browserstack.com/wd/hub/session',
        method: 'POST'
    },

    openUrl: function openUrl(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/url',
            method: 'POST'
        };
    },

    getWindowSize: function getWindowSize(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/window/current/size'
        };
    },

    setWindowSize: function setWindowSize(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/window/current/size',
            method: 'POST'
        };
    },

    maximizeWindow: function maximizeWindow(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/window/current/maximize',
            method: 'POST'
        };
    },

    getUrl: function getUrl(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/url'
        };
    },

    deleteSession: function deleteSession(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id,
            method: 'DELETE'
        };
    },

    screenshot: function screenshot(id) {
        return {
            url: 'http://hub-cloud.browserstack.com/wd/hub/session/' + id + '/screenshot'
        };
    },

    getStatus: function getStatus(id) {
        return {
            url: 'https://api.browserstack.com/automate/sessions/' + id + '.json'
        };
    },

    setStatus: function setStatus(id) {
        return {
            url: 'https://api.browserstack.com/automate/sessions/' + id + '.json',
            method: 'PUT'
        };
    }
};

function requestApi(path, params) {
    return (0, _requestApi2.default)(path, params).then(function (response) {
        if (response.status) {
            throw new Error(ERROR_MESSAGES.REMOTE_API_REQUEST_FAILED({
                status: response.status,
                apiResponse: response.value && response.value.message || (0, _util.inspect)(response)
            }));
        }

        return response;
    });
}

function getCorrectedSize(currentClientAreaSize, currentWindowSize, requestedSize) {
    var horizontalChrome = currentWindowSize.width - currentClientAreaSize.width;
    var verticalChrome = currentWindowSize.height - currentClientAreaSize.height;

    return {
        width: requestedSize.width + horizontalChrome,
        height: requestedSize.height + verticalChrome
    };
}

var AutomateBackend = function (_BaseBackend) {
    (0, _inherits3.default)(AutomateBackend, _BaseBackend);

    function AutomateBackend() {
        (0, _classCallCheck3.default)(this, AutomateBackend);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, _BaseBackend.call.apply(_BaseBackend, [this].concat(args)));

        _this.sessions = {};
        return _this;
    }

    AutomateBackend._ensureSessionId = function _ensureSessionId(sessionInfo) {
        var sessionData = sessionInfo.value || {};
        var sessionCapabilities = sessionData.capabilities || {};

        sessionInfo.sessionId = sessionInfo.sessionId || sessionData.sessionId || sessionData['webdriver.remote.sessionid'] || sessionCapabilities['webdriver.remote.sessionid'];

        if (!sessionInfo.sessionId) {
            throw new Error(ERROR_MESSAGES.SESSION_ID_NOT_FOUND({
                sessionInfoDump: (0, _util.inspect)(sessionInfo)
            }));
        }
    };

    AutomateBackend.prototype._requestSessionUrl = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
            var sessionInfo;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.getStatus(this.sessions[id].sessionId));

                        case 2:
                            sessionInfo = _context.sent;
                            return _context.abrupt('return', sessionInfo['automation_session']['browser_url']);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _requestSessionUrl(_x) {
            return _ref.apply(this, arguments);
        }

        return _requestSessionUrl;
    }();

    AutomateBackend.prototype._requestCurrentWindowSize = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id) {
            var currentWindowSizeData;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return requestApi(BROWSERSTACK_API_PATHS.getWindowSize(this.sessions[id].sessionId));

                        case 2:
                            currentWindowSizeData = _context2.sent;
                            return _context2.abrupt('return', {
                                width: currentWindowSizeData.value.width,
                                height: currentWindowSizeData.value.height
                            });

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _requestCurrentWindowSize(_x2) {
            return _ref2.apply(this, arguments);
        }

        return _requestCurrentWindowSize;
    }();

    AutomateBackend.prototype.getBrowsersList = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var platformsInfo;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.browserList);

                        case 2:
                            platformsInfo = _context3.sent;
                            return _context3.abrupt('return', platformsInfo.reverse());

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function getBrowsersList() {
            return _ref3.apply(this, arguments);
        }

        return getBrowsersList;
    }();

    AutomateBackend.prototype.getSessionUrl = function getSessionUrl(id) {
        return this.sessions[id] ? this.sessions[id].sessionUrl : '';
    };

    AutomateBackend.prototype.openBrowser = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(id, pageUrl, capabilities) {
            var _capabilities, localIdentifier, local, restCapabilities, sessionId;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _capabilities = capabilities, localIdentifier = _capabilities.localIdentifier, local = _capabilities.local, restCapabilities = (0, _objectWithoutProperties3.default)(_capabilities, ['localIdentifier', 'local']);


                            capabilities = (0, _extends3.default)({
                                'browserstack.localIdentifier': localIdentifier,
                                'browserstack.local': local
                            }, restCapabilities);

                            _context4.next = 4;
                            return requestApi(BROWSERSTACK_API_PATHS.newSession, {
                                body: { desiredCapabilities: capabilities },

                                executeImmediately: true
                            });

                        case 4:
                            this.sessions[id] = _context4.sent;


                            AutomateBackend._ensureSessionId(this.sessions[id]);

                            _context4.next = 8;
                            return this._requestSessionUrl(id);

                        case 8:
                            this.sessions[id].sessionUrl = _context4.sent;
                            sessionId = this.sessions[id].sessionId;


                            this.sessions[id].interval = setInterval(function () {
                                return requestApi(BROWSERSTACK_API_PATHS.getUrl(sessionId), { executeImmediately: true });
                            }, API_POLLING_INTERVAL);

                            _context4.next = 13;
                            return requestApi(BROWSERSTACK_API_PATHS.openUrl(sessionId), { body: { url: pageUrl } });

                        case 13:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function openBrowser(_x3, _x4, _x5) {
            return _ref4.apply(this, arguments);
        }

        return openBrowser;
    }();

    AutomateBackend.prototype.closeBrowser = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id) {
            var session;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            session = this.sessions[id];

                            if (session) {
                                _context5.next = 3;
                                break;
                            }

                            return _context5.abrupt('return');

                        case 3:

                            clearInterval(session.interval);

                            delete this.sessions[id];

                            // Delete session whose sessionId is created

                            if (!(session.sessionId && session.sessionId !== '')) {
                                _context5.next = 8;
                                break;
                            }

                            _context5.next = 8;
                            return requestApi(BROWSERSTACK_API_PATHS.deleteSession(session.sessionId));

                        case 8:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function closeBrowser(_x6) {
            return _ref5.apply(this, arguments);
        }

        return closeBrowser;
    }();

    AutomateBackend.prototype.takeScreenshot = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(id, screenshotPath) {
            var _this2 = this;

            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            return _context7.abrupt('return', new _pinkie2.default(function () {
                                var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(resolve, reject) {
                                    var base64Data, buffer;
                                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                                        while (1) {
                                            switch (_context6.prev = _context6.next) {
                                                case 0:
                                                    _context6.next = 2;
                                                    return requestApi(BROWSERSTACK_API_PATHS.screenshot(_this2.sessions[id].sessionId));

                                                case 2:
                                                    base64Data = _context6.sent;
                                                    buffer = Buffer.from(base64Data.value, 'base64');


                                                    _jimp2.default.read(buffer).then(function (image) {
                                                        return image.write(screenshotPath, resolve);
                                                    }).catch(reject);

                                                case 5:
                                                case 'end':
                                                    return _context6.stop();
                                            }
                                        }
                                    }, _callee6, _this2);
                                }));

                                return function (_x9, _x10) {
                                    return _ref7.apply(this, arguments);
                                };
                            }()));

                        case 1:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function takeScreenshot(_x7, _x8) {
            return _ref6.apply(this, arguments);
        }

        return takeScreenshot;
    }();

    AutomateBackend.prototype.resizeWindow = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(id, width, height, currentWidth, currentHeight) {
            var sessionId, currentWindowSize, currentClientAreaSize, requestedSize, correctedSize;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            sessionId = this.sessions[id].sessionId;
                            _context8.next = 3;
                            return this._requestCurrentWindowSize(id);

                        case 3:
                            currentWindowSize = _context8.sent;
                            currentClientAreaSize = { width: currentWidth, height: currentHeight };
                            requestedSize = { width: width, height: height };
                            correctedSize = getCorrectedSize(currentClientAreaSize, currentWindowSize, requestedSize);
                            _context8.next = 9;
                            return requestApi(BROWSERSTACK_API_PATHS.setWindowSize(sessionId), { body: correctedSize });

                        case 9:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function resizeWindow(_x11, _x12, _x13, _x14, _x15) {
            return _ref8.apply(this, arguments);
        }

        return resizeWindow;
    }();

    AutomateBackend.prototype.maximizeWindow = function () {
        var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(id) {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.next = 2;
                            return requestApi(BROWSERSTACK_API_PATHS.maximizeWindow(this.sessions[id].sessionId));

                        case 2:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function maximizeWindow(_x16) {
            return _ref9.apply(this, arguments);
        }

        return maximizeWindow;
    }();

    AutomateBackend.prototype.reportJobResult = function () {
        var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(id, jobResult, jobData, possibleResults) {
            var sessionId, jobStatus;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            sessionId = this.sessions[id].sessionId;
                            jobStatus = (0, _createBrowserstackStatus2.default)(jobResult, jobData, possibleResults);
                            _context10.next = 4;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.setStatus(sessionId), { body: jobStatus });

                        case 4:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function reportJobResult(_x17, _x18, _x19, _x20) {
            return _ref10.apply(this, arguments);
        }

        return reportJobResult;
    }();

    return AutomateBackend;
}(_base2.default);

exports.default = AutomateBackend;
module.exports = exports['default'];