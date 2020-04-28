"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const process_1 = __importDefault(require("./process"));
const VIDEO_EXTENSION = 'mp4';
const TEMP_VIDEO_FILE_PREFIX = 'tmp-video';
const TEMP_MERGE_FILE_PREFIX = TEMP_VIDEO_FILE_PREFIX + '-merge';
const TEMP_MERGE_CONFIG_FILE_PREFIX = 'config';
const TEMP_MERGE_CONFIG_FILE_EXTENSION = 'txt';
class TestRunVideoRecorder {
    constructor({ testRun, test, index }, { path, ffmpegPath, encodingOptions }) {
        this.testRun = testRun;
        this.test = test;
        this.index = index;
        this.tempFiles = null;
        this.videoRecorder = null;
        this.path = path;
        this.ffmpegPath = ffmpegPath;
        this.encodingOptions = encodingOptions;
    }
    get testRunInfo() {
        return {
            testIndex: this.index,
            fixture: this.test.fixture.name,
            test: this.test.name,
            alias: this._connection.browserInfo.alias,
            parsedUserAgent: this._connection.browserInfo.parsedUserAgent
        };
    }
    get hasErrors() {
        return !!this.testRun.errs.length;
    }
    get _connection() {
        return this.testRun.browserConnection;
    }
    async startCapturing() {
        await this.videoRecorder.startCapturing();
    }
    async finishCapturing() {
        await this.videoRecorder.finishCapturing();
    }
    async init() {
        this.tempFiles = this._generateTempNames();
        this.videoRecorder = this._createVideoRecorderProcess();
        await this.videoRecorder.init();
    }
    async isVideoSupported() {
        const connectionCapabilities = await this._connection.provider.hasCustomActionForBrowser(this._connection.id);
        return connectionCapabilities && connectionCapabilities.hasGetVideoFrameData;
    }
    _createVideoRecorderProcess() {
        return new process_1.default(this.tempFiles.tempVideoPath, this.ffmpegPath, this._connection, this.encodingOptions);
    }
    _generateTempNames() {
        const id = this._connection.id;
        const tempFileNames = {
            tempVideoPath: `${TEMP_VIDEO_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`,
            tempMergeConfigPath: `${TEMP_MERGE_CONFIG_FILE_PREFIX}-${id}.${TEMP_MERGE_CONFIG_FILE_EXTENSION}`,
            tmpMergeName: `${TEMP_MERGE_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`
        };
        for (const [tempFile, tempName] of Object.entries(tempFileNames))
            tempFileNames[tempFile] = path_1.join(this.path, tempName);
        return tempFileNames;
    }
}
exports.default = TestRunVideoRecorder;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1ydW4tdmlkZW8tcmVjb3JkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdmlkZW8tcmVjb3JkZXIvdGVzdC1ydW4tdmlkZW8tcmVjb3JkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBNEI7QUFDNUIsd0RBQTZDO0FBRTdDLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQztBQUU5QixNQUFNLHNCQUFzQixHQUFHLFdBQVcsQ0FBQztBQUMzQyxNQUFNLHNCQUFzQixHQUFHLHNCQUFzQixHQUFHLFFBQVEsQ0FBQztBQUVqRSxNQUFNLDZCQUE2QixHQUFNLFFBQVEsQ0FBQztBQUNsRCxNQUFNLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztBQUUvQyxNQUFxQixvQkFBb0I7SUFDckMsWUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRTtRQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFNLE9BQU8sQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFTLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFRLEtBQUssQ0FBQztRQUV4QixJQUFJLENBQUMsU0FBUyxHQUFPLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUUxQixJQUFJLENBQUMsSUFBSSxHQUFjLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxHQUFRLFVBQVUsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTztZQUNILFNBQVMsRUFBUSxJQUFJLENBQUMsS0FBSztZQUMzQixPQUFPLEVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtZQUN2QyxJQUFJLEVBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQy9CLEtBQUssRUFBWSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLO1lBQ25ELGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxlQUFlO1NBQ2hFLENBQUM7SUFDTixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjO1FBQ2hCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWU7UUFDakIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUV4RCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0I7UUFDbEIsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFOUcsT0FBTyxzQkFBc0IsSUFBSSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQztJQUNqRixDQUFDO0lBRUQsMkJBQTJCO1FBQ3ZCLE9BQU8sSUFBSSxpQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNILENBQUM7SUFFRCxrQkFBa0I7UUFDZCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUUvQixNQUFNLGFBQWEsR0FBRztZQUNsQixhQUFhLEVBQVEsR0FBRyxzQkFBc0IsSUFBSSxFQUFFLElBQUksZUFBZSxFQUFFO1lBQ3pFLG1CQUFtQixFQUFFLEdBQUcsNkJBQTZCLElBQUksRUFBRSxJQUFJLGdDQUFnQyxFQUFFO1lBQ2pHLFlBQVksRUFBUyxHQUFHLHNCQUFzQixJQUFJLEVBQUUsSUFBSSxlQUFlLEVBQUU7U0FDNUUsQ0FBQztRQUVGLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUM1RCxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFeEQsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztDQUNKO0FBdkVELHVDQXVFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCBWaWRlb1JlY29yZGVyUHJvY2VzcyBmcm9tICcuL3Byb2Nlc3MnO1xuXG5jb25zdCBWSURFT19FWFRFTlNJT04gPSAnbXA0JztcblxuY29uc3QgVEVNUF9WSURFT19GSUxFX1BSRUZJWCA9ICd0bXAtdmlkZW8nO1xuY29uc3QgVEVNUF9NRVJHRV9GSUxFX1BSRUZJWCA9IFRFTVBfVklERU9fRklMRV9QUkVGSVggKyAnLW1lcmdlJztcblxuY29uc3QgVEVNUF9NRVJHRV9DT05GSUdfRklMRV9QUkVGSVggICAgPSAnY29uZmlnJztcbmNvbnN0IFRFTVBfTUVSR0VfQ09ORklHX0ZJTEVfRVhURU5TSU9OID0gJ3R4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RSdW5WaWRlb1JlY29yZGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoeyB0ZXN0UnVuLCB0ZXN0LCBpbmRleCB9LCB7IHBhdGgsIGZmbXBlZ1BhdGgsIGVuY29kaW5nT3B0aW9ucyB9KSB7XG4gICAgICAgIHRoaXMudGVzdFJ1biAgICA9IHRlc3RSdW47XG4gICAgICAgIHRoaXMudGVzdCAgICAgICA9IHRlc3Q7XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IGluZGV4O1xuXG4gICAgICAgIHRoaXMudGVtcEZpbGVzICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMudmlkZW9SZWNvcmRlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5wYXRoICAgICAgICAgICAgPSBwYXRoO1xuICAgICAgICB0aGlzLmZmbXBlZ1BhdGggICAgICA9IGZmbXBlZ1BhdGg7XG4gICAgICAgIHRoaXMuZW5jb2RpbmdPcHRpb25zID0gZW5jb2RpbmdPcHRpb25zO1xuICAgIH1cblxuICAgIGdldCB0ZXN0UnVuSW5mbyAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXN0SW5kZXg6ICAgICAgIHRoaXMuaW5kZXgsXG4gICAgICAgICAgICBmaXh0dXJlOiAgICAgICAgIHRoaXMudGVzdC5maXh0dXJlLm5hbWUsXG4gICAgICAgICAgICB0ZXN0OiAgICAgICAgICAgIHRoaXMudGVzdC5uYW1lLFxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmJyb3dzZXJJbmZvLmFsaWFzLFxuICAgICAgICAgICAgcGFyc2VkVXNlckFnZW50OiB0aGlzLl9jb25uZWN0aW9uLmJyb3dzZXJJbmZvLnBhcnNlZFVzZXJBZ2VudFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldCBoYXNFcnJvcnMgKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLnRlc3RSdW4uZXJycy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZ2V0IF9jb25uZWN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdFJ1bi5icm93c2VyQ29ubmVjdGlvbjtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydENhcHR1cmluZyAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMudmlkZW9SZWNvcmRlci5zdGFydENhcHR1cmluZygpO1xuICAgIH1cblxuICAgIGFzeW5jIGZpbmlzaENhcHR1cmluZyAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMudmlkZW9SZWNvcmRlci5maW5pc2hDYXB0dXJpbmcoKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0ICgpIHtcbiAgICAgICAgdGhpcy50ZW1wRmlsZXMgICAgID0gdGhpcy5fZ2VuZXJhdGVUZW1wTmFtZXMoKTtcbiAgICAgICAgdGhpcy52aWRlb1JlY29yZGVyID0gdGhpcy5fY3JlYXRlVmlkZW9SZWNvcmRlclByb2Nlc3MoKTtcblxuICAgICAgICBhd2FpdCB0aGlzLnZpZGVvUmVjb3JkZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGlzVmlkZW9TdXBwb3J0ZWQgKCkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uQ2FwYWJpbGl0aWVzID0gYXdhaXQgdGhpcy5fY29ubmVjdGlvbi5wcm92aWRlci5oYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyKHRoaXMuX2Nvbm5lY3Rpb24uaWQpO1xuXG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uQ2FwYWJpbGl0aWVzICYmIGNvbm5lY3Rpb25DYXBhYmlsaXRpZXMuaGFzR2V0VmlkZW9GcmFtZURhdGE7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVZpZGVvUmVjb3JkZXJQcm9jZXNzICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWaWRlb1JlY29yZGVyUHJvY2Vzcyh0aGlzLnRlbXBGaWxlcy50ZW1wVmlkZW9QYXRoLCB0aGlzLmZmbXBlZ1BhdGgsIHRoaXMuX2Nvbm5lY3Rpb24sIHRoaXMuZW5jb2RpbmdPcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZ2VuZXJhdGVUZW1wTmFtZXMgKCkge1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMuX2Nvbm5lY3Rpb24uaWQ7XG5cbiAgICAgICAgY29uc3QgdGVtcEZpbGVOYW1lcyA9IHtcbiAgICAgICAgICAgIHRlbXBWaWRlb1BhdGg6ICAgICAgIGAke1RFTVBfVklERU9fRklMRV9QUkVGSVh9LSR7aWR9LiR7VklERU9fRVhURU5TSU9OfWAsXG4gICAgICAgICAgICB0ZW1wTWVyZ2VDb25maWdQYXRoOiBgJHtURU1QX01FUkdFX0NPTkZJR19GSUxFX1BSRUZJWH0tJHtpZH0uJHtURU1QX01FUkdFX0NPTkZJR19GSUxFX0VYVEVOU0lPTn1gLFxuICAgICAgICAgICAgdG1wTWVyZ2VOYW1lOiAgICAgICAgYCR7VEVNUF9NRVJHRV9GSUxFX1BSRUZJWH0tJHtpZH0uJHtWSURFT19FWFRFTlNJT059YFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgW3RlbXBGaWxlLCB0ZW1wTmFtZV0gb2YgT2JqZWN0LmVudHJpZXModGVtcEZpbGVOYW1lcykpXG4gICAgICAgICAgICB0ZW1wRmlsZU5hbWVzW3RlbXBGaWxlXSA9IGpvaW4odGhpcy5wYXRoLCB0ZW1wTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHRlbXBGaWxlTmFtZXM7XG4gICAgfVxufVxuXG4iXX0=