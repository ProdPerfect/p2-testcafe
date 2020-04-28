"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lazyRequire = require('import-lazy')(require);
const ClientFunctionBuilder = lazyRequire('../../client-functions/client-function-builder');
const SelectorBuilder = lazyRequire('../../client-functions/selectors/selector-builder');
const role = lazyRequire('../../role');
const createRequestLogger = lazyRequire('../request-hooks/request-logger');
const createRequestMock = lazyRequire('../request-hooks/request-mock');
// NOTE: We can't use lazy require for RequestHook, because it will break base class detection for inherited classes
let RequestHook = null;
// NOTE: We can't use lazy require for testControllerProxy, because it will break test controller detection
let testControllerProxy = null;
function Role(loginPage, initFn, options) {
    return role.createRole(loginPage, initFn, options);
}
function RequestMock() {
    return createRequestMock();
}
function RequestLogger(requestFilterRuleInit, logOptions) {
    return createRequestLogger(requestFilterRuleInit, logOptions);
}
function ClientFunction(fn, options) {
    const builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });
    return builder.getFunction();
}
function Selector(fn, options) {
    const builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });
    return builder.getFunction();
}
Object.defineProperty(Role, 'anonymous', {
    get: () => role.createAnonymousRole
});
exports.default = {
    Role,
    ClientFunction,
    Selector,
    RequestLogger,
    RequestMock,
    get RequestHook() {
        if (!RequestHook)
            RequestHook = require('../request-hooks/hook');
        return RequestHook;
    },
    get t() {
        if (!testControllerProxy)
            testControllerProxy = require('../test-controller/proxy');
        return testControllerProxy;
    }
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL2V4cG9ydGFibGUtbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxXQUFXLEdBQWEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlELE1BQU0scUJBQXFCLEdBQUcsV0FBVyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7QUFDNUYsTUFBTSxlQUFlLEdBQVMsV0FBVyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7QUFDL0YsTUFBTSxJQUFJLEdBQW9CLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RCxNQUFNLG1CQUFtQixHQUFLLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQzdFLE1BQU0saUJBQWlCLEdBQU8sV0FBVyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFFM0Usb0hBQW9IO0FBQ3BILElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUV2QiwyR0FBMkc7QUFDM0csSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFFL0IsU0FBUyxJQUFJLENBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPO0lBQ3JDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFFRCxTQUFTLFdBQVc7SUFDaEIsT0FBTyxpQkFBaUIsRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBRSxxQkFBcUIsRUFBRSxVQUFVO0lBQ3JELE9BQU8sbUJBQW1CLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFFLEVBQUUsRUFBRSxPQUFPO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUkscUJBQXFCLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFFNUYsT0FBTyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakMsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFFLEVBQUUsRUFBRSxPQUFPO0lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUVoRixPQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNqQyxDQUFDO0FBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO0lBQ3JDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO0NBQ3RDLENBQUMsQ0FBQztBQUVILGtCQUFlO0lBQ1gsSUFBSTtJQUVKLGNBQWM7SUFFZCxRQUFRO0lBRVIsYUFBYTtJQUViLFdBQVc7SUFFWCxJQUFJLFdBQVc7UUFDWCxJQUFJLENBQUMsV0FBVztZQUNaLFdBQVcsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUVuRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsSUFBSSxDQUFDLG1CQUFtQjtZQUNwQixtQkFBbUIsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUU5RCxPQUFPLG1CQUFtQixDQUFDO0lBQy9CLENBQUM7Q0FDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbGF6eVJlcXVpcmUgICAgICAgICAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IENsaWVudEZ1bmN0aW9uQnVpbGRlciA9IGxhenlSZXF1aXJlKCcuLi8uLi9jbGllbnQtZnVuY3Rpb25zL2NsaWVudC1mdW5jdGlvbi1idWlsZGVyJyk7XG5jb25zdCBTZWxlY3RvckJ1aWxkZXIgICAgICAgPSBsYXp5UmVxdWlyZSgnLi4vLi4vY2xpZW50LWZ1bmN0aW9ucy9zZWxlY3RvcnMvc2VsZWN0b3ItYnVpbGRlcicpO1xuY29uc3Qgcm9sZSAgICAgICAgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJy4uLy4uL3JvbGUnKTtcbmNvbnN0IGNyZWF0ZVJlcXVlc3RMb2dnZXIgICA9IGxhenlSZXF1aXJlKCcuLi9yZXF1ZXN0LWhvb2tzL3JlcXVlc3QtbG9nZ2VyJyk7XG5jb25zdCBjcmVhdGVSZXF1ZXN0TW9jayAgICAgPSBsYXp5UmVxdWlyZSgnLi4vcmVxdWVzdC1ob29rcy9yZXF1ZXN0LW1vY2snKTtcblxuLy8gTk9URTogV2UgY2FuJ3QgdXNlIGxhenkgcmVxdWlyZSBmb3IgUmVxdWVzdEhvb2ssIGJlY2F1c2UgaXQgd2lsbCBicmVhayBiYXNlIGNsYXNzIGRldGVjdGlvbiBmb3IgaW5oZXJpdGVkIGNsYXNzZXNcbmxldCBSZXF1ZXN0SG9vayA9IG51bGw7XG5cbi8vIE5PVEU6IFdlIGNhbid0IHVzZSBsYXp5IHJlcXVpcmUgZm9yIHRlc3RDb250cm9sbGVyUHJveHksIGJlY2F1c2UgaXQgd2lsbCBicmVhayB0ZXN0IGNvbnRyb2xsZXIgZGV0ZWN0aW9uXG5sZXQgdGVzdENvbnRyb2xsZXJQcm94eSA9IG51bGw7XG5cbmZ1bmN0aW9uIFJvbGUgKGxvZ2luUGFnZSwgaW5pdEZuLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHJvbGUuY3JlYXRlUm9sZShsb2dpblBhZ2UsIGluaXRGbiwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIFJlcXVlc3RNb2NrICgpIHtcbiAgICByZXR1cm4gY3JlYXRlUmVxdWVzdE1vY2soKTtcbn1cblxuZnVuY3Rpb24gUmVxdWVzdExvZ2dlciAocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBsb2dPcHRpb25zKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVJlcXVlc3RMb2dnZXIocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBsb2dPcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gQ2xpZW50RnVuY3Rpb24gKGZuLCBvcHRpb25zKSB7XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoZm4sIG9wdGlvbnMsIHsgaW5zdGFudGlhdGlvbjogJ0NsaWVudEZ1bmN0aW9uJyB9KTtcblxuICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG59XG5cbmZ1bmN0aW9uIFNlbGVjdG9yIChmbiwgb3B0aW9ucykge1xuICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGZuLCBvcHRpb25zLCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICByZXR1cm4gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUm9sZSwgJ2Fub255bW91cycsIHtcbiAgICBnZXQ6ICgpID0+IHJvbGUuY3JlYXRlQW5vbnltb3VzUm9sZVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBSb2xlLFxuXG4gICAgQ2xpZW50RnVuY3Rpb24sXG5cbiAgICBTZWxlY3RvcixcblxuICAgIFJlcXVlc3RMb2dnZXIsXG5cbiAgICBSZXF1ZXN0TW9jayxcblxuICAgIGdldCBSZXF1ZXN0SG9vayAoKSB7XG4gICAgICAgIGlmICghUmVxdWVzdEhvb2spXG4gICAgICAgICAgICBSZXF1ZXN0SG9vayA9IHJlcXVpcmUoJy4uL3JlcXVlc3QtaG9va3MvaG9vaycpO1xuXG4gICAgICAgIHJldHVybiBSZXF1ZXN0SG9vaztcbiAgICB9LFxuXG4gICAgZ2V0IHQgKCkge1xuICAgICAgICBpZiAoIXRlc3RDb250cm9sbGVyUHJveHkpXG4gICAgICAgICAgICB0ZXN0Q29udHJvbGxlclByb3h5ID0gcmVxdWlyZSgnLi4vdGVzdC1jb250cm9sbGVyL3Byb3h5Jyk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RDb250cm9sbGVyUHJveHk7XG4gICAgfVxufTtcbiJdfQ==