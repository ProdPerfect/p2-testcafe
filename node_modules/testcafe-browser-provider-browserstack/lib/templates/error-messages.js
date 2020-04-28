'use strict';

exports.__esModule = true;
exports.SESSION_ID_NOT_FOUND = exports.REMOTE_API_REQUEST_FAILED = exports.API_METHOD_NOT_IMPLEMENTED = exports.BROWSERSTACK_AUTHENTICATION_FAILED = undefined;

var _taggedTemplateLiteralLoose2 = require('babel-runtime/helpers/taggedTemplateLiteralLoose');

var _taggedTemplateLiteralLoose3 = _interopRequireDefault(_taggedTemplateLiteralLoose2);

var _templateObject = (0, _taggedTemplateLiteralLoose3.default)(['\n    API error ', ': \n    \n    ', '\n'], ['\n    API error ', ': \n    \n    ', '\n']),
    _templateObject2 = (0, _taggedTemplateLiteralLoose3.default)([' \n    Unable to find a session ID in the following session information: \n    \n    ', '\n'], [' \n    Unable to find a session ID in the following session information: \n    \n    ', '\n']);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BROWSERSTACK_AUTHENTICATION_FAILED = exports.BROWSERSTACK_AUTHENTICATION_FAILED = function BROWSERSTACK_AUTHENTICATION_FAILED() {
    return 'Authentication failed. Please assign the correct username and access key to the BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.';
};
var API_METHOD_NOT_IMPLEMENTED = exports.API_METHOD_NOT_IMPLEMENTED = function API_METHOD_NOT_IMPLEMENTED() {
    return 'The API method is not implemented';
};

var REMOTE_API_REQUEST_FAILED = exports.REMOTE_API_REQUEST_FAILED = function REMOTE_API_REQUEST_FAILED(_ref) {
    var status = _ref.status,
        apiResponse = _ref.apiResponse;
    return (0, _dedent2.default)(_templateObject, status, apiResponse);
};

var SESSION_ID_NOT_FOUND = exports.SESSION_ID_NOT_FOUND = function SESSION_ID_NOT_FOUND(_ref2) {
    var sessionInfoDump = _ref2.sessionInfoDump;
    return (0, _dedent2.default)(_templateObject2, sessionInfoDump);
};