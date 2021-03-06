"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testcafe_browser_tools_1 = require("testcafe-browser-tools");
const get_maximized_headless_window_size_1 = __importDefault(require("../../utils/get-maximized-headless-window-size"));
const crop_1 = require("../../../../screenshots/crop");
const promisified_functions_1 = require("../../../../utils/promisified-functions");
exports.default = {
    openedBrowsers: {},
    isMultiBrowser: false,
    supportMultipleWindows: true,
    getActiveWindowId(browserId) {
        return this.openedBrowsers[browserId].activeWindowId;
    },
    setActiveWindowId(browserId, val) {
        this.openedBrowsers[browserId].activeWindowId = val;
    },
    _getConfig() {
        throw new Error('Not implemented');
    },
    _getBrowserProtocolClient( /* runtimeInfo */) {
        throw new Error('Not implemented');
    },
    _getBrowserName() {
        return this.providerName.replace(':', '');
    },
    async isValidBrowserName(browserName) {
        const config = await this._getConfig(browserName);
        const browserInfo = await testcafe_browser_tools_1.getBrowserInfo(config.path || this._getBrowserName());
        return !!browserInfo;
    },
    async isLocalBrowser() {
        return true;
    },
    isHeadlessBrowser(browserId) {
        return this.openedBrowsers[browserId].config.headless;
    },
    _getCropDimensions(viewportWidth, viewportHeight) {
        if (!viewportWidth || !viewportHeight)
            return null;
        return {
            left: 0,
            top: 0,
            right: viewportWidth,
            bottom: viewportHeight
        };
    },
    async takeScreenshot(browserId, path, viewportWidth, viewportHeight, fullPage) {
        const runtimeInfo = this.openedBrowsers[browserId];
        const browserClient = this._getBrowserProtocolClient(runtimeInfo);
        const binaryImage = await browserClient.getScreenshotData(runtimeInfo, fullPage);
        const cropDimensions = this._getCropDimensions(viewportWidth, viewportHeight);
        let pngImage = await promisified_functions_1.readPng(binaryImage);
        if (!fullPage)
            pngImage = await crop_1.cropScreenshot(pngImage, { path, cropDimensions }) || pngImage;
        await promisified_functions_1.writePng(path, pngImage);
    },
    async maximizeWindow(browserId) {
        const maximumSize = get_maximized_headless_window_size_1.default();
        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);
    }
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9iYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbUVBQXdEO0FBQ3hELHdIQUE0RjtBQUM1Rix1REFBOEQ7QUFDOUQsbUZBQTRFO0FBRTVFLGtCQUFlO0lBQ1gsY0FBYyxFQUFFLEVBQUU7SUFFbEIsY0FBYyxFQUFFLEtBQUs7SUFFckIsc0JBQXNCLEVBQUUsSUFBSTtJQUU1QixpQkFBaUIsQ0FBRSxTQUFTO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxjQUFjLENBQUM7SUFDekQsQ0FBQztJQUVELGlCQUFpQixDQUFFLFNBQVMsRUFBRSxHQUFHO1FBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0lBRUQsVUFBVTtRQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQseUJBQXlCLEVBQUUsaUJBQWlCO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZUFBZTtRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUUsV0FBVztRQUNqQyxNQUFNLE1BQU0sR0FBUSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsTUFBTSx1Q0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFFaEYsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsaUJBQWlCLENBQUUsU0FBUztRQUN4QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUMxRCxDQUFDO0lBRUQsa0JBQWtCLENBQUUsYUFBYSxFQUFFLGNBQWM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGNBQWM7WUFDakMsT0FBTyxJQUFJLENBQUM7UUFFaEIsT0FBTztZQUNILElBQUksRUFBSSxDQUFDO1lBQ1QsR0FBRyxFQUFLLENBQUM7WUFDVCxLQUFLLEVBQUcsYUFBYTtZQUNyQixNQUFNLEVBQUUsY0FBYztTQUN6QixDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFFBQVE7UUFDMUUsTUFBTSxXQUFXLEdBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxNQUFNLGFBQWEsR0FBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsTUFBTSxXQUFXLEdBQU0sTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFOUUsSUFBSSxRQUFRLEdBQUcsTUFBTSwrQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxRQUFRO1lBQ1QsUUFBUSxHQUFHLE1BQU0scUJBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUM7UUFFcEYsTUFBTSxnQ0FBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBRSxTQUFTO1FBQzNCLE1BQU0sV0FBVyxHQUFHLDRDQUE4QixFQUFFLENBQUM7UUFFckQsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckgsQ0FBQztDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRCcm93c2VySW5mbyB9IGZyb20gJ3Rlc3RjYWZlLWJyb3dzZXItdG9vbHMnO1xuaW1wb3J0IGdldE1heGltaXplZEhlYWRsZXNzV2luZG93U2l6ZSBmcm9tICcuLi8uLi91dGlscy9nZXQtbWF4aW1pemVkLWhlYWRsZXNzLXdpbmRvdy1zaXplJztcbmltcG9ydCB7IGNyb3BTY3JlZW5zaG90IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NyZWVuc2hvdHMvY3JvcCc7XG5pbXBvcnQgeyByZWFkUG5nLCB3cml0ZVBuZyB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3Byb21pc2lmaWVkLWZ1bmN0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBvcGVuZWRCcm93c2Vyczoge30sXG5cbiAgICBpc011bHRpQnJvd3NlcjogZmFsc2UsXG5cbiAgICBzdXBwb3J0TXVsdGlwbGVXaW5kb3dzOiB0cnVlLFxuXG4gICAgZ2V0QWN0aXZlV2luZG93SWQgKGJyb3dzZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGVuZWRCcm93c2Vyc1ticm93c2VySWRdLmFjdGl2ZVdpbmRvd0lkO1xuICAgIH0sXG5cbiAgICBzZXRBY3RpdmVXaW5kb3dJZCAoYnJvd3NlcklkLCB2YWwpIHtcbiAgICAgICAgdGhpcy5vcGVuZWRCcm93c2Vyc1ticm93c2VySWRdLmFjdGl2ZVdpbmRvd0lkID0gdmFsO1xuICAgIH0sXG5cbiAgICBfZ2V0Q29uZmlnICgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9LFxuXG4gICAgX2dldEJyb3dzZXJQcm90b2NvbENsaWVudCAoLyogcnVudGltZUluZm8gKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9LFxuXG4gICAgX2dldEJyb3dzZXJOYW1lICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvdmlkZXJOYW1lLnJlcGxhY2UoJzonLCAnJyk7XG4gICAgfSxcblxuICAgIGFzeW5jIGlzVmFsaWRCcm93c2VyTmFtZSAoYnJvd3Nlck5hbWUpIHtcbiAgICAgICAgY29uc3QgY29uZmlnICAgICAgPSBhd2FpdCB0aGlzLl9nZXRDb25maWcoYnJvd3Nlck5hbWUpO1xuICAgICAgICBjb25zdCBicm93c2VySW5mbyA9IGF3YWl0IGdldEJyb3dzZXJJbmZvKGNvbmZpZy5wYXRoIHx8IHRoaXMuX2dldEJyb3dzZXJOYW1lKCkpO1xuXG4gICAgICAgIHJldHVybiAhIWJyb3dzZXJJbmZvO1xuICAgIH0sXG5cbiAgICBhc3luYyBpc0xvY2FsQnJvd3NlciAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBpc0hlYWRsZXNzQnJvd3NlciAoYnJvd3NlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF0uY29uZmlnLmhlYWRsZXNzO1xuICAgIH0sXG5cbiAgICBfZ2V0Q3JvcERpbWVuc2lvbnMgKHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0KSB7XG4gICAgICAgIGlmICghdmlld3BvcnRXaWR0aCB8fCAhdmlld3BvcnRIZWlnaHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogICAwLFxuICAgICAgICAgICAgdG9wOiAgICAwLFxuICAgICAgICAgICAgcmlnaHQ6ICB2aWV3cG9ydFdpZHRoLFxuICAgICAgICAgICAgYm90dG9tOiB2aWV3cG9ydEhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhc3luYyB0YWtlU2NyZWVuc2hvdCAoYnJvd3NlcklkLCBwYXRoLCB2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgZnVsbFBhZ2UpIHtcbiAgICAgICAgY29uc3QgcnVudGltZUluZm8gICAgPSB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF07XG4gICAgICAgIGNvbnN0IGJyb3dzZXJDbGllbnQgID0gdGhpcy5fZ2V0QnJvd3NlclByb3RvY29sQ2xpZW50KHJ1bnRpbWVJbmZvKTtcbiAgICAgICAgY29uc3QgYmluYXJ5SW1hZ2UgICAgPSBhd2FpdCBicm93c2VyQ2xpZW50LmdldFNjcmVlbnNob3REYXRhKHJ1bnRpbWVJbmZvLCBmdWxsUGFnZSk7XG4gICAgICAgIGNvbnN0IGNyb3BEaW1lbnNpb25zID0gdGhpcy5fZ2V0Q3JvcERpbWVuc2lvbnModmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQpO1xuXG4gICAgICAgIGxldCBwbmdJbWFnZSA9IGF3YWl0IHJlYWRQbmcoYmluYXJ5SW1hZ2UpO1xuXG4gICAgICAgIGlmICghZnVsbFBhZ2UpXG4gICAgICAgICAgICBwbmdJbWFnZSA9IGF3YWl0IGNyb3BTY3JlZW5zaG90KHBuZ0ltYWdlLCB7IHBhdGgsIGNyb3BEaW1lbnNpb25zIH0pIHx8IHBuZ0ltYWdlO1xuXG4gICAgICAgIGF3YWl0IHdyaXRlUG5nKHBhdGgsIHBuZ0ltYWdlKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgbWF4aW1pemVXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBtYXhpbXVtU2l6ZSA9IGdldE1heGltaXplZEhlYWRsZXNzV2luZG93U2l6ZSgpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMucmVzaXplV2luZG93KGJyb3dzZXJJZCwgbWF4aW11bVNpemUud2lkdGgsIG1heGltdW1TaXplLmhlaWdodCwgbWF4aW11bVNpemUud2lkdGgsIG1heGltdW1TaXplLmhlaWdodCk7XG4gICAgfVxufTtcbiJdfQ==