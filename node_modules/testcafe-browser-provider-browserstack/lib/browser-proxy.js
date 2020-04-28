'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    function BrowserProxy(targetHost, targetPort) {
        var _this = this;

        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            proxyPort = _ref.proxyPort,
            responseDelay = _ref.responseDelay;

        (0, _classCallCheck3.default)(this, BrowserProxy);

        this.targetHost = targetHost;
        this.targetPort = targetPort;
        this.proxyPort = proxyPort || 0;
        this.responseDelay = responseDelay || 0;

        this.server = _http2.default.createServer(function () {
            return _this._onBrowserRequest.apply(_this, arguments);
        });

        this.server.on('connection', function (socket) {
            return socket.unref();
        });
    }

    BrowserProxy.prototype._onBrowserRequest = function _onBrowserRequest(req, res) {
        var _this2 = this;

        setTimeout(function () {
            var parsedRequestUrl = (0, _url.parse)(req.url);
            var destinationUrl = 'http://' + _this2.targetHost + ':' + _this2.targetPort + parsedRequestUrl.path;

            res.statusCode = 302;

            res.setHeader('location', destinationUrl);
            res.end();
        }, this.responseDelay);
    };

    BrowserProxy.prototype.init = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var _this3 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', new _pinkie2.default(function (resolve, reject) {
                                _this3.server.listen(_this3.proxyPort, function (err) {
                                    if (err) reject(err);else {
                                        _this3.proxyPort = _this3.server.address().port;

                                        resolve();
                                    }
                                });
                            }));

                        case 1:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function init() {
            return _ref2.apply(this, arguments);
        }

        return init;
    }();

    BrowserProxy.prototype.dispose = function dispose() {
        this.server.close();
    };

    return BrowserProxy;
}();