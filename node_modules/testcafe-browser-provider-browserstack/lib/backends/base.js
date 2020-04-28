'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _errorMessages = require('../templates/error-messages');

var ERROR_MESSAGES = _interopRequireWildcard(_errorMessages);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseBackend = function () {
    function BaseBackend(reportWarning) {
        (0, _classCallCheck3.default)(this, BaseBackend);

        this.reportWarning = reportWarning;
    }

    BaseBackend.prototype.getBrowsersList = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getBrowsersList() {
            return _ref.apply(this, arguments);
        }

        return getBrowsersList;
    }();

    BaseBackend.prototype.openBrowser = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function openBrowser() {
            return _ref2.apply(this, arguments);
        }

        return openBrowser;
    }();

    BaseBackend.prototype.closeBrowser = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function closeBrowser() {
            return _ref3.apply(this, arguments);
        }

        return closeBrowser;
    }();

    BaseBackend.prototype.takeScreenshot = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function takeScreenshot() {
            return _ref4.apply(this, arguments);
        }

        return takeScreenshot;
    }();

    BaseBackend.prototype.resizeWindow = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function resizeWindow() {
            return _ref5.apply(this, arguments);
        }

        return resizeWindow;
    }();

    BaseBackend.prototype.maximizeWindow = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function maximizeWindow() {
            return _ref6.apply(this, arguments);
        }

        return maximizeWindow;
    }();

    BaseBackend.prototype.reportJobResult = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());

                        case 1:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function reportJobResult() {
            return _ref7.apply(this, arguments);
        }

        return reportJobResult;
    }();

    BaseBackend.prototype.getSessionUrl = function getSessionUrl() /*id*/{
        throw new Error(ERROR_MESSAGES.API_METHOD_NOT_IMPLEMENTED());
    };

    return BaseBackend;
}();

exports.default = BaseBackend;
module.exports = exports['default'];