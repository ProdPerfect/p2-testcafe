"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const read_file_relative_1 = require("read-file-relative");
const promisify_event_1 = __importDefault(require("promisify-event"));
const mustache_1 = __importDefault(require("mustache"));
const async_event_emitter_1 = __importDefault(require("../utils/async-event-emitter"));
const debug_log_1 = __importDefault(require("./debug-log"));
const formattable_adapter_1 = __importDefault(require("../errors/test-run/formattable-adapter"));
const error_list_1 = __importDefault(require("../errors/error-list"));
const test_run_1 = require("../errors/test-run/");
const phase_1 = __importDefault(require("./phase"));
const client_messages_1 = __importDefault(require("./client-messages"));
const type_1 = __importDefault(require("./commands/type"));
const delay_1 = __importDefault(require("../utils/delay"));
const marker_symbol_1 = __importDefault(require("./marker-symbol"));
const test_run_tracker_1 = __importDefault(require("../api/test-run-tracker"));
const phase_2 = __importDefault(require("../role/phase"));
const plugin_host_1 = __importDefault(require("../reporter/plugin-host"));
const browser_console_messages_1 = __importDefault(require("./browser-console-messages"));
const unstable_network_mode_1 = require("../browser/connection/unstable-network-mode");
const warning_log_1 = __importDefault(require("../notifications/warning-log"));
const warning_message_1 = __importDefault(require("../notifications/warning-message"));
const testcafe_hammerhead_1 = require("testcafe-hammerhead");
const INJECTABLES = __importStar(require("../assets/injectables"));
const utils_1 = require("../custom-client-scripts/utils");
const get_url_1 = __importDefault(require("../custom-client-scripts/get-url"));
const string_1 = require("../utils/string");
const utils_2 = require("./commands/utils");
const types_1 = require("../errors/types");
const process_test_fn_error_1 = __importDefault(require("../errors/process-test-fn-error"));
const lazyRequire = require('import-lazy')(require);
const SessionController = lazyRequire('./session-controller');
const ClientFunctionBuilder = lazyRequire('../client-functions/client-function-builder');
const BrowserManipulationQueue = lazyRequire('./browser-manipulation-queue');
const TestRunBookmark = lazyRequire('./bookmark');
const AssertionExecutor = lazyRequire('../assertions/executor');
const actionCommands = lazyRequire('./commands/actions');
const browserManipulationCommands = lazyRequire('./commands/browser-manipulation');
const serviceCommands = lazyRequire('./commands/service');
const observationCommands = lazyRequire('./commands/observation');
const { executeJsExpression, executeAsyncJsExpression } = lazyRequire('./execute-js-expression');
const TEST_RUN_TEMPLATE = read_file_relative_1.readSync('../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = read_file_relative_1.readSync('../client/test-run/iframe.js.mustache');
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY = 3000;
const CHILD_WINDOW_READY_TIMEOUT = 30 * 1000;
const ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';
class TestRun extends async_event_emitter_1.default {
    constructor(test, browserConnection, screenshotCapturer, globalWarningLog, opts) {
        super();
        this[marker_symbol_1.default] = true;
        this.warningLog = new warning_log_1.default(globalWarningLog);
        this.opts = opts;
        this.test = test;
        this.browserConnection = browserConnection;
        this.phase = phase_1.default.initial;
        this.driverTaskQueue = [];
        this.testDoneCommandQueued = false;
        this.activeDialogHandler = null;
        this.activeIframeSelector = null;
        this.speed = this.opts.speed;
        this.pageLoadTimeout = this.opts.pageLoadTimeout;
        this.disablePageReloads = test.disablePageReloads || opts.disablePageReloads && test.disablePageReloads !==
            false;
        this.disablePageCaching = test.disablePageCaching || opts.disablePageCaching;
        this.allowMultipleWindows = opts.allowMultipleWindows;
        this.session = SessionController.getSession(this);
        this.consoleMessages = new browser_console_messages_1.default();
        this.pendingRequest = null;
        this.pendingPageError = null;
        this.controller = null;
        this.ctx = Object.create(null);
        this.fixtureCtx = null;
        this.currentRoleId = null;
        this.usedRoleStates = Object.create(null);
        this.errs = [];
        this.lastDriverStatusId = null;
        this.lastDriverStatusResponse = null;
        this.fileDownloadingHandled = false;
        this.resolveWaitForFileDownloadingPromise = null;
        this.addingDriverTasksCount = 0;
        this.debugging = this.opts.debugMode;
        this.debugOnFail = this.opts.debugOnFail;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new plugin_host_1.default({ noColors: false });
        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, this.warningLog);
        this.debugLog = new debug_log_1.default(this.browserConnection.userAgent);
        this.quarantine = null;
        this.debugLogger = this.opts.debugLogger;
        this._addInjectables();
        this._initRequestHooks();
    }
    _addClientScriptContentWarningsIfNecessary() {
        const { empty, duplicatedContent } = utils_1.findProblematicScripts(this.test.clientScripts);
        if (empty.length)
            this.warningLog.addWarning(warning_message_1.default.clientScriptsWithEmptyContent);
        if (duplicatedContent.length) {
            const suffix = string_1.getPluralSuffix(duplicatedContent);
            const duplicatedContentClientScriptsStr = string_1.getConcatenatedValuesString(duplicatedContent, ',\n ');
            this.warningLog.addWarning(warning_message_1.default.clientScriptsWithDuplicatedContent, suffix, duplicatedContentClientScriptsStr);
        }
    }
    _addInjectables() {
        this._addClientScriptContentWarningsIfNecessary();
        this.injectable.scripts.push(...INJECTABLES.SCRIPTS);
        this.injectable.userScripts.push(...this.test.clientScripts.map(script => {
            return {
                url: get_url_1.default(script),
                page: script.page
            };
        }));
        this.injectable.styles.push(INJECTABLES.TESTCAFE_UI_STYLES);
    }
    get id() {
        return this.session.id;
    }
    get injectable() {
        return this.session.injectable;
    }
    addQuarantineInfo(quarantine) {
        this.quarantine = quarantine;
    }
    addRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) !== -1)
            return;
        this.requestHooks.push(hook);
        this._initRequestHook(hook);
    }
    removeRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) === -1)
            return;
        lodash_1.pull(this.requestHooks, hook);
        this._disposeRequestHook(hook);
    }
    _initRequestHook(hook) {
        hook.warningLog = this.warningLog;
        hook._instantiateRequestFilterRules();
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.addRequestEventListeners(rule, {
                onRequest: hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse: hook.onResponse.bind(hook)
            }, err => this._onRequestHookMethodError(err, hook));
        });
    }
    _onRequestHookMethodError(event, hook) {
        let err = event.error;
        const isRequestHookNotImplementedMethodError = err instanceof test_run_1.RequestHookNotImplementedMethodError;
        if (!isRequestHookNotImplementedMethodError) {
            const hookClassName = hook.constructor.name;
            err = new test_run_1.RequestHookUnhandledError(err, hookClassName, event.methodName);
        }
        this.addError(err);
    }
    _disposeRequestHook(hook) {
        hook.warningLog = null;
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.removeRequestEventListeners(rule);
        });
    }
    _initRequestHooks() {
        this.requestHooks = Array.from(this.test.requestHooks);
        this.requestHooks.forEach(hook => this._initRequestHook(hook));
    }
    // Hammerhead payload
    _getPayloadScript() {
        this.fileDownloadingHandled = false;
        this.resolveWaitForFileDownloadingPromise = null;
        return mustache_1.default.render(TEST_RUN_TEMPLATE, {
            testRunId: JSON.stringify(this.session.id),
            browserId: JSON.stringify(this.browserConnection.id),
            browserHeartbeatRelativeUrl: JSON.stringify(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl: JSON.stringify(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl: JSON.stringify(this.browserConnection.statusDoneRelativeUrl),
            browserActiveWindowIdUrl: JSON.stringify(this.browserConnection.activeWindowIdUrl),
            userAgent: JSON.stringify(this.browserConnection.userAgent),
            testName: JSON.stringify(this.test.name),
            fixtureName: JSON.stringify(this.test.fixture.name),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            childWindowReadyTimeout: CHILD_WINDOW_READY_TIMEOUT,
            skipJsErrors: this.opts.skipJsErrors,
            retryTestPages: this.opts.retryTestPages,
            speed: this.speed,
            dialogHandler: JSON.stringify(this.activeDialogHandler)
        });
    }
    _getIframePayloadScript() {
        return mustache_1.default.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId: JSON.stringify(this.session.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            retryTestPages: !!this.opts.retryTestPages,
            speed: this.speed,
            dialogHandler: JSON.stringify(this.activeDialogHandler)
        });
    }
    // Hammerhead handlers
    getAuthCredentials() {
        return this.test.authCredentials;
    }
    handleFileDownload() {
        if (this.resolveWaitForFileDownloadingPromise) {
            this.resolveWaitForFileDownloadingPromise(true);
            this.resolveWaitForFileDownloadingPromise = null;
        }
        else
            this.fileDownloadingHandled = true;
    }
    handlePageError(ctx, err) {
        if (ctx.req.headers[unstable_network_mode_1.UNSTABLE_NETWORK_MODE_HEADER]) {
            ctx.closeWithError(500, err.toString());
            return;
        }
        this.pendingPageError = new test_run_1.PageLoadError(err, ctx.reqOpts.url);
        ctx.redirect(ctx.toProxyUrl(testcafe_hammerhead_1.SPECIAL_ERROR_PAGE));
    }
    // Test function execution
    async _executeTestFn(phase, fn) {
        this.phase = phase;
        try {
            await fn(this);
        }
        catch (err) {
            await this._makeScreenshotOnFail();
            this.addError(err);
            return false;
        }
        finally {
            this.errScreenshotPath = null;
        }
        return !this._addPendingPageErrorIfAny();
    }
    async _runBeforeHook() {
        if (this.test.beforeFn)
            return await this._executeTestFn(phase_1.default.inTestBeforeHook, this.test.beforeFn);
        if (this.test.fixture.beforeEachFn)
            return await this._executeTestFn(phase_1.default.inFixtureBeforeEachHook, this.test.fixture.beforeEachFn);
        return true;
    }
    async _runAfterHook() {
        if (this.test.afterFn)
            return await this._executeTestFn(phase_1.default.inTestAfterHook, this.test.afterFn);
        if (this.test.fixture.afterEachFn)
            return await this._executeTestFn(phase_1.default.inFixtureAfterEachHook, this.test.fixture.afterEachFn);
        return true;
    }
    async start() {
        test_run_tracker_1.default.activeTestRuns[this.session.id] = this;
        await this.emit('start');
        const onDisconnected = err => this._disconnect(err);
        this.browserConnection.once('disconnected', onDisconnected);
        await this.once('connected');
        await this.emit('ready');
        if (await this._runBeforeHook()) {
            await this._executeTestFn(phase_1.default.inTest, this.test.fn);
            await this._runAfterHook();
        }
        if (this.disconnected)
            return;
        this.browserConnection.removeListener('disconnected', onDisconnected);
        if (this.errs.length && this.debugOnFail)
            await this._enqueueSetBreakpointCommand(null, this.debugReporterPluginHost.formatError(this.errs[0]));
        await this.emit('before-done');
        await this.executeCommand(new serviceCommands.TestDoneCommand());
        this._addPendingPageErrorIfAny();
        this.session.clearRequestEventListeners();
        this.normalizeRequestHookErrors();
        delete test_run_tracker_1.default.activeTestRuns[this.session.id];
        await this.emit('done');
    }
    // Errors
    _addPendingPageErrorIfAny() {
        if (this.pendingPageError) {
            this.addError(this.pendingPageError);
            this.pendingPageError = null;
            return true;
        }
        return false;
    }
    _createErrorAdapter(err) {
        return new formattable_adapter_1.default(err, {
            userAgent: this.browserConnection.userAgent,
            screenshotPath: this.errScreenshotPath || '',
            testRunId: this.id,
            testRunPhase: this.phase
        });
    }
    addError(err) {
        const errList = err instanceof error_list_1.default ? err.items : [err];
        errList.forEach(item => {
            const adapter = this._createErrorAdapter(item);
            this.errs.push(adapter);
        });
    }
    normalizeRequestHookErrors() {
        const requestHookErrors = lodash_1.remove(this.errs, e => e.code === types_1.TEST_RUN_ERRORS.requestHookNotImplementedError ||
            e.code === types_1.TEST_RUN_ERRORS.requestHookUnhandledError);
        if (!requestHookErrors.length)
            return;
        const uniqRequestHookErrors = lodash_1.chain(requestHookErrors)
            .uniqBy(e => e.hookClassName + e.methodName)
            .sortBy(['hookClassName', 'methodName'])
            .value();
        this.errs = this.errs.concat(uniqRequestHookErrors);
    }
    // Task queue
    _enqueueCommand(command, callsite) {
        if (this.pendingRequest)
            this._resolvePendingRequest(command);
        return new Promise(async (resolve, reject) => {
            this.addingDriverTasksCount--;
            this.driverTaskQueue.push({ command, resolve, reject, callsite });
            if (!this.addingDriverTasksCount)
                await this.emit(ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT, this.driverTaskQueue.length);
        });
    }
    get driverTaskQueueLength() {
        return this.addingDriverTasksCount ? promisify_event_1.default(this, ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT) : Promise.resolve(this.driverTaskQueue.length);
    }
    async _enqueueBrowserConsoleMessagesCommand(command, callsite) {
        await this._enqueueCommand(command, callsite);
        const consoleMessageCopy = this.consoleMessages.getCopy();
        return consoleMessageCopy[this.browserConnection.activeWindowId];
    }
    async _enqueueSetBreakpointCommand(callsite, error) {
        if (this.browserConnection.isHeadlessBrowser()) {
            this.warningLog.addWarning(warning_message_1.default.debugInHeadlessError);
            return;
        }
        if (this.debugLogger)
            this.debugLogger.showBreakpoint(this.session.id, this.browserConnection.userAgent, callsite, error);
        this.debugging = await this.executeCommand(new serviceCommands.SetBreakpointCommand(!!error), callsite);
    }
    _removeAllNonServiceTasks() {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => utils_2.isServiceCommand(driverTask.command));
        this.browserManipulationQueue.removeAllNonServiceManipulations();
    }
    // Current driver task
    get currentDriverTask() {
        return this.driverTaskQueue[0];
    }
    _resolveCurrentDriverTask(result) {
        this.currentDriverTask.resolve(result);
        this.driverTaskQueue.shift();
        if (this.testDoneCommandQueued)
            this._removeAllNonServiceTasks();
    }
    _rejectCurrentDriverTask(err) {
        err.callsite = err.callsite || this.currentDriverTask.callsite;
        this.currentDriverTask.reject(err);
        this._removeAllNonServiceTasks();
    }
    // Pending request
    _clearPendingRequest() {
        if (this.pendingRequest) {
            clearTimeout(this.pendingRequest.responseTimeout);
            this.pendingRequest = null;
        }
    }
    _resolvePendingRequest(command) {
        this.lastDriverStatusResponse = command;
        this.pendingRequest.resolve(command);
        this._clearPendingRequest();
    }
    // Handle driver request
    _shouldResolveCurrentDriverTask(driverStatus) {
        const currentCommand = this.currentDriverTask.command;
        const isExecutingObservationCommand = currentCommand instanceof observationCommands.ExecuteSelectorCommand ||
            currentCommand instanceof observationCommands.ExecuteClientFunctionCommand;
        const isDebugActive = currentCommand instanceof serviceCommands.SetBreakpointCommand;
        const shouldExecuteCurrentCommand = driverStatus.isFirstRequestAfterWindowSwitching && (isExecutingObservationCommand || isDebugActive);
        return !shouldExecuteCurrentCommand;
    }
    _fulfillCurrentDriverTask(driverStatus) {
        if (!this.currentDriverTask)
            return;
        if (driverStatus.executionError)
            this._rejectCurrentDriverTask(driverStatus.executionError);
        else if (this._shouldResolveCurrentDriverTask(driverStatus))
            this._resolveCurrentDriverTask(driverStatus.result);
    }
    _handlePageErrorStatus(pageError) {
        if (this.currentDriverTask && utils_2.isCommandRejectableByPageError(this.currentDriverTask.command)) {
            this._rejectCurrentDriverTask(pageError);
            this.pendingPageError = null;
            return true;
        }
        this.pendingPageError = this.pendingPageError || pageError;
        return false;
    }
    _handleDriverRequest(driverStatus) {
        const isTestDone = this.currentDriverTask && this.currentDriverTask.command.type ===
            type_1.default.testDone;
        const pageError = this.pendingPageError || driverStatus.pageError;
        const currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);
        if (this.disconnected)
            return new Promise((_, reject) => reject());
        this.consoleMessages.concat(driverStatus.consoleMessages);
        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (isTestDone) {
                this._resolveCurrentDriverTask();
                return TEST_DONE_CONFIRMATION_RESPONSE;
            }
            this._fulfillCurrentDriverTask(driverStatus);
            if (driverStatus.isPendingWindowSwitching)
                return null;
        }
        return this._getCurrentDriverTaskCommand();
    }
    _getCurrentDriverTaskCommand() {
        if (!this.currentDriverTask)
            return null;
        const command = this.currentDriverTask.command;
        if (command.type === type_1.default.navigateTo && command.stateSnapshot)
            this.session.useStateSnapshot(JSON.parse(command.stateSnapshot));
        return command;
    }
    // Execute command
    _executeJsExpression(command) {
        const resultVariableName = command.resultVariableName;
        let expression = command.expression;
        if (resultVariableName)
            expression = `${resultVariableName} = ${expression}, ${resultVariableName}`;
        return executeJsExpression(expression, this, { skipVisibilityCheck: false });
    }
    async _executeAssertion(command, callsite) {
        const assertionTimeout = command.options.timeout ===
            void 0 ? this.opts.assertionTimeout : command.options.timeout;
        const executor = new AssertionExecutor(command, assertionTimeout, callsite);
        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));
        const executeFn = this.decoratePreventEmitActionEvents(() => executor.run(), { prevent: true });
        return await executeFn();
    }
    _adjustConfigurationWithCommand(command) {
        if (command.type === type_1.default.testDone) {
            this.testDoneCommandQueued = true;
            if (this.debugLogger)
                this.debugLogger.hideBreakpoint(this.session.id);
        }
        else if (command.type === type_1.default.setNativeDialogHandler)
            this.activeDialogHandler = command.dialogHandler;
        else if (command.type === type_1.default.switchToIframe)
            this.activeIframeSelector = command.selector;
        else if (command.type === type_1.default.switchToMainWindow)
            this.activeIframeSelector = null;
        else if (command.type === type_1.default.setTestSpeed)
            this.speed = command.speed;
        else if (command.type === type_1.default.setPageLoadTimeout)
            this.pageLoadTimeout = command.duration;
        else if (command.type === type_1.default.debug)
            this.debugging = true;
    }
    async _adjustScreenshotCommand(command) {
        const browserId = this.browserConnection.id;
        const { hasChromelessScreenshots } = await this.browserConnection.provider.hasCustomActionForBrowser(browserId);
        if (!hasChromelessScreenshots)
            command.generateScreenshotMark();
    }
    async _setBreakpointIfNecessary(command, callsite) {
        if (!this.disableDebugBreakpoints && this.debugging && utils_2.canSetDebuggerBreakpointBeforeCommand(command))
            await this._enqueueSetBreakpointCommand(callsite);
    }
    async executeAction(apiActionName, command, callsite) {
        const actionArgs = { apiActionName, command };
        let errorAdapter = null;
        let error = null;
        let result = null;
        await this.emitActionEvent('action-start', actionArgs);
        const start = new Date();
        try {
            result = await this.executeCommand(command, callsite);
        }
        catch (err) {
            error = err;
        }
        const duration = new Date() - start;
        if (error) {
            // NOTE: check if error is TestCafeErrorList is specific for the `useRole` action
            // if error is TestCafeErrorList we do not need to create an adapter,
            // since error is already was processed in role initializer
            if (!(error instanceof error_list_1.default)) {
                await this._makeScreenshotOnFail();
                errorAdapter = this._createErrorAdapter(process_test_fn_error_1.default(error));
            }
        }
        Object.assign(actionArgs, {
            result,
            duration,
            err: errorAdapter
        });
        await this.emitActionEvent('action-done', actionArgs);
        if (error)
            throw error;
        return result;
    }
    async executeCommand(command, callsite) {
        this.debugLog.command(command);
        if (this.pendingPageError && utils_2.isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite);
        if (utils_2.isExecutableOnClientCommand(command))
            this.addingDriverTasksCount++;
        this._adjustConfigurationWithCommand(command);
        await this._setBreakpointIfNecessary(command, callsite);
        if (utils_2.isScreenshotCommand(command)) {
            if (this.opts.disableScreenshots) {
                this.warningLog.addWarning(warning_message_1.default.screenshotsDisabled);
                return null;
            }
            await this._adjustScreenshotCommand(command);
        }
        if (utils_2.isBrowserManipulationCommand(command)) {
            this.browserManipulationQueue.push(command);
            if (utils_2.isResizeWindowCommand(command) && this.opts.videoPath)
                this.warningLog.addWarning(warning_message_1.default.videoBrowserResizing, this.test.name);
        }
        if (command.type === type_1.default.wait)
            return delay_1.default(command.timeout);
        if (command.type === type_1.default.setPageLoadTimeout)
            return null;
        if (command.type === type_1.default.debug)
            return await this._enqueueSetBreakpointCommand(callsite);
        if (command.type === type_1.default.useRole) {
            let fn = () => this._useRole(command.role, callsite);
            fn = this.decoratePreventEmitActionEvents(fn, { prevent: true });
            fn = this.decorateDisableDebugBreakpoints(fn, { disable: true });
            return await fn();
        }
        if (command.type === type_1.default.assertion)
            return this._executeAssertion(command, callsite);
        if (command.type === type_1.default.executeExpression)
            return await this._executeJsExpression(command, callsite);
        if (command.type === type_1.default.executeAsyncExpression)
            return await executeAsyncJsExpression(command.expression, this, callsite);
        if (command.type === type_1.default.getBrowserConsoleMessages)
            return await this._enqueueBrowserConsoleMessagesCommand(command, callsite);
        return this._enqueueCommand(command, callsite);
    }
    _rejectCommandWithPageError(callsite) {
        const err = this.pendingPageError;
        err.callsite = callsite;
        this.pendingPageError = null;
        return Promise.reject(err);
    }
    async _makeScreenshotOnFail() {
        const { screenshots } = this.opts;
        if (!this.errScreenshotPath && screenshots && screenshots.takeOnFails)
            this.errScreenshotPath = await this.executeCommand(new browserManipulationCommands.TakeScreenshotOnFailCommand());
    }
    _decorateWithFlag(fn, flagName, value) {
        return async () => {
            this[flagName] = value;
            try {
                return await fn();
            }
            catch (err) {
                throw err;
            }
            finally {
                this[flagName] = !value;
            }
        };
    }
    decoratePreventEmitActionEvents(fn, { prevent }) {
        return this._decorateWithFlag(fn, 'preventEmitActionEvents', prevent);
    }
    decorateDisableDebugBreakpoints(fn, { disable }) {
        return this._decorateWithFlag(fn, 'disableDebugBreakpoints', disable);
    }
    // Role management
    async getStateSnapshot() {
        const state = this.session.getStateSnapshot();
        state.storages = await this.executeCommand(new serviceCommands.BackupStoragesCommand());
        return state;
    }
    async switchToCleanRun(url) {
        this.ctx = Object.create(null);
        this.fixtureCtx = Object.create(null);
        this.consoleMessages = new browser_console_messages_1.default();
        this.session.useStateSnapshot(testcafe_hammerhead_1.StateSnapshot.empty());
        if (this.speed !== this.opts.speed) {
            const setSpeedCommand = new actionCommands.SetTestSpeedCommand({ speed: this.opts.speed });
            await this.executeCommand(setSpeedCommand);
        }
        if (this.pageLoadTimeout !== this.opts.pageLoadTimeout) {
            const setPageLoadTimeoutCommand = new actionCommands.SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });
            await this.executeCommand(setPageLoadTimeoutCommand);
        }
        await this.navigateToUrl(url, true);
        if (this.activeDialogHandler) {
            const removeDialogHandlerCommand = new actionCommands.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });
            await this.executeCommand(removeDialogHandlerCommand);
        }
    }
    async navigateToUrl(url, forceReload, stateSnapshot) {
        const navigateCommand = new actionCommands.NavigateToCommand({ url, forceReload, stateSnapshot });
        await this.executeCommand(navigateCommand);
    }
    async _getStateSnapshotFromRole(role) {
        const prevPhase = this.phase;
        this.phase = phase_1.default.inRoleInitializer;
        if (role.phase === phase_2.default.uninitialized)
            await role.initialize(this);
        else if (role.phase === phase_2.default.pendingInitialization)
            await promisify_event_1.default(role, 'initialized');
        if (role.initErr)
            throw role.initErr;
        this.phase = prevPhase;
        return role.stateSnapshot;
    }
    async _useRole(role, callsite) {
        if (this.phase === phase_1.default.inRoleInitializer)
            throw new test_run_1.RoleSwitchInRoleInitializerError(callsite);
        const bookmark = new TestRunBookmark(this, role);
        await bookmark.init();
        if (this.currentRoleId)
            this.usedRoleStates[this.currentRoleId] = await this.getStateSnapshot();
        const stateSnapshot = this.usedRoleStates[role.id] || await this._getStateSnapshotFromRole(role);
        this.session.useStateSnapshot(stateSnapshot);
        this.currentRoleId = role.id;
        await bookmark.restore(callsite, stateSnapshot);
    }
    // Get current URL
    async getCurrentUrl() {
        const builder = new ClientFunctionBuilder(() => {
            /* eslint-disable no-undef */
            return window.location.href;
            /* eslint-enable no-undef */
        }, { boundTestRun: this });
        const getLocation = builder.getFunction();
        return await getLocation();
    }
    _disconnect(err) {
        this.disconnected = true;
        if (this.currentDriverTask)
            this._rejectCurrentDriverTask(err);
        this.emit('disconnected', err);
        delete test_run_tracker_1.default.activeTestRuns[this.session.id];
    }
    async emitActionEvent(eventName, args) {
        if (!this.preventEmitActionEvents)
            await this.emit(eventName, args);
    }
}
exports.default = TestRun;
// Service message handlers
const ServiceMessages = TestRun.prototype;
// NOTE: this function is time-critical and must return ASAP to avoid client disconnection
ServiceMessages[client_messages_1.default.ready] = function (msg) {
    this.debugLog.driverMessage(msg);
    this.emit('connected');
    this._clearPendingRequest();
    // NOTE: the driver sends the status for the second time if it didn't get a response at the
    // first try. This is possible when the page was unloaded after the driver sent the status.
    if (msg.status.id === this.lastDriverStatusId)
        return this.lastDriverStatusResponse;
    this.lastDriverStatusId = msg.status.id;
    this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);
    if (this.lastDriverStatusResponse || msg.status.isPendingWindowSwitching)
        return this.lastDriverStatusResponse;
    // NOTE: we send an empty response after the MAX_RESPONSE_DELAY timeout is exceeded to keep connection
    // with the client and prevent the response timeout exception on the client side
    const responseTimeout = setTimeout(() => this._resolvePendingRequest(null), MAX_RESPONSE_DELAY);
    return new Promise((resolve, reject) => {
        this.pendingRequest = { resolve, reject, responseTimeout };
    });
};
ServiceMessages[client_messages_1.default.readyForBrowserManipulation] = async function (msg) {
    this.debugLog.driverMessage(msg);
    let result = null;
    let error = null;
    try {
        result = await this.browserManipulationQueue.executePendingManipulation(msg);
    }
    catch (err) {
        error = err;
    }
    return { result, error };
};
ServiceMessages[client_messages_1.default.waitForFileDownload] = function (msg) {
    this.debugLog.driverMessage(msg);
    return new Promise(resolve => {
        if (this.fileDownloadingHandled) {
            this.fileDownloadingHandled = false;
            resolve(true);
        }
        else
            this.resolveWaitForFileDownloadingPromise = resolve;
    });
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC1ydW4vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTZDO0FBQzdDLDJEQUFzRDtBQUN0RCxzRUFBNkM7QUFDN0Msd0RBQWdDO0FBQ2hDLHVGQUE2RDtBQUM3RCw0REFBMEM7QUFDMUMsaUdBQW9GO0FBQ3BGLHNFQUFxRDtBQUNyRCxrREFLNkI7QUFDN0Isb0RBQTRCO0FBQzVCLHdFQUFnRDtBQUNoRCwyREFBMkM7QUFDM0MsMkRBQW1DO0FBQ25DLG9FQUE0QztBQUM1QywrRUFBcUQ7QUFDckQsMERBQXVDO0FBQ3ZDLDBFQUF5RDtBQUN6RCwwRkFBZ0U7QUFDaEUsdUZBQTJGO0FBQzNGLCtFQUFzRDtBQUN0RCx1RkFBK0Q7QUFDL0QsNkRBQXdFO0FBQ3hFLG1FQUFxRDtBQUNyRCwwREFBd0U7QUFDeEUsK0VBQXdFO0FBQ3hFLDRDQUErRTtBQUUvRSw0Q0FRMEI7QUFFMUIsMkNBQWtEO0FBQ2xELDRGQUFpRTtBQUVqRSxNQUFNLFdBQVcsR0FBbUIsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLE1BQU0saUJBQWlCLEdBQWEsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDeEUsTUFBTSxxQkFBcUIsR0FBUyxXQUFXLENBQUMsNkNBQTZDLENBQUMsQ0FBQztBQUMvRixNQUFNLHdCQUF3QixHQUFNLFdBQVcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sZUFBZSxHQUFlLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM5RCxNQUFNLGlCQUFpQixHQUFhLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzFFLE1BQU0sY0FBYyxHQUFnQixXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN0RSxNQUFNLDJCQUEyQixHQUFHLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FB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LENBQUMseUJBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLFVBQVUsR0FBRztJQUNoRSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVqQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzdCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7WUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCOztZQUVHLElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxPQUFPLENBQUM7SUFDNUQsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwdWxsLCByZW1vdmUsIGNoYWluIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHJlYWRTeW5jIGFzIHJlYWQgfSBmcm9tICdyZWFkLWZpbGUtcmVsYXRpdmUnO1xuaW1wb3J0IHByb21pc2lmeUV2ZW50IGZyb20gJ3Byb21pc2lmeS1ldmVudCc7XG5pbXBvcnQgTXVzdGFjaGUgZnJvbSAnbXVzdGFjaGUnO1xuaW1wb3J0IEFzeW5jRXZlbnRFbWl0dGVyIGZyb20gJy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuaW1wb3J0IFRlc3RSdW5EZWJ1Z0xvZyBmcm9tICcuL2RlYnVnLWxvZyc7XG5pbXBvcnQgVGVzdFJ1bkVycm9yRm9ybWF0dGFibGVBZGFwdGVyIGZyb20gJy4uL2Vycm9ycy90ZXN0LXJ1bi9mb3JtYXR0YWJsZS1hZGFwdGVyJztcbmltcG9ydCBUZXN0Q2FmZUVycm9yTGlzdCBmcm9tICcuLi9lcnJvcnMvZXJyb3ItbGlzdCc7XG5pbXBvcnQge1xuICAgIFJlcXVlc3RIb29rVW5oYW5kbGVkRXJyb3IsXG4gICAgUGFnZUxvYWRFcnJvcixcbiAgICBSZXF1ZXN0SG9va05vdEltcGxlbWVudGVkTWV0aG9kRXJyb3IsXG4gICAgUm9sZVN3aXRjaEluUm9sZUluaXRpYWxpemVyRXJyb3Jcbn0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuLyc7XG5pbXBvcnQgUEhBU0UgZnJvbSAnLi9waGFzZSc7XG5pbXBvcnQgQ0xJRU5UX01FU1NBR0VTIGZyb20gJy4vY2xpZW50LW1lc3NhZ2VzJztcbmltcG9ydCBDT01NQU5EX1RZUEUgZnJvbSAnLi9jb21tYW5kcy90eXBlJztcbmltcG9ydCBkZWxheSBmcm9tICcuLi91dGlscy9kZWxheSc7XG5pbXBvcnQgdGVzdFJ1bk1hcmtlciBmcm9tICcuL21hcmtlci1zeW1ib2wnO1xuaW1wb3J0IHRlc3RSdW5UcmFja2VyIGZyb20gJy4uL2FwaS90ZXN0LXJ1bi10cmFja2VyJztcbmltcG9ydCBST0xFX1BIQVNFIGZyb20gJy4uL3JvbGUvcGhhc2UnO1xuaW1wb3J0IFJlcG9ydGVyUGx1Z2luSG9zdCBmcm9tICcuLi9yZXBvcnRlci9wbHVnaW4taG9zdCc7XG5pbXBvcnQgQnJvd3NlckNvbnNvbGVNZXNzYWdlcyBmcm9tICcuL2Jyb3dzZXItY29uc29sZS1tZXNzYWdlcyc7XG5pbXBvcnQgeyBVTlNUQUJMRV9ORVRXT1JLX01PREVfSEVBREVSIH0gZnJvbSAnLi4vYnJvd3Nlci9jb25uZWN0aW9uL3Vuc3RhYmxlLW5ldHdvcmstbW9kZSc7XG5pbXBvcnQgV2FybmluZ0xvZyBmcm9tICcuLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbG9nJztcbmltcG9ydCBXQVJOSU5HX01FU1NBR0UgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IHsgU3RhdGVTbmFwc2hvdCwgU1BFQ0lBTF9FUlJPUl9QQUdFIH0gZnJvbSAndGVzdGNhZmUtaGFtbWVyaGVhZCc7XG5pbXBvcnQgKiBhcyBJTkpFQ1RBQkxFUyBmcm9tICcuLi9hc3NldHMvaW5qZWN0YWJsZXMnO1xuaW1wb3J0IHsgZmluZFByb2JsZW1hdGljU2NyaXB0cyB9IGZyb20gJy4uL2N1c3RvbS1jbGllbnQtc2NyaXB0cy91dGlscyc7XG5pbXBvcnQgZ2V0Q3VzdG9tQ2xpZW50U2NyaXB0VXJsIGZyb20gJy4uL2N1c3RvbS1jbGllbnQtc2NyaXB0cy9nZXQtdXJsJztcbmltcG9ydCB7IGdldFBsdXJhbFN1ZmZpeCwgZ2V0Q29uY2F0ZW5hdGVkVmFsdWVzU3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMvc3RyaW5nJztcblxuaW1wb3J0IHtcbiAgICBpc0NvbW1hbmRSZWplY3RhYmxlQnlQYWdlRXJyb3IsXG4gICAgaXNCcm93c2VyTWFuaXB1bGF0aW9uQ29tbWFuZCxcbiAgICBpc1NjcmVlbnNob3RDb21tYW5kLFxuICAgIGlzU2VydmljZUNvbW1hbmQsXG4gICAgY2FuU2V0RGVidWdnZXJCcmVha3BvaW50QmVmb3JlQ29tbWFuZCxcbiAgICBpc0V4ZWN1dGFibGVPbkNsaWVudENvbW1hbmQsXG4gICAgaXNSZXNpemVXaW5kb3dDb21tYW5kXG59IGZyb20gJy4vY29tbWFuZHMvdXRpbHMnO1xuXG5pbXBvcnQgeyBURVNUX1JVTl9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuaW1wb3J0IHByb2Nlc3NUZXN0Rm5FcnJvciBmcm9tICcuLi9lcnJvcnMvcHJvY2Vzcy10ZXN0LWZuLWVycm9yJztcblxuY29uc3QgbGF6eVJlcXVpcmUgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IFNlc3Npb25Db250cm9sbGVyICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL3Nlc3Npb24tY29udHJvbGxlcicpO1xuY29uc3QgQ2xpZW50RnVuY3Rpb25CdWlsZGVyICAgICAgID0gbGF6eVJlcXVpcmUoJy4uL2NsaWVudC1mdW5jdGlvbnMvY2xpZW50LWZ1bmN0aW9uLWJ1aWxkZXInKTtcbmNvbnN0IEJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZSAgICA9IGxhenlSZXF1aXJlKCcuL2Jyb3dzZXItbWFuaXB1bGF0aW9uLXF1ZXVlJyk7XG5jb25zdCBUZXN0UnVuQm9va21hcmsgICAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9ib29rbWFyaycpO1xuY29uc3QgQXNzZXJ0aW9uRXhlY3V0b3IgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJy4uL2Fzc2VydGlvbnMvZXhlY3V0b3InKTtcbmNvbnN0IGFjdGlvbkNvbW1hbmRzICAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2NvbW1hbmRzL2FjdGlvbnMnKTtcbmNvbnN0IGJyb3dzZXJNYW5pcHVsYXRpb25Db21tYW5kcyA9IGxhenlSZXF1aXJlKCcuL2NvbW1hbmRzL2Jyb3dzZXItbWFuaXB1bGF0aW9uJyk7XG5jb25zdCBzZXJ2aWNlQ29tbWFuZHMgICAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9jb21tYW5kcy9zZXJ2aWNlJyk7XG5jb25zdCBvYnNlcnZhdGlvbkNvbW1hbmRzICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9jb21tYW5kcy9vYnNlcnZhdGlvbicpO1xuXG5jb25zdCB7IGV4ZWN1dGVKc0V4cHJlc3Npb24sIGV4ZWN1dGVBc3luY0pzRXhwcmVzc2lvbiB9ID0gbGF6eVJlcXVpcmUoJy4vZXhlY3V0ZS1qcy1leHByZXNzaW9uJyk7XG5cbmNvbnN0IFRFU1RfUlVOX1RFTVBMQVRFICAgICAgICAgICAgICAgPSByZWFkKCcuLi9jbGllbnQvdGVzdC1ydW4vaW5kZXguanMubXVzdGFjaGUnKTtcbmNvbnN0IElGUkFNRV9URVNUX1JVTl9URU1QTEFURSAgICAgICAgPSByZWFkKCcuLi9jbGllbnQvdGVzdC1ydW4vaWZyYW1lLmpzLm11c3RhY2hlJyk7XG5jb25zdCBURVNUX0RPTkVfQ09ORklSTUFUSU9OX1JFU1BPTlNFID0gJ3Rlc3QtZG9uZS1jb25maXJtYXRpb24nO1xuY29uc3QgTUFYX1JFU1BPTlNFX0RFTEFZICAgICAgICAgICAgICA9IDMwMDA7XG5jb25zdCBDSElMRF9XSU5ET1dfUkVBRFlfVElNRU9VVCAgICAgID0gMzAgKiAxMDAwO1xuXG5jb25zdCBBTExfRFJJVkVSX1RBU0tTX0FEREVEX1RPX1FVRVVFX0VWRU5UID0gJ2FsbC1kcml2ZXItdGFza3MtYWRkZWQtdG8tcXVldWUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0UnVuIGV4dGVuZHMgQXN5bmNFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0LCBicm93c2VyQ29ubmVjdGlvbiwgc2NyZWVuc2hvdENhcHR1cmVyLCBnbG9iYWxXYXJuaW5nTG9nLCBvcHRzKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpc1t0ZXN0UnVuTWFya2VyXSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy53YXJuaW5nTG9nID0gbmV3IFdhcm5pbmdMb2coZ2xvYmFsV2FybmluZ0xvZyk7XG5cbiAgICAgICAgdGhpcy5vcHRzICAgICAgICAgICAgICA9IG9wdHM7XG4gICAgICAgIHRoaXMudGVzdCAgICAgICAgICAgICAgPSB0ZXN0O1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uID0gYnJvd3NlckNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IFBIQVNFLmluaXRpYWw7XG5cbiAgICAgICAgdGhpcy5kcml2ZXJUYXNrUXVldWUgICAgICAgPSBbXTtcbiAgICAgICAgdGhpcy50ZXN0RG9uZUNvbW1hbmRRdWV1ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmFjdGl2ZURpYWxvZ0hhbmRsZXIgID0gbnVsbDtcbiAgICAgICAgdGhpcy5hY3RpdmVJZnJhbWVTZWxlY3RvciA9IG51bGw7XG4gICAgICAgIHRoaXMuc3BlZWQgICAgICAgICAgICAgICAgPSB0aGlzLm9wdHMuc3BlZWQ7XG4gICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ICAgICAgPSB0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0O1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZVBhZ2VSZWxvYWRzICAgPSB0ZXN0LmRpc2FibGVQYWdlUmVsb2FkcyB8fCBvcHRzLmRpc2FibGVQYWdlUmVsb2FkcyAmJiB0ZXN0LmRpc2FibGVQYWdlUmVsb2FkcyAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlO1xuICAgICAgICB0aGlzLmRpc2FibGVQYWdlQ2FjaGluZyAgID0gdGVzdC5kaXNhYmxlUGFnZUNhY2hpbmcgfHwgb3B0cy5kaXNhYmxlUGFnZUNhY2hpbmc7XG4gICAgICAgIHRoaXMuYWxsb3dNdWx0aXBsZVdpbmRvd3MgPSBvcHRzLmFsbG93TXVsdGlwbGVXaW5kb3dzO1xuXG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IFNlc3Npb25Db250cm9sbGVyLmdldFNlc3Npb24odGhpcyk7XG5cbiAgICAgICAgdGhpcy5jb25zb2xlTWVzc2FnZXMgPSBuZXcgQnJvd3NlckNvbnNvbGVNZXNzYWdlcygpO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgICA9IG51bGw7XG4gICAgICAgIHRoaXMucGVuZGluZ1BhZ2VFcnJvciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdHggICAgICAgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5maXh0dXJlQ3R4ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlSWQgID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VkUm9sZVN0YXRlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgdGhpcy5lcnJzID0gW107XG5cbiAgICAgICAgdGhpcy5sYXN0RHJpdmVyU3RhdHVzSWQgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3REcml2ZXJTdGF0dXNSZXNwb25zZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuYWRkaW5nRHJpdmVyVGFza3NDb3VudCA9IDA7XG5cbiAgICAgICAgdGhpcy5kZWJ1Z2dpbmcgICAgICAgICAgICAgICA9IHRoaXMub3B0cy5kZWJ1Z01vZGU7XG4gICAgICAgIHRoaXMuZGVidWdPbkZhaWwgICAgICAgICAgICAgPSB0aGlzLm9wdHMuZGVidWdPbkZhaWw7XG4gICAgICAgIHRoaXMuZGlzYWJsZURlYnVnQnJlYWtwb2ludHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWJ1Z1JlcG9ydGVyUGx1Z2luSG9zdCA9IG5ldyBSZXBvcnRlclBsdWdpbkhvc3QoeyBub0NvbG9yczogZmFsc2UgfSk7XG5cbiAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUgPSBuZXcgQnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlKGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHRoaXMud2FybmluZ0xvZyk7XG5cbiAgICAgICAgdGhpcy5kZWJ1Z0xvZyA9IG5ldyBUZXN0UnVuRGVidWdMb2codGhpcy5icm93c2VyQ29ubmVjdGlvbi51c2VyQWdlbnQpO1xuXG4gICAgICAgIHRoaXMucXVhcmFudGluZSAgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZGVidWdMb2dnZXIgPSB0aGlzLm9wdHMuZGVidWdMb2dnZXI7XG5cbiAgICAgICAgdGhpcy5fYWRkSW5qZWN0YWJsZXMoKTtcbiAgICAgICAgdGhpcy5faW5pdFJlcXVlc3RIb29rcygpO1xuICAgIH1cblxuICAgIF9hZGRDbGllbnRTY3JpcHRDb250ZW50V2FybmluZ3NJZk5lY2Vzc2FyeSAoKSB7XG4gICAgICAgIGNvbnN0IHsgZW1wdHksIGR1cGxpY2F0ZWRDb250ZW50IH0gPSBmaW5kUHJvYmxlbWF0aWNTY3JpcHRzKHRoaXMudGVzdC5jbGllbnRTY3JpcHRzKTtcblxuICAgICAgICBpZiAoZW1wdHkubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy53YXJuaW5nTG9nLmFkZFdhcm5pbmcoV0FSTklOR19NRVNTQUdFLmNsaWVudFNjcmlwdHNXaXRoRW1wdHlDb250ZW50KTtcblxuICAgICAgICBpZiAoZHVwbGljYXRlZENvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBzdWZmaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBnZXRQbHVyYWxTdWZmaXgoZHVwbGljYXRlZENvbnRlbnQpO1xuICAgICAgICAgICAgY29uc3QgZHVwbGljYXRlZENvbnRlbnRDbGllbnRTY3JpcHRzU3RyID0gZ2V0Q29uY2F0ZW5hdGVkVmFsdWVzU3RyaW5nKGR1cGxpY2F0ZWRDb250ZW50LCAnLFxcbiAnKTtcblxuICAgICAgICAgICAgdGhpcy53YXJuaW5nTG9nLmFkZFdhcm5pbmcoV0FSTklOR19NRVNTQUdFLmNsaWVudFNjcmlwdHNXaXRoRHVwbGljYXRlZENvbnRlbnQsIHN1ZmZpeCwgZHVwbGljYXRlZENvbnRlbnRDbGllbnRTY3JpcHRzU3RyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9hZGRJbmplY3RhYmxlcyAoKSB7XG4gICAgICAgIHRoaXMuX2FkZENsaWVudFNjcmlwdENvbnRlbnRXYXJuaW5nc0lmTmVjZXNzYXJ5KCk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zY3JpcHRzLnB1c2goLi4uSU5KRUNUQUJMRVMuU0NSSVBUUyk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS51c2VyU2NyaXB0cy5wdXNoKC4uLnRoaXMudGVzdC5jbGllbnRTY3JpcHRzLm1hcChzY3JpcHQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6ICBnZXRDdXN0b21DbGllbnRTY3JpcHRVcmwoc2NyaXB0KSxcbiAgICAgICAgICAgICAgICBwYWdlOiBzY3JpcHQucGFnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmluamVjdGFibGUuc3R5bGVzLnB1c2goSU5KRUNUQUJMRVMuVEVTVENBRkVfVUlfU1RZTEVTKTtcbiAgICB9XG5cbiAgICBnZXQgaWQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXNzaW9uLmlkO1xuICAgIH1cblxuICAgIGdldCBpbmplY3RhYmxlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vzc2lvbi5pbmplY3RhYmxlO1xuICAgIH1cblxuICAgIGFkZFF1YXJhbnRpbmVJbmZvIChxdWFyYW50aW5lKSB7XG4gICAgICAgIHRoaXMucXVhcmFudGluZSA9IHF1YXJhbnRpbmU7XG4gICAgfVxuXG4gICAgYWRkUmVxdWVzdEhvb2sgKGhvb2spIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdEhvb2tzLmluZGV4T2YoaG9vaykgIT09IC0xKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdEhvb2tzLnB1c2goaG9vayk7XG4gICAgICAgIHRoaXMuX2luaXRSZXF1ZXN0SG9vayhob29rKTtcbiAgICB9XG5cbiAgICByZW1vdmVSZXF1ZXN0SG9vayAoaG9vaykge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0SG9va3MuaW5kZXhPZihob29rKSA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgcHVsbCh0aGlzLnJlcXVlc3RIb29rcywgaG9vayk7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VSZXF1ZXN0SG9vayhob29rKTtcbiAgICB9XG5cbiAgICBfaW5pdFJlcXVlc3RIb29rIChob29rKSB7XG4gICAgICAgIGhvb2sud2FybmluZ0xvZyA9IHRoaXMud2FybmluZ0xvZztcblxuICAgICAgICBob29rLl9pbnN0YW50aWF0ZVJlcXVlc3RGaWx0ZXJSdWxlcygpO1xuICAgICAgICBob29rLl9pbnN0YW50aWF0ZWRSZXF1ZXN0RmlsdGVyUnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5hZGRSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMocnVsZSwge1xuICAgICAgICAgICAgICAgIG9uUmVxdWVzdDogICAgICAgICAgIGhvb2sub25SZXF1ZXN0LmJpbmQoaG9vayksXG4gICAgICAgICAgICAgICAgb25Db25maWd1cmVSZXNwb25zZTogaG9vay5fb25Db25maWd1cmVSZXNwb25zZS5iaW5kKGhvb2spLFxuICAgICAgICAgICAgICAgIG9uUmVzcG9uc2U6ICAgICAgICAgIGhvb2sub25SZXNwb25zZS5iaW5kKGhvb2spXG4gICAgICAgICAgICB9LCBlcnIgPT4gdGhpcy5fb25SZXF1ZXN0SG9va01ldGhvZEVycm9yKGVyciwgaG9vaykpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25SZXF1ZXN0SG9va01ldGhvZEVycm9yIChldmVudCwgaG9vaykge1xuICAgICAgICBsZXQgZXJyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGV2ZW50LmVycm9yO1xuICAgICAgICBjb25zdCBpc1JlcXVlc3RIb29rTm90SW1wbGVtZW50ZWRNZXRob2RFcnJvciA9IGVyciBpbnN0YW5jZW9mIFJlcXVlc3RIb29rTm90SW1wbGVtZW50ZWRNZXRob2RFcnJvcjtcblxuICAgICAgICBpZiAoIWlzUmVxdWVzdEhvb2tOb3RJbXBsZW1lbnRlZE1ldGhvZEVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBob29rQ2xhc3NOYW1lID0gaG9vay5jb25zdHJ1Y3Rvci5uYW1lO1xuXG4gICAgICAgICAgICBlcnIgPSBuZXcgUmVxdWVzdEhvb2tVbmhhbmRsZWRFcnJvcihlcnIsIGhvb2tDbGFzc05hbWUsIGV2ZW50Lm1ldGhvZE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRFcnJvcihlcnIpO1xuICAgIH1cblxuICAgIF9kaXNwb3NlUmVxdWVzdEhvb2sgKGhvb2spIHtcbiAgICAgICAgaG9vay53YXJuaW5nTG9nID0gbnVsbDtcblxuICAgICAgICBob29rLl9pbnN0YW50aWF0ZWRSZXF1ZXN0RmlsdGVyUnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5yZW1vdmVSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMocnVsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0UmVxdWVzdEhvb2tzICgpIHtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SG9va3MgPSBBcnJheS5mcm9tKHRoaXMudGVzdC5yZXF1ZXN0SG9va3MpO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdEhvb2tzLmZvckVhY2goaG9vayA9PiB0aGlzLl9pbml0UmVxdWVzdEhvb2soaG9vaykpO1xuICAgIH1cblxuICAgIC8vIEhhbW1lcmhlYWQgcGF5bG9hZFxuICAgIF9nZXRQYXlsb2FkU2NyaXB0ICgpIHtcbiAgICAgICAgdGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBNdXN0YWNoZS5yZW5kZXIoVEVTVF9SVU5fVEVNUExBVEUsIHtcbiAgICAgICAgICAgIHRlc3RSdW5JZDogICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuc2Vzc2lvbi5pZCksXG4gICAgICAgICAgICBicm93c2VySWQ6ICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLmlkKSxcbiAgICAgICAgICAgIGJyb3dzZXJIZWFydGJlYXRSZWxhdGl2ZVVybDogIEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uaGVhcnRiZWF0UmVsYXRpdmVVcmwpLFxuICAgICAgICAgICAgYnJvd3NlclN0YXR1c1JlbGF0aXZlVXJsOiAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5icm93c2VyQ29ubmVjdGlvbi5zdGF0dXNSZWxhdGl2ZVVybCksXG4gICAgICAgICAgICBicm93c2VyU3RhdHVzRG9uZVJlbGF0aXZlVXJsOiBKU09OLnN0cmluZ2lmeSh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnN0YXR1c0RvbmVSZWxhdGl2ZVVybCksXG4gICAgICAgICAgICBicm93c2VyQWN0aXZlV2luZG93SWRVcmw6ICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLmFjdGl2ZVdpbmRvd0lkVXJsKSxcbiAgICAgICAgICAgIHVzZXJBZ2VudDogICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24udXNlckFnZW50KSxcbiAgICAgICAgICAgIHRlc3ROYW1lOiAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMudGVzdC5uYW1lKSxcbiAgICAgICAgICAgIGZpeHR1cmVOYW1lOiAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMudGVzdC5maXh0dXJlLm5hbWUpLFxuICAgICAgICAgICAgc2VsZWN0b3JUaW1lb3V0OiAgICAgICAgICAgICAgdGhpcy5vcHRzLnNlbGVjdG9yVGltZW91dCxcbiAgICAgICAgICAgIHBhZ2VMb2FkVGltZW91dDogICAgICAgICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0LFxuICAgICAgICAgICAgY2hpbGRXaW5kb3dSZWFkeVRpbWVvdXQ6ICAgICAgQ0hJTERfV0lORE9XX1JFQURZX1RJTUVPVVQsXG4gICAgICAgICAgICBza2lwSnNFcnJvcnM6ICAgICAgICAgICAgICAgICB0aGlzLm9wdHMuc2tpcEpzRXJyb3JzLFxuICAgICAgICAgICAgcmV0cnlUZXN0UGFnZXM6ICAgICAgICAgICAgICAgdGhpcy5vcHRzLnJldHJ5VGVzdFBhZ2VzLFxuICAgICAgICAgICAgc3BlZWQ6ICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVlZCxcbiAgICAgICAgICAgIGRpYWxvZ0hhbmRsZXI6ICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldElmcmFtZVBheWxvYWRTY3JpcHQgKCkge1xuICAgICAgICByZXR1cm4gTXVzdGFjaGUucmVuZGVyKElGUkFNRV9URVNUX1JVTl9URU1QTEFURSwge1xuICAgICAgICAgICAgdGVzdFJ1bklkOiAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLnNlc3Npb24uaWQpLFxuICAgICAgICAgICAgc2VsZWN0b3JUaW1lb3V0OiB0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0LFxuICAgICAgICAgICAgcGFnZUxvYWRUaW1lb3V0OiB0aGlzLnBhZ2VMb2FkVGltZW91dCxcbiAgICAgICAgICAgIHJldHJ5VGVzdFBhZ2VzOiAgISF0aGlzLm9wdHMucmV0cnlUZXN0UGFnZXMsXG4gICAgICAgICAgICBzcGVlZDogICAgICAgICAgIHRoaXMuc3BlZWQsXG4gICAgICAgICAgICBkaWFsb2dIYW5kbGVyOiAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSGFtbWVyaGVhZCBoYW5kbGVyc1xuICAgIGdldEF1dGhDcmVkZW50aWFscyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlc3QuYXV0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIGhhbmRsZUZpbGVEb3dubG9hZCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVQYWdlRXJyb3IgKGN0eCwgZXJyKSB7XG4gICAgICAgIGlmIChjdHgucmVxLmhlYWRlcnNbVU5TVEFCTEVfTkVUV09SS19NT0RFX0hFQURFUl0pIHtcbiAgICAgICAgICAgIGN0eC5jbG9zZVdpdGhFcnJvcig1MDAsIGVyci50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVuZGluZ1BhZ2VFcnJvciA9IG5ldyBQYWdlTG9hZEVycm9yKGVyciwgY3R4LnJlcU9wdHMudXJsKTtcblxuICAgICAgICBjdHgucmVkaXJlY3QoY3R4LnRvUHJveHlVcmwoU1BFQ0lBTF9FUlJPUl9QQUdFKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmdW5jdGlvbiBleGVjdXRpb25cbiAgICBhc3luYyBfZXhlY3V0ZVRlc3RGbiAocGhhc2UsIGZuKSB7XG4gICAgICAgIHRoaXMucGhhc2UgPSBwaGFzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZm4odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fbWFrZVNjcmVlbnNob3RPbkZhaWwoKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRFcnJvcihlcnIpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLmVyclNjcmVlbnNob3RQYXRoID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhdGhpcy5fYWRkUGVuZGluZ1BhZ2VFcnJvcklmQW55KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1bkJlZm9yZUhvb2sgKCkge1xuICAgICAgICBpZiAodGhpcy50ZXN0LmJlZm9yZUZuKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2V4ZWN1dGVUZXN0Rm4oUEhBU0UuaW5UZXN0QmVmb3JlSG9vaywgdGhpcy50ZXN0LmJlZm9yZUZuKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0LmZpeHR1cmUuYmVmb3JlRWFjaEZuKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2V4ZWN1dGVUZXN0Rm4oUEhBU0UuaW5GaXh0dXJlQmVmb3JlRWFjaEhvb2ssIHRoaXMudGVzdC5maXh0dXJlLmJlZm9yZUVhY2hGbik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1bkFmdGVySG9vayAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRlc3QuYWZ0ZXJGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluVGVzdEFmdGVySG9vaywgdGhpcy50ZXN0LmFmdGVyRm4pO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3QuZml4dHVyZS5hZnRlckVhY2hGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluRml4dHVyZUFmdGVyRWFjaEhvb2ssIHRoaXMudGVzdC5maXh0dXJlLmFmdGVyRWFjaEZuKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydCAoKSB7XG4gICAgICAgIHRlc3RSdW5UcmFja2VyLmFjdGl2ZVRlc3RSdW5zW3RoaXMuc2Vzc2lvbi5pZF0gPSB0aGlzO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnc3RhcnQnKTtcblxuICAgICAgICBjb25zdCBvbkRpc2Nvbm5lY3RlZCA9IGVyciA9PiB0aGlzLl9kaXNjb25uZWN0KGVycik7XG5cbiAgICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbi5vbmNlKCdkaXNjb25uZWN0ZWQnLCBvbkRpc2Nvbm5lY3RlZCk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5vbmNlKCdjb25uZWN0ZWQnKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG5cbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuX3J1bkJlZm9yZUhvb2soKSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZXhlY3V0ZVRlc3RGbihQSEFTRS5pblRlc3QsIHRoaXMudGVzdC5mbik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9ydW5BZnRlckhvb2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRpc2Nvbm5lY3RlZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnJlbW92ZUxpc3RlbmVyKCdkaXNjb25uZWN0ZWQnLCBvbkRpc2Nvbm5lY3RlZCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZXJycy5sZW5ndGggJiYgdGhpcy5kZWJ1Z09uRmFpbClcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZChudWxsLCB0aGlzLmRlYnVnUmVwb3J0ZXJQbHVnaW5Ib3N0LmZvcm1hdEVycm9yKHRoaXMuZXJyc1swXSkpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnYmVmb3JlLWRvbmUnKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuVGVzdERvbmVDb21tYW5kKCkpO1xuXG4gICAgICAgIHRoaXMuX2FkZFBlbmRpbmdQYWdlRXJyb3JJZkFueSgpO1xuICAgICAgICB0aGlzLnNlc3Npb24uY2xlYXJSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5ub3JtYWxpemVSZXF1ZXN0SG9va0Vycm9ycygpO1xuXG4gICAgICAgIGRlbGV0ZSB0ZXN0UnVuVHJhY2tlci5hY3RpdmVUZXN0UnVuc1t0aGlzLnNlc3Npb24uaWRdO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnZG9uZScpO1xuICAgIH1cblxuICAgIC8vIEVycm9yc1xuICAgIF9hZGRQZW5kaW5nUGFnZUVycm9ySWZBbnkgKCkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUGFnZUVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEVycm9yKHRoaXMucGVuZGluZ1BhZ2VFcnJvcik7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUVycm9yQWRhcHRlciAoZXJyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVzdFJ1bkVycm9yRm9ybWF0dGFibGVBZGFwdGVyKGVyciwge1xuICAgICAgICAgICAgdXNlckFnZW50OiAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb24udXNlckFnZW50LFxuICAgICAgICAgICAgc2NyZWVuc2hvdFBhdGg6IHRoaXMuZXJyU2NyZWVuc2hvdFBhdGggfHwgJycsXG4gICAgICAgICAgICB0ZXN0UnVuSWQ6ICAgICAgdGhpcy5pZCxcbiAgICAgICAgICAgIHRlc3RSdW5QaGFzZTogICB0aGlzLnBoYXNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEVycm9yIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyTGlzdCA9IGVyciBpbnN0YW5jZW9mIFRlc3RDYWZlRXJyb3JMaXN0ID8gZXJyLml0ZW1zIDogW2Vycl07XG5cbiAgICAgICAgZXJyTGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgY29uc3QgYWRhcHRlciA9IHRoaXMuX2NyZWF0ZUVycm9yQWRhcHRlcihpdGVtKTtcblxuICAgICAgICAgICAgdGhpcy5lcnJzLnB1c2goYWRhcHRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZVJlcXVlc3RIb29rRXJyb3JzICgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdEhvb2tFcnJvcnMgPSByZW1vdmUodGhpcy5lcnJzLCBlID0+XG4gICAgICAgICAgICBlLmNvZGUgPT09IFRFU1RfUlVOX0VSUk9SUy5yZXF1ZXN0SG9va05vdEltcGxlbWVudGVkRXJyb3IgfHxcbiAgICAgICAgICAgIGUuY29kZSA9PT0gVEVTVF9SVU5fRVJST1JTLnJlcXVlc3RIb29rVW5oYW5kbGVkRXJyb3IpO1xuXG4gICAgICAgIGlmICghcmVxdWVzdEhvb2tFcnJvcnMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHVuaXFSZXF1ZXN0SG9va0Vycm9ycyA9IGNoYWluKHJlcXVlc3RIb29rRXJyb3JzKVxuICAgICAgICAgICAgLnVuaXFCeShlID0+IGUuaG9va0NsYXNzTmFtZSArIGUubWV0aG9kTmFtZSlcbiAgICAgICAgICAgIC5zb3J0QnkoWydob29rQ2xhc3NOYW1lJywgJ21ldGhvZE5hbWUnXSlcbiAgICAgICAgICAgIC52YWx1ZSgpO1xuXG4gICAgICAgIHRoaXMuZXJycyA9IHRoaXMuZXJycy5jb25jYXQodW5pcVJlcXVlc3RIb29rRXJyb3JzKTtcbiAgICB9XG5cbiAgICAvLyBUYXNrIHF1ZXVlXG4gICAgX2VucXVldWVDb21tYW5kIChjb21tYW5kLCBjYWxsc2l0ZSkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUmVxdWVzdClcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVQZW5kaW5nUmVxdWVzdChjb21tYW5kKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50LS07XG4gICAgICAgICAgICB0aGlzLmRyaXZlclRhc2tRdWV1ZS5wdXNoKHsgY29tbWFuZCwgcmVzb2x2ZSwgcmVqZWN0LCBjYWxsc2l0ZSB9KTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmFkZGluZ0RyaXZlclRhc2tzQ291bnQpXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5lbWl0KEFMTF9EUklWRVJfVEFTS1NfQURERURfVE9fUVVFVUVfRVZFTlQsIHRoaXMuZHJpdmVyVGFza1F1ZXVlLmxlbmd0aCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBkcml2ZXJUYXNrUXVldWVMZW5ndGggKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50ID8gcHJvbWlzaWZ5RXZlbnQodGhpcywgQUxMX0RSSVZFUl9UQVNLU19BRERFRF9UT19RVUVVRV9FVkVOVCkgOiBQcm9taXNlLnJlc29sdmUodGhpcy5kcml2ZXJUYXNrUXVldWUubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfZW5xdWV1ZUJyb3dzZXJDb25zb2xlTWVzc2FnZXNDb21tYW5kIChjb21tYW5kLCBjYWxsc2l0ZSkge1xuICAgICAgICBhd2FpdCB0aGlzLl9lbnF1ZXVlQ29tbWFuZChjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgY29uc3QgY29uc29sZU1lc3NhZ2VDb3B5ID0gdGhpcy5jb25zb2xlTWVzc2FnZXMuZ2V0Q29weSgpO1xuXG4gICAgICAgIHJldHVybiBjb25zb2xlTWVzc2FnZUNvcHlbdGhpcy5icm93c2VyQ29ubmVjdGlvbi5hY3RpdmVXaW5kb3dJZF07XG4gICAgfVxuXG4gICAgYXN5bmMgX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZCAoY2FsbHNpdGUsIGVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLmlzSGVhZGxlc3NCcm93c2VyKCkpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5kZWJ1Z0luSGVhZGxlc3NFcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kZWJ1Z0xvZ2dlcilcbiAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIuc2hvd0JyZWFrcG9pbnQodGhpcy5zZXNzaW9uLmlkLCB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnVzZXJBZ2VudCwgY2FsbHNpdGUsIGVycm9yKTtcblxuICAgICAgICB0aGlzLmRlYnVnZ2luZyA9IGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IHNlcnZpY2VDb21tYW5kcy5TZXRCcmVha3BvaW50Q29tbWFuZCghIWVycm9yKSwgY2FsbHNpdGUpO1xuICAgIH1cblxuICAgIF9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MgKCkge1xuICAgICAgICB0aGlzLmRyaXZlclRhc2tRdWV1ZSA9IHRoaXMuZHJpdmVyVGFza1F1ZXVlLmZpbHRlcihkcml2ZXJUYXNrID0+IGlzU2VydmljZUNvbW1hbmQoZHJpdmVyVGFzay5jb21tYW5kKSk7XG5cbiAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUucmVtb3ZlQWxsTm9uU2VydmljZU1hbmlwdWxhdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvLyBDdXJyZW50IGRyaXZlciB0YXNrXG4gICAgZ2V0IGN1cnJlbnREcml2ZXJUYXNrICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJpdmVyVGFza1F1ZXVlWzBdO1xuICAgIH1cblxuICAgIF9yZXNvbHZlQ3VycmVudERyaXZlclRhc2sgKHJlc3VsdCkge1xuICAgICAgICB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgdGhpcy5kcml2ZXJUYXNrUXVldWUuc2hpZnQoKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0RG9uZUNvbW1hbmRRdWV1ZWQpXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MoKTtcbiAgICB9XG5cbiAgICBfcmVqZWN0Q3VycmVudERyaXZlclRhc2sgKGVycikge1xuICAgICAgICBlcnIuY2FsbHNpdGUgPSBlcnIuY2FsbHNpdGUgfHwgdGhpcy5jdXJyZW50RHJpdmVyVGFzay5jYWxsc2l0ZTtcblxuICAgICAgICB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLnJlamVjdChlcnIpO1xuICAgICAgICB0aGlzLl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MoKTtcbiAgICB9XG5cbiAgICAvLyBQZW5kaW5nIHJlcXVlc3RcbiAgICBfY2xlYXJQZW5kaW5nUmVxdWVzdCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNwb25zZVRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0IChjb21tYW5kKSB7XG4gICAgICAgIHRoaXMubGFzdERyaXZlclN0YXR1c1Jlc3BvbnNlID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNvbHZlKGNvbW1hbmQpO1xuICAgICAgICB0aGlzLl9jbGVhclBlbmRpbmdSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGRyaXZlciByZXF1ZXN0XG4gICAgX3Nob3VsZFJlc29sdmVDdXJyZW50RHJpdmVyVGFzayAoZHJpdmVyU3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb21tYW5kID0gdGhpcy5jdXJyZW50RHJpdmVyVGFzay5jb21tYW5kO1xuXG4gICAgICAgIGNvbnN0IGlzRXhlY3V0aW5nT2JzZXJ2YXRpb25Db21tYW5kID0gY3VycmVudENvbW1hbmQgaW5zdGFuY2VvZiBvYnNlcnZhdGlvbkNvbW1hbmRzLkV4ZWN1dGVTZWxlY3RvckNvbW1hbmQgfHxcbiAgICAgICAgICAgIGN1cnJlbnRDb21tYW5kIGluc3RhbmNlb2Ygb2JzZXJ2YXRpb25Db21tYW5kcy5FeGVjdXRlQ2xpZW50RnVuY3Rpb25Db21tYW5kO1xuXG4gICAgICAgIGNvbnN0IGlzRGVidWdBY3RpdmUgPSBjdXJyZW50Q29tbWFuZCBpbnN0YW5jZW9mIHNlcnZpY2VDb21tYW5kcy5TZXRCcmVha3BvaW50Q29tbWFuZDtcblxuICAgICAgICBjb25zdCBzaG91bGRFeGVjdXRlQ3VycmVudENvbW1hbmQgPVxuICAgICAgICAgICAgZHJpdmVyU3RhdHVzLmlzRmlyc3RSZXF1ZXN0QWZ0ZXJXaW5kb3dTd2l0Y2hpbmcgJiYgKGlzRXhlY3V0aW5nT2JzZXJ2YXRpb25Db21tYW5kIHx8IGlzRGVidWdBY3RpdmUpO1xuXG4gICAgICAgIHJldHVybiAhc2hvdWxkRXhlY3V0ZUN1cnJlbnRDb21tYW5kO1xuICAgIH1cblxuICAgIF9mdWxmaWxsQ3VycmVudERyaXZlclRhc2sgKGRyaXZlclN0YXR1cykge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudERyaXZlclRhc2spXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKGRyaXZlclN0YXR1cy5leGVjdXRpb25FcnJvcilcbiAgICAgICAgICAgIHRoaXMuX3JlamVjdEN1cnJlbnREcml2ZXJUYXNrKGRyaXZlclN0YXR1cy5leGVjdXRpb25FcnJvcik7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3Nob3VsZFJlc29sdmVDdXJyZW50RHJpdmVyVGFzayhkcml2ZXJTdGF0dXMpKVxuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUN1cnJlbnREcml2ZXJUYXNrKGRyaXZlclN0YXR1cy5yZXN1bHQpO1xuICAgIH1cblxuICAgIF9oYW5kbGVQYWdlRXJyb3JTdGF0dXMgKHBhZ2VFcnJvcikge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50RHJpdmVyVGFzayAmJiBpc0NvbW1hbmRSZWplY3RhYmxlQnlQYWdlRXJyb3IodGhpcy5jdXJyZW50RHJpdmVyVGFzay5jb21tYW5kKSkge1xuICAgICAgICAgICAgdGhpcy5fcmVqZWN0Q3VycmVudERyaXZlclRhc2socGFnZUVycm9yKTtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1BhZ2VFcnJvciA9IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nUGFnZUVycm9yID0gdGhpcy5wZW5kaW5nUGFnZUVycm9yIHx8IHBhZ2VFcnJvcjtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX2hhbmRsZURyaXZlclJlcXVlc3QgKGRyaXZlclN0YXR1cykge1xuICAgICAgICBjb25zdCBpc1Rlc3REb25lICAgICAgICAgICAgICAgICA9IHRoaXMuY3VycmVudERyaXZlclRhc2sgJiYgdGhpcy5jdXJyZW50RHJpdmVyVGFzay5jb21tYW5kLnR5cGUgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ09NTUFORF9UWVBFLnRlc3REb25lO1xuICAgICAgICBjb25zdCBwYWdlRXJyb3IgICAgICAgICAgICAgICAgICA9IHRoaXMucGVuZGluZ1BhZ2VFcnJvciB8fCBkcml2ZXJTdGF0dXMucGFnZUVycm9yO1xuICAgICAgICBjb25zdCBjdXJyZW50VGFza1JlamVjdGVkQnlFcnJvciA9IHBhZ2VFcnJvciAmJiB0aGlzLl9oYW5kbGVQYWdlRXJyb3JTdGF0dXMocGFnZUVycm9yKTtcblxuICAgICAgICBpZiAodGhpcy5kaXNjb25uZWN0ZWQpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4gcmVqZWN0KCkpO1xuXG4gICAgICAgIHRoaXMuY29uc29sZU1lc3NhZ2VzLmNvbmNhdChkcml2ZXJTdGF0dXMuY29uc29sZU1lc3NhZ2VzKTtcblxuICAgICAgICBpZiAoIWN1cnJlbnRUYXNrUmVqZWN0ZWRCeUVycm9yICYmIGRyaXZlclN0YXR1cy5pc0NvbW1hbmRSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChpc1Rlc3REb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUN1cnJlbnREcml2ZXJUYXNrKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVEVTVF9ET05FX0NPTkZJUk1BVElPTl9SRVNQT05TRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZnVsZmlsbEN1cnJlbnREcml2ZXJUYXNrKGRyaXZlclN0YXR1cyk7XG5cbiAgICAgICAgICAgIGlmIChkcml2ZXJTdGF0dXMuaXNQZW5kaW5nV2luZG93U3dpdGNoaW5nKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldEN1cnJlbnREcml2ZXJUYXNrQ29tbWFuZCgpO1xuICAgIH1cblxuICAgIF9nZXRDdXJyZW50RHJpdmVyVGFza0NvbW1hbmQgKCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudERyaXZlclRhc2spXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBjb21tYW5kID0gdGhpcy5jdXJyZW50RHJpdmVyVGFzay5jb21tYW5kO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5uYXZpZ2F0ZVRvICYmIGNvbW1hbmQuc3RhdGVTbmFwc2hvdClcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi51c2VTdGF0ZVNuYXBzaG90KEpTT04ucGFyc2UoY29tbWFuZC5zdGF0ZVNuYXBzaG90KSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZSBjb21tYW5kXG4gICAgX2V4ZWN1dGVKc0V4cHJlc3Npb24gKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0VmFyaWFibGVOYW1lID0gY29tbWFuZC5yZXN1bHRWYXJpYWJsZU5hbWU7XG4gICAgICAgIGxldCBleHByZXNzaW9uICAgICAgICAgICA9IGNvbW1hbmQuZXhwcmVzc2lvbjtcblxuICAgICAgICBpZiAocmVzdWx0VmFyaWFibGVOYW1lKVxuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGAke3Jlc3VsdFZhcmlhYmxlTmFtZX0gPSAke2V4cHJlc3Npb259LCAke3Jlc3VsdFZhcmlhYmxlTmFtZX1gO1xuXG4gICAgICAgIHJldHVybiBleGVjdXRlSnNFeHByZXNzaW9uKGV4cHJlc3Npb24sIHRoaXMsIHsgc2tpcFZpc2liaWxpdHlDaGVjazogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2V4ZWN1dGVBc3NlcnRpb24gKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGNvbnN0IGFzc2VydGlvblRpbWVvdXQgPSBjb21tYW5kLm9wdGlvbnMudGltZW91dCA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgMCA/IHRoaXMub3B0cy5hc3NlcnRpb25UaW1lb3V0IDogY29tbWFuZC5vcHRpb25zLnRpbWVvdXQ7XG4gICAgICAgIGNvbnN0IGV4ZWN1dG9yICAgICAgICAgPSBuZXcgQXNzZXJ0aW9uRXhlY3V0b3IoY29tbWFuZCwgYXNzZXJ0aW9uVGltZW91dCwgY2FsbHNpdGUpO1xuXG4gICAgICAgIGV4ZWN1dG9yLm9uY2UoJ3N0YXJ0LWFzc2VydGlvbi1yZXRyaWVzJywgdGltZW91dCA9PiB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuU2hvd0Fzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kKHRpbWVvdXQpKSk7XG4gICAgICAgIGV4ZWN1dG9yLm9uY2UoJ2VuZC1hc3NlcnRpb24tcmV0cmllcycsIHN1Y2Nlc3MgPT4gdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgc2VydmljZUNvbW1hbmRzLkhpZGVBc3NlcnRpb25SZXRyaWVzU3RhdHVzQ29tbWFuZChzdWNjZXNzKSkpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGVGbiA9IHRoaXMuZGVjb3JhdGVQcmV2ZW50RW1pdEFjdGlvbkV2ZW50cygoKSA9PiBleGVjdXRvci5ydW4oKSwgeyBwcmV2ZW50OiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBleGVjdXRlRm4oKTtcbiAgICB9XG5cbiAgICBfYWRqdXN0Q29uZmlndXJhdGlvbldpdGhDb21tYW5kIChjb21tYW5kKSB7XG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS50ZXN0RG9uZSkge1xuICAgICAgICAgICAgdGhpcy50ZXN0RG9uZUNvbW1hbmRRdWV1ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVidWdMb2dnZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dlci5oaWRlQnJlYWtwb2ludCh0aGlzLnNlc3Npb24uaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuc2V0TmF0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlciA9IGNvbW1hbmQuZGlhbG9nSGFuZGxlcjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5zd2l0Y2hUb0lmcmFtZSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBjb21tYW5kLnNlbGVjdG9yO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnN3aXRjaFRvTWFpbldpbmRvdylcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFRlc3RTcGVlZClcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSBjb21tYW5kLnNwZWVkO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFBhZ2VMb2FkVGltZW91dClcbiAgICAgICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ID0gY29tbWFuZC5kdXJhdGlvbjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5kZWJ1ZylcbiAgICAgICAgICAgIHRoaXMuZGVidWdnaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBfYWRqdXN0U2NyZWVuc2hvdENvbW1hbmQgKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgYnJvd3NlcklkICAgICAgICAgICAgICAgICAgICA9IHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uaWQ7XG4gICAgICAgIGNvbnN0IHsgaGFzQ2hyb21lbGVzc1NjcmVlbnNob3RzIH0gPSBhd2FpdCB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnByb3ZpZGVyLmhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIoYnJvd3NlcklkKTtcblxuICAgICAgICBpZiAoIWhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cylcbiAgICAgICAgICAgIGNvbW1hbmQuZ2VuZXJhdGVTY3JlZW5zaG90TWFyaygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9zZXRCcmVha3BvaW50SWZOZWNlc3NhcnkgKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlRGVidWdCcmVha3BvaW50cyAmJiB0aGlzLmRlYnVnZ2luZyAmJiBjYW5TZXREZWJ1Z2dlckJyZWFrcG9pbnRCZWZvcmVDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW5xdWV1ZVNldEJyZWFrcG9pbnRDb21tYW5kKGNhbGxzaXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlQWN0aW9uIChhcGlBY3Rpb25OYW1lLCBjb21tYW5kLCBjYWxsc2l0ZSkge1xuICAgICAgICBjb25zdCBhY3Rpb25BcmdzID0geyBhcGlBY3Rpb25OYW1lLCBjb21tYW5kIH07XG5cbiAgICAgICAgbGV0IGVycm9yQWRhcHRlciA9IG51bGw7XG4gICAgICAgIGxldCBlcnJvciAgICAgICAgPSBudWxsO1xuICAgICAgICBsZXQgcmVzdWx0ICAgICAgID0gbnVsbDtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXRBY3Rpb25FdmVudCgnYWN0aW9uLXN0YXJ0JywgYWN0aW9uQXJncyk7XG5cbiAgICAgICAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKGNvbW1hbmQsIGNhbGxzaXRlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gbmV3IERhdGUoKSAtIHN0YXJ0O1xuXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgLy8gTk9URTogY2hlY2sgaWYgZXJyb3IgaXMgVGVzdENhZmVFcnJvckxpc3QgaXMgc3BlY2lmaWMgZm9yIHRoZSBgdXNlUm9sZWAgYWN0aW9uXG4gICAgICAgICAgICAvLyBpZiBlcnJvciBpcyBUZXN0Q2FmZUVycm9yTGlzdCB3ZSBkbyBub3QgbmVlZCB0byBjcmVhdGUgYW4gYWRhcHRlcixcbiAgICAgICAgICAgIC8vIHNpbmNlIGVycm9yIGlzIGFscmVhZHkgd2FzIHByb2Nlc3NlZCBpbiByb2xlIGluaXRpYWxpemVyXG4gICAgICAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRlc3RDYWZlRXJyb3JMaXN0KSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX21ha2VTY3JlZW5zaG90T25GYWlsKCk7XG5cbiAgICAgICAgICAgICAgICBlcnJvckFkYXB0ZXIgPSB0aGlzLl9jcmVhdGVFcnJvckFkYXB0ZXIocHJvY2Vzc1Rlc3RGbkVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGFjdGlvbkFyZ3MsIHtcbiAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgZXJyOiBlcnJvckFkYXB0ZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5lbWl0QWN0aW9uRXZlbnQoJ2FjdGlvbi1kb25lJywgYWN0aW9uQXJncyk7XG5cbiAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlQ29tbWFuZCAoY29tbWFuZCwgY2FsbHNpdGUpIHtcbiAgICAgICAgdGhpcy5kZWJ1Z0xvZy5jb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdQYWdlRXJyb3IgJiYgaXNDb21tYW5kUmVqZWN0YWJsZUJ5UGFnZUVycm9yKGNvbW1hbmQpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdENvbW1hbmRXaXRoUGFnZUVycm9yKGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoaXNFeGVjdXRhYmxlT25DbGllbnRDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50Kys7XG5cbiAgICAgICAgdGhpcy5fYWRqdXN0Q29uZmlndXJhdGlvbldpdGhDb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEJyZWFrcG9pbnRJZk5lY2Vzc2FyeShjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGlzU2NyZWVuc2hvdENvbW1hbmQoY29tbWFuZCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMuZGlzYWJsZVNjcmVlbnNob3RzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53YXJuaW5nTG9nLmFkZFdhcm5pbmcoV0FSTklOR19NRVNTQUdFLnNjcmVlbnNob3RzRGlzYWJsZWQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2FkanVzdFNjcmVlbnNob3RDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmQoY29tbWFuZCkpIHtcbiAgICAgICAgICAgIHRoaXMuYnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlLnB1c2goY29tbWFuZCk7XG5cbiAgICAgICAgICAgIGlmIChpc1Jlc2l6ZVdpbmRvd0NvbW1hbmQoY29tbWFuZCkgJiYgdGhpcy5vcHRzLnZpZGVvUGF0aClcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdMb2cuYWRkV2FybmluZyhXQVJOSU5HX01FU1NBR0UudmlkZW9Ccm93c2VyUmVzaXppbmcsIHRoaXMudGVzdC5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS53YWl0KVxuICAgICAgICAgICAgcmV0dXJuIGRlbGF5KGNvbW1hbmQudGltZW91dCk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFBhZ2VMb2FkVGltZW91dClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5kZWJ1ZylcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9lbnF1ZXVlU2V0QnJlYWtwb2ludENvbW1hbmQoY2FsbHNpdGUpO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS51c2VSb2xlKSB7XG4gICAgICAgICAgICBsZXQgZm4gPSAoKSA9PiB0aGlzLl91c2VSb2xlKGNvbW1hbmQucm9sZSwgY2FsbHNpdGUpO1xuXG4gICAgICAgICAgICBmbiA9IHRoaXMuZGVjb3JhdGVQcmV2ZW50RW1pdEFjdGlvbkV2ZW50cyhmbiwgeyBwcmV2ZW50OiB0cnVlIH0pO1xuICAgICAgICAgICAgZm4gPSB0aGlzLmRlY29yYXRlRGlzYWJsZURlYnVnQnJlYWtwb2ludHMoZm4sIHsgZGlzYWJsZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuYXNzZXJ0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGVBc3NlcnRpb24oY29tbWFuZCwgY2FsbHNpdGUpO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5leGVjdXRlRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlSnNFeHByZXNzaW9uKGNvbW1hbmQsIGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuZXhlY3V0ZUFzeW5jRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBleGVjdXRlQXN5bmNKc0V4cHJlc3Npb24oY29tbWFuZC5leHByZXNzaW9uLCB0aGlzLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLmdldEJyb3dzZXJDb25zb2xlTWVzc2FnZXMpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZW5xdWV1ZUJyb3dzZXJDb25zb2xlTWVzc2FnZXNDb21tYW5kKGNvbW1hbmQsIGNhbGxzaXRlKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZW5xdWV1ZUNvbW1hbmQoY29tbWFuZCwgY2FsbHNpdGUpO1xuICAgIH1cblxuICAgIF9yZWplY3RDb21tYW5kV2l0aFBhZ2VFcnJvciAoY2FsbHNpdGUpIHtcbiAgICAgICAgY29uc3QgZXJyID0gdGhpcy5wZW5kaW5nUGFnZUVycm9yO1xuXG4gICAgICAgIGVyci5jYWxsc2l0ZSAgICAgICAgICA9IGNhbGxzaXRlO1xuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGFzeW5jIF9tYWtlU2NyZWVuc2hvdE9uRmFpbCAoKSB7XG4gICAgICAgIGNvbnN0IHsgc2NyZWVuc2hvdHMgfSA9IHRoaXMub3B0cztcblxuICAgICAgICBpZiAoIXRoaXMuZXJyU2NyZWVuc2hvdFBhdGggJiYgc2NyZWVuc2hvdHMgJiYgc2NyZWVuc2hvdHMudGFrZU9uRmFpbHMpXG4gICAgICAgICAgICB0aGlzLmVyclNjcmVlbnNob3RQYXRoID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgYnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmRzLlRha2VTY3JlZW5zaG90T25GYWlsQ29tbWFuZCgpKTtcbiAgICB9XG5cbiAgICBfZGVjb3JhdGVXaXRoRmxhZyAoZm4sIGZsYWdOYW1lLCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpc1tmbGFnTmFtZV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzW2ZsYWdOYW1lXSA9ICF2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBkZWNvcmF0ZVByZXZlbnRFbWl0QWN0aW9uRXZlbnRzIChmbiwgeyBwcmV2ZW50IH0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlY29yYXRlV2l0aEZsYWcoZm4sICdwcmV2ZW50RW1pdEFjdGlvbkV2ZW50cycsIHByZXZlbnQpO1xuICAgIH1cblxuICAgIGRlY29yYXRlRGlzYWJsZURlYnVnQnJlYWtwb2ludHMgKGZuLCB7IGRpc2FibGUgfSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVjb3JhdGVXaXRoRmxhZyhmbiwgJ2Rpc2FibGVEZWJ1Z0JyZWFrcG9pbnRzJywgZGlzYWJsZSk7XG4gICAgfVxuXG4gICAgLy8gUm9sZSBtYW5hZ2VtZW50XG4gICAgYXN5bmMgZ2V0U3RhdGVTbmFwc2hvdCAoKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5zZXNzaW9uLmdldFN0YXRlU25hcHNob3QoKTtcblxuICAgICAgICBzdGF0ZS5zdG9yYWdlcyA9IGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IHNlcnZpY2VDb21tYW5kcy5CYWNrdXBTdG9yYWdlc0NvbW1hbmQoKSk7XG5cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGFzeW5jIHN3aXRjaFRvQ2xlYW5SdW4gKHVybCkge1xuICAgICAgICB0aGlzLmN0eCAgICAgICAgICAgICA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuZml4dHVyZUN0eCAgICAgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5jb25zb2xlTWVzc2FnZXMgPSBuZXcgQnJvd3NlckNvbnNvbGVNZXNzYWdlcygpO1xuXG4gICAgICAgIHRoaXMuc2Vzc2lvbi51c2VTdGF0ZVNuYXBzaG90KFN0YXRlU25hcHNob3QuZW1wdHkoKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3BlZWQgIT09IHRoaXMub3B0cy5zcGVlZCkge1xuICAgICAgICAgICAgY29uc3Qgc2V0U3BlZWRDb21tYW5kID0gbmV3IGFjdGlvbkNvbW1hbmRzLlNldFRlc3RTcGVlZENvbW1hbmQoeyBzcGVlZDogdGhpcy5vcHRzLnNwZWVkIH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHNldFNwZWVkQ29tbWFuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYWdlTG9hZFRpbWVvdXQgIT09IHRoaXMub3B0cy5wYWdlTG9hZFRpbWVvdXQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNldFBhZ2VMb2FkVGltZW91dENvbW1hbmQgPSBuZXcgYWN0aW9uQ29tbWFuZHMuU2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZCh7IGR1cmF0aW9uOiB0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0IH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHNldFBhZ2VMb2FkVGltZW91dENvbW1hbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5uYXZpZ2F0ZVRvVXJsKHVybCwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlcikge1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlRGlhbG9nSGFuZGxlckNvbW1hbmQgPSBuZXcgYWN0aW9uQ29tbWFuZHMuU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvbW1hbmQoeyBkaWFsb2dIYW5kbGVyOiB7IGZuOiBudWxsIH0gfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQocmVtb3ZlRGlhbG9nSGFuZGxlckNvbW1hbmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgbmF2aWdhdGVUb1VybCAodXJsLCBmb3JjZVJlbG9hZCwgc3RhdGVTbmFwc2hvdCkge1xuICAgICAgICBjb25zdCBuYXZpZ2F0ZUNvbW1hbmQgPSBuZXcgYWN0aW9uQ29tbWFuZHMuTmF2aWdhdGVUb0NvbW1hbmQoeyB1cmwsIGZvcmNlUmVsb2FkLCBzdGF0ZVNuYXBzaG90IH0pO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmF2aWdhdGVDb21tYW5kKTtcbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0U3RhdGVTbmFwc2hvdEZyb21Sb2xlIChyb2xlKSB7XG4gICAgICAgIGNvbnN0IHByZXZQaGFzZSA9IHRoaXMucGhhc2U7XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IFBIQVNFLmluUm9sZUluaXRpYWxpemVyO1xuXG4gICAgICAgIGlmIChyb2xlLnBoYXNlID09PSBST0xFX1BIQVNFLnVuaW5pdGlhbGl6ZWQpXG4gICAgICAgICAgICBhd2FpdCByb2xlLmluaXRpYWxpemUodGhpcyk7XG5cbiAgICAgICAgZWxzZSBpZiAocm9sZS5waGFzZSA9PT0gUk9MRV9QSEFTRS5wZW5kaW5nSW5pdGlhbGl6YXRpb24pXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNpZnlFdmVudChyb2xlLCAnaW5pdGlhbGl6ZWQnKTtcblxuICAgICAgICBpZiAocm9sZS5pbml0RXJyKVxuICAgICAgICAgICAgdGhyb3cgcm9sZS5pbml0RXJyO1xuXG4gICAgICAgIHRoaXMucGhhc2UgPSBwcmV2UGhhc2U7XG5cbiAgICAgICAgcmV0dXJuIHJvbGUuc3RhdGVTbmFwc2hvdDtcbiAgICB9XG5cbiAgICBhc3luYyBfdXNlUm9sZSAocm9sZSwgY2FsbHNpdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT09IFBIQVNFLmluUm9sZUluaXRpYWxpemVyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJvbGVTd2l0Y2hJblJvbGVJbml0aWFsaXplckVycm9yKGNhbGxzaXRlKTtcblxuICAgICAgICBjb25zdCBib29rbWFyayA9IG5ldyBUZXN0UnVuQm9va21hcmsodGhpcywgcm9sZSk7XG5cbiAgICAgICAgYXdhaXQgYm9va21hcmsuaW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb2xlSWQpXG4gICAgICAgICAgICB0aGlzLnVzZWRSb2xlU3RhdGVzW3RoaXMuY3VycmVudFJvbGVJZF0gPSBhd2FpdCB0aGlzLmdldFN0YXRlU25hcHNob3QoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZVNuYXBzaG90ID0gdGhpcy51c2VkUm9sZVN0YXRlc1tyb2xlLmlkXSB8fCBhd2FpdCB0aGlzLl9nZXRTdGF0ZVNuYXBzaG90RnJvbVJvbGUocm9sZSk7XG5cbiAgICAgICAgdGhpcy5zZXNzaW9uLnVzZVN0YXRlU25hcHNob3Qoc3RhdGVTbmFwc2hvdCk7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50Um9sZUlkID0gcm9sZS5pZDtcblxuICAgICAgICBhd2FpdCBib29rbWFyay5yZXN0b3JlKGNhbGxzaXRlLCBzdGF0ZVNuYXBzaG90KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgY3VycmVudCBVUkxcbiAgICBhc3luYyBnZXRDdXJyZW50VXJsICgpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfSwgeyBib3VuZFRlc3RSdW46IHRoaXMgfSk7XG5cbiAgICAgICAgY29uc3QgZ2V0TG9jYXRpb24gPSBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGdldExvY2F0aW9uKCk7XG4gICAgfVxuXG4gICAgX2Rpc2Nvbm5lY3QgKGVycikge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudERyaXZlclRhc2spXG4gICAgICAgICAgICB0aGlzLl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayhlcnIpO1xuXG4gICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcblxuICAgICAgICBkZWxldGUgdGVzdFJ1blRyYWNrZXIuYWN0aXZlVGVzdFJ1bnNbdGhpcy5zZXNzaW9uLmlkXTtcbiAgICB9XG5cbiAgICBhc3luYyBlbWl0QWN0aW9uRXZlbnQgKGV2ZW50TmFtZSwgYXJncykge1xuICAgICAgICBpZiAoIXRoaXMucHJldmVudEVtaXRBY3Rpb25FdmVudHMpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoZXZlbnROYW1lLCBhcmdzKTtcbiAgICB9XG59XG5cbi8vIFNlcnZpY2UgbWVzc2FnZSBoYW5kbGVyc1xuY29uc3QgU2VydmljZU1lc3NhZ2VzID0gVGVzdFJ1bi5wcm90b3R5cGU7XG5cbi8vIE5PVEU6IHRoaXMgZnVuY3Rpb24gaXMgdGltZS1jcml0aWNhbCBhbmQgbXVzdCByZXR1cm4gQVNBUCB0byBhdm9pZCBjbGllbnQgZGlzY29ubmVjdGlvblxuU2VydmljZU1lc3NhZ2VzW0NMSUVOVF9NRVNTQUdFUy5yZWFkeV0gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgdGhpcy5kZWJ1Z0xvZy5kcml2ZXJNZXNzYWdlKG1zZyk7XG5cbiAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuXG4gICAgdGhpcy5fY2xlYXJQZW5kaW5nUmVxdWVzdCgpO1xuXG4gICAgLy8gTk9URTogdGhlIGRyaXZlciBzZW5kcyB0aGUgc3RhdHVzIGZvciB0aGUgc2Vjb25kIHRpbWUgaWYgaXQgZGlkbid0IGdldCBhIHJlc3BvbnNlIGF0IHRoZVxuICAgIC8vIGZpcnN0IHRyeS4gVGhpcyBpcyBwb3NzaWJsZSB3aGVuIHRoZSBwYWdlIHdhcyB1bmxvYWRlZCBhZnRlciB0aGUgZHJpdmVyIHNlbnQgdGhlIHN0YXR1cy5cbiAgICBpZiAobXNnLnN0YXR1cy5pZCA9PT0gdGhpcy5sYXN0RHJpdmVyU3RhdHVzSWQpXG4gICAgICAgIHJldHVybiB0aGlzLmxhc3REcml2ZXJTdGF0dXNSZXNwb25zZTtcblxuICAgIHRoaXMubGFzdERyaXZlclN0YXR1c0lkICAgICAgID0gbXNnLnN0YXR1cy5pZDtcbiAgICB0aGlzLmxhc3REcml2ZXJTdGF0dXNSZXNwb25zZSA9IHRoaXMuX2hhbmRsZURyaXZlclJlcXVlc3QobXNnLnN0YXR1cyk7XG5cbiAgICBpZiAodGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UgfHwgbXNnLnN0YXR1cy5pc1BlbmRpbmdXaW5kb3dTd2l0Y2hpbmcpXG4gICAgICAgIHJldHVybiB0aGlzLmxhc3REcml2ZXJTdGF0dXNSZXNwb25zZTtcblxuICAgIC8vIE5PVEU6IHdlIHNlbmQgYW4gZW1wdHkgcmVzcG9uc2UgYWZ0ZXIgdGhlIE1BWF9SRVNQT05TRV9ERUxBWSB0aW1lb3V0IGlzIGV4Y2VlZGVkIHRvIGtlZXAgY29ubmVjdGlvblxuICAgIC8vIHdpdGggdGhlIGNsaWVudCBhbmQgcHJldmVudCB0aGUgcmVzcG9uc2UgdGltZW91dCBleGNlcHRpb24gb24gdGhlIGNsaWVudCBzaWRlXG4gICAgY29uc3QgcmVzcG9uc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLl9yZXNvbHZlUGVuZGluZ1JlcXVlc3QobnVsbCksIE1BWF9SRVNQT05TRV9ERUxBWSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0ID0geyByZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlVGltZW91dCB9O1xuICAgIH0pO1xufTtcblxuU2VydmljZU1lc3NhZ2VzW0NMSUVOVF9NRVNTQUdFUy5yZWFkeUZvckJyb3dzZXJNYW5pcHVsYXRpb25dID0gYXN5bmMgZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMuZGVidWdMb2cuZHJpdmVyTWVzc2FnZShtc2cpO1xuXG4gICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgbGV0IGVycm9yICA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZS5leGVjdXRlUGVuZGluZ01hbmlwdWxhdGlvbihtc2cpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGVycm9yID0gZXJyO1xuICAgIH1cblxuICAgIHJldHVybiB7IHJlc3VsdCwgZXJyb3IgfTtcbn07XG5cblNlcnZpY2VNZXNzYWdlc1tDTElFTlRfTUVTU0FHRVMud2FpdEZvckZpbGVEb3dubG9hZF0gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgdGhpcy5kZWJ1Z0xvZy5kcml2ZXJNZXNzYWdlKG1zZyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmZpbGVEb3dubG9hZGluZ0hhbmRsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZURvd25sb2FkaW5nSGFuZGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSA9IHJlc29sdmU7XG4gICAgfSk7XG59O1xuIl19