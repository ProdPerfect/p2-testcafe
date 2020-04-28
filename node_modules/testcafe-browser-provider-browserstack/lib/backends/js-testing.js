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

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _requestApi = require('../utils/request-api');

var _requestApi2 = _interopRequireDefault(_requestApi);

var _createBrowserstackStatus = require('../utils/create-browserstack-status');

var _createBrowserstackStatus2 = _interopRequireDefault(_createBrowserstackStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TESTS_TIMEOUT = process.env['BROWSERSTACK_TEST_TIMEOUT'] || 1800;

var BROWSERSTACK_API_PATHS = {
    browserList: {
        url: 'https://api.browserstack.com/4/browsers?flat=true'
    },

    newWorker: {
        url: 'https://api.browserstack.com/4/worker',
        method: 'POST'
    },

    getWorkerInfo: function getWorkerInfo(id) {
        return {
            url: 'https://api.browserstack.com/4/worker/' + id
        };
    },

    deleteWorker: function deleteWorker(id) {
        return {
            url: 'https://api.browserstack.com/4/worker/' + id,
            method: 'DELETE'
        };
    },

    screenshot: function screenshot(id) {
        return {
            url: 'https://api.browserstack.com/4/worker/' + id + '/screenshot.png',
            encoding: null
        };
    },

    setStatus: function setStatus(id) {
        return {
            url: 'https://api.browserstack.com/automate/sessions/' + id + '.json',
            method: 'PUT'
        };
    }
};

var JSTestingBackend = function (_BaseBackend) {
    (0, _inherits3.default)(JSTestingBackend, _BaseBackend);

    function JSTestingBackend() {
        (0, _classCallCheck3.default)(this, JSTestingBackend);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, _BaseBackend.call.apply(_BaseBackend, [this].concat(args)));

        _this.workers = {};
        return _this;
    }

    JSTestingBackend.prototype._requestSessionUrl = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
            var workerInfo;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.getWorkerInfo(this.workers[id].id));

                        case 2:
                            workerInfo = _context.sent;
                            return _context.abrupt('return', workerInfo['browser_url']);

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

    JSTestingBackend.prototype._getSessionId = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id) {
            var sessionIdMatch;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            sessionIdMatch = this.workers[id].sessionUrl.match(/[^/]*$/);
                            return _context2.abrupt('return', sessionIdMatch && sessionIdMatch[0]);

                        case 2:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _getSessionId(_x2) {
            return _ref2.apply(this, arguments);
        }

        return _getSessionId;
    }();

    JSTestingBackend.prototype.getBrowsersList = function () {
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

    JSTestingBackend.prototype.getSessionUrl = function getSessionUrl(id) {
        return this.workers[id] ? this.workers[id].sessionUrl : '';
    };

    JSTestingBackend.prototype.openBrowser = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(id, pageUrl, capabilities) {
            var _capabilities, local, restCapabilities;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _capabilities = capabilities, local = _capabilities.local, restCapabilities = (0, _objectWithoutProperties3.default)(_capabilities, ['local']);


                            capabilities = (0, _extends3.default)({
                                'browserstack.local': local,

                                timeout: TESTS_TIMEOUT,
                                url: pageUrl

                            }, restCapabilities);

                            _context4.next = 4;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.newWorker, (0, _extends3.default)({
                                executeImmediately: true

                            }, capabilities));

                        case 4:
                            this.workers[id] = _context4.sent;


                            this.workers[id].started = Date.now();
                            _context4.next = 8;
                            return this._requestSessionUrl(id);

                        case 8:
                            this.workers[id].sessionUrl = _context4.sent;
                            _context4.next = 11;
                            return this._getSessionId(id);

                        case 11:
                            this.workers[id].sessionId = _context4.sent;

                        case 12:
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

    JSTestingBackend.prototype.closeBrowser = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id) {
            var workerId;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            workerId = this.workers[id].id;

                            // Return incase of invalid workerId

                            if (!(!workerId || workerId === '')) {
                                _context5.next = 3;
                                break;
                            }

                            return _context5.abrupt('return');

                        case 3:
                            _context5.next = 5;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.deleteWorker(workerId));

                        case 5:
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

    JSTestingBackend.prototype.takeScreenshot = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(id, screenshotPath) {
            var buffer, image;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.screenshot(this.workers[id].id));

                        case 2:
                            buffer = _context6.sent;
                            _context6.next = 5;
                            return _jimp2.default.read(buffer);

                        case 5:
                            image = _context6.sent;
                            _context6.next = 8;
                            return image.writeAsync(screenshotPath);

                        case 8:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function takeScreenshot(_x7, _x8) {
            return _ref6.apply(this, arguments);
        }

        return takeScreenshot;
    }();

    JSTestingBackend.prototype.resizeWindow = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(id) {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            this.reportWarning(id, 'The window resize functionality is not supported by the Browserstack JS Testing API. Use the Browserstack Automate API.');

                        case 1:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function resizeWindow(_x9) {
            return _ref7.apply(this, arguments);
        }

        return resizeWindow;
    }();

    JSTestingBackend.prototype.maximizeWindow = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(id) {
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            this.reportWarning(id, 'The window maximization functionality is not supported by the Browserstack JS Testing API. Use the Browserstack Automate API.');

                        case 1:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function maximizeWindow(_x10) {
            return _ref8.apply(this, arguments);
        }

        return maximizeWindow;
    }();

    JSTestingBackend.prototype.reportJobResult = function () {
        var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(id, jobResult, jobData, possibleResults) {
            var sessionId, jobStatus;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            sessionId = this.workers[id].sessionId;
                            jobStatus = (0, _createBrowserstackStatus2.default)(jobResult, jobData, possibleResults);
                            _context9.next = 4;
                            return (0, _requestApi2.default)(BROWSERSTACK_API_PATHS.setStatus(sessionId), { body: jobStatus });

                        case 4:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function reportJobResult(_x11, _x12, _x13, _x14) {
            return _ref9.apply(this, arguments);
        }

        return reportJobResult;
    }();

    return JSTestingBackend;
}(_base2.default);

exports.default = JSTestingBackend;
module.exports = exports['default'];