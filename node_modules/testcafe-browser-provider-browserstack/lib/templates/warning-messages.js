'use strict';

exports.__esModule = true;
exports.API_POLLING_INTERVAL_IS_TOO_LARGE = undefined;

var _taggedTemplateLiteralLoose2 = require('babel-runtime/helpers/taggedTemplateLiteralLoose');

var _taggedTemplateLiteralLoose3 = _interopRequireDefault(_taggedTemplateLiteralLoose2);

var _templateObject = (0, _taggedTemplateLiteralLoose3.default)(['\n    The API Polling interval is set to ', '. It shouldn\'t exceed the BrowserStack idle timeout, which is ', '.\n    Stability and performance are not guaranteed.\n'], ['\n    The API Polling interval is set to ', '. It shouldn\'t exceed the BrowserStack idle timeout, which is ', '.\n    Stability and performance are not guaranteed.\n']);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_POLLING_INTERVAL_IS_TOO_LARGE = exports.API_POLLING_INTERVAL_IS_TOO_LARGE = function API_POLLING_INTERVAL_IS_TOO_LARGE(_ref) {
    var actual = _ref.actual,
        expected = _ref.expected;
    return (0, _dedent2.default)(_templateObject, actual, expected);
};