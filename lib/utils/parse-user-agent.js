"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bowser_1 = __importDefault(require("bowser"));
const DEFAULT_NAME = 'Other';
const DEFAULT_VERSION = '0.0';
const DEFAULT_PLATFORM_TYPE = DEFAULT_NAME.toLowerCase();
const EMPTY_PARSED_USER_AGENT = bowser_1.default.parse(' ');
function calculateBrowser(browserDetails) {
    return {
        name: browserDetails.name || DEFAULT_NAME,
        version: browserDetails.version || DEFAULT_VERSION
    };
}
function calculateOs(parsedOsDetails) {
    const name = parsedOsDetails.name || DEFAULT_NAME;
    let version = DEFAULT_VERSION;
    // NOTE: a 'versionName' property value is more readable in the case of Windows (GH-481):
    // Windows 8.1: os.version: "NT 6.3", os.versionName: "8.1".
    if (name.toLowerCase() === 'windows') {
        if (parsedOsDetails.versionName)
            version = parsedOsDetails.versionName;
    }
    else if (parsedOsDetails.version)
        version = parsedOsDetails.version;
    return { name, version };
}
function calculateEngine(engineDetails) {
    return {
        name: engineDetails.name || DEFAULT_NAME,
        version: engineDetails.version || DEFAULT_VERSION
    };
}
function calculatePrettyUserAgent(browser, os) {
    return `${browser.name} ${browser.version} / ${os.name} ${os.version}`;
}
function parseUserAgent(userAgent = '') {
    const parsedUserAgent = userAgent ? bowser_1.default.parse(userAgent) : EMPTY_PARSED_USER_AGENT;
    const browser = calculateBrowser(parsedUserAgent.browser);
    const os = calculateOs(parsedUserAgent.os);
    const engine = calculateEngine(parsedUserAgent.engine);
    const prettyUserAgent = calculatePrettyUserAgent(browser, os);
    return {
        name: browser.name,
        version: browser.version,
        platform: parsedUserAgent.platform.type || DEFAULT_PLATFORM_TYPE,
        os,
        engine,
        prettyUserAgent: prettyUserAgent,
        userAgent
    };
}
exports.default = parseUserAgent;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtdXNlci1hZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9wYXJzZS11c2VyLWFnZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQTRCO0FBRTVCLE1BQU0sWUFBWSxHQUFjLE9BQU8sQ0FBQztBQUN4QyxNQUFNLGVBQWUsR0FBVyxLQUFLLENBQUM7QUFDdEMsTUFBTSxxQkFBcUIsR0FBSyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0QsTUFBTSx1QkFBdUIsR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQWlCbEQsU0FBUyxnQkFBZ0IsQ0FBRSxjQUE0QztJQUNuRSxPQUFPO1FBQ0gsSUFBSSxFQUFLLGNBQWMsQ0FBQyxJQUFJLElBQUksWUFBWTtRQUM1QyxPQUFPLEVBQUUsY0FBYyxDQUFDLE9BQU8sSUFBSSxlQUFlO0tBQ3JELENBQUM7QUFDTixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUUsZUFBd0M7SUFDMUQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLElBQUksSUFBSSxZQUFZLENBQUM7SUFFbEQsSUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDO0lBRTlCLHlGQUF5RjtJQUN6Riw0REFBNEQ7SUFDNUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssU0FBUyxFQUFFO1FBQ2xDLElBQUksZUFBZSxDQUFDLFdBQVc7WUFDM0IsT0FBTyxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7S0FDN0M7U0FDSSxJQUFJLGVBQWUsQ0FBQyxPQUFPO1FBQzVCLE9BQU8sR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDO0lBRXRDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLGFBQTBDO0lBQ2hFLE9BQU87UUFDSCxJQUFJLEVBQUssYUFBYSxDQUFDLElBQUksSUFBSSxZQUFZO1FBQzNDLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxJQUFJLGVBQWU7S0FDcEQsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUFFLE9BQXdCLEVBQUUsRUFBbUI7SUFDNUUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzRSxDQUFDO0FBRUQsU0FBd0IsY0FBYyxDQUFFLFlBQW9CLEVBQUU7SUFDMUQsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUM7SUFDdEYsTUFBTSxPQUFPLEdBQVcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sRUFBRSxHQUFnQixXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sTUFBTSxHQUFZLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEUsTUFBTSxlQUFlLEdBQUcsd0JBQXdCLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlELE9BQU87UUFDSCxJQUFJLEVBQWEsT0FBTyxDQUFDLElBQUk7UUFDN0IsT0FBTyxFQUFVLE9BQU8sQ0FBQyxPQUFPO1FBQ2hDLFFBQVEsRUFBUyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxxQkFBcUI7UUFDdkUsRUFBRTtRQUNGLE1BQU07UUFDTixlQUFlLEVBQUUsZUFBZTtRQUNoQyxTQUFTO0tBQ1osQ0FBQztBQUNOLENBQUM7QUFoQkQsaUNBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJvd3NlciBmcm9tICdib3dzZXInO1xuXG5jb25zdCBERUZBVUxUX05BTUUgICAgICAgICAgICA9ICdPdGhlcic7XG5jb25zdCBERUZBVUxUX1ZFUlNJT04gICAgICAgICA9ICcwLjAnO1xuY29uc3QgREVGQVVMVF9QTEFURk9STV9UWVBFICAgPSBERUZBVUxUX05BTUUudG9Mb3dlckNhc2UoKTtcbmNvbnN0IEVNUFRZX1BBUlNFRF9VU0VSX0FHRU5UID0gQm93c2VyLnBhcnNlKCcgJyk7XG5cbmludGVyZmFjZSBQYXJzZWRDb21wb25lbnQge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB2ZXJzaW9uOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQYXJzZWRVc2VyQWdlbnQge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgcGxhdGZvcm06IHN0cmluZztcbiAgICBvczogUGFyc2VkQ29tcG9uZW50O1xuICAgIGVuZ2luZTogUGFyc2VkQ29tcG9uZW50O1xuICAgIHByZXR0eVVzZXJBZ2VudDogc3RyaW5nO1xuICAgIHVzZXJBZ2VudDogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCcm93c2VyIChicm93c2VyRGV0YWlsczogQm93c2VyLlBhcnNlci5Ccm93c2VyRGV0YWlscyk6IFBhcnNlZENvbXBvbmVudCB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogICAgYnJvd3NlckRldGFpbHMubmFtZSB8fCBERUZBVUxUX05BTUUsXG4gICAgICAgIHZlcnNpb246IGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gfHwgREVGQVVMVF9WRVJTSU9OXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlT3MgKHBhcnNlZE9zRGV0YWlsczogQm93c2VyLlBhcnNlci5PU0RldGFpbHMpOiBQYXJzZWRDb21wb25lbnQge1xuICAgIGNvbnN0IG5hbWUgPSBwYXJzZWRPc0RldGFpbHMubmFtZSB8fCBERUZBVUxUX05BTUU7XG5cbiAgICBsZXQgdmVyc2lvbiA9IERFRkFVTFRfVkVSU0lPTjtcblxuICAgIC8vIE5PVEU6IGEgJ3ZlcnNpb25OYW1lJyBwcm9wZXJ0eSB2YWx1ZSBpcyBtb3JlIHJlYWRhYmxlIGluIHRoZSBjYXNlIG9mIFdpbmRvd3MgKEdILTQ4MSk6XG4gICAgLy8gV2luZG93cyA4LjE6IG9zLnZlcnNpb246IFwiTlQgNi4zXCIsIG9zLnZlcnNpb25OYW1lOiBcIjguMVwiLlxuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd3aW5kb3dzJykge1xuICAgICAgICBpZiAocGFyc2VkT3NEZXRhaWxzLnZlcnNpb25OYW1lKVxuICAgICAgICAgICAgdmVyc2lvbiA9IHBhcnNlZE9zRGV0YWlscy52ZXJzaW9uTmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkT3NEZXRhaWxzLnZlcnNpb24pXG4gICAgICAgIHZlcnNpb24gPSBwYXJzZWRPc0RldGFpbHMudmVyc2lvbjtcblxuICAgIHJldHVybiB7IG5hbWUsIHZlcnNpb24gfTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlRW5naW5lIChlbmdpbmVEZXRhaWxzOiBCb3dzZXIuUGFyc2VyLkVuZ2luZURldGFpbHMpOiBQYXJzZWRDb21wb25lbnQge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICAgIGVuZ2luZURldGFpbHMubmFtZSB8fCBERUZBVUxUX05BTUUsXG4gICAgICAgIHZlcnNpb246IGVuZ2luZURldGFpbHMudmVyc2lvbiB8fCBERUZBVUxUX1ZFUlNJT05cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQcmV0dHlVc2VyQWdlbnQgKGJyb3dzZXI6IFBhcnNlZENvbXBvbmVudCwgb3M6IFBhcnNlZENvbXBvbmVudCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke2Jyb3dzZXIubmFtZX0gJHticm93c2VyLnZlcnNpb259IC8gJHtvcy5uYW1lfSAke29zLnZlcnNpb259YDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VVc2VyQWdlbnQgKHVzZXJBZ2VudDogc3RyaW5nID0gJycpOiBQYXJzZWRVc2VyQWdlbnQge1xuICAgIGNvbnN0IHBhcnNlZFVzZXJBZ2VudCA9IHVzZXJBZ2VudCA/IEJvd3Nlci5wYXJzZSh1c2VyQWdlbnQpIDogRU1QVFlfUEFSU0VEX1VTRVJfQUdFTlQ7XG4gICAgY29uc3QgYnJvd3NlciAgICAgICAgID0gY2FsY3VsYXRlQnJvd3NlcihwYXJzZWRVc2VyQWdlbnQuYnJvd3Nlcik7XG4gICAgY29uc3Qgb3MgICAgICAgICAgICAgID0gY2FsY3VsYXRlT3MocGFyc2VkVXNlckFnZW50Lm9zKTtcbiAgICBjb25zdCBlbmdpbmUgICAgICAgICAgPSBjYWxjdWxhdGVFbmdpbmUocGFyc2VkVXNlckFnZW50LmVuZ2luZSk7XG4gICAgY29uc3QgcHJldHR5VXNlckFnZW50ID0gY2FsY3VsYXRlUHJldHR5VXNlckFnZW50KGJyb3dzZXIsIG9zKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICAgICAgICAgICAgYnJvd3Nlci5uYW1lLFxuICAgICAgICB2ZXJzaW9uOiAgICAgICAgIGJyb3dzZXIudmVyc2lvbixcbiAgICAgICAgcGxhdGZvcm06ICAgICAgICBwYXJzZWRVc2VyQWdlbnQucGxhdGZvcm0udHlwZSB8fCBERUZBVUxUX1BMQVRGT1JNX1RZUEUsXG4gICAgICAgIG9zLFxuICAgICAgICBlbmdpbmUsXG4gICAgICAgIHByZXR0eVVzZXJBZ2VudDogcHJldHR5VXNlckFnZW50LFxuICAgICAgICB1c2VyQWdlbnRcbiAgICB9O1xufVxuIl19