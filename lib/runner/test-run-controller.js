"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_event_emitter_1 = __importDefault(require("../utils/async-event-emitter"));
const testcafe_legacy_api_1 = require("testcafe-legacy-api");
const test_run_1 = __importDefault(require("../test-run"));
const session_controller_1 = __importDefault(require("../test-run/session-controller"));
const QUARANTINE_THRESHOLD = 3;
const DISCONNECT_THRESHOLD = 3;
class Quarantine {
    constructor() {
        this.attempts = [];
    }
    getFailedAttempts() {
        return this.attempts.filter(errors => !!errors.length);
    }
    getPassedAttempts() {
        return this.attempts.filter(errors => errors.length === 0);
    }
    getNextAttemptNumber() {
        return this.attempts.length + 1;
    }
    isThresholdReached(extraErrors) {
        const { failedTimes, passedTimes } = this._getAttemptsResult(extraErrors);
        const failedThresholdReached = failedTimes >= QUARANTINE_THRESHOLD;
        const passedThresholdReached = passedTimes >= QUARANTINE_THRESHOLD;
        return failedThresholdReached || passedThresholdReached;
    }
    isFirstAttemptSuccessful(extraErrors) {
        const { failedTimes, passedTimes } = this._getAttemptsResult(extraErrors);
        return failedTimes === 0 && passedTimes > 0;
    }
    _getAttemptsResult(extraErrors) {
        let failedTimes = this.getFailedAttempts().length;
        let passedTimes = this.getPassedAttempts().length;
        if (extraErrors) {
            if (extraErrors.length)
                failedTimes += extraErrors.length;
            else
                passedTimes += 1;
        }
        return { failedTimes, passedTimes };
    }
}
class TestRunController extends async_event_emitter_1.default {
    constructor(test, index, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();
        this.test = test;
        this.index = index;
        this.opts = opts;
        this.proxy = proxy;
        this.screenshots = screenshots;
        this.warningLog = warningLog;
        this.fixtureHookController = fixtureHookController;
        this.TestRunCtor = TestRunController._getTestRunCtor(test, opts);
        this.testRun = null;
        this.done = false;
        this.quarantine = null;
        this.disconnectionCount = 0;
        if (this.opts.quarantineMode)
            this.quarantine = new Quarantine();
    }
    static _getTestRunCtor(test, opts) {
        if (opts.TestRunCtor)
            return opts.TestRunCtor;
        return test.isLegacy ? testcafe_legacy_api_1.TestRun : test_run_1.default;
    }
    async _createTestRun(connection) {
        const screenshotCapturer = this.screenshots.createCapturerFor(this.test, this.index, this.quarantine, connection, this.warningLog);
        const TestRunCtor = this.TestRunCtor;
        this.testRun = new TestRunCtor(this.test, connection, screenshotCapturer, this.warningLog, this.opts);
        this.screenshots.addTestRun(this.test, this.testRun);
        if (this.testRun.addQuarantineInfo)
            this.testRun.addQuarantineInfo(this.quarantine);
        if (!this.quarantine || this._isFirstQuarantineAttempt()) {
            await this.emit('test-run-create', {
                testRun: this.testRun,
                legacy: TestRunCtor === testcafe_legacy_api_1.TestRun,
                test: this.test,
                index: this.index,
                quarantine: this.quarantine,
            });
        }
        return this.testRun;
    }
    async _endQuarantine() {
        if (this.quarantine.attempts.length > 1)
            this.testRun.unstable = this.quarantine.getPassedAttempts().length > 0;
        await this._emitTestRunDone();
    }
    _shouldKeepInQuarantine() {
        const errors = this.testRun.errs;
        const hasErrors = !!errors.length;
        const attempts = this.quarantine.attempts;
        const isFirstAttempt = this._isFirstQuarantineAttempt();
        attempts.push(errors);
        return isFirstAttempt ? hasErrors : !this.quarantine.isThresholdReached();
    }
    _isFirstQuarantineAttempt() {
        return this.quarantine && !this.quarantine.attempts.length;
    }
    async _keepInQuarantine() {
        await this._restartTest();
    }
    async _restartTest() {
        await this.emit('test-run-restart');
    }
    async _testRunDoneInQuarantineMode() {
        if (this._shouldKeepInQuarantine())
            await this._keepInQuarantine();
        else
            await this._endQuarantine();
    }
    async _testRunDone() {
        if (this.quarantine)
            await this._testRunDoneInQuarantineMode();
        else
            await this._emitTestRunDone();
    }
    async _emitActionStart(args) {
        await this.emit('test-action-start', args);
    }
    async _emitActionDone(args) {
        await this.emit('test-action-done', args);
    }
    async _emitTestRunDone() {
        // NOTE: we should report test run completion in order they were completed in browser.
        // To keep a sequence after fixture hook execution we use completion queue.
        await this.fixtureHookController.runFixtureAfterHookIfNecessary(this.testRun);
        this.done = true;
        await this.emit('test-run-done');
    }
    async _emitTestRunStart() {
        await this.emit('test-run-start');
    }
    async _testRunBeforeDone() {
        let raiseEvent = !this.quarantine;
        if (!raiseEvent) {
            const isSuccessfulQuarantineFirstAttempt = this._isFirstQuarantineAttempt() && !this.testRun.errs.length;
            const isAttemptsThresholdReached = this.quarantine.isThresholdReached(this.testRun.errs);
            raiseEvent = isSuccessfulQuarantineFirstAttempt || isAttemptsThresholdReached;
        }
        if (raiseEvent)
            await this.emit('test-run-before-done');
    }
    _testRunDisconnected(connection) {
        this.disconnectionCount++;
        const disconnectionThresholdExceedeed = this.disconnectionCount >= DISCONNECT_THRESHOLD;
        return connection
            .processDisconnection(disconnectionThresholdExceedeed)
            .then(() => {
            return this._restartTest();
        });
    }
    _assignTestRunEvents(testRun, connection) {
        testRun.on('action-start', async (args) => this._emitActionStart(Object.assign(args, { testRun })));
        testRun.on('action-done', async (args) => this._emitActionDone(Object.assign(args, { testRun })));
        testRun.once('start', async () => this._emitTestRunStart());
        testRun.once('ready', async () => {
            if (!this.quarantine || this._isFirstQuarantineAttempt())
                await this.emit('test-run-ready');
        });
        testRun.once('before-done', () => this._testRunBeforeDone());
        testRun.once('done', () => this._testRunDone());
        testRun.once('disconnected', () => this._testRunDisconnected(connection));
    }
    get blocked() {
        return this.fixtureHookController.isTestBlocked(this.test);
    }
    async start(connection) {
        const testRun = await this._createTestRun(connection);
        const hookOk = await this.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);
        if (this.test.skip || !hookOk) {
            await this.emit('test-run-start');
            await this._emitTestRunDone();
            return null;
        }
        this._assignTestRunEvents(testRun, connection);
        testRun.start();
        return session_controller_1.default.getSessionUrl(testRun, this.proxy);
    }
}
exports.default = TestRunController;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1ydW4tY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvdGVzdC1ydW4tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVGQUE2RDtBQUM3RCw2REFBK0Q7QUFDL0QsMkRBQWtDO0FBQ2xDLHdGQUErRDtBQUUvRCxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUMvQixNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUUvQixNQUFNLFVBQVU7SUFDWjtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxpQkFBaUI7UUFDYixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELG9CQUFvQjtRQUNoQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsa0JBQWtCLENBQUUsV0FBVztRQUMzQixNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRSxNQUFNLHNCQUFzQixHQUFHLFdBQVcsSUFBSSxvQkFBb0IsQ0FBQztRQUNuRSxNQUFNLHNCQUFzQixHQUFHLFdBQVcsSUFBSSxvQkFBb0IsQ0FBQztRQUVuRSxPQUFPLHNCQUFzQixJQUFJLHNCQUFzQixDQUFDO0lBQzVELENBQUM7SUFFRCx3QkFBd0IsQ0FBRSxXQUFXO1FBQ2pD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LENBQUUsVUFBVTtRQUNuQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsK0JBQStCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekYsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMzQixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRS9DLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVoQixPQUFPLDRCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDSjtBQXRMRCxvQ0FzTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXN5bmNFdmVudEVtaXR0ZXIgZnJvbSAnLi4vdXRpbHMvYXN5bmMtZXZlbnQtZW1pdHRlcic7XG5pbXBvcnQgeyBUZXN0UnVuIGFzIExlZ2FjeVRlc3RSdW4gfSBmcm9tICd0ZXN0Y2FmZS1sZWdhY3ktYXBpJztcbmltcG9ydCBUZXN0UnVuIGZyb20gJy4uL3Rlc3QtcnVuJztcbmltcG9ydCBTZXNzaW9uQ29udHJvbGxlciBmcm9tICcuLi90ZXN0LXJ1bi9zZXNzaW9uLWNvbnRyb2xsZXInO1xuXG5jb25zdCBRVUFSQU5USU5FX1RIUkVTSE9MRCA9IDM7XG5jb25zdCBESVNDT05ORUNUX1RIUkVTSE9MRCA9IDM7XG5cbmNsYXNzIFF1YXJhbnRpbmUge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5hdHRlbXB0cyA9IFtdO1xuICAgIH1cblxuICAgIGdldEZhaWxlZEF0dGVtcHRzICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0ZW1wdHMuZmlsdGVyKGVycm9ycyA9PiAhIWVycm9ycy5sZW5ndGgpO1xuICAgIH1cblxuICAgIGdldFBhc3NlZEF0dGVtcHRzICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0ZW1wdHMuZmlsdGVyKGVycm9ycyA9PiBlcnJvcnMubGVuZ3RoID09PSAwKTtcbiAgICB9XG5cbiAgICBnZXROZXh0QXR0ZW1wdE51bWJlciAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGVtcHRzLmxlbmd0aCArIDE7XG4gICAgfVxuXG4gICAgaXNUaHJlc2hvbGRSZWFjaGVkIChleHRyYUVycm9ycykge1xuICAgICAgICBjb25zdCB7IGZhaWxlZFRpbWVzLCBwYXNzZWRUaW1lcyB9ID0gdGhpcy5fZ2V0QXR0ZW1wdHNSZXN1bHQoZXh0cmFFcnJvcnMpO1xuXG4gICAgICAgIGNvbnN0IGZhaWxlZFRocmVzaG9sZFJlYWNoZWQgPSBmYWlsZWRUaW1lcyA+PSBRVUFSQU5USU5FX1RIUkVTSE9MRDtcbiAgICAgICAgY29uc3QgcGFzc2VkVGhyZXNob2xkUmVhY2hlZCA9IHBhc3NlZFRpbWVzID49IFFVQVJBTlRJTkVfVEhSRVNIT0xEO1xuXG4gICAgICAgIHJldHVybiBmYWlsZWRUaHJlc2hvbGRSZWFjaGVkIHx8IHBhc3NlZFRocmVzaG9sZFJlYWNoZWQ7XG4gICAgfVxuXG4gICAgaXNGaXJzdEF0dGVtcHRTdWNjZXNzZnVsIChleHRyYUVycm9ycykge1xuICAgICAgICBjb25zdCB7IGZhaWxlZFRpbWVzLCBwYXNzZWRUaW1lcyB9ID0gdGhpcy5fZ2V0QXR0ZW1wdHNSZXN1bHQoZXh0cmFFcnJvcnMpO1xuXG4gICAgICAgIHJldHVybiBmYWlsZWRUaW1lcyA9PT0gMCAmJiBwYXNzZWRUaW1lcyA+IDA7XG4gICAgfVxuXG4gICAgX2dldEF0dGVtcHRzUmVzdWx0IChleHRyYUVycm9ycykge1xuICAgICAgICBsZXQgZmFpbGVkVGltZXMgPSB0aGlzLmdldEZhaWxlZEF0dGVtcHRzKCkubGVuZ3RoO1xuICAgICAgICBsZXQgcGFzc2VkVGltZXMgPSB0aGlzLmdldFBhc3NlZEF0dGVtcHRzKCkubGVuZ3RoO1xuXG4gICAgICAgIGlmIChleHRyYUVycm9ycykge1xuICAgICAgICAgICAgaWYgKGV4dHJhRXJyb3JzLmxlbmd0aClcbiAgICAgICAgICAgICAgICBmYWlsZWRUaW1lcyArPSBleHRyYUVycm9ycy5sZW5ndGg7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcGFzc2VkVGltZXMgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IGZhaWxlZFRpbWVzLCBwYXNzZWRUaW1lcyB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdFJ1bkNvbnRyb2xsZXIgZXh0ZW5kcyBBc3luY0V2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IgKHRlc3QsIGluZGV4LCBwcm94eSwgc2NyZWVuc2hvdHMsIHdhcm5pbmdMb2csIGZpeHR1cmVIb29rQ29udHJvbGxlciwgb3B0cykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMudGVzdCAgPSB0ZXN0O1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMub3B0cyAgPSBvcHRzO1xuXG4gICAgICAgIHRoaXMucHJveHkgICAgICAgICAgICAgICAgID0gcHJveHk7XG4gICAgICAgIHRoaXMuc2NyZWVuc2hvdHMgICAgICAgICAgID0gc2NyZWVuc2hvdHM7XG4gICAgICAgIHRoaXMud2FybmluZ0xvZyAgICAgICAgICAgID0gd2FybmluZ0xvZztcbiAgICAgICAgdGhpcy5maXh0dXJlSG9va0NvbnRyb2xsZXIgPSBmaXh0dXJlSG9va0NvbnRyb2xsZXI7XG5cbiAgICAgICAgdGhpcy5UZXN0UnVuQ3RvciA9IFRlc3RSdW5Db250cm9sbGVyLl9nZXRUZXN0UnVuQ3Rvcih0ZXN0LCBvcHRzKTtcblxuICAgICAgICB0aGlzLnRlc3RSdW4gICAgICAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMuZG9uZSAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVhcmFudGluZSAgICAgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0aW9uQ291bnQgPSAwO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMucXVhcmFudGluZU1vZGUpXG4gICAgICAgICAgICB0aGlzLnF1YXJhbnRpbmUgPSBuZXcgUXVhcmFudGluZSgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfZ2V0VGVzdFJ1bkN0b3IgKHRlc3QsIG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHMuVGVzdFJ1bkN0b3IpXG4gICAgICAgICAgICByZXR1cm4gb3B0cy5UZXN0UnVuQ3RvcjtcblxuICAgICAgICByZXR1cm4gdGVzdC5pc0xlZ2FjeSA/IExlZ2FjeVRlc3RSdW4gOiBUZXN0UnVuO1xuICAgIH1cblxuICAgIGFzeW5jIF9jcmVhdGVUZXN0UnVuIChjb25uZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbnNob3RDYXB0dXJlciA9IHRoaXMuc2NyZWVuc2hvdHMuY3JlYXRlQ2FwdHVyZXJGb3IodGhpcy50ZXN0LCB0aGlzLmluZGV4LCB0aGlzLnF1YXJhbnRpbmUsIGNvbm5lY3Rpb24sIHRoaXMud2FybmluZ0xvZyk7XG4gICAgICAgIGNvbnN0IFRlc3RSdW5DdG9yICAgICAgICA9IHRoaXMuVGVzdFJ1bkN0b3I7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuID0gbmV3IFRlc3RSdW5DdG9yKHRoaXMudGVzdCwgY29ubmVjdGlvbiwgc2NyZWVuc2hvdENhcHR1cmVyLCB0aGlzLndhcm5pbmdMb2csIHRoaXMub3B0cyk7XG5cbiAgICAgICAgdGhpcy5zY3JlZW5zaG90cy5hZGRUZXN0UnVuKHRoaXMudGVzdCwgdGhpcy50ZXN0UnVuKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0UnVuLmFkZFF1YXJhbnRpbmVJbmZvKVxuICAgICAgICAgICAgdGhpcy50ZXN0UnVuLmFkZFF1YXJhbnRpbmVJbmZvKHRoaXMucXVhcmFudGluZSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnF1YXJhbnRpbmUgfHwgdGhpcy5faXNGaXJzdFF1YXJhbnRpbmVBdHRlbXB0KCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tY3JlYXRlJywge1xuICAgICAgICAgICAgICAgIHRlc3RSdW46ICAgIHRoaXMudGVzdFJ1bixcbiAgICAgICAgICAgICAgICBsZWdhY3k6ICAgICBUZXN0UnVuQ3RvciA9PT0gTGVnYWN5VGVzdFJ1bixcbiAgICAgICAgICAgICAgICB0ZXN0OiAgICAgICB0aGlzLnRlc3QsXG4gICAgICAgICAgICAgICAgaW5kZXg6ICAgICAgdGhpcy5pbmRleCxcbiAgICAgICAgICAgICAgICBxdWFyYW50aW5lOiB0aGlzLnF1YXJhbnRpbmUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RSdW47XG4gICAgfVxuXG4gICAgYXN5bmMgX2VuZFF1YXJhbnRpbmUgKCkge1xuICAgICAgICBpZiAodGhpcy5xdWFyYW50aW5lLmF0dGVtcHRzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICB0aGlzLnRlc3RSdW4udW5zdGFibGUgPSB0aGlzLnF1YXJhbnRpbmUuZ2V0UGFzc2VkQXR0ZW1wdHMoKS5sZW5ndGggPiAwO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX2VtaXRUZXN0UnVuRG9uZSgpO1xuICAgIH1cblxuICAgIF9zaG91bGRLZWVwSW5RdWFyYW50aW5lICgpIHtcbiAgICAgICAgY29uc3QgZXJyb3JzICAgICAgICAgPSB0aGlzLnRlc3RSdW4uZXJycztcbiAgICAgICAgY29uc3QgaGFzRXJyb3JzICAgICAgPSAhIWVycm9ycy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGF0dGVtcHRzICAgICAgID0gdGhpcy5xdWFyYW50aW5lLmF0dGVtcHRzO1xuICAgICAgICBjb25zdCBpc0ZpcnN0QXR0ZW1wdCA9IHRoaXMuX2lzRmlyc3RRdWFyYW50aW5lQXR0ZW1wdCgpO1xuXG4gICAgICAgIGF0dGVtcHRzLnB1c2goZXJyb3JzKTtcblxuICAgICAgICByZXR1cm4gaXNGaXJzdEF0dGVtcHQgPyBoYXNFcnJvcnMgOiAhdGhpcy5xdWFyYW50aW5lLmlzVGhyZXNob2xkUmVhY2hlZCgpO1xuICAgIH1cblxuICAgIF9pc0ZpcnN0UXVhcmFudGluZUF0dGVtcHQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWFyYW50aW5lICYmICF0aGlzLnF1YXJhbnRpbmUuYXR0ZW1wdHMubGVuZ3RoO1xuICAgIH1cblxuICAgIGFzeW5jIF9rZWVwSW5RdWFyYW50aW5lICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fcmVzdGFydFRlc3QoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfcmVzdGFydFRlc3QgKCkge1xuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtcnVuLXJlc3RhcnQnKTtcbiAgICB9XG5cbiAgICBhc3luYyBfdGVzdFJ1bkRvbmVJblF1YXJhbnRpbmVNb2RlICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Nob3VsZEtlZXBJblF1YXJhbnRpbmUoKSlcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2tlZXBJblF1YXJhbnRpbmUoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW5kUXVhcmFudGluZSgpO1xuICAgIH1cblxuICAgIGFzeW5jIF90ZXN0UnVuRG9uZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnF1YXJhbnRpbmUpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl90ZXN0UnVuRG9uZUluUXVhcmFudGluZU1vZGUoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW1pdFRlc3RSdW5Eb25lKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2VtaXRBY3Rpb25TdGFydCAoYXJncykge1xuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtYWN0aW9uLXN0YXJ0JywgYXJncyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2VtaXRBY3Rpb25Eb25lIChhcmdzKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1hY3Rpb24tZG9uZScsIGFyZ3MpO1xuICAgIH1cblxuICAgIGFzeW5jIF9lbWl0VGVzdFJ1bkRvbmUgKCkge1xuICAgICAgICAvLyBOT1RFOiB3ZSBzaG91bGQgcmVwb3J0IHRlc3QgcnVuIGNvbXBsZXRpb24gaW4gb3JkZXIgdGhleSB3ZXJlIGNvbXBsZXRlZCBpbiBicm93c2VyLlxuICAgICAgICAvLyBUbyBrZWVwIGEgc2VxdWVuY2UgYWZ0ZXIgZml4dHVyZSBob29rIGV4ZWN1dGlvbiB3ZSB1c2UgY29tcGxldGlvbiBxdWV1ZS5cbiAgICAgICAgYXdhaXQgdGhpcy5maXh0dXJlSG9va0NvbnRyb2xsZXIucnVuRml4dHVyZUFmdGVySG9va0lmTmVjZXNzYXJ5KHRoaXMudGVzdFJ1bik7XG5cbiAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtcnVuLWRvbmUnKTtcbiAgICB9XG5cbiAgICBhc3luYyBfZW1pdFRlc3RSdW5TdGFydCAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tc3RhcnQnKTtcbiAgICB9XG5cbiAgICBhc3luYyBfdGVzdFJ1bkJlZm9yZURvbmUgKCkge1xuICAgICAgICBsZXQgcmFpc2VFdmVudCA9ICF0aGlzLnF1YXJhbnRpbmU7XG5cbiAgICAgICAgaWYgKCFyYWlzZUV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBpc1N1Y2Nlc3NmdWxRdWFyYW50aW5lRmlyc3RBdHRlbXB0ID0gdGhpcy5faXNGaXJzdFF1YXJhbnRpbmVBdHRlbXB0KCkgJiYgIXRoaXMudGVzdFJ1bi5lcnJzLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGlzQXR0ZW1wdHNUaHJlc2hvbGRSZWFjaGVkICAgICAgICAgPSB0aGlzLnF1YXJhbnRpbmUuaXNUaHJlc2hvbGRSZWFjaGVkKHRoaXMudGVzdFJ1bi5lcnJzKTtcblxuICAgICAgICAgICAgcmFpc2VFdmVudCA9IGlzU3VjY2Vzc2Z1bFF1YXJhbnRpbmVGaXJzdEF0dGVtcHQgfHwgaXNBdHRlbXB0c1RocmVzaG9sZFJlYWNoZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmFpc2VFdmVudClcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tYmVmb3JlLWRvbmUnKTtcbiAgICB9XG5cbiAgICBfdGVzdFJ1bkRpc2Nvbm5lY3RlZCAoY29ubmVjdGlvbikge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3Rpb25Db3VudCsrO1xuXG4gICAgICAgIGNvbnN0IGRpc2Nvbm5lY3Rpb25UaHJlc2hvbGRFeGNlZWRlZWQgPSB0aGlzLmRpc2Nvbm5lY3Rpb25Db3VudCA+PSBESVNDT05ORUNUX1RIUkVTSE9MRDtcblxuICAgICAgICByZXR1cm4gY29ubmVjdGlvblxuICAgICAgICAgICAgLnByb2Nlc3NEaXNjb25uZWN0aW9uKGRpc2Nvbm5lY3Rpb25UaHJlc2hvbGRFeGNlZWRlZWQpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3RhcnRUZXN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXNzaWduVGVzdFJ1bkV2ZW50cyAodGVzdFJ1biwgY29ubmVjdGlvbikge1xuICAgICAgICB0ZXN0UnVuLm9uKCdhY3Rpb24tc3RhcnQnLCBhc3luYyBhcmdzID0+IHRoaXMuX2VtaXRBY3Rpb25TdGFydChPYmplY3QuYXNzaWduKGFyZ3MsIHsgdGVzdFJ1biB9KSkpO1xuICAgICAgICB0ZXN0UnVuLm9uKCdhY3Rpb24tZG9uZScsIGFzeW5jIGFyZ3MgPT4gdGhpcy5fZW1pdEFjdGlvbkRvbmUoT2JqZWN0LmFzc2lnbihhcmdzLCB7IHRlc3RSdW4gfSkpKTtcblxuICAgICAgICB0ZXN0UnVuLm9uY2UoJ3N0YXJ0JywgYXN5bmMgKCkgPT4gdGhpcy5fZW1pdFRlc3RSdW5TdGFydCgpKTtcbiAgICAgICAgdGVzdFJ1bi5vbmNlKCdyZWFkeScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5xdWFyYW50aW5lIHx8IHRoaXMuX2lzRmlyc3RRdWFyYW50aW5lQXR0ZW1wdCgpKVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tcmVhZHknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRlc3RSdW4ub25jZSgnYmVmb3JlLWRvbmUnLCAoKSA9PiB0aGlzLl90ZXN0UnVuQmVmb3JlRG9uZSgpKTtcbiAgICAgICAgdGVzdFJ1bi5vbmNlKCdkb25lJywgKCkgPT4gdGhpcy5fdGVzdFJ1bkRvbmUoKSk7XG4gICAgICAgIHRlc3RSdW4ub25jZSgnZGlzY29ubmVjdGVkJywgKCkgPT4gdGhpcy5fdGVzdFJ1bkRpc2Nvbm5lY3RlZChjb25uZWN0aW9uKSk7XG4gICAgfVxuXG4gICAgZ2V0IGJsb2NrZWQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maXh0dXJlSG9va0NvbnRyb2xsZXIuaXNUZXN0QmxvY2tlZCh0aGlzLnRlc3QpO1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0IChjb25uZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRlc3RSdW4gPSBhd2FpdCB0aGlzLl9jcmVhdGVUZXN0UnVuKGNvbm5lY3Rpb24pO1xuXG4gICAgICAgIGNvbnN0IGhvb2tPayA9IGF3YWl0IHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyLnJ1bkZpeHR1cmVCZWZvcmVIb29rSWZOZWNlc3NhcnkodGVzdFJ1bik7XG5cbiAgICAgICAgaWYgKHRoaXMudGVzdC5za2lwIHx8ICFob29rT2spIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tc3RhcnQnKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2VtaXRUZXN0UnVuRG9uZSgpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hc3NpZ25UZXN0UnVuRXZlbnRzKHRlc3RSdW4sIGNvbm5lY3Rpb24pO1xuXG4gICAgICAgIHRlc3RSdW4uc3RhcnQoKTtcblxuICAgICAgICByZXR1cm4gU2Vzc2lvbkNvbnRyb2xsZXIuZ2V0U2Vzc2lvblVybCh0ZXN0UnVuLCB0aGlzLnByb3h5KTtcbiAgICB9XG59XG4iXX0=