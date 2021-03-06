"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testcafe_browser_tools_1 = __importDefault(require("testcafe-browser-tools"));
const string_1 = require("../../../utils/string");
exports.default = {
    isMultiBrowser: true,
    async _handleString(str) {
        const args = string_1.splitQuotedText(str, ' ', '`"\'');
        const path = args.shift();
        const browserInfo = await testcafe_browser_tools_1.default.getBrowserInfo(path);
        if (!browserInfo)
            return null;
        const params = Object.assign({}, browserInfo);
        if (args.length)
            params.cmd = args.join(' ') + (params.cmd ? ' ' + params.cmd : '');
        return params;
    },
    async _handleJSON(str) {
        let params = null;
        try {
            params = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        if (!params.path)
            return null;
        const openParameters = await testcafe_browser_tools_1.default.getBrowserInfo(params.path);
        if (!openParameters)
            return null;
        if (params.cmd)
            openParameters.cmd = params.cmd;
        return openParameters;
    },
    async openBrowser(browserId, pageUrl, browserName) {
        const openParameters = await this._handleString(browserName) || await this._handleJSON(browserName);
        if (!openParameters)
            throw new Error('The specified browser name is not valid!');
        await testcafe_browser_tools_1.default.open(openParameters, pageUrl);
    },
    async isLocalBrowser() {
        return true;
    }
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL3BhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvRkFBa0Q7QUFDbEQsa0RBQXdEO0FBRXhELGtCQUFlO0lBQ1gsY0FBYyxFQUFFLElBQUk7SUFFcEIsS0FBSyxDQUFDLGFBQWEsQ0FBRSxHQUFHO1FBQ3BCLE1BQU0sSUFBSSxHQUFHLHdCQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQ0FBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsV0FBVztZQUNaLE9BQU8sSUFBSSxDQUFDO1FBRWhCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTlDLElBQUksSUFBSSxDQUFDLE1BQU07WUFDWCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdkUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUUsR0FBRztRQUNsQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSTtZQUNBLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxDQUFDLEVBQUU7WUFDTixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ1osT0FBTyxJQUFJLENBQUM7UUFFaEIsTUFBTSxjQUFjLEdBQUcsTUFBTSxnQ0FBWSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLGNBQWM7WUFDZixPQUFPLElBQUksQ0FBQztRQUVoQixJQUFJLE1BQU0sQ0FBQyxHQUFHO1lBQ1YsY0FBYyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBRXBDLE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsV0FBVztRQUM5QyxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXBHLElBQUksQ0FBQyxjQUFjO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBRWhFLE1BQU0sZ0NBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBicm93c2VyVG9vbHMgZnJvbSAndGVzdGNhZmUtYnJvd3Nlci10b29scyc7XG5pbXBvcnQgeyBzcGxpdFF1b3RlZFRleHQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9zdHJpbmcnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgaXNNdWx0aUJyb3dzZXI6IHRydWUsXG5cbiAgICBhc3luYyBfaGFuZGxlU3RyaW5nIChzdHIpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHNwbGl0UXVvdGVkVGV4dChzdHIsICcgJywgJ2BcIlxcJycpO1xuICAgICAgICBjb25zdCBwYXRoID0gYXJncy5zaGlmdCgpO1xuXG4gICAgICAgIGNvbnN0IGJyb3dzZXJJbmZvID0gYXdhaXQgYnJvd3NlclRvb2xzLmdldEJyb3dzZXJJbmZvKHBhdGgpO1xuXG4gICAgICAgIGlmICghYnJvd3NlckluZm8pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBicm93c2VySW5mbyk7XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKVxuICAgICAgICAgICAgcGFyYW1zLmNtZCA9IGFyZ3Muam9pbignICcpICsgKHBhcmFtcy5jbWQgPyAnICcgKyBwYXJhbXMuY21kIDogJycpO1xuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfSxcblxuICAgIGFzeW5jIF9oYW5kbGVKU09OIChzdHIpIHtcbiAgICAgICAgbGV0IHBhcmFtcyA9IG51bGw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcmFtcyA9IEpTT04ucGFyc2Uoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcmFtcy5wYXRoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3Qgb3BlblBhcmFtZXRlcnMgPSBhd2FpdCBicm93c2VyVG9vbHMuZ2V0QnJvd3NlckluZm8ocGFyYW1zLnBhdGgpO1xuXG4gICAgICAgIGlmICghb3BlblBhcmFtZXRlcnMpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBpZiAocGFyYW1zLmNtZClcbiAgICAgICAgICAgIG9wZW5QYXJhbWV0ZXJzLmNtZCA9IHBhcmFtcy5jbWQ7XG5cbiAgICAgICAgcmV0dXJuIG9wZW5QYXJhbWV0ZXJzO1xuICAgIH0sXG5cbiAgICBhc3luYyBvcGVuQnJvd3NlciAoYnJvd3NlcklkLCBwYWdlVXJsLCBicm93c2VyTmFtZSkge1xuICAgICAgICBjb25zdCBvcGVuUGFyYW1ldGVycyA9IGF3YWl0IHRoaXMuX2hhbmRsZVN0cmluZyhicm93c2VyTmFtZSkgfHwgYXdhaXQgdGhpcy5faGFuZGxlSlNPTihicm93c2VyTmFtZSk7XG5cbiAgICAgICAgaWYgKCFvcGVuUGFyYW1ldGVycylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHNwZWNpZmllZCBicm93c2VyIG5hbWUgaXMgbm90IHZhbGlkIScpO1xuXG4gICAgICAgIGF3YWl0IGJyb3dzZXJUb29scy5vcGVuKG9wZW5QYXJhbWV0ZXJzLCBwYWdlVXJsKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgaXNMb2NhbEJyb3dzZXIgKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59O1xuIl19