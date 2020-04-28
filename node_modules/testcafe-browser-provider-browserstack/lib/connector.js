'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _browserstackLocal = require('browserstack-local');

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROXY_AUTH_RE = /^([^:]*)(?::(.*))?$/;

var identity = function identity(x) {
    return x;
};

var capitalize = function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
};

function copyOptions(source, destination) {
    var transfromFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity;

    (0, _keys2.default)(source).forEach(function (key) {
        return source[key] && (destination[transfromFunc(key)] = source[key]);
    });
}

function getProxyOptions(proxyConfig) {
    try {
        var _nodeUrl$parse = _url2.default.parse('http://' + proxyConfig),
            hostname = _nodeUrl$parse.hostname,
            port = _nodeUrl$parse.port,
            auth = _nodeUrl$parse.auth;

        var parsedAuth = auth && auth.match(PROXY_AUTH_RE);

        return {
            host: hostname === 'undefined' ? null : hostname,
            port: port,
            user: parsedAuth && parsedAuth[1],
            pass: parsedAuth && parsedAuth[2]
        };
    } catch (e) {
        return {};
    }
}

var BrowserstackConnector = function () {
    function BrowserstackConnector(accessKey) {
        (0, _classCallCheck3.default)(this, BrowserstackConnector);

        this.accessKey = accessKey;
        this.connectorInstance = null;
        this.tempFileName = '';
    }

    BrowserstackConnector.prototype._getTempFileName = function _getTempFileName() {
        if (!this.tempFileName) {
            _tmp2.default.setGracefulCleanup();

            this.tempFileName = _tmp2.default.tmpNameSync({ unsafeCleanup: true });
        }

        return this.tempFileName;
    };

    BrowserstackConnector.prototype.create = function create() {
        var _this = this;

        return new _pinkie2.default(function (resolve, reject) {
            var connector = new _browserstackLocal.Local();
            var parallelRuns = process.env['BROWSERSTACK_PARALLEL_RUNS'];
            var logfile = process.env['BROWSERSTACK_LOGFILE'] || (_osFamily2.default.win ? _this._getTempFileName() : '/dev/null');
            var verbose = process.env['BROWSERSTACK_VERBOSE'];
            var binarypath = process.env['BROWSERSTACK_BINARY_PATH'];

            var opts = (0, _extends3.default)({
                key: _this.accessKey,
                logfile: logfile,
                forceLocal: !!process.env['BROWSERSTACK_FORCE_LOCAL'],
                forceProxy: !!process.env['BROWSERSTACK_FORCE_PROXY'],
                localIdentifier: Date.now()

            }, parallelRuns ? { parallelRuns: parallelRuns } : {}, verbose ? { verbose: verbose } : {}, binarypath ? { binarypath: binarypath } : {}, {

                //NOTE: additional args use different format
                'enable-logging-for-api': true
            });

            var proxyOptions = getProxyOptions(process.env['BROWSERSTACK_PROXY']);
            var localProxyOptions = getProxyOptions(process.env['BROWSERSTACK_LOCAL_PROXY']);

            copyOptions(proxyOptions, opts, function (key) {
                return 'proxy' + capitalize(key);
            });
            copyOptions(localProxyOptions, opts, function (key) {
                return 'local-proxy-' + key;
            });

            connector.start(opts, function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                _this.connectorInstance = connector;
                resolve(connector);
            });
        });
    };

    BrowserstackConnector.prototype.destroy = function destroy() {
        var _this2 = this;

        return new _pinkie2.default(function (resolve, reject) {
            _this2.connectorInstance.stop(function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    };

    return BrowserstackConnector;
}();

exports.default = BrowserstackConnector;
module.exports = exports['default'];