"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const device_specs_1 = require("device-specs");
const utils_1 = require("./commands/utils");
const type_1 = __importDefault(require("./commands/type"));
const warning_message_1 = __importDefault(require("../notifications/warning-message"));
const test_run_1 = require("../errors/test-run/");
const types_1 = require("../errors/types");
class BrowserManipulationQueue {
    constructor(browserConnection, screenshotCapturer, warningLog) {
        this.commands = [];
        this.browserId = browserConnection.id;
        this.browserProvider = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog = warningLog;
    }
    async _resizeWindow(width, height, currentWidth, currentHeight) {
        const canResizeWindow = await this.browserProvider.canResizeWindowToDimensions(this.browserId, width, height);
        if (!canResizeWindow)
            throw new test_run_1.WindowDimensionsOverflowError();
        try {
            return await this.browserProvider.resizeWindow(this.browserId, width, height, currentWidth, currentHeight);
        }
        catch (err) {
            this.warningLog.addWarning(warning_message_1.default.resizeError, err.message);
            return null;
        }
    }
    async _resizeWindowToFitDevice(device, portrait, currentWidth, currentHeight) {
        const { landscapeWidth, portraitWidth } = device_specs_1.getViewportSize(device);
        const width = portrait ? portraitWidth : landscapeWidth;
        const height = portrait ? landscapeWidth : portraitWidth;
        return await this._resizeWindow(width, height, currentWidth, currentHeight);
    }
    async _maximizeWindow() {
        try {
            return await this.browserProvider.maximizeWindow(this.browserId);
        }
        catch (err) {
            this.warningLog.addWarning(warning_message_1.default.maximizeError, err.message);
            return null;
        }
    }
    async _takeScreenshot(capture) {
        try {
            return await capture();
        }
        catch (err) {
            if (err.code === types_1.TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError)
                throw err;
            this.warningLog.addWarning(warning_message_1.default.screenshotError, err.stack);
            return null;
        }
    }
    async executePendingManipulation(driverMsg) {
        const command = this.commands.shift();
        switch (command.type) {
            case type_1.default.takeElementScreenshot:
            case type_1.default.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction({
                    customPath: command.path,
                    pageDimensions: driverMsg.pageDimensions,
                    cropDimensions: driverMsg.cropDimensions,
                    markSeed: command.markSeed,
                    fullPage: command.fullPage
                }));
            case type_1.default.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    pageDimensions: driverMsg.pageDimensions,
                    markSeed: command.markSeed,
                    fullPage: command.fullPage
                }));
            case type_1.default.resizeWindow:
                return await this._resizeWindow(command.width, command.height, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);
            case type_1.default.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);
            case type_1.default.maximizeWindow:
                return await this._maximizeWindow();
        }
        return null;
    }
    push(command) {
        this.commands.push(command);
    }
    removeAllNonServiceManipulations() {
        this.commands = this.commands.filter(command => utils_1.isServiceCommand(command));
    }
}
exports.default = BrowserManipulationQueue;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tYW5pcHVsYXRpb24tcXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC1ydW4vYnJvd3Nlci1tYW5pcHVsYXRpb24tcXVldWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQ0FBK0M7QUFDL0MsNENBQW9EO0FBQ3BELDJEQUEyQztBQUMzQyx1RkFBK0Q7QUFDL0Qsa0RBQW9FO0FBQ3BFLDJDQUFrRDtBQUdsRCxNQUFxQix3QkFBd0I7SUFDekMsWUFBYSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxVQUFVO1FBQzFELElBQUksQ0FBQyxRQUFRLEdBQWEsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQVksaUJBQWlCLENBQUMsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEdBQU0saUJBQWlCLENBQUMsUUFBUSxDQUFDO1FBQ3JELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxJQUFJLENBQUMsVUFBVSxHQUFXLFVBQVUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxhQUFhO1FBQzNELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU5RyxJQUFJLENBQUMsZUFBZTtZQUNoQixNQUFNLElBQUksd0NBQTZCLEVBQUUsQ0FBQztRQUU5QyxJQUFJO1lBQ0EsT0FBTyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDOUc7UUFDRCxPQUFPLEdBQUcsRUFBRTtZQUNSLElBQUksQ0FBQyxVQUFVLENB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LGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUU5SSxLQUFLLGNBQVksQ0FBQyx1QkFBdUI7Z0JBQ3JDLE9BQU8sTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFL0ssS0FBSyxjQUFZLENBQUMsY0FBYztnQkFDNUIsT0FBTyxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUMzQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFJLENBQUUsT0FBTztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxnQ0FBZ0M7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztDQUNKO0FBakdELDJDQWlHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFZpZXdwb3J0U2l6ZSB9IGZyb20gJ2RldmljZS1zcGVjcyc7XG5pbXBvcnQgeyBpc1NlcnZpY2VDb21tYW5kIH0gZnJvbSAnLi9jb21tYW5kcy91dGlscyc7XG5pbXBvcnQgQ09NTUFORF9UWVBFIGZyb20gJy4vY29tbWFuZHMvdHlwZSc7XG5pbXBvcnQgV0FSTklOR19NRVNTQUdFIGZyb20gJy4uL25vdGlmaWNhdGlvbnMvd2FybmluZy1tZXNzYWdlJztcbmltcG9ydCB7IFdpbmRvd0RpbWVuc2lvbnNPdmVyZmxvd0Vycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuLyc7XG5pbXBvcnQgeyBURVNUX1JVTl9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZSB7XG4gICAgY29uc3RydWN0b3IgKGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHdhcm5pbmdMb2cpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kcyAgICAgICAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5icm93c2VySWQgICAgICAgICAgPSBicm93c2VyQ29ubmVjdGlvbi5pZDtcbiAgICAgICAgdGhpcy5icm93c2VyUHJvdmlkZXIgICAgPSBicm93c2VyQ29ubmVjdGlvbi5wcm92aWRlcjtcbiAgICAgICAgdGhpcy5zY3JlZW5zaG90Q2FwdHVyZXIgPSBzY3JlZW5zaG90Q2FwdHVyZXI7XG4gICAgICAgIHRoaXMud2FybmluZ0xvZyAgICAgICAgID0gd2FybmluZ0xvZztcbiAgICB9XG5cbiAgICBhc3luYyBfcmVzaXplV2luZG93ICh3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpIHtcbiAgICAgICAgY29uc3QgY2FuUmVzaXplV2luZG93ID0gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIuY2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zKHRoaXMuYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBpZiAoIWNhblJlc2l6ZVdpbmRvdylcbiAgICAgICAgICAgIHRocm93IG5ldyBXaW5kb3dEaW1lbnNpb25zT3ZlcmZsb3dFcnJvcigpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIucmVzaXplV2luZG93KHRoaXMuYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5yZXNpemVFcnJvciwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfcmVzaXplV2luZG93VG9GaXREZXZpY2UgKGRldmljZSwgcG9ydHJhaXQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCkge1xuICAgICAgICBjb25zdCB7IGxhbmRzY2FwZVdpZHRoLCBwb3J0cmFpdFdpZHRoIH0gPSBnZXRWaWV3cG9ydFNpemUoZGV2aWNlKTtcblxuICAgICAgICBjb25zdCB3aWR0aCAgPSBwb3J0cmFpdCA/IHBvcnRyYWl0V2lkdGggOiBsYW5kc2NhcGVXaWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gcG9ydHJhaXQgPyBsYW5kc2NhcGVXaWR0aCA6IHBvcnRyYWl0V2lkdGg7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Jlc2l6ZVdpbmRvdyh3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9tYXhpbWl6ZVdpbmRvdyAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIubWF4aW1pemVXaW5kb3codGhpcy5icm93c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5tYXhpbWl6ZUVycm9yLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF90YWtlU2NyZWVuc2hvdCAoY2FwdHVyZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNhcHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09IFRFU1RfUlVOX0VSUk9SUy5pbnZhbGlkRWxlbWVudFNjcmVlbnNob3REaW1lbnNpb25zRXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuXG4gICAgICAgICAgICB0aGlzLndhcm5pbmdMb2cuYWRkV2FybmluZyhXQVJOSU5HX01FU1NBR0Uuc2NyZWVuc2hvdEVycm9yLCBlcnIuc3RhY2spO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlUGVuZGluZ01hbmlwdWxhdGlvbiAoZHJpdmVyTXNnKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLnNoaWZ0KCk7XG5cbiAgICAgICAgc3dpdGNoIChjb21tYW5kLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnRha2VFbGVtZW50U2NyZWVuc2hvdDpcbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnRha2VTY3JlZW5zaG90OlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl90YWtlU2NyZWVuc2hvdCgoKSA9PiB0aGlzLnNjcmVlbnNob3RDYXB0dXJlci5jYXB0dXJlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tUGF0aDogICAgIGNvbW1hbmQucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZURpbWVuc2lvbnM6IGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgY3JvcERpbWVuc2lvbnM6IGRyaXZlck1zZy5jcm9wRGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbWFya1NlZWQ6ICAgICAgIGNvbW1hbmQubWFya1NlZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxQYWdlOiAgICAgICBjb21tYW5kLmZ1bGxQYWdlXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBjYXNlIENPTU1BTkRfVFlQRS50YWtlU2NyZWVuc2hvdE9uRmFpbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fdGFrZVNjcmVlbnNob3QoKCkgPT4gdGhpcy5zY3JlZW5zaG90Q2FwdHVyZXIuY2FwdHVyZUVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZURpbWVuc2lvbnM6IGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbWFya1NlZWQ6ICAgICAgIGNvbW1hbmQubWFya1NlZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxQYWdlOiAgICAgICBjb21tYW5kLmZ1bGxQYWdlXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBjYXNlIENPTU1BTkRfVFlQRS5yZXNpemVXaW5kb3c6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Jlc2l6ZVdpbmRvdyhjb21tYW5kLndpZHRoLCBjb21tYW5kLmhlaWdodCwgZHJpdmVyTXNnLnBhZ2VEaW1lbnNpb25zLmlubmVyV2lkdGgsIGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucy5pbm5lckhlaWdodCk7XG5cbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnJlc2l6ZVdpbmRvd1RvRml0RGV2aWNlOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9yZXNpemVXaW5kb3dUb0ZpdERldmljZShjb21tYW5kLmRldmljZSwgY29tbWFuZC5vcHRpb25zLnBvcnRyYWl0T3JpZW50YXRpb24sIGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucy5pbm5lcldpZHRoLCBkcml2ZXJNc2cucGFnZURpbWVuc2lvbnMuaW5uZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICBjYXNlIENPTU1BTkRfVFlQRS5tYXhpbWl6ZVdpbmRvdzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbWF4aW1pemVXaW5kb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHB1c2ggKGNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kcy5wdXNoKGNvbW1hbmQpO1xuICAgIH1cblxuICAgIHJlbW92ZUFsbE5vblNlcnZpY2VNYW5pcHVsYXRpb25zICgpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHRoaXMuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gaXNTZXJ2aWNlQ29tbWFuZChjb21tYW5kKSk7XG4gICAgfVxufVxuIl19