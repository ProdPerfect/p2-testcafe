"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const built_in_1 = __importDefault(require("./built-in"));
const plugin_host_1 = __importDefault(require("./plugin-host"));
const parse_provider_name_1 = __importDefault(require("./parse-provider-name"));
const _1 = __importDefault(require("./"));
const connection_1 = __importDefault(require("../connection"));
const runtime_1 = require("../../errors/runtime");
const types_1 = require("../../errors/types");
const BROWSER_PROVIDER_RE = /^([^:\s]+):?(.*)?$/;
exports.default = {
    providersCache: {},
    async _handlePathAndCmd(alias) {
        const browserName = JSON.stringify(alias);
        const providerName = 'path';
        const provider = await this.getProvider(providerName);
        return { provider, providerName, browserName };
    },
    async _parseAliasString(alias) {
        const providerRegExpMatch = BROWSER_PROVIDER_RE.exec(alias);
        if (!providerRegExpMatch)
            throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.cannotFindBrowser, alias);
        let providerName = providerRegExpMatch[1];
        let browserName = providerRegExpMatch[2] || '';
        let provider = await this.getProvider(providerName);
        if (!provider && providerRegExpMatch[2])
            provider = await this.getProvider(providerName + ':');
        if (!provider) {
            providerName = 'locally-installed';
            provider = await this.getProvider(providerName);
            browserName = providerRegExpMatch[1] || '';
        }
        return { provider, providerName, browserName };
    },
    async _parseAlias(alias) {
        if (alias.browserName && alias.providerName && alias.provider)
            return alias;
        if (alias && alias.path)
            return this._handlePathAndCmd(alias);
        if (typeof alias === 'string')
            return this._parseAliasString(alias);
        throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.cannotFindBrowser, alias);
    },
    async _getInfoForAllBrowserNames(provider, providerName) {
        const allBrowserNames = provider.isMultiBrowser ?
            await provider.getBrowserList() :
            [];
        if (!allBrowserNames.length)
            return { provider, providerName, browserName: '' };
        return allBrowserNames
            .map(browserName => ({ provider, providerName, browserName }));
    },
    _getProviderModule(providerName, moduleName) {
        try {
            // First, just check if the module exists
            require.resolve(moduleName);
        }
        catch (e) {
            // Module does not exist. Return null, and let the caller handle
            return null;
        }
        // Load the module
        const providerObject = require(moduleName);
        this.addProvider(providerName, providerObject);
        return this._getProviderFromCache(providerName);
    },
    _getProviderFromCache(providerName) {
        return this.providersCache[providerName] || null;
    },
    _getBuiltinProvider(providerName) {
        const providerObject = built_in_1.default[providerName];
        if (!providerObject)
            return null;
        this.addProvider(providerName, providerObject);
        return this._getProviderFromCache(providerName);
    },
    async getBrowserInfo(alias) {
        if (alias instanceof connection_1.default)
            return alias;
        const browserInfo = await this._parseAlias(alias);
        const { provider, providerName, browserName } = browserInfo;
        if (browserName === 'all')
            return await this._getInfoForAllBrowserNames(provider, providerName);
        if (!await provider.isValidBrowserName(browserName))
            throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.cannotFindBrowser, alias);
        return Object.assign({ alias }, browserInfo);
    },
    addProvider(providerName, providerObject) {
        providerName = parse_provider_name_1.default(providerName).providerName;
        this.providersCache[providerName] = new _1.default(new plugin_host_1.default(providerObject, providerName));
    },
    removeProvider(providerName) {
        providerName = parse_provider_name_1.default(providerName).providerName;
        delete this.providersCache[providerName];
    },
    async getProvider(providerName) {
        const parsedProviderName = parse_provider_name_1.default(providerName);
        const moduleName = parsedProviderName.moduleName;
        providerName = parsedProviderName.providerName;
        const provider = this._getProviderFromCache(providerName) ||
            this._getProviderModule(providerName, moduleName) ||
            this._getBuiltinProvider(providerName);
        if (provider)
            await this.providersCache[providerName].init();
        return provider;
    },
    dispose() {
        return Promise.all(Object.values(this.providersCache).map(item => item.dispose()));
    }
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL3Bvb2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwREFBNEM7QUFDNUMsZ0VBQXNEO0FBQ3RELGdGQUFzRDtBQUN0RCwwQ0FBaUM7QUFDakMsK0RBQThDO0FBQzlDLGtEQUFvRDtBQUNwRCw4Q0FBb0Q7QUFFcEQsTUFBTSxtQkFBbUIsR0FBRyxvQkFBb0IsQ0FBQztBQUVqRCxrQkFBZTtJQUNYLGNBQWMsRUFBRSxFQUFFO0lBRWxCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBRSxLQUFLO1FBQzFCLE1BQU0sV0FBVyxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBQzVCLE1BQU0sUUFBUSxHQUFPLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUxRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGlCQUFpQixDQUFFLEtBQUs7UUFDMUIsTUFBTSxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLG1CQUFtQjtZQUNwQixNQUFNLElBQUksc0JBQVksQ0FBQyxzQkFBYyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXBFLElBQUksWUFBWSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksV0FBVyxHQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoRCxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFcEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxt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Q0FBQztZQUNqRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEQsSUFBSSxRQUFRO1lBQ1IsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRW5ELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxPQUFPO1FBQ0gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQlVJTFRfSU5fUFJPVklERVJTIGZyb20gJy4vYnVpbHQtaW4nO1xuaW1wb3J0IEJyb3dzZXJQcm92aWRlclBsdWdpbkhvc3QgZnJvbSAnLi9wbHVnaW4taG9zdCc7XG5pbXBvcnQgcGFyc2VQcm92aWRlck5hbWUgZnJvbSAnLi9wYXJzZS1wcm92aWRlci1uYW1lJztcbmltcG9ydCBCcm93c2VyUHJvdmlkZXIgZnJvbSAnLi8nO1xuaW1wb3J0IEJyb3dzZXJDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi9lcnJvcnMvdHlwZXMnO1xuXG5jb25zdCBCUk9XU0VSX1BST1ZJREVSX1JFID0gL14oW146XFxzXSspOj8oLiopPyQvO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgcHJvdmlkZXJzQ2FjaGU6IHt9LFxuXG4gICAgYXN5bmMgX2hhbmRsZVBhdGhBbmRDbWQgKGFsaWFzKSB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJOYW1lICA9IEpTT04uc3RyaW5naWZ5KGFsaWFzKTtcbiAgICAgICAgY29uc3QgcHJvdmlkZXJOYW1lID0gJ3BhdGgnO1xuICAgICAgICBjb25zdCBwcm92aWRlciAgICAgPSBhd2FpdCB0aGlzLmdldFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgX3BhcnNlQWxpYXNTdHJpbmcgKGFsaWFzKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyUmVnRXhwTWF0Y2ggPSBCUk9XU0VSX1BST1ZJREVSX1JFLmV4ZWMoYWxpYXMpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXJSZWdFeHBNYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RmluZEJyb3dzZXIsIGFsaWFzKTtcblxuICAgICAgICBsZXQgcHJvdmlkZXJOYW1lID0gcHJvdmlkZXJSZWdFeHBNYXRjaFsxXTtcbiAgICAgICAgbGV0IGJyb3dzZXJOYW1lICA9IHByb3ZpZGVyUmVnRXhwTWF0Y2hbMl0gfHwgJyc7XG5cbiAgICAgICAgbGV0IHByb3ZpZGVyID0gYXdhaXQgdGhpcy5nZXRQcm92aWRlcihwcm92aWRlck5hbWUpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXIgJiYgcHJvdmlkZXJSZWdFeHBNYXRjaFsyXSlcbiAgICAgICAgICAgIHByb3ZpZGVyID0gYXdhaXQgdGhpcy5nZXRQcm92aWRlcihwcm92aWRlck5hbWUgKyAnOicpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHByb3ZpZGVyTmFtZSA9ICdsb2NhbGx5LWluc3RhbGxlZCc7XG4gICAgICAgICAgICBwcm92aWRlciAgICAgPSBhd2FpdCB0aGlzLmdldFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgICAgICBicm93c2VyTmFtZSAgPSBwcm92aWRlclJlZ0V4cE1hdGNoWzFdIHx8ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgX3BhcnNlQWxpYXMgKGFsaWFzKSB7XG4gICAgICAgIGlmIChhbGlhcy5icm93c2VyTmFtZSAmJiBhbGlhcy5wcm92aWRlck5hbWUgJiYgYWxpYXMucHJvdmlkZXIpXG4gICAgICAgICAgICByZXR1cm4gYWxpYXM7XG5cbiAgICAgICAgaWYgKGFsaWFzICYmIGFsaWFzLnBhdGgpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlUGF0aEFuZENtZChhbGlhcyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhbGlhcyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBbGlhc1N0cmluZyhhbGlhcyk7XG5cbiAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RGaW5kQnJvd3NlciwgYWxpYXMpO1xuICAgIH0sXG5cbiAgICBhc3luYyBfZ2V0SW5mb0ZvckFsbEJyb3dzZXJOYW1lcyAocHJvdmlkZXIsIHByb3ZpZGVyTmFtZSkge1xuICAgICAgICBjb25zdCBhbGxCcm93c2VyTmFtZXMgPSBwcm92aWRlci5pc011bHRpQnJvd3NlciA/XG4gICAgICAgICAgICBhd2FpdCBwcm92aWRlci5nZXRCcm93c2VyTGlzdCgpIDpcbiAgICAgICAgICAgIFtdO1xuXG4gICAgICAgIGlmICghYWxsQnJvd3Nlck5hbWVzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB7IHByb3ZpZGVyLCBwcm92aWRlck5hbWUsIGJyb3dzZXJOYW1lOiAnJyB9O1xuXG4gICAgICAgIHJldHVybiBhbGxCcm93c2VyTmFtZXNcbiAgICAgICAgICAgIC5tYXAoYnJvd3Nlck5hbWUgPT4gKHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfSkpO1xuICAgIH0sXG5cbiAgICBfZ2V0UHJvdmlkZXJNb2R1bGUgKHByb3ZpZGVyTmFtZSwgbW9kdWxlTmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRmlyc3QsIGp1c3QgY2hlY2sgaWYgdGhlIG1vZHVsZSBleGlzdHNcbiAgICAgICAgICAgIHJlcXVpcmUucmVzb2x2ZShtb2R1bGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gTW9kdWxlIGRvZXMgbm90IGV4aXN0LiBSZXR1cm4gbnVsbCwgYW5kIGxldCB0aGUgY2FsbGVyIGhhbmRsZVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHRoZSBtb2R1bGVcbiAgICAgICAgY29uc3QgcHJvdmlkZXJPYmplY3QgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xuXG4gICAgICAgIHRoaXMuYWRkUHJvdmlkZXIocHJvdmlkZXJOYW1lLCBwcm92aWRlck9iamVjdCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm92aWRlckZyb21DYWNoZShwcm92aWRlck5hbWUpO1xuICAgIH0sXG5cbiAgICBfZ2V0UHJvdmlkZXJGcm9tQ2FjaGUgKHByb3ZpZGVyTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm92aWRlcnNDYWNoZVtwcm92aWRlck5hbWVdIHx8IG51bGw7XG4gICAgfSxcblxuICAgIF9nZXRCdWlsdGluUHJvdmlkZXIgKHByb3ZpZGVyTmFtZSkge1xuICAgICAgICBjb25zdCBwcm92aWRlck9iamVjdCA9IEJVSUxUX0lOX1BST1ZJREVSU1twcm92aWRlck5hbWVdO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXJPYmplY3QpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB0aGlzLmFkZFByb3ZpZGVyKHByb3ZpZGVyTmFtZSwgcHJvdmlkZXJPYmplY3QpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm92aWRlckZyb21DYWNoZShwcm92aWRlck5hbWUpO1xuICAgIH0sXG5cbiAgICBhc3luYyBnZXRCcm93c2VySW5mbyAoYWxpYXMpIHtcbiAgICAgICAgaWYgKGFsaWFzIGluc3RhbmNlb2YgQnJvd3NlckNvbm5lY3Rpb24pXG4gICAgICAgICAgICByZXR1cm4gYWxpYXM7XG5cbiAgICAgICAgY29uc3QgYnJvd3NlckluZm8gPSBhd2FpdCB0aGlzLl9wYXJzZUFsaWFzKGFsaWFzKTtcblxuICAgICAgICBjb25zdCB7IHByb3ZpZGVyLCBwcm92aWRlck5hbWUsIGJyb3dzZXJOYW1lIH0gPSBicm93c2VySW5mbztcblxuICAgICAgICBpZiAoYnJvd3Nlck5hbWUgPT09ICdhbGwnKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2dldEluZm9Gb3JBbGxCcm93c2VyTmFtZXMocHJvdmlkZXIsIHByb3ZpZGVyTmFtZSk7XG5cbiAgICAgICAgaWYgKCFhd2FpdCBwcm92aWRlci5pc1ZhbGlkQnJvd3Nlck5hbWUoYnJvd3Nlck5hbWUpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RGaW5kQnJvd3NlciwgYWxpYXMpO1xuXG4gICAgICAgIHJldHVybiB7IGFsaWFzLCAuLi5icm93c2VySW5mbyB9O1xuICAgIH0sXG5cbiAgICBhZGRQcm92aWRlciAocHJvdmlkZXJOYW1lLCBwcm92aWRlck9iamVjdCkge1xuICAgICAgICBwcm92aWRlck5hbWUgPSBwYXJzZVByb3ZpZGVyTmFtZShwcm92aWRlck5hbWUpLnByb3ZpZGVyTmFtZTtcblxuICAgICAgICB0aGlzLnByb3ZpZGVyc0NhY2hlW3Byb3ZpZGVyTmFtZV0gPSBuZXcgQnJvd3NlclByb3ZpZGVyKFxuICAgICAgICAgICAgbmV3IEJyb3dzZXJQcm92aWRlclBsdWdpbkhvc3QocHJvdmlkZXJPYmplY3QsIHByb3ZpZGVyTmFtZSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUHJvdmlkZXIgKHByb3ZpZGVyTmFtZSkge1xuICAgICAgICBwcm92aWRlck5hbWUgPSBwYXJzZVByb3ZpZGVyTmFtZShwcm92aWRlck5hbWUpLnByb3ZpZGVyTmFtZTtcblxuICAgICAgICBkZWxldGUgdGhpcy5wcm92aWRlcnNDYWNoZVtwcm92aWRlck5hbWVdO1xuICAgIH0sXG5cbiAgICBhc3luYyBnZXRQcm92aWRlciAocHJvdmlkZXJOYW1lKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFByb3ZpZGVyTmFtZSA9IHBhcnNlUHJvdmlkZXJOYW1lKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgICAgICAgICA9IHBhcnNlZFByb3ZpZGVyTmFtZS5tb2R1bGVOYW1lO1xuXG4gICAgICAgIHByb3ZpZGVyTmFtZSA9IHBhcnNlZFByb3ZpZGVyTmFtZS5wcm92aWRlck5hbWU7XG5cbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLl9nZXRQcm92aWRlckZyb21DYWNoZShwcm92aWRlck5hbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFByb3ZpZGVyTW9kdWxlKHByb3ZpZGVyTmFtZSwgbW9kdWxlTmFtZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0QnVpbHRpblByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG5cbiAgICAgICAgaWYgKHByb3ZpZGVyKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm92aWRlcnNDYWNoZVtwcm92aWRlck5hbWVdLmluaXQoKTtcblxuICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgfSxcblxuICAgIGRpc3Bvc2UgKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LnZhbHVlcyh0aGlzLnByb3ZpZGVyc0NhY2hlKS5tYXAoaXRlbSA9PiBpdGVtLmRpc3Bvc2UoKSkpO1xuICAgIH1cbn07XG4iXX0=