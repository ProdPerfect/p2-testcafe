"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testcafe_hammerhead_1 = require("testcafe-hammerhead");
const hook_1 = __importDefault(require("./hook"));
const parse_user_agent_1 = __importDefault(require("../../utils/parse-user-agent"));
const test_run_tracker_1 = __importDefault(require("../test-run-tracker"));
const re_executable_promise_1 = __importDefault(require("../../utils/re-executable-promise"));
const runtime_1 = require("../../errors/runtime");
const types_1 = require("../../errors/types");
const DEFAULT_OPTIONS = {
    logRequestHeaders: false,
    logRequestBody: false,
    stringifyRequestBody: false,
    logResponseHeaders: false,
    logResponseBody: false,
    stringifyResponseBody: false
};
class RequestLoggerImplementation extends hook_1.default {
    constructor(requestFilterRuleInit, options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);
        RequestLoggerImplementation._assertLogOptions(options);
        const configureResponseEventOptions = new testcafe_hammerhead_1.ConfigureResponseEventOptions(options.logResponseHeaders, options.logResponseBody);
        super(requestFilterRuleInit, configureResponseEventOptions);
        this.options = options;
        this._internalRequests = {};
    }
    static _assertLogOptions(logOptions) {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody)
            throw new runtime_1.APIError('RequestLogger', types_1.RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');
        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody)
            throw new runtime_1.APIError('RequestLogger', types_1.RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    }
    async onRequest(event) {
        const loggedReq = {
            id: event._requestInfo.requestId,
            testRunId: event._requestInfo.sessionId,
            userAgent: parse_user_agent_1.default(event._requestInfo.userAgent).prettyUserAgent,
            request: {
                timestamp: Date.now(),
                url: event._requestInfo.url,
                method: event._requestInfo.method,
            }
        };
        if (this.options.logRequestHeaders)
            loggedReq.request.headers = Object.assign({}, event._requestInfo.headers);
        if (this.options.logRequestBody)
            loggedReq.request.body = this.options.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;
        this._internalRequests[loggedReq.id] = loggedReq;
    }
    async onResponse(event) {
        const loggedReq = this._internalRequests[event.requestId];
        // NOTE: If the 'clear' method is called during a long running request,
        // we should not save a response part - request part has been already removed.
        if (!loggedReq)
            return;
        loggedReq.response = {
            statusCode: event.statusCode,
            timestamp: Date.now()
        };
        if (this.options.logResponseHeaders)
            loggedReq.response.headers = Object.assign({}, event.headers);
        if (this.options.logResponseBody) {
            loggedReq.response.body = this.options.stringifyResponseBody && event.body
                ? event.body.toString()
                : event.body;
        }
    }
    _prepareInternalRequestInfo() {
        const testRun = test_run_tracker_1.default.resolveContextTestRun();
        let preparedRequests = Object.values(this._internalRequests);
        if (testRun)
            preparedRequests = preparedRequests.filter(r => r.testRunId === testRun.id);
        return preparedRequests;
    }
    _getCompletedRequests() {
        return this._prepareInternalRequestInfo().filter(r => r.response);
    }
    // API
    contains(predicate) {
        return re_executable_promise_1.default.fromFn(async () => {
            return !!this._getCompletedRequests().find(predicate);
        });
    }
    count(predicate) {
        return re_executable_promise_1.default.fromFn(async () => {
            return this._getCompletedRequests().filter(predicate).length;
        });
    }
    clear() {
        const testRun = test_run_tracker_1.default.resolveContextTestRun();
        if (testRun) {
            Object.keys(this._internalRequests).forEach(id => {
                if (this._internalRequests[id].testRunId === testRun.id)
                    delete this._internalRequests[id];
            });
        }
        else
            this._internalRequests = {};
    }
    get requests() {
        return this._prepareInternalRequestInfo();
    }
}
function createRequestLogger(requestFilterRuleInit, logOptions) {
    return new RequestLoggerImplementation(requestFilterRuleInit, logOptions);
}
exports.default = createRequestLogger;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpL3JlcXVlc3QtaG9va3MvcmVxdWVzdC1sb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2REFBb0U7QUFDcEUsa0RBQWlDO0FBQ2pDLG9GQUEwRDtBQUMxRCwyRUFBaUQ7QUFDakQsOEZBQW9FO0FBQ3BFLGtEQUFnRDtBQUNoRCw4Q0FBb0Q7QUFFcEQsTUFBTSxlQUFlLEdBQUc7SUFDcEIsaUJBQWlCLEVBQU0sS0FBSztJQUM1QixjQUFjLEVBQVMsS0FBSztJQUM1QixvQkFBb0IsRUFBRyxLQUFLO0lBQzVCLGtCQUFrQixFQUFLLEtBQUs7SUFDNUIsZUFBZSxFQUFRLEtBQUs7SUFDNUIscUJBQXFCLEVBQUUsS0FBSztDQUMvQixDQUFDO0FBRUYsTUFBTSwyQkFBNEIsU0FBUSxjQUFXO0lBQ2pELFlBQWEscUJBQXFCLEVBQUUsT0FBTztRQUN2QyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELDJCQUEyQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXZELE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxtREFBNkIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTdILEtBQUssQ0FBQyxxQkFBcUIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBRSxVQUFVO1FBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0I7WUFDN0QsTUFBTSxJQUFJLGtCQUFRLENB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QUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7SUFDOUMsQ0FBQztDQUNKO0FBRUQsU0FBd0IsbUJBQW1CLENBQUUscUJBQXFCLEVBQUUsVUFBVTtJQUMxRSxPQUFPLElBQUksMkJBQTJCLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDOUUsQ0FBQztBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uZmlndXJlUmVzcG9uc2VFdmVudE9wdGlvbnMgfSBmcm9tICd0ZXN0Y2FmZS1oYW1tZXJoZWFkJztcbmltcG9ydCBSZXF1ZXN0SG9vayBmcm9tICcuL2hvb2snO1xuaW1wb3J0IHBhcnNlVXNlckFnZW50IGZyb20gJy4uLy4uL3V0aWxzL3BhcnNlLXVzZXItYWdlbnQnO1xuaW1wb3J0IHRlc3RSdW5UcmFja2VyIGZyb20gJy4uL3Rlc3QtcnVuLXRyYWNrZXInO1xuaW1wb3J0IFJlRXhlY3V0YWJsZVByb21pc2UgZnJvbSAnLi4vLi4vdXRpbHMvcmUtZXhlY3V0YWJsZS1wcm9taXNlJztcbmltcG9ydCB7IEFQSUVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi9lcnJvcnMvdHlwZXMnO1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgbG9nUmVxdWVzdEhlYWRlcnM6ICAgICBmYWxzZSxcbiAgICBsb2dSZXF1ZXN0Qm9keTogICAgICAgIGZhbHNlLFxuICAgIHN0cmluZ2lmeVJlcXVlc3RCb2R5OiAgZmFsc2UsXG4gICAgbG9nUmVzcG9uc2VIZWFkZXJzOiAgICBmYWxzZSxcbiAgICBsb2dSZXNwb25zZUJvZHk6ICAgICAgIGZhbHNlLFxuICAgIHN0cmluZ2lmeVJlc3BvbnNlQm9keTogZmFsc2Vcbn07XG5cbmNsYXNzIFJlcXVlc3RMb2dnZXJJbXBsZW1lbnRhdGlvbiBleHRlbmRzIFJlcXVlc3RIb29rIHtcbiAgICBjb25zdHJ1Y3RvciAocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuICAgICAgICBSZXF1ZXN0TG9nZ2VySW1wbGVtZW50YXRpb24uX2Fzc2VydExvZ09wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgY29uc3QgY29uZmlndXJlUmVzcG9uc2VFdmVudE9wdGlvbnMgPSBuZXcgQ29uZmlndXJlUmVzcG9uc2VFdmVudE9wdGlvbnMob3B0aW9ucy5sb2dSZXNwb25zZUhlYWRlcnMsIG9wdGlvbnMubG9nUmVzcG9uc2VCb2R5KTtcblxuICAgICAgICBzdXBlcihyZXF1ZXN0RmlsdGVyUnVsZUluaXQsIGNvbmZpZ3VyZVJlc3BvbnNlRXZlbnRPcHRpb25zKTtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIHRoaXMuX2ludGVybmFsUmVxdWVzdHMgPSB7fTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2Fzc2VydExvZ09wdGlvbnMgKGxvZ09wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFsb2dPcHRpb25zLmxvZ1JlcXVlc3RCb2R5ICYmIGxvZ09wdGlvbnMuc3RyaW5naWZ5UmVxdWVzdEJvZHkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgQVBJRXJyb3IoJ1JlcXVlc3RMb2dnZXInLCBSVU5USU1FX0VSUk9SUy5yZXF1ZXN0SG9va0NvbmZpZ3VyZUFQSUVycm9yLCAnUmVxdWVzdExvZ2dlcicsICdDYW5ub3Qgc3RyaW5naWZ5IHRoZSByZXF1ZXN0IGJvZHkgYmVjYXVzZSBpdCBpcyBub3QgbG9nZ2VkLiBTcGVjaWZ5IHsgbG9nUmVxdWVzdEJvZHk6IHRydWUgfSBpbiBsb2cgb3B0aW9ucy4nKTtcblxuICAgICAgICBpZiAoIWxvZ09wdGlvbnMubG9nUmVzcG9uc2VCb2R5ICYmIGxvZ09wdGlvbnMuc3RyaW5naWZ5UmVzcG9uc2VCb2R5KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEFQSUVycm9yKCdSZXF1ZXN0TG9nZ2VyJywgUlVOVElNRV9FUlJPUlMucmVxdWVzdEhvb2tDb25maWd1cmVBUElFcnJvciwgJ1JlcXVlc3RMb2dnZXInLCAnQ2Fubm90IHN0cmluZ2lmeSB0aGUgcmVzcG9uc2UgYm9keSBiZWNhdXNlIGl0IGlzIG5vdCBsb2dnZWQuIFNwZWNpZnkgeyBsb2dSZXNwb25zZUJvZHk6IHRydWUgfSBpbiBsb2cgb3B0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlcXVlc3QgKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlZFJlcSA9IHtcbiAgICAgICAgICAgIGlkOiAgICAgICAgZXZlbnQuX3JlcXVlc3RJbmZvLnJlcXVlc3RJZCxcbiAgICAgICAgICAgIHRlc3RSdW5JZDogZXZlbnQuX3JlcXVlc3RJbmZvLnNlc3Npb25JZCxcbiAgICAgICAgICAgIHVzZXJBZ2VudDogcGFyc2VVc2VyQWdlbnQoZXZlbnQuX3JlcXVlc3RJbmZvLnVzZXJBZ2VudCkucHJldHR5VXNlckFnZW50LFxuICAgICAgICAgICAgcmVxdWVzdDogICB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIHVybDogICAgICAgZXZlbnQuX3JlcXVlc3RJbmZvLnVybCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICAgIGV2ZW50Ll9yZXF1ZXN0SW5mby5tZXRob2QsXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2dSZXF1ZXN0SGVhZGVycylcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXF1ZXN0LmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudC5fcmVxdWVzdEluZm8uaGVhZGVycyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2dSZXF1ZXN0Qm9keSlcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXF1ZXN0LmJvZHkgPSB0aGlzLm9wdGlvbnMuc3RyaW5naWZ5UmVxdWVzdEJvZHkgPyBldmVudC5fcmVxdWVzdEluZm8uYm9keS50b1N0cmluZygpIDogZXZlbnQuX3JlcXVlc3RJbmZvLmJvZHk7XG5cbiAgICAgICAgdGhpcy5faW50ZXJuYWxSZXF1ZXN0c1tsb2dnZWRSZXEuaWRdID0gbG9nZ2VkUmVxO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVzcG9uc2UgKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlZFJlcSA9IHRoaXMuX2ludGVybmFsUmVxdWVzdHNbZXZlbnQucmVxdWVzdElkXTtcblxuICAgICAgICAvLyBOT1RFOiBJZiB0aGUgJ2NsZWFyJyBtZXRob2QgaXMgY2FsbGVkIGR1cmluZyBhIGxvbmcgcnVubmluZyByZXF1ZXN0LFxuICAgICAgICAvLyB3ZSBzaG91bGQgbm90IHNhdmUgYSByZXNwb25zZSBwYXJ0IC0gcmVxdWVzdCBwYXJ0IGhhcyBiZWVuIGFscmVhZHkgcmVtb3ZlZC5cbiAgICAgICAgaWYgKCFsb2dnZWRSZXEpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgbG9nZ2VkUmVxLnJlc3BvbnNlID0ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogZXZlbnQuc3RhdHVzQ29kZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogIERhdGUubm93KClcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxvZ1Jlc3BvbnNlSGVhZGVycylcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXNwb25zZS5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgZXZlbnQuaGVhZGVycyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2dSZXNwb25zZUJvZHkpIHtcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXNwb25zZS5ib2R5ID0gdGhpcy5vcHRpb25zLnN0cmluZ2lmeVJlc3BvbnNlQm9keSAmJiBldmVudC5ib2R5XG4gICAgICAgICAgICAgICAgPyBldmVudC5ib2R5LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICA6IGV2ZW50LmJvZHk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcHJlcGFyZUludGVybmFsUmVxdWVzdEluZm8gKCkge1xuICAgICAgICBjb25zdCB0ZXN0UnVuICAgICAgICA9IHRlc3RSdW5UcmFja2VyLnJlc29sdmVDb250ZXh0VGVzdFJ1bigpO1xuICAgICAgICBsZXQgcHJlcGFyZWRSZXF1ZXN0cyA9IE9iamVjdC52YWx1ZXModGhpcy5faW50ZXJuYWxSZXF1ZXN0cyk7XG5cbiAgICAgICAgaWYgKHRlc3RSdW4pXG4gICAgICAgICAgICBwcmVwYXJlZFJlcXVlc3RzID0gcHJlcGFyZWRSZXF1ZXN0cy5maWx0ZXIociA9PiByLnRlc3RSdW5JZCA9PT0gdGVzdFJ1bi5pZCk7XG5cbiAgICAgICAgcmV0dXJuIHByZXBhcmVkUmVxdWVzdHM7XG4gICAgfVxuXG4gICAgX2dldENvbXBsZXRlZFJlcXVlc3RzICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZXBhcmVJbnRlcm5hbFJlcXVlc3RJbmZvKCkuZmlsdGVyKHIgPT4gci5yZXNwb25zZSk7XG4gICAgfVxuXG4gICAgLy8gQVBJXG4gICAgY29udGFpbnMgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fZ2V0Q29tcGxldGVkUmVxdWVzdHMoKS5maW5kKHByZWRpY2F0ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvdW50IChwcmVkaWNhdGUpIHtcbiAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRDb21wbGV0ZWRSZXF1ZXN0cygpLmZpbHRlcihwcmVkaWNhdGUpLmxlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xlYXIgKCkge1xuICAgICAgICBjb25zdCB0ZXN0UnVuID0gdGVzdFJ1blRyYWNrZXIucmVzb2x2ZUNvbnRleHRUZXN0UnVuKCk7XG5cbiAgICAgICAgaWYgKHRlc3RSdW4pIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2ludGVybmFsUmVxdWVzdHMpLmZvckVhY2goaWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRlcm5hbFJlcXVlc3RzW2lkXS50ZXN0UnVuSWQgPT09IHRlc3RSdW4uaWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9pbnRlcm5hbFJlcXVlc3RzW2lkXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsUmVxdWVzdHMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXQgcmVxdWVzdHMgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJlcGFyZUludGVybmFsUmVxdWVzdEluZm8oKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3RMb2dnZXIgKHJlcXVlc3RGaWx0ZXJSdWxlSW5pdCwgbG9nT3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdExvZ2dlckltcGxlbWVudGF0aW9uKHJlcXVlc3RGaWx0ZXJSdWxlSW5pdCwgbG9nT3B0aW9ucyk7XG59XG5cbiJdfQ==