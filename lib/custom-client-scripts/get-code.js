"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore Could not find a declaration file for module 'testcafe-hammerhead'
const testcafe_hammerhead_1 = require("testcafe-hammerhead");
const internal_properties_1 = __importDefault(require("../client/driver/internal-properties"));
function getCustomClientScriptCode(script) {
    return `try {	
        ${testcafe_hammerhead_1.processScript(script.content)}	
    }	
    catch (e) {	
       window['${internal_properties_1.default.testCafeDriverInstance}'].onCustomClientScriptError(e, '${script.module || ''}');	
    }`;
}
exports.default = getCustomClientScriptCode;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWNvZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VzdG9tLWNsaWVudC1zY3JpcHRzL2dldC1jb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0ZBQWdGO0FBQ2hGLDZEQUFvRDtBQUNwRCwrRkFBdUU7QUFHdkUsU0FBd0IseUJBQXlCLENBQUUsTUFBb0I7SUFDbkUsT0FBTztVQUNELG1DQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7O2lCQUd0Qiw2QkFBbUIsQ0FBQyxzQkFBc0Isb0NBQW9DLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRTtNQUM1RyxDQUFDO0FBQ1AsQ0FBQztBQVBELDRDQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZSBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAndGVzdGNhZmUtaGFtbWVyaGVhZCdcbmltcG9ydCB7IHByb2Nlc3NTY3JpcHQgfSBmcm9tICd0ZXN0Y2FmZS1oYW1tZXJoZWFkJztcbmltcG9ydCBJTlRFUk5BTF9QUk9QRVJUSUVTIGZyb20gJy4uL2NsaWVudC9kcml2ZXIvaW50ZXJuYWwtcHJvcGVydGllcyc7XG5pbXBvcnQgQ2xpZW50U2NyaXB0IGZyb20gJy4vY2xpZW50LXNjcmlwdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEN1c3RvbUNsaWVudFNjcmlwdENvZGUgKHNjcmlwdDogQ2xpZW50U2NyaXB0KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRyeSB7XHRcbiAgICAgICAgJHtwcm9jZXNzU2NyaXB0KHNjcmlwdC5jb250ZW50KX1cdFxuICAgIH1cdFxuICAgIGNhdGNoIChlKSB7XHRcbiAgICAgICB3aW5kb3dbJyR7SU5URVJOQUxfUFJPUEVSVElFUy50ZXN0Q2FmZURyaXZlckluc3RhbmNlfSddLm9uQ3VzdG9tQ2xpZW50U2NyaXB0RXJyb3IoZSwgJyR7c2NyaXB0Lm1vZHVsZSB8fCAnJ30nKTtcdFxuICAgIH1gO1xufVxuIl19