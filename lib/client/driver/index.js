// NOTE: We should have the capability to initialize scripts with different contexts.
// This is required for iframes without the src attribute because Hammerhead does not
// inject scripts into such iframes. So, we wrap all scripts in initialization functions.
(function () {
    function initTestCafeClientDrivers(window, isIFrameWithoutSrc) {
        var document = window.document;

        (function (hammerhead, testCafeCore, testcafeAutomation, testcafeUi) {
    var hammerhead__default = 'default' in hammerhead ? hammerhead['default'] : hammerhead;
    var testCafeCore__default = 'default' in testCafeCore ? testCafeCore['default'] : testCafeCore;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var HEARTBEAT_TIMEOUT = 2 * 60 * 1000;
    var CHECK_IFRAME_DRIVER_LINK_DELAY = 500;
    var CHECK_CHILD_WINDOW_DRIVER_LINK_DELAY = 500;
    var SEND_STATUS_REQUEST_TIME_LIMIT = 5000;
    var SEND_STATUS_REQUEST_RETRY_DELAY = 300;
    var SEND_STATUS_REQUEST_RETRY_COUNT = Math.floor(HEARTBEAT_TIMEOUT / SEND_STATUS_REQUEST_RETRY_DELAY - 1);
    var CHECK_STATUS_RETRY_DELAY = 1000;

    var TEST_RUN_MESSAGES = {
        ready: 'ready',
        readyForBrowserManipulation: 'ready-for-browser-manipulation',
        waitForFileDownload: 'wait-for-file-download'
    };

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var COMMAND_TYPE = {
        click: 'click',
        rightClick: 'right-click',
        doubleClick: 'double-click',
        drag: 'drag',
        dragToElement: 'drag-to-element',
        hover: 'hover',
        typeText: 'type-text',
        selectText: 'select-text',
        selectTextAreaContent: 'select-text-area-content',
        selectEditableContent: 'select-editable-content',
        pressKey: 'press-key',
        wait: 'wait',
        navigateTo: 'navigate-to',
        setFilesToUpload: 'set-files-to-upload',
        clearUpload: 'clear-upload',
        executeClientFunction: 'execute-client-function',
        executeSelector: 'execute-selector',
        takeScreenshot: 'take-screenshot',
        takeElementScreenshot: 'take-element-screenshot',
        takeScreenshotOnFail: 'take-screenshot-on-fail',
        prepareBrowserManipulation: 'prepare-browser-manipulation',
        showAssertionRetriesStatus: 'show-assertion-retries-status',
        hideAssertionRetriesStatus: 'hide-assertion-retries-status',
        setBreakpoint: 'set-breakpoint',
        resizeWindow: 'resize-window',
        resizeWindowToFitDevice: 'resize-window-to-fit-device',
        maximizeWindow: 'maximize-window',
        switchToIframe: 'switch-to-iframe',
        switchToMainWindow: 'switch-to-main-window',
        setNativeDialogHandler: 'set-native-dialog-handler',
        getNativeDialogHistory: 'get-native-dialog-history',
        getBrowserConsoleMessages: 'get-browser-console-messages',
        setTestSpeed: 'set-test-speed',
        setPageLoadTimeout: 'set-page-load-timeout',
        debug: 'debug',
        assertion: 'assertion',
        useRole: 'useRole',
        testDone: 'test-done',
        backupStorages: 'backup-storages',
        executeExpression: 'execute-expression',
        executeAsyncExpression: 'execute-async-expression',
        unlockPage: 'unlock-page',
        recorder: 'recorder'
    };

    // -------------------------------------------------------------
    function isCommandRejectableByPageError(command) {
        return !isObservationCommand(command) && !isBrowserManipulationCommand(command) && !isServiceCommand(command) ||
            isResizeWindowCommand(command)
                && !isWindowSwitchingCommand(command);
    }
    function isClientFunctionCommand(command) {
        return command.type === COMMAND_TYPE.executeClientFunction ||
            command.type === COMMAND_TYPE.executeSelector;
    }
    function isObservationCommand(command) {
        return isClientFunctionCommand(command) ||
            command.type === COMMAND_TYPE.wait ||
            command.type === COMMAND_TYPE.assertion ||
            command.type === COMMAND_TYPE.executeExpression;
    }
    function isWindowSwitchingCommand(command) {
        return command.type === COMMAND_TYPE.switchToIframe || command.type === COMMAND_TYPE.switchToMainWindow;
    }
    function isScreenshotCommand(command) {
        return command.type === COMMAND_TYPE.takeScreenshot ||
            command.type === COMMAND_TYPE.takeElementScreenshot ||
            command.type === COMMAND_TYPE.takeScreenshotOnFail;
    }
    function isResizeWindowCommand(command) {
        return command.type === COMMAND_TYPE.resizeWindow ||
            command.type === COMMAND_TYPE.resizeWindowToFitDevice ||
            command.type === COMMAND_TYPE.maximizeWindow;
    }
    function isBrowserManipulationCommand(command) {
        return isScreenshotCommand(command) || isResizeWindowCommand(command);
    }
    function isServiceCommand(command) {
        return command.type === COMMAND_TYPE.testDone ||
            command.type === COMMAND_TYPE.showAssertionRetriesStatus ||
            command.type === COMMAND_TYPE.hideAssertionRetriesStatus ||
            command.type === COMMAND_TYPE.setBreakpoint ||
            command.type === COMMAND_TYPE.takeScreenshotOnFail ||
            command.type === COMMAND_TYPE.recorder;
    }
    function isExecutableInTopWindowOnly(command) {
        return command.type === COMMAND_TYPE.testDone ||
            command.type === COMMAND_TYPE.switchToMainWindow ||
            command.type === COMMAND_TYPE.setNativeDialogHandler ||
            command.type === COMMAND_TYPE.getNativeDialogHistory ||
            command.type === COMMAND_TYPE.setTestSpeed ||
            command.type === COMMAND_TYPE.showAssertionRetriesStatus ||
            command.type === COMMAND_TYPE.hideAssertionRetriesStatus ||
            command.type === COMMAND_TYPE.setBreakpoint ||
            isBrowserManipulationCommand(command) && command.type !== COMMAND_TYPE.takeElementScreenshot;
    }

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var TEST_RUN_ERRORS = {
        uncaughtErrorOnPage: 'E1',
        uncaughtErrorInTestCode: 'E2',
        uncaughtNonErrorObjectInTestCode: 'E3',
        uncaughtErrorInClientFunctionCode: 'E4',
        uncaughtErrorInCustomDOMPropertyCode: 'E5',
        unhandledPromiseRejection: 'E6',
        uncaughtException: 'E7',
        missingAwaitError: 'E8',
        actionIntegerOptionError: 'E9',
        actionPositiveIntegerOptionError: 'E10',
        actionBooleanOptionError: 'E11',
        actionSpeedOptionError: 'E12',
        actionOptionsTypeError: 'E14',
        actionBooleanArgumentError: 'E15',
        actionStringArgumentError: 'E16',
        actionNullableStringArgumentError: 'E17',
        actionStringOrStringArrayArgumentError: 'E18',
        actionStringArrayElementError: 'E19',
        actionIntegerArgumentError: 'E20',
        actionRoleArgumentError: 'E21',
        actionPositiveIntegerArgumentError: 'E22',
        actionSelectorError: 'E23',
        actionElementNotFoundError: 'E24',
        actionElementIsInvisibleError: 'E26',
        actionSelectorMatchesWrongNodeTypeError: 'E27',
        actionAdditionalElementNotFoundError: 'E28',
        actionAdditionalElementIsInvisibleError: 'E29',
        actionAdditionalSelectorMatchesWrongNodeTypeError: 'E30',
        actionElementNonEditableError: 'E31',
        actionElementNotTextAreaError: 'E32',
        actionElementNonContentEditableError: 'E33',
        actionElementIsNotFileInputError: 'E34',
        actionRootContainerNotFoundError: 'E35',
        actionIncorrectKeysError: 'E36',
        actionCannotFindFileToUploadError: 'E37',
        actionUnsupportedDeviceTypeError: 'E38',
        actionIframeIsNotLoadedError: 'E39',
        actionElementNotIframeError: 'E40',
        actionInvalidScrollTargetError: 'E41',
        currentIframeIsNotLoadedError: 'E42',
        currentIframeNotFoundError: 'E43',
        currentIframeIsInvisibleError: 'E44',
        nativeDialogNotHandledError: 'E45',
        uncaughtErrorInNativeDialogHandler: 'E46',
        setTestSpeedArgumentError: 'E47',
        setNativeDialogHandlerCodeWrongTypeError: 'E48',
        clientFunctionExecutionInterruptionError: 'E49',
        domNodeClientFunctionResultError: 'E50',
        invalidSelectorResultError: 'E51',
        cannotObtainInfoForElementSpecifiedBySelectorError: 'E52',
        externalAssertionLibraryError: 'E53',
        pageLoadError: 'E54',
        windowDimensionsOverflowError: 'E55',
        forbiddenCharactersInScreenshotPathError: 'E56',
        invalidElementScreenshotDimensionsError: 'E57',
        roleSwitchInRoleInitializerError: 'E58',
        assertionExecutableArgumentError: 'E59',
        assertionWithoutMethodCallError: 'E60',
        assertionUnawaitedPromiseError: 'E61',
        requestHookNotImplementedError: 'E62',
        requestHookUnhandledError: 'E63',
        uncaughtErrorInCustomClientScriptCode: 'E64',
        uncaughtErrorInCustomClientScriptCodeLoadedFromModule: 'E65',
        uncaughtErrorInCustomScript: 'E66',
        uncaughtTestCafeErrorInCustomScript: 'E67',
        childWindowIsNotLoadedError: 'E68',
        childWindowNotFoundError: 'E69',
        cannotSwitchToWindowError: 'E70',
        closeChildWindowError: 'E71',
        childWindowClosedBeforeSwitchingError: 'E72'
    };

    // Base
    //--------------------------------------------------------------------
    var TestRunErrorBase = /** @class */ (function () {
        function TestRunErrorBase(code) {
            this.code = code;
            this.isTestCafeError = true;
            this.callsite = null;
        }
        return TestRunErrorBase;
    }());
    var ActionOptionErrorBase = /** @class */ (function (_super) {
        __extends(ActionOptionErrorBase, _super);
        function ActionOptionErrorBase(code, optionName, actualValue) {
            var _this = _super.call(this, code) || this;
            _this.optionName = optionName;
            _this.actualValue = actualValue;
            return _this;
        }
        return ActionOptionErrorBase;
    }(TestRunErrorBase));
    var ActionArgumentErrorBase = /** @class */ (function (_super) {
        __extends(ActionArgumentErrorBase, _super);
        function ActionArgumentErrorBase(code, argumentName, actualValue) {
            var _this = _super.call(this, code) || this;
            _this.argumentName = argumentName;
            _this.actualValue = actualValue;
            return _this;
        }
        return ActionArgumentErrorBase;
    }(TestRunErrorBase));
    // Synchronization errors
    //--------------------------------------------------------------------
    var MissingAwaitError = /** @class */ (function (_super) {
        __extends(MissingAwaitError, _super);
        function MissingAwaitError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.missingAwaitError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return MissingAwaitError;
    }(TestRunErrorBase));
    // Client function errors
    //--------------------------------------------------------------------
    var ClientFunctionExecutionInterruptionError = /** @class */ (function (_super) {
        __extends(ClientFunctionExecutionInterruptionError, _super);
        function ClientFunctionExecutionInterruptionError(instantiationCallsiteName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError) || this;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return ClientFunctionExecutionInterruptionError;
    }(TestRunErrorBase));
    var DomNodeClientFunctionResultError = /** @class */ (function (_super) {
        __extends(DomNodeClientFunctionResultError, _super);
        function DomNodeClientFunctionResultError(instantiationCallsiteName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.domNodeClientFunctionResultError) || this;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return DomNodeClientFunctionResultError;
    }(TestRunErrorBase));
    // Selector errors
    //--------------------------------------------------------------------
    var SelectorErrorBase = /** @class */ (function (_super) {
        __extends(SelectorErrorBase, _super);
        function SelectorErrorBase(code, _a) {
            var apiFnChain = _a.apiFnChain, apiFnIndex = _a.apiFnIndex;
            var _this = _super.call(this, code) || this;
            _this.apiFnChain = apiFnChain;
            _this.apiFnIndex = apiFnIndex;
            return _this;
        }
        return SelectorErrorBase;
    }(TestRunErrorBase));
    var InvalidSelectorResultError = /** @class */ (function (_super) {
        __extends(InvalidSelectorResultError, _super);
        function InvalidSelectorResultError() {
            return _super.call(this, TEST_RUN_ERRORS.invalidSelectorResultError) || this;
        }
        return InvalidSelectorResultError;
    }(TestRunErrorBase));
    var CannotObtainInfoForElementSpecifiedBySelectorError = /** @class */ (function (_super) {
        __extends(CannotObtainInfoForElementSpecifiedBySelectorError, _super);
        function CannotObtainInfoForElementSpecifiedBySelectorError(callsite, apiFnArgs) {
            var _this = _super.call(this, TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError, apiFnArgs) || this;
            _this.callsite = callsite;
            return _this;
        }
        return CannotObtainInfoForElementSpecifiedBySelectorError;
    }(SelectorErrorBase));
    // Page errors
    //--------------------------------------------------------------------
    var PageLoadError = /** @class */ (function (_super) {
        __extends(PageLoadError, _super);
        function PageLoadError(errMsg, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.pageLoadError) || this;
            _this.url = url;
            _this.errMsg = errMsg;
            return _this;
        }
        return PageLoadError;
    }(TestRunErrorBase));
    // Uncaught errors
    //--------------------------------------------------------------------
    var UncaughtErrorOnPage = /** @class */ (function (_super) {
        __extends(UncaughtErrorOnPage, _super);
        function UncaughtErrorOnPage(errStack, pageDestUrl) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorOnPage) || this;
            _this.errStack = errStack;
            _this.pageDestUrl = pageDestUrl;
            return _this;
        }
        return UncaughtErrorOnPage;
    }(TestRunErrorBase));
    var UncaughtErrorInTestCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInTestCode, _super);
        function UncaughtErrorInTestCode(err, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInTestCode) || this;
            _this.errMsg = String(err.rawMessage || err);
            _this.callsite = err.callsite || callsite;
            _this.originError = err;
            return _this;
        }
        return UncaughtErrorInTestCode;
    }(TestRunErrorBase));
    var UncaughtNonErrorObjectInTestCode = /** @class */ (function (_super) {
        __extends(UncaughtNonErrorObjectInTestCode, _super);
        function UncaughtNonErrorObjectInTestCode(obj) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode) || this;
            _this.objType = typeof obj;
            _this.objStr = String(obj);
            return _this;
        }
        return UncaughtNonErrorObjectInTestCode;
    }(TestRunErrorBase));
    var UncaughtErrorInClientFunctionCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInClientFunctionCode, _super);
        function UncaughtErrorInClientFunctionCode(instantiationCallsiteName, err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode) || this;
            _this.errMsg = String(err);
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return UncaughtErrorInClientFunctionCode;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomDOMPropertyCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomDOMPropertyCode, _super);
        function UncaughtErrorInCustomDOMPropertyCode(instantiationCallsiteName, err, prop) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode, err, prop) || this;
            _this.errMsg = String(err);
            _this.property = prop;
            _this.instantiationCallsiteName = instantiationCallsiteName;
            return _this;
        }
        return UncaughtErrorInCustomDOMPropertyCode;
    }(TestRunErrorBase));
    var UnhandledPromiseRejectionError = /** @class */ (function (_super) {
        __extends(UnhandledPromiseRejectionError, _super);
        function UnhandledPromiseRejectionError(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.unhandledPromiseRejection) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UnhandledPromiseRejectionError;
    }(TestRunErrorBase));
    var UncaughtExceptionError = /** @class */ (function (_super) {
        __extends(UncaughtExceptionError, _super);
        function UncaughtExceptionError(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtException) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UncaughtExceptionError;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomClientScriptCode = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomClientScriptCode, _super);
        function UncaughtErrorInCustomClientScriptCode(err) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCode) || this;
            _this.errMsg = String(err);
            return _this;
        }
        return UncaughtErrorInCustomClientScriptCode;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomClientScriptLoadedFromModule = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomClientScriptLoadedFromModule, _super);
        function UncaughtErrorInCustomClientScriptLoadedFromModule(err, moduleName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCodeLoadedFromModule) || this;
            _this.errMsg = String(err);
            _this.moduleName = moduleName;
            return _this;
        }
        return UncaughtErrorInCustomClientScriptLoadedFromModule;
    }(TestRunErrorBase));
    // Assertion errors
    //--------------------------------------------------------------------
    var ExternalAssertionLibraryError = /** @class */ (function (_super) {
        __extends(ExternalAssertionLibraryError, _super);
        function ExternalAssertionLibraryError(err, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.externalAssertionLibraryError) || this;
            _this.errMsg = String(err);
            _this.callsite = callsite;
            return _this;
        }
        return ExternalAssertionLibraryError;
    }(TestRunErrorBase));
    var AssertionExecutableArgumentError = /** @class */ (function (_super) {
        __extends(AssertionExecutableArgumentError, _super);
        function AssertionExecutableArgumentError(argumentName, argumentValue, err, isAPIError) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionExecutableArgumentError, argumentName, argumentValue) || this;
            _this.errMsg = isAPIError ? err.rawMessage : err.message;
            _this.originError = err;
            return _this;
        }
        return AssertionExecutableArgumentError;
    }(ActionArgumentErrorBase));
    var AssertionWithoutMethodCallError = /** @class */ (function (_super) {
        __extends(AssertionWithoutMethodCallError, _super);
        function AssertionWithoutMethodCallError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionWithoutMethodCallError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return AssertionWithoutMethodCallError;
    }(TestRunErrorBase));
    var AssertionUnawaitedPromiseError = /** @class */ (function (_super) {
        __extends(AssertionUnawaitedPromiseError, _super);
        function AssertionUnawaitedPromiseError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.assertionUnawaitedPromiseError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return AssertionUnawaitedPromiseError;
    }(TestRunErrorBase));
    // Action parameters errors
    //--------------------------------------------------------------------
    // Options errors
    var ActionIntegerOptionError = /** @class */ (function (_super) {
        __extends(ActionIntegerOptionError, _super);
        function ActionIntegerOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionIntegerOptionError, optionName, actualValue) || this;
        }
        return ActionIntegerOptionError;
    }(ActionOptionErrorBase));
    var ActionPositiveIntegerOptionError = /** @class */ (function (_super) {
        __extends(ActionPositiveIntegerOptionError, _super);
        function ActionPositiveIntegerOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionPositiveIntegerOptionError, optionName, actualValue) || this;
        }
        return ActionPositiveIntegerOptionError;
    }(ActionOptionErrorBase));
    var ActionBooleanOptionError = /** @class */ (function (_super) {
        __extends(ActionBooleanOptionError, _super);
        function ActionBooleanOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionBooleanOptionError, optionName, actualValue) || this;
        }
        return ActionBooleanOptionError;
    }(ActionOptionErrorBase));
    var ActionBooleanArgumentError = /** @class */ (function (_super) {
        __extends(ActionBooleanArgumentError, _super);
        function ActionBooleanArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionBooleanArgumentError, argumentName, actualValue) || this;
        }
        return ActionBooleanArgumentError;
    }(ActionArgumentErrorBase));
    var ActionSpeedOptionError = /** @class */ (function (_super) {
        __extends(ActionSpeedOptionError, _super);
        function ActionSpeedOptionError(optionName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionSpeedOptionError, optionName, actualValue) || this;
        }
        return ActionSpeedOptionError;
    }(ActionOptionErrorBase));
    var ActionOptionsTypeError = /** @class */ (function (_super) {
        __extends(ActionOptionsTypeError, _super);
        function ActionOptionsTypeError(actualType) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionOptionsTypeError) || this;
            _this.actualType = actualType;
            return _this;
        }
        return ActionOptionsTypeError;
    }(TestRunErrorBase));
    // Arguments errors
    var ActionStringArgumentError = /** @class */ (function (_super) {
        __extends(ActionStringArgumentError, _super);
        function ActionStringArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionStringArgumentError, argumentName, actualValue) || this;
        }
        return ActionStringArgumentError;
    }(ActionArgumentErrorBase));
    var ActionNullableStringArgumentError = /** @class */ (function (_super) {
        __extends(ActionNullableStringArgumentError, _super);
        function ActionNullableStringArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionNullableStringArgumentError, argumentName, actualValue) || this;
        }
        return ActionNullableStringArgumentError;
    }(ActionArgumentErrorBase));
    var ActionIntegerArgumentError = /** @class */ (function (_super) {
        __extends(ActionIntegerArgumentError, _super);
        function ActionIntegerArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionIntegerArgumentError, argumentName, actualValue) || this;
        }
        return ActionIntegerArgumentError;
    }(ActionArgumentErrorBase));
    var ActionRoleArgumentError = /** @class */ (function (_super) {
        __extends(ActionRoleArgumentError, _super);
        function ActionRoleArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionRoleArgumentError, argumentName, actualValue) || this;
        }
        return ActionRoleArgumentError;
    }(ActionArgumentErrorBase));
    var ActionPositiveIntegerArgumentError = /** @class */ (function (_super) {
        __extends(ActionPositiveIntegerArgumentError, _super);
        function ActionPositiveIntegerArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionPositiveIntegerArgumentError, argumentName, actualValue) || this;
        }
        return ActionPositiveIntegerArgumentError;
    }(ActionArgumentErrorBase));
    var ActionStringOrStringArrayArgumentError = /** @class */ (function (_super) {
        __extends(ActionStringOrStringArrayArgumentError, _super);
        function ActionStringOrStringArrayArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError, argumentName, actualValue) || this;
        }
        return ActionStringOrStringArrayArgumentError;
    }(ActionArgumentErrorBase));
    var ActionStringArrayElementError = /** @class */ (function (_super) {
        __extends(ActionStringArrayElementError, _super);
        function ActionStringArrayElementError(argumentName, actualValue, elementIndex) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionStringArrayElementError, argumentName, actualValue) || this;
            _this.elementIndex = elementIndex;
            return _this;
        }
        return ActionStringArrayElementError;
    }(ActionArgumentErrorBase));
    var SetTestSpeedArgumentError = /** @class */ (function (_super) {
        __extends(SetTestSpeedArgumentError, _super);
        function SetTestSpeedArgumentError(argumentName, actualValue) {
            return _super.call(this, TEST_RUN_ERRORS.setTestSpeedArgumentError, argumentName, actualValue) || this;
        }
        return SetTestSpeedArgumentError;
    }(ActionArgumentErrorBase));
    var ActionUnsupportedDeviceTypeError = /** @class */ (function (_super) {
        __extends(ActionUnsupportedDeviceTypeError, _super);
        function ActionUnsupportedDeviceTypeError(argumentName, argumentValue) {
            return _super.call(this, TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError, argumentName, argumentValue) || this;
        }
        return ActionUnsupportedDeviceTypeError;
    }(ActionArgumentErrorBase));
    // Selector errors
    var ActionSelectorError = /** @class */ (function (_super) {
        __extends(ActionSelectorError, _super);
        function ActionSelectorError(selectorName, err, isAPIError) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionSelectorError) || this;
            _this.selectorName = selectorName;
            _this.errMsg = isAPIError ? err.rawMessage : err.message;
            _this.originError = err;
            return _this;
        }
        return ActionSelectorError;
    }(TestRunErrorBase));
    // Action execution errors
    //--------------------------------------------------------------------
    var ActionElementNotFoundError = /** @class */ (function (_super) {
        __extends(ActionElementNotFoundError, _super);
        function ActionElementNotFoundError(apiFnArgs) {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotFoundError, apiFnArgs) || this;
        }
        return ActionElementNotFoundError;
    }(SelectorErrorBase));
    var ActionElementIsInvisibleError = /** @class */ (function (_super) {
        __extends(ActionElementIsInvisibleError, _super);
        function ActionElementIsInvisibleError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementIsInvisibleError) || this;
        }
        return ActionElementIsInvisibleError;
    }(TestRunErrorBase));
    var ActionSelectorMatchesWrongNodeTypeError = /** @class */ (function (_super) {
        __extends(ActionSelectorMatchesWrongNodeTypeError, _super);
        function ActionSelectorMatchesWrongNodeTypeError(nodeDescription) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError) || this;
            _this.nodeDescription = nodeDescription;
            return _this;
        }
        return ActionSelectorMatchesWrongNodeTypeError;
    }(TestRunErrorBase));
    var ActionAdditionalElementNotFoundError = /** @class */ (function (_super) {
        __extends(ActionAdditionalElementNotFoundError, _super);
        function ActionAdditionalElementNotFoundError(argumentName, apiFnArgs) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalElementNotFoundError, apiFnArgs) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionAdditionalElementNotFoundError;
    }(SelectorErrorBase));
    var ActionAdditionalElementIsInvisibleError = /** @class */ (function (_super) {
        __extends(ActionAdditionalElementIsInvisibleError, _super);
        function ActionAdditionalElementIsInvisibleError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionAdditionalElementIsInvisibleError;
    }(TestRunErrorBase));
    var ActionAdditionalSelectorMatchesWrongNodeTypeError = /** @class */ (function (_super) {
        __extends(ActionAdditionalSelectorMatchesWrongNodeTypeError, _super);
        function ActionAdditionalSelectorMatchesWrongNodeTypeError(argumentName, nodeDescription) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError) || this;
            _this.argumentName = argumentName;
            _this.nodeDescription = nodeDescription;
            return _this;
        }
        return ActionAdditionalSelectorMatchesWrongNodeTypeError;
    }(TestRunErrorBase));
    var ActionElementNonEditableError = /** @class */ (function (_super) {
        __extends(ActionElementNonEditableError, _super);
        function ActionElementNonEditableError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNonEditableError) || this;
        }
        return ActionElementNonEditableError;
    }(TestRunErrorBase));
    var ActionElementNotTextAreaError = /** @class */ (function (_super) {
        __extends(ActionElementNotTextAreaError, _super);
        function ActionElementNotTextAreaError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotTextAreaError) || this;
        }
        return ActionElementNotTextAreaError;
    }(TestRunErrorBase));
    var ActionElementNonContentEditableError = /** @class */ (function (_super) {
        __extends(ActionElementNonContentEditableError, _super);
        function ActionElementNonContentEditableError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionElementNonContentEditableError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionElementNonContentEditableError;
    }(TestRunErrorBase));
    var ActionRootContainerNotFoundError = /** @class */ (function (_super) {
        __extends(ActionRootContainerNotFoundError, _super);
        function ActionRootContainerNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.actionRootContainerNotFoundError) || this;
        }
        return ActionRootContainerNotFoundError;
    }(TestRunErrorBase));
    var ActionIncorrectKeysError = /** @class */ (function (_super) {
        __extends(ActionIncorrectKeysError, _super);
        function ActionIncorrectKeysError(argumentName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionIncorrectKeysError) || this;
            _this.argumentName = argumentName;
            return _this;
        }
        return ActionIncorrectKeysError;
    }(TestRunErrorBase));
    var ActionCannotFindFileToUploadError = /** @class */ (function (_super) {
        __extends(ActionCannotFindFileToUploadError, _super);
        function ActionCannotFindFileToUploadError(filePaths, scannedFilePaths) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionCannotFindFileToUploadError) || this;
            _this.filePaths = filePaths;
            _this.scannedFilePaths = scannedFilePaths;
            return _this;
        }
        return ActionCannotFindFileToUploadError;
    }(TestRunErrorBase));
    var ActionElementIsNotFileInputError = /** @class */ (function (_super) {
        __extends(ActionElementIsNotFileInputError, _super);
        function ActionElementIsNotFileInputError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementIsNotFileInputError) || this;
        }
        return ActionElementIsNotFileInputError;
    }(TestRunErrorBase));
    var ActionInvalidScrollTargetError = /** @class */ (function (_super) {
        __extends(ActionInvalidScrollTargetError, _super);
        function ActionInvalidScrollTargetError(scrollTargetXValid, scrollTargetYValid) {
            var _this = _super.call(this, TEST_RUN_ERRORS.actionInvalidScrollTargetError) || this;
            if (!scrollTargetXValid) {
                if (!scrollTargetYValid)
                    _this.properties = 'scrollTargetX and scrollTargetY properties';
                else
                    _this.properties = 'scrollTargetX property';
            }
            else
                _this.properties = 'scrollTargetY property';
            return _this;
        }
        return ActionInvalidScrollTargetError;
    }(TestRunErrorBase));
    var UncaughtErrorInCustomScript = /** @class */ (function (_super) {
        __extends(UncaughtErrorInCustomScript, _super);
        function UncaughtErrorInCustomScript(err, expression, line, column, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInCustomScript) || this;
            _this.callsite = callsite;
            _this.expression = expression;
            _this.line = line;
            _this.column = column;
            _this.originError = err;
            _this.errMsg = err.message || String(err);
            return _this;
        }
        return UncaughtErrorInCustomScript;
    }(TestRunErrorBase));
    var UncaughtTestCafeErrorInCustomScript = /** @class */ (function (_super) {
        __extends(UncaughtTestCafeErrorInCustomScript, _super);
        function UncaughtTestCafeErrorInCustomScript(err, expression, line, column, callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtTestCafeErrorInCustomScript) || this;
            _this.callsite = callsite;
            _this.expression = expression;
            _this.line = line;
            _this.column = column;
            _this.originError = err;
            _this.errCallsite = err.callsite;
            return _this;
        }
        return UncaughtTestCafeErrorInCustomScript;
    }(TestRunErrorBase));
    var WindowDimensionsOverflowError = /** @class */ (function (_super) {
        __extends(WindowDimensionsOverflowError, _super);
        function WindowDimensionsOverflowError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.windowDimensionsOverflowError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return WindowDimensionsOverflowError;
    }(TestRunErrorBase));
    var InvalidElementScreenshotDimensionsError = /** @class */ (function (_super) {
        __extends(InvalidElementScreenshotDimensionsError, _super);
        function InvalidElementScreenshotDimensionsError(width, height) {
            var _this = _super.call(this, TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError) || this;
            var widthIsInvalid = width <= 0;
            var heightIsInvalid = height <= 0;
            if (widthIsInvalid) {
                if (heightIsInvalid) {
                    _this.verb = 'are';
                    _this.dimensions = 'width and height';
                }
                else {
                    _this.verb = 'is';
                    _this.dimensions = 'width';
                }
            }
            else {
                _this.verb = 'is';
                _this.dimensions = 'height';
            }
            return _this;
        }
        return InvalidElementScreenshotDimensionsError;
    }(TestRunErrorBase));
    var ForbiddenCharactersInScreenshotPathError = /** @class */ (function (_super) {
        __extends(ForbiddenCharactersInScreenshotPathError, _super);
        function ForbiddenCharactersInScreenshotPathError(screenshotPath, forbiddenCharsList) {
            var _this = _super.call(this, TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError) || this;
            _this.screenshotPath = screenshotPath;
            _this.forbiddenCharsList = forbiddenCharsList;
            return _this;
        }
        return ForbiddenCharactersInScreenshotPathError;
    }(TestRunErrorBase));
    var RoleSwitchInRoleInitializerError = /** @class */ (function (_super) {
        __extends(RoleSwitchInRoleInitializerError, _super);
        function RoleSwitchInRoleInitializerError(callsite) {
            var _this = _super.call(this, TEST_RUN_ERRORS.roleSwitchInRoleInitializerError) || this;
            _this.callsite = callsite;
            return _this;
        }
        return RoleSwitchInRoleInitializerError;
    }(TestRunErrorBase));
    // Iframe errors
    var ActionElementNotIframeError = /** @class */ (function (_super) {
        __extends(ActionElementNotIframeError, _super);
        function ActionElementNotIframeError() {
            return _super.call(this, TEST_RUN_ERRORS.actionElementNotIframeError) || this;
        }
        return ActionElementNotIframeError;
    }(TestRunErrorBase));
    var ActionIframeIsNotLoadedError = /** @class */ (function (_super) {
        __extends(ActionIframeIsNotLoadedError, _super);
        function ActionIframeIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.actionIframeIsNotLoadedError) || this;
        }
        return ActionIframeIsNotLoadedError;
    }(TestRunErrorBase));
    var CurrentIframeIsNotLoadedError = /** @class */ (function (_super) {
        __extends(CurrentIframeIsNotLoadedError, _super);
        function CurrentIframeIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeIsNotLoadedError) || this;
        }
        return CurrentIframeIsNotLoadedError;
    }(TestRunErrorBase));
    var ChildWindowNotFoundError = /** @class */ (function (_super) {
        __extends(ChildWindowNotFoundError, _super);
        function ChildWindowNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowNotFoundError) || this;
        }
        return ChildWindowNotFoundError;
    }(TestRunErrorBase));
    var ChildWindowIsNotLoadedError = /** @class */ (function (_super) {
        __extends(ChildWindowIsNotLoadedError, _super);
        function ChildWindowIsNotLoadedError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowIsNotLoadedError) || this;
        }
        return ChildWindowIsNotLoadedError;
    }(TestRunErrorBase));
    var CannotSwitchToWindowError = /** @class */ (function (_super) {
        __extends(CannotSwitchToWindowError, _super);
        function CannotSwitchToWindowError() {
            return _super.call(this, TEST_RUN_ERRORS.cannotSwitchToWindowError) || this;
        }
        return CannotSwitchToWindowError;
    }(TestRunErrorBase));
    var CloseChildWindowError = /** @class */ (function (_super) {
        __extends(CloseChildWindowError, _super);
        function CloseChildWindowError() {
            return _super.call(this, TEST_RUN_ERRORS.closeChildWindowError) || this;
        }
        return CloseChildWindowError;
    }(TestRunErrorBase));
    var CurrentIframeNotFoundError = /** @class */ (function (_super) {
        __extends(CurrentIframeNotFoundError, _super);
        function CurrentIframeNotFoundError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeNotFoundError) || this;
        }
        return CurrentIframeNotFoundError;
    }(TestRunErrorBase));
    var CurrentIframeIsInvisibleError = /** @class */ (function (_super) {
        __extends(CurrentIframeIsInvisibleError, _super);
        function CurrentIframeIsInvisibleError() {
            return _super.call(this, TEST_RUN_ERRORS.currentIframeIsInvisibleError) || this;
        }
        return CurrentIframeIsInvisibleError;
    }(TestRunErrorBase));
    // Native dialog errors
    var NativeDialogNotHandledError = /** @class */ (function (_super) {
        __extends(NativeDialogNotHandledError, _super);
        function NativeDialogNotHandledError(dialogType, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.nativeDialogNotHandledError) || this;
            _this.dialogType = dialogType;
            _this.pageUrl = url;
            return _this;
        }
        return NativeDialogNotHandledError;
    }(TestRunErrorBase));
    var UncaughtErrorInNativeDialogHandler = /** @class */ (function (_super) {
        __extends(UncaughtErrorInNativeDialogHandler, _super);
        function UncaughtErrorInNativeDialogHandler(dialogType, errMsg, url) {
            var _this = _super.call(this, TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler) || this;
            _this.dialogType = dialogType;
            _this.errMsg = errMsg;
            _this.pageUrl = url;
            return _this;
        }
        return UncaughtErrorInNativeDialogHandler;
    }(TestRunErrorBase));
    var SetNativeDialogHandlerCodeWrongTypeError = /** @class */ (function (_super) {
        __extends(SetNativeDialogHandlerCodeWrongTypeError, _super);
        function SetNativeDialogHandlerCodeWrongTypeError(actualType) {
            var _this = _super.call(this, TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError) || this;
            _this.actualType = actualType;
            return _this;
        }
        return SetNativeDialogHandlerCodeWrongTypeError;
    }(TestRunErrorBase));
    var RequestHookUnhandledError = /** @class */ (function (_super) {
        __extends(RequestHookUnhandledError, _super);
        function RequestHookUnhandledError(err, hookClassName, methodName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.requestHookUnhandledError) || this;
            _this.errMsg = String(err);
            _this.hookClassName = hookClassName;
            _this.methodName = methodName;
            return _this;
        }
        return RequestHookUnhandledError;
    }(TestRunErrorBase));
    var RequestHookNotImplementedMethodError = /** @class */ (function (_super) {
        __extends(RequestHookNotImplementedMethodError, _super);
        function RequestHookNotImplementedMethodError(methodName, hookClassName) {
            var _this = _super.call(this, TEST_RUN_ERRORS.requestHookNotImplementedError) || this;
            _this.methodName = methodName;
            _this.hookClassName = hookClassName;
            return _this;
        }
        return RequestHookNotImplementedMethodError;
    }(TestRunErrorBase));
    var ChildWindowClosedBeforeSwitchingError = /** @class */ (function (_super) {
        __extends(ChildWindowClosedBeforeSwitchingError, _super);
        function ChildWindowClosedBeforeSwitchingError() {
            return _super.call(this, TEST_RUN_ERRORS.childWindowClosedBeforeSwitchingError) || this;
        }
        return ChildWindowClosedBeforeSwitchingError;
    }(TestRunErrorBase));

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var BrowserConsoleMessages = /** @class */ (function () {
        function BrowserConsoleMessages(data) {
            this.concat(data);
        }
        BrowserConsoleMessages.prototype.ensureMessageContainer = function (windowId) {
            if (this[windowId])
                return;
            this[windowId] = {
                log: [],
                info: [],
                warn: [],
                error: []
            };
        };
        BrowserConsoleMessages.prototype.concat = function (consoleMessages) {
            var _this = this;
            if (!consoleMessages)
                return this;
            Object.keys(consoleMessages).forEach(function (windowId) {
                _this.ensureMessageContainer(windowId);
                _this[windowId].log = _this[windowId].log.concat(consoleMessages[windowId].log);
                _this[windowId].info = _this[windowId].info.concat(consoleMessages[windowId].info);
                _this[windowId].warn = _this[windowId].warn.concat(consoleMessages[windowId].warn);
                _this[windowId].error = _this[windowId].error.concat(consoleMessages[windowId].error);
            });
            return this;
        };
        BrowserConsoleMessages.prototype.addMessage = function (type, msg, windowId) {
            this.ensureMessageContainer(windowId);
            this[windowId][type].push(msg);
        };
        BrowserConsoleMessages.prototype.getCopy = function () {
            var _this = this;
            var copy = {};
            Object.keys(this).forEach(function (windowId) {
                copy[windowId] = {
                    log: _this[windowId].log.slice(),
                    info: _this[windowId].info.slice(),
                    warn: _this[windowId].warn.slice(),
                    error: _this[windowId].error.slice()
                };
            });
            return copy;
        };
        return BrowserConsoleMessages;
    }());

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var Assignable = /** @class */ (function () {
        function Assignable() {
        }
        Assignable.prototype._getAssignableProperties = function () {
            throw new Error('Not implemented');
        };
        Assignable.prototype._assignFrom = function (obj, validate, initOptions) {
            if (initOptions === void 0) { initOptions = {}; }
            if (!obj)
                return;
            var props = this._getAssignableProperties();
            for (var i = 0; i < props.length; i++) {
                var _a = props[i], name_1 = _a.name, type = _a.type, required = _a.required, init = _a.init, defaultValue = _a.defaultValue;
                var path = name_1.split('.');
                var lastIdx = path.length - 1;
                var last = path[lastIdx];
                var srcObj = obj;
                var destObj = this;
                for (var j = 0; j < lastIdx && srcObj && destObj; j++) {
                    srcObj = srcObj[path[j]];
                    destObj = destObj[path[j]];
                }
                if (destObj && 'defaultValue' in props[i])
                    destObj[name_1] = defaultValue;
                if (srcObj && destObj) {
                    var srcVal = srcObj[last];
                    if (srcVal !== void 0 || required) {
                        if (validate && type)
                            type(name_1, srcVal);
                        destObj[last] = init ? init(name_1, srcVal, initOptions) : srcVal;
                    }
                }
            }
        };
        return Assignable;
    }());

    function generateId () {
        return hammerhead.nativeMethods.performanceNow().toString();
    }

    var DriverStatus = /** @class */ (function (_super) {
        __extends(DriverStatus, _super);
        function DriverStatus(obj) {
            var _this = _super.call(this, obj) || this;
            _this.id = generateId();
            _this.isCommandResult = false;
            _this.executionError = null;
            _this.pageError = null;
            _this.resent = false;
            _this.result = null;
            _this.consoleMessages = null;
            _this.isPendingWindowSwitching = false;
            _this.isFirstRequestAfterWindowSwitching = false;
            _this._assignFrom(obj, true);
            return _this;
        }
        DriverStatus.prototype._getAssignableProperties = function () {
            return [
                { name: 'isCommandResult' },
                { name: 'executionError' },
                { name: 'pageError' },
                { name: 'result' },
                { name: 'consoleMessages' },
                { name: 'isPendingWindowSwitching' },
                { name: 'isFirstRequestAfterWindowSwitching' }
            ];
        };
        return DriverStatus;
    }(Assignable));

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var replicator = createCommonjsModule(function (module) {
    // Const
    var TRANSFORMED_TYPE_KEY    = '@t';
    var CIRCULAR_REF_KEY        = '@r';
    var KEY_REQUIRE_ESCAPING_RE = /^#*@(t|r)$/;

    var GLOBAL = (function getGlobal () {
        // NOTE: see http://www.ecma-international.org/ecma-262/6.0/index.html#sec-performeval step 10
        var savedEval = eval;

        return savedEval('this');
    })();

    var ARRAY_BUFFER_SUPPORTED = typeof ArrayBuffer === 'function';
    var MAP_SUPPORTED          = typeof Map === 'function';
    var SET_SUPPORTED          = typeof Set === 'function';

    var TYPED_ARRAY_CTORS = [
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array'
    ];


    // Saved proto functions
    var arrSlice = Array.prototype.slice;


    // Default serializer
    var JSONSerializer = {
        serialize: function (val) {
            return JSON.stringify(val);
        },

        deserialize: function (val) {
            return JSON.parse(val);
        }
    };


    // EncodingTransformer
    var EncodingTransformer = function (val, transforms) {
        this.references               = val;
        this.transforms               = transforms;
        this.circularCandidates       = [];
        this.circularCandidatesDescrs = [];
        this.circularRefCount         = 0;
    };

    EncodingTransformer._createRefMark = function (idx) {
        var obj = Object.create(null);

        obj[CIRCULAR_REF_KEY] = idx;

        return obj;
    };

    EncodingTransformer.prototype._createCircularCandidate = function (val, parent, key) {
        this.circularCandidates.push(val);
        this.circularCandidatesDescrs.push({ parent: parent, key: key, refIdx: -1 });
    };

    EncodingTransformer.prototype._applyTransform = function (val, parent, key, transform) {
        var result          = Object.create(null);
        var serializableVal = transform.toSerializable(val);

        if (typeof serializableVal === 'object')
            this._createCircularCandidate(val, parent, key);

        result[TRANSFORMED_TYPE_KEY] = transform.type;
        result.data                  = this._handleValue(serializableVal, parent, key);

        return result;
    };

    EncodingTransformer.prototype._handleArray = function (arr) {
        var result = [];

        for (var i = 0; i < arr.length; i++)
            result[i] = this._handleValue(arr[i], result, i);

        return result;
    };

    EncodingTransformer.prototype._handlePlainObject = function (obj) {
        var replicator       = this;
        var result           = Object.create(null);
        var ownPropertyNames = Object.getOwnPropertyNames(obj);

        ownPropertyNames.forEach(function (key) {
            var resultKey = KEY_REQUIRE_ESCAPING_RE.test(key) ? '#' + key : key;

            result[resultKey] = replicator._handleValue(obj[key], result, resultKey);
        });

        return result;
    };

    EncodingTransformer.prototype._handleObject = function (obj, parent, key) {
        this._createCircularCandidate(obj, parent, key);

        return Array.isArray(obj) ? this._handleArray(obj) : this._handlePlainObject(obj);
    };

    EncodingTransformer.prototype._ensureCircularReference = function (obj) {
        var circularCandidateIdx = this.circularCandidates.indexOf(obj);

        if (circularCandidateIdx > -1) {
            var descr = this.circularCandidatesDescrs[circularCandidateIdx];

            if (descr.refIdx === -1)
                descr.refIdx = descr.parent ? ++this.circularRefCount : 0;

            return EncodingTransformer._createRefMark(descr.refIdx);
        }

        return null;
    };

    EncodingTransformer.prototype._handleValue = function (val, parent, key) {
        var type     = typeof val;
        var isObject = type === 'object' && val !== null;

        if (isObject) {
            var refMark = this._ensureCircularReference(val);

            if (refMark)
                return refMark;
        }

        for (var i = 0; i < this.transforms.length; i++) {
            var transform = this.transforms[i];

            if (transform.shouldTransform(type, val))
                return this._applyTransform(val, parent, key, transform);
        }

        if (isObject)
            return this._handleObject(val, parent, key);

        return val;
    };

    EncodingTransformer.prototype.transform = function () {
        var references = [this._handleValue(this.references, null, null)];

        for (var i = 0; i < this.circularCandidatesDescrs.length; i++) {
            var descr = this.circularCandidatesDescrs[i];

            if (descr.refIdx > 0) {
                references[descr.refIdx] = descr.parent[descr.key];
                descr.parent[descr.key]  = EncodingTransformer._createRefMark(descr.refIdx);
            }
        }

        return references;
    };

    // DecodingTransform
    var DecodingTransformer = function (references, transformsMap) {
        this.references            = references;
        this.transformMap          = transformsMap;
        this.activeTransformsStack = [];
        this.visitedRefs           = Object.create(null);
    };

    DecodingTransformer.prototype._handlePlainObject = function (obj) {
        var replicator       = this;
        var unescaped        = Object.create(null);
        var ownPropertyNames = Object.getOwnPropertyNames(obj);

        ownPropertyNames.forEach(function (key) {
            replicator._handleValue(obj[key], obj, key);

            if (KEY_REQUIRE_ESCAPING_RE.test(key)) {
                // NOTE: use intermediate object to avoid unescaped and escaped keys interference
                // E.g. unescaped "##@t" will be "#@t" which can overwrite escaped "#@t".
                unescaped[key.substring(1)] = obj[key];
                delete obj[key];
            }
        });

        for (var unsecapedKey in unescaped)
            obj[unsecapedKey] = unescaped[unsecapedKey];
    };

    DecodingTransformer.prototype._handleTransformedObject = function (obj, parent, key) {
        var transformType = obj[TRANSFORMED_TYPE_KEY];
        var transform     = this.transformMap[transformType];

        if (!transform)
            throw new Error('Can\'t find transform for "' + transformType + '" type.');

        this.activeTransformsStack.push(obj);
        this._handleValue(obj.data, obj, 'data');
        this.activeTransformsStack.pop();

        parent[key] = transform.fromSerializable(obj.data);
    };

    DecodingTransformer.prototype._handleCircularSelfRefDuringTransform = function (refIdx, parent, key) {
        // NOTE: we've hit a hard case: object reference itself during transformation.
        // We can't dereference it since we don't have resulting object yet. And we'll
        // not be able to restore reference lately because we will need to traverse
        // transformed object again and reference might be unreachable or new object contain
        // new circular references. As a workaround we create getter, so once transformation
        // complete, dereferenced property will point to correct transformed object.
        var references = this.references;
        var val = void 0;

        Object.defineProperty(parent, key, {
            configurable: true,
            enumerable:   true,

            get: function () {
                if (val === void 0)
                    val = references[refIdx];

                return val;
            },

            set: function (value) {
                val = value;
                return val;
            }
        });
    };

    DecodingTransformer.prototype._handleCircularRef = function (refIdx, parent, key) {
        if (this.activeTransformsStack.indexOf(this.references[refIdx]) > -1)
            this._handleCircularSelfRefDuringTransform(refIdx, parent, key);

        else {
            if (!this.visitedRefs[refIdx]) {
                this.visitedRefs[refIdx] = true;
                this._handleValue(this.references[refIdx], this.references, refIdx);
            }

            parent[key] = this.references[refIdx];
        }
    };

    DecodingTransformer.prototype._handleValue = function (val, parent, key) {
        if (typeof val !== 'object' || val === null)
            return;

        var refIdx = val[CIRCULAR_REF_KEY];

        if (refIdx !== void 0)
            this._handleCircularRef(refIdx, parent, key);

        else if (val[TRANSFORMED_TYPE_KEY])
            this._handleTransformedObject(val, parent, key);

        else if (Array.isArray(val)) {
            for (var i = 0; i < val.length; i++)
                this._handleValue(val[i], val, i);
        }

        else
            this._handlePlainObject(val);
    };

    DecodingTransformer.prototype.transform = function () {
        this.visitedRefs[0] = true;
        this._handleValue(this.references[0], this.references, 0);

        return this.references[0];
    };


    // Transforms
    var builtInTransforms = [
        {
            type: '[[NaN]]',

            shouldTransform: function (type, val) {
                return type === 'number' && isNaN(val);
            },

            toSerializable: function () {
                return '';
            },

            fromSerializable: function () {
                return NaN;
            }
        },

        {
            type: '[[undefined]]',

            shouldTransform: function (type) {
                return type === 'undefined';
            },

            toSerializable: function () {
                return '';
            },

            fromSerializable: function () {
                return void 0;
            }
        },
        {
            type: '[[Date]]',

            shouldTransform: function (type, val) {
                return val instanceof Date;
            },

            toSerializable: function (date) {
                return date.getTime();
            },

            fromSerializable: function (val) {
                var date = new Date();

                date.setTime(val);
                return date;
            }
        },
        {
            type: '[[RegExp]]',

            shouldTransform: function (type, val) {
                return val instanceof RegExp;
            },

            toSerializable: function (re) {
                var result = {
                    src:   re.source,
                    flags: ''
                };

                if (re.global)
                    result.flags += 'g';

                if (re.ignoreCase)
                    result.flags += 'i';

                if (re.multiline)
                    result.flags += 'm';

                return result;
            },

            fromSerializable: function (val) {
                return new RegExp(val.src, val.flags);
            }
        },

        {
            type: '[[Error]]',

            shouldTransform: function (type, val) {
                return val instanceof Error;
            },

            toSerializable: function (err) {
                return {
                    name:    err.name,
                    message: err.message,
                    stack:   err.stack
                };
            },

            fromSerializable: function (val) {
                var Ctor = GLOBAL[val.name] || Error;
                var err  = new Ctor(val.message);

                err.stack = val.stack;
                return err;
            }
        },

        {
            type: '[[ArrayBuffer]]',

            shouldTransform: function (type, val) {
                return ARRAY_BUFFER_SUPPORTED && val instanceof ArrayBuffer;
            },

            toSerializable: function (buffer) {
                var view = new Int8Array(buffer);

                return arrSlice.call(view);
            },

            fromSerializable: function (val) {
                if (ARRAY_BUFFER_SUPPORTED) {
                    var buffer = new ArrayBuffer(val.length);
                    var view   = new Int8Array(buffer);

                    view.set(val);

                    return buffer;
                }

                return val;
            }
        },

        {
            type: '[[TypedArray]]',

            shouldTransform: function (type, val) {
                for (var i = 0; i < TYPED_ARRAY_CTORS.length; i++) {
                    var ctorName = TYPED_ARRAY_CTORS[i];

                    if (typeof GLOBAL[ctorName] === 'function' && val instanceof GLOBAL[ctorName])
                        return true;
                }

                return false;
            },

            toSerializable: function (arr) {
                return {
                    ctorName: arr.constructor.name,
                    arr:      arrSlice.call(arr)
                };
            },

            fromSerializable: function (val) {
                return typeof GLOBAL[val.ctorName] === 'function' ? new GLOBAL[val.ctorName](val.arr) : val.arr;
            }
        },

        {
            type: '[[Map]]',

            shouldTransform: function (type, val) {
                return MAP_SUPPORTED && val instanceof Map;
            },

            toSerializable: function (map) {
                var flattenedKVArr = [];

                map.forEach(function (val, key) {
                    flattenedKVArr.push(key);
                    flattenedKVArr.push(val);
                });

                return flattenedKVArr;
            },

            fromSerializable: function (val) {
                if (MAP_SUPPORTED) {
                    // NOTE: new Map(iterable) is not supported by all browsers
                    var map = new Map();

                    for (var i = 0; i < val.length; i += 2)
                        map.set(val[i], val[i + 1]);

                    return map;
                }

                var kvArr = [];

                for (var j = 0; j < val.length; j += 2)
                    kvArr.push([val[i], val[i + 1]]);

                return kvArr;
            }
        },

        {
            type: '[[Set]]',

            shouldTransform: function (type, val) {
                return SET_SUPPORTED && val instanceof Set;
            },

            toSerializable: function (set) {
                var arr = [];

                set.forEach(function (val) {
                    arr.push(val);
                });

                return arr;
            },

            fromSerializable: function (val) {
                if (SET_SUPPORTED) {
                    // NOTE: new Set(iterable) is not supported by all browsers
                    var set = new Set();

                    for (var i = 0; i < val.length; i++)
                        set.add(val[i]);

                    return set;
                }

                return val;
            }
        }
    ];

    // Replicator
    var Replicator = module.exports = function (serializer) {
        this.transforms    = [];
        this.transformsMap = Object.create(null);
        this.serializer    = serializer || JSONSerializer;

        this.addTransforms(builtInTransforms);
    };

    // Manage transforms
    Replicator.prototype.addTransforms = function (transforms) {
        transforms = Array.isArray(transforms) ? transforms : [transforms];

        for (var i = 0; i < transforms.length; i++) {
            var transform = transforms[i];

            if (this.transformsMap[transform.type])
                throw new Error('Transform with type "' + transform.type + '" was already added.');

            this.transforms.push(transform);
            this.transformsMap[transform.type] = transform;
        }

        return this;
    };

    Replicator.prototype.removeTransforms = function (transforms) {
        transforms = Array.isArray(transforms) ? transforms : [transforms];

        for (var i = 0; i < transforms.length; i++) {
            var transform = transforms[i];
            var idx       = this.transforms.indexOf(transform);

            if (idx > -1)
                this.transforms.splice(idx, 1);

            delete this.transformsMap[transform.type];
        }

        return this;
    };

    Replicator.prototype.encode = function (val) {
        var transformer = new EncodingTransformer(val, this.transforms);
        var references  = transformer.transform();

        return this.serializer.serialize(references);
    };

    Replicator.prototype.decode = function (val) {
        var references  = this.serializer.deserialize(val);
        var transformer = new DecodingTransformer(references, this.transformsMap);

        return transformer.transform();
    };
    });

    // NOTE: evalFunction is isolated into a separate module to
    // restrict access to TestCafe intrinsics for the evaluated code.
    // It also accepts `__dependencies$` argument which may be used by evaluated code.
    /* eslint-disable @typescript-eslint/no-unused-vars */
    function evalFunction(fnCode, __dependencies$) {
        // NOTE: `eval` in strict mode will not override context variables
        var evaluator = new hammerhead.nativeMethods.Function('fnCode', '__dependencies$', 'Promise', '"use strict"; return eval(fnCode)');
        return evaluator(fnCode, __dependencies$, hammerhead.Promise);
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    var NODE_SNAPSHOT_PROPERTIES = [
        'nodeType',
        'textContent',
        'childNodeCount',
        'hasChildNodes',
        'childElementCount',
        'hasChildElements'
    ];
    var ELEMENT_ACTION_SNAPSHOT_PROPERTIES = [
        'tagName',
        'attributes'
    ];
    var ELEMENT_SNAPSHOT_PROPERTIES = [
        'tagName',
        'visible',
        'focused',
        'attributes',
        'boundingClientRect',
        'classNames',
        'style',
        'innerText',
        'namespaceURI',
        'id',
        'value',
        'checked',
        'selected',
        'selectedIndex',
        'scrollWidth',
        'scrollHeight',
        'scrollLeft',
        'scrollTop',
        'offsetWidth',
        'offsetHeight',
        'offsetLeft',
        'offsetTop',
        'clientWidth',
        'clientHeight',
        'clientLeft',
        'clientTop'
    ];

    // Node
    var nodeSnapshotPropertyInitializers = {
        // eslint-disable-next-line no-restricted-properties
        textContent: function (node) { return node.textContent; },
        childNodeCount: function (node) { return node.childNodes.length; },
        hasChildNodes: function (node) { return !!nodeSnapshotPropertyInitializers.childNodeCount(node); },
        childElementCount: function (node) {
            /*eslint-disable no-restricted-properties*/
            var children = node.children;
            if (children)
                return children.length;
            // NOTE: IE doesn't have `children` for non-element nodes =/
            var childElementCount = 0;
            var childNodeCount = node.childNodes.length;
            /*eslint-enable no-restricted-properties*/
            for (var i = 0; i < childNodeCount; i++) {
                if (node.childNodes[i].nodeType === 1)
                    childElementCount++;
            }
            return childElementCount;
        },
        /*eslint-disable no-restricted-properties*/
        hasChildElements: function (node) { return !!nodeSnapshotPropertyInitializers.childElementCount(node); }
        /*eslint-enable no-restricted-properties*/
    };
    var BaseSnapshot = /** @class */ (function () {
        function BaseSnapshot() {
        }
        BaseSnapshot.prototype._initializeProperties = function (node, properties, initializers) {
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var initializer = initializers[property];
                this[property] = initializer ? initializer(node) : node[property];
            }
        };
        return BaseSnapshot;
    }());
    var NodeSnapshot = /** @class */ (function (_super) {
        __extends(NodeSnapshot, _super);
        function NodeSnapshot(node) {
            var _this = _super.call(this) || this;
            _this._initializeProperties(node, NODE_SNAPSHOT_PROPERTIES, nodeSnapshotPropertyInitializers);
            return _this;
        }
        return NodeSnapshot;
    }(BaseSnapshot));
    // Element
    var elementSnapshotPropertyInitializers = {
        tagName: function (element) { return element.tagName.toLowerCase(); },
        visible: testCafeCore.positionUtils.isElementVisible,
        focused: function (element) { return testCafeCore.domUtils.getActiveElement() === element; },
        attributes: function (element) {
            // eslint-disable-next-line no-restricted-properties
            var attrs = element.attributes;
            var result = {};
            for (var i = attrs.length - 1; i >= 0; i--)
                // eslint-disable-next-line no-restricted-properties
                result[attrs[i].name] = attrs[i].value;
            return result;
        },
        boundingClientRect: function (element) {
            var rect = element.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            };
        },
        classNames: function (element) {
            var className = element.className;
            className = typeof className.animVal === 'string' ? className.animVal : className;
            return className
                .replace(/^\s+|\s+$/g, '')
                .split(/\s+/g);
        },
        style: function (element) {
            var result = {};
            var computed = window.getComputedStyle(element);
            for (var i = 0; i < computed.length; i++) {
                var prop = computed[i];
                result[prop] = computed[prop];
            }
            return result;
        },
        // eslint-disable-next-line no-restricted-properties
        innerText: function (element) { return element.innerText; }
    };
    var ElementActionSnapshot = /** @class */ (function (_super) {
        __extends(ElementActionSnapshot, _super);
        function ElementActionSnapshot(element) {
            var _this = _super.call(this, element) || this;
            _this._initializeProperties(element, ELEMENT_ACTION_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
            return _this;
        }
        return ElementActionSnapshot;
    }(BaseSnapshot));
    var ElementSnapshot = /** @class */ (function (_super) {
        __extends(ElementSnapshot, _super);
        function ElementSnapshot(element) {
            var _this = _super.call(this, element) || this;
            _this._initializeProperties(element, ELEMENT_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
            return _this;
        }
        return ElementSnapshot;
    }(NodeSnapshot));

    // NOTE: save original ctors because they may be overwritten by page code
    var Node$1 = window.Node;
    var identity = function (val) { return val; };
    function createReplicator(transforms) {
        // NOTE: we will serialize replicator results
        // to JSON with a command or command result.
        // Therefore there is no need to do additional job here,
        // so we use identity functions for serialization.
        var replicator$1 = new replicator({
            serialize: identity,
            deserialize: identity
        });
        return replicator$1.addTransforms(transforms);
    }
    var FunctionTransform = /** @class */ (function () {
        function FunctionTransform() {
            this.type = 'Function';
        }
        FunctionTransform.prototype.shouldTransform = function (type) {
            return type === 'function';
        };
        FunctionTransform.prototype.toSerializable = function () {
            return '';
        };
        // HACK: UglifyJS + TypeScript + argument destructuring can generate incorrect code.
        // So we have to use plain assignments here.
        FunctionTransform.prototype.fromSerializable = function (opts) {
            var fnCode = opts.fnCode;
            var dependencies = opts.dependencies;
            return evalFunction(fnCode, dependencies);
        };
        return FunctionTransform;
    }());
    var SelectorElementActionTransform = /** @class */ (function () {
        function SelectorElementActionTransform() {
            this.type = 'Node';
        }
        SelectorElementActionTransform.prototype.shouldTransform = function (type, val) {
            return val instanceof Node$1;
        };
        SelectorElementActionTransform.prototype.toSerializable = function (node) {
            return new ElementActionSnapshot(node);
        };
        return SelectorElementActionTransform;
    }());
    var SelectorNodeTransform = /** @class */ (function () {
        function SelectorNodeTransform(customDOMProperties) {
            this.type = 'Node';
            this.customDOMProperties = customDOMProperties || {};
        }
        SelectorNodeTransform.prototype._extend = function (snapshot, node) {
            var _this = this;
            hammerhead__default.nativeMethods.objectKeys.call(window.Object, this.customDOMProperties).forEach(function (prop) {
                try {
                    snapshot[prop] = _this.customDOMProperties[prop](node);
                }
                catch (err) {
                    throw new UncaughtErrorInCustomDOMPropertyCode(_this.instantiationCallsiteName, err, prop);
                }
            });
        };
        SelectorNodeTransform.prototype.shouldTransform = function (type, val) {
            return val instanceof Node$1;
        };
        SelectorNodeTransform.prototype.toSerializable = function (node) {
            var snapshot = node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);
            this._extend(snapshot, node);
            return snapshot;
        };
        return SelectorNodeTransform;
    }());
    var ClientFunctionNodeTransform = /** @class */ (function () {
        function ClientFunctionNodeTransform(instantiationCallsiteName) {
            this.type = 'Node';
            this.instantiationCallsiteName = instantiationCallsiteName;
        }
        ClientFunctionNodeTransform.prototype.shouldTransform = function (type, val) {
            if (val instanceof Node$1)
                throw new DomNodeClientFunctionResultError(this.instantiationCallsiteName);
        };
        return ClientFunctionNodeTransform;
    }());

    var ClientFunctionExecutor = /** @class */ (function () {
        function ClientFunctionExecutor(command) {
            this.command = command;
            this.replicator = this._createReplicator();
            this.dependencies = this.replicator.decode(this.command.dependencies);
            this.fn = evalFunction(this.command.fnCode, this.dependencies);
        }
        ClientFunctionExecutor.prototype.getResult = function () {
            var _this = this;
            return hammerhead.Promise.resolve()
                .then(function () {
                var args = _this.replicator.decode(_this.command.args);
                return _this._executeFn(args);
            })
                .catch(function (err) {
                if (!err.isTestCafeError)
                    err = new UncaughtErrorInClientFunctionCode(_this.command.instantiationCallsiteName, err);
                throw err;
            });
        };
        ClientFunctionExecutor.prototype.getResultDriverStatus = function () {
            var _this = this;
            return this
                .getResult()
                .then(function (result) { return new DriverStatus({
                isCommandResult: true,
                result: _this.replicator.encode(result)
            }); })
                .catch(function (err) {
                return new DriverStatus({
                    isCommandResult: true,
                    executionError: err
                });
            });
        };
        //Overridable methods
        ClientFunctionExecutor.prototype._createReplicator = function () {
            return createReplicator([
                new ClientFunctionNodeTransform(this.command.instantiationCallsiteName),
                new FunctionTransform()
            ]);
        };
        ClientFunctionExecutor.prototype._executeFn = function (args) {
            return this.fn.apply(window, args);
        };
        return ClientFunctionExecutor;
    }());

    var MESSAGE_TYPE = {
        appearedDialog: 'appeared-dialog',
        unexpectedDialog: 'unexpected-dialog',
        handlerError: 'handler-error'
    };

    var messageSandbox = hammerhead__default.eventSandbox.message;
    var processScript = hammerhead__default.processScript;
    var nativeMethods = hammerhead__default.nativeMethods;
    var APPEARED_DIALOGS = 'testcafe|native-dialog-tracker|appeared-dialogs';
    var UNEXPECTED_DIALOG = 'testcafe|native-dialog-tracker|unexpected-dialog';
    var ERROR_IN_HANDLER = 'testcafe|native-dialog-tracker|error-in-handler';
    var GETTING_PAGE_URL_PROCESSED_SCRIPT = processScript('window.location.href');
    var NativeDialogTracker = /** @class */ (function () {
        function NativeDialogTracker(contextStorage, dialogHandler) {
            this.contextStorage = contextStorage;
            this.dialogHandler = dialogHandler;
            this._init();
            this._initListening();
            if (this.dialogHandler)
                this.setHandler(dialogHandler);
        }
        Object.defineProperty(NativeDialogTracker.prototype, "appearedDialogs", {
            get: function () {
                var dialogs = this.contextStorage.getItem(APPEARED_DIALOGS);
                if (!dialogs) {
                    dialogs = [];
                    this.appearedDialogs = dialogs;
                }
                return dialogs;
            },
            set: function (dialog) {
                this.contextStorage.setItem(APPEARED_DIALOGS, dialog);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeDialogTracker.prototype, "unexpectedDialog", {
            get: function () {
                return this.contextStorage.getItem(UNEXPECTED_DIALOG);
            },
            set: function (dialog) {
                this.contextStorage.setItem(UNEXPECTED_DIALOG, dialog);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeDialogTracker.prototype, "handlerError", {
            get: function () {
                return this.contextStorage.getItem(ERROR_IN_HANDLER);
            },
            set: function (dialog) {
                this.contextStorage.setItem(ERROR_IN_HANDLER, dialog);
            },
            enumerable: true,
            configurable: true
        });
        NativeDialogTracker._getPageUrl = function () {
            return nativeMethods.eval(GETTING_PAGE_URL_PROCESSED_SCRIPT);
        };
        NativeDialogTracker.prototype._initListening = function () {
            var _this = this;
            messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, function (e) {
                var msg = e.message;
                if (msg.type === MESSAGE_TYPE.appearedDialog)
                    // eslint-disable-next-line no-restricted-properties
                    _this._addAppearedDialogs(msg.dialogType, msg.text, msg.url);
                else if (msg.type === MESSAGE_TYPE.unexpectedDialog && !_this.unexpectedDialog)
                    _this.unexpectedDialog = { type: msg.dialogType, url: msg.url };
                else if (msg.type === MESSAGE_TYPE.handlerError && !_this.handlerError)
                    _this._onHandlerError(msg.dialogType, msg.message, msg.url);
            });
        };
        NativeDialogTracker.prototype._init = function () {
            var _this = this;
            hammerhead__default.on(hammerhead__default.EVENTS.beforeUnload, function (e) {
                if (e.prevented && !e.isFakeIEEvent) {
                    if (_this.dialogHandler) {
                        var handler = _this._createDialogHandler('beforeunload');
                        handler(e.returnValue || '');
                    }
                    else
                        _this._defaultDialogHandler('beforeunload');
                }
                // NOTE: we should save changes that could be made via 'shift' and 'push' methods.
                if (_this.contextStorage)
                    _this.contextStorage.save();
            });
            window.alert = function () { return _this._defaultDialogHandler('alert'); };
            window.confirm = function () { return _this._defaultDialogHandler('confirm'); };
            window.prompt = function () { return _this._defaultDialogHandler('prompt'); };
        };
        NativeDialogTracker.prototype._createDialogHandler = function (type) {
            var _this = this;
            return function (text) {
                var url = NativeDialogTracker._getPageUrl();
                _this._addAppearedDialogs(type, text, url);
                var executor = new ClientFunctionExecutor(_this.dialogHandler);
                var result = null;
                try {
                    result = executor.fn.apply(window, [type, text, url]);
                }
                catch (err) {
                    _this._onHandlerError(type, err.message || String(err), url);
                }
                return result;
            };
        };
        // Overridable methods
        NativeDialogTracker.prototype._defaultDialogHandler = function (type) {
            var url = NativeDialogTracker._getPageUrl();
            this.unexpectedDialog = this.unexpectedDialog || { type: type, url: url };
        };
        NativeDialogTracker.prototype._addAppearedDialogs = function (type, text, url) {
            this.appearedDialogs.splice(0, 0, { type: type, text: text, url: url });
        };
        NativeDialogTracker.prototype._onHandlerError = function (type, message, url) {
            this.handlerError = this.handlerError || { type: type, message: message, url: url };
        };
        // API
        NativeDialogTracker.prototype.setHandler = function (dialogHandler) {
            var _this = this;
            this.dialogHandler = dialogHandler;
            ['alert', 'confirm', 'prompt'].forEach(function (dialogType) {
                window[dialogType] = _this.dialogHandler ?
                    _this._createDialogHandler(dialogType) :
                    function () { return _this._defaultDialogHandler(dialogType); };
            });
        };
        NativeDialogTracker.prototype.getUnexpectedDialogError = function () {
            var unexpectedDialog = this.unexpectedDialog;
            var handlerError = this.handlerError;
            this.unexpectedDialog = null;
            this.handlerError = null;
            if (unexpectedDialog)
                return new NativeDialogNotHandledError(unexpectedDialog.type, unexpectedDialog.url);
            if (handlerError)
                return new UncaughtErrorInNativeDialogHandler(handlerError.type, handlerError.message, handlerError.url);
            return null;
        };
        return NativeDialogTracker;
    }());

    var TYPE = {
        establishConnection: 'driver|establish-connection',
        commandExecuted: 'driver|command-executed',
        executeCommand: 'driver|execute-command',
        confirmation: 'driver|confirmation',
        setNativeDialogHandler: 'driver|set-native-dialog-handler',
        setAsMaster: 'driver|set-as-master',
        closeAllChildWindows: 'driver|close-all-child-windows'
    };
    var InterDriverMessage = /** @class */ (function () {
        function InterDriverMessage(type) {
            this.type = type;
            this.id = generateId();
        }
        return InterDriverMessage;
    }());
    var EstablishConnectionMessage = /** @class */ (function (_super) {
        __extends(EstablishConnectionMessage, _super);
        function EstablishConnectionMessage() {
            return _super.call(this, TYPE.establishConnection) || this;
        }
        return EstablishConnectionMessage;
    }(InterDriverMessage));
    var CommandExecutedMessage = /** @class */ (function (_super) {
        __extends(CommandExecutedMessage, _super);
        function CommandExecutedMessage(driverStatus) {
            var _this = _super.call(this, TYPE.commandExecuted) || this;
            _this.driverStatus = driverStatus;
            return _this;
        }
        return CommandExecutedMessage;
    }(InterDriverMessage));
    var ExecuteCommandMessage = /** @class */ (function (_super) {
        __extends(ExecuteCommandMessage, _super);
        function ExecuteCommandMessage(command, testSpeed) {
            var _this = _super.call(this, TYPE.executeCommand) || this;
            _this.command = command;
            _this.testSpeed = testSpeed;
            return _this;
        }
        return ExecuteCommandMessage;
    }(InterDriverMessage));
    var ConfirmationMessage = /** @class */ (function (_super) {
        __extends(ConfirmationMessage, _super);
        function ConfirmationMessage(requestMessageId, result) {
            var _this = _super.call(this, TYPE.confirmation) || this;
            _this.requestMessageId = requestMessageId;
            _this.result = result;
            return _this;
        }
        return ConfirmationMessage;
    }(InterDriverMessage));
    var SetNativeDialogHandlerMessage = /** @class */ (function (_super) {
        __extends(SetNativeDialogHandlerMessage, _super);
        function SetNativeDialogHandlerMessage(dialogHandler) {
            var _this = _super.call(this, TYPE.setNativeDialogHandler) || this;
            _this.dialogHandler = dialogHandler;
            return _this;
        }
        return SetNativeDialogHandlerMessage;
    }(InterDriverMessage));
    var SetAsMasterMessage = /** @class */ (function (_super) {
        __extends(SetAsMasterMessage, _super);
        function SetAsMasterMessage() {
            return _super.call(this, TYPE.setAsMaster) || this;
        }
        return SetAsMasterMessage;
    }(InterDriverMessage));
    var CloseAllChildWindowsMessage = /** @class */ (function (_super) {
        __extends(CloseAllChildWindowsMessage, _super);
        function CloseAllChildWindowsMessage() {
            return _super.call(this, TYPE.closeAllChildWindows) || this;
        }
        return CloseAllChildWindowsMessage;
    }(InterDriverMessage));

    var JSON$1 = hammerhead__default.json;
    var nativeMethods$1 = hammerhead__default.nativeMethods;
    var STORAGE_KEY_PREFIX = 'testcafe|driver|';
    var Storage = /** @class */ (function () {
        function Storage(window, testRunId, windowId) {
            this.storage = nativeMethods$1.winSessionStorageGetter.call(window);
            this.storageKey = this._createStorageKey(testRunId, windowId);
            this.data = {};
            this._loadFromStorage();
        }
        Storage.prototype._createStorageKey = function (testRunId, windowId) {
            var storageKey = STORAGE_KEY_PREFIX + testRunId;
            if (windowId)
                return storageKey + '|' + windowId;
            return storageKey;
        };
        Storage.prototype._loadFromStorage = function () {
            var savedData = this.storage.getItem(this.storageKey);
            if (savedData) {
                this.data = JSON$1.parse(savedData);
                this.storage.removeItem(this.storageKey);
            }
        };
        Storage.prototype.save = function () {
            this.storage.setItem(this.storageKey, JSON$1.stringify(this.data));
        };
        Storage.prototype.setItem = function (prop, value) {
            this.data[prop] = value;
            this.save();
        };
        Storage.prototype.getItem = function (prop) {
            return this.data[prop];
        };
        Storage.prototype.dispose = function () {
            this.storage.removeItem(this.storageKey);
        };
        return Storage;
    }());

    var MIN_RESPONSE_WAITING_TIMEOUT = 2500;
    var RESEND_MESSAGE_INTERVAL = 1000;
    function sendMessageToDriver(msg, driverWindow, timeout, NotLoadedErrorCtor) {
        var sendMsgInterval = null;
        var sendMsgTimeout = null;
        var onResponse = null;
        timeout = Math.max(timeout || 0, MIN_RESPONSE_WAITING_TIMEOUT);
        var sendAndWaitForResponse = function () {
            return new hammerhead.Promise(function (resolve) {
                onResponse = function (e) {
                    if (e.message.type === TYPE.confirmation && e.message.requestMessageId === msg.id)
                        resolve(e.message);
                };
                hammerhead.eventSandbox.message.on(hammerhead.eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);
                sendMsgInterval = hammerhead.nativeMethods.setInterval.call(window, function () { return hammerhead.eventSandbox.message.sendServiceMsg(msg, driverWindow); }, RESEND_MESSAGE_INTERVAL);
                hammerhead.eventSandbox.message.sendServiceMsg(msg, driverWindow);
            });
        };
        return hammerhead.Promise.race([testCafeCore.delay(timeout), sendAndWaitForResponse()])
            .then(function (response) {
            hammerhead.nativeMethods.clearInterval.call(window, sendMsgInterval);
            hammerhead.nativeMethods.clearTimeout.call(window, sendMsgTimeout);
            hammerhead.eventSandbox.message.off(hammerhead.eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onResponse);
            if (!response)
                throw new NotLoadedErrorCtor();
            return response;
        });
    }

    var WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT = 20000;
    var WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT = 5000;
    var CHECK_IFRAME_EXISTENCE_INTERVAL = 1000;
    var CHECK_IFRAME_VISIBLE_INTERVAL = 200;
    var WAIT_IFRAME_RESPONSE_DELAY = 500;
    var CHECK_CHILD_WINDOW_CLOSED_INTERVAL = 200;

    function sendConfirmationMessage (_a) {
        var requestMsgId = _a.requestMsgId, result = _a.result, window = _a.window;
        var msg = new ConfirmationMessage(requestMsgId, result);
        hammerhead.eventSandbox.message.sendServiceMsg(msg, window);
    }

    var ChildIframeDriverLink = /** @class */ (function () {
        function ChildIframeDriverLink(driverWindow, driverId) {
            this.driverWindow = driverWindow;
            this.driverIframe = testCafeCore.domUtils.findIframeByWindow(driverWindow);
            this.driverId = driverId;
            this.iframeAvailabilityTimeout = 0;
        }
        Object.defineProperty(ChildIframeDriverLink.prototype, "availabilityTimeout", {
            set: function (val) {
                this.iframeAvailabilityTimeout = val;
            },
            enumerable: true,
            configurable: true
        });
        ChildIframeDriverLink.prototype._ensureIframe = function () {
            var _this = this;
            if (!testCafeCore.domUtils.isElementInDocument(this.driverIframe))
                return hammerhead.Promise.reject(new CurrentIframeNotFoundError());
            return testCafeCore.waitFor(function () { return testCafeCore.positionUtils.isElementVisible(_this.driverIframe) ? _this.driverIframe : null; }, CHECK_IFRAME_VISIBLE_INTERVAL, this.iframeAvailabilityTimeout)
                .catch(function () {
                throw new CurrentIframeIsInvisibleError();
            });
        };
        ChildIframeDriverLink.prototype._waitForIframeRemovedOrHidden = function () {
            var _this = this;
            // NOTE: If an iframe was removed or became hidden while a
            // command was being executed, we consider this command finished.
            return new hammerhead.Promise(function (resolve) {
                _this.checkIframeInterval = hammerhead.nativeMethods.setInterval.call(window, function () {
                    _this._ensureIframe()
                        .catch(function () {
                        // NOTE: wait for possible delayed iframe message
                        return testCafeCore.delay(WAIT_IFRAME_RESPONSE_DELAY)
                            .then(function () { return resolve(new DriverStatus({ isCommandResult: true })); });
                    });
                }, CHECK_IFRAME_EXISTENCE_INTERVAL);
            });
        };
        ChildIframeDriverLink.prototype._waitForCommandResult = function () {
            var _this = this;
            var onMessage = null;
            var waitForResultMessage = function () { return new hammerhead.Promise(function (resolve) {
                onMessage = function (e) {
                    if (e.message.type === TYPE.commandExecuted)
                        resolve(e.message.driverStatus);
                };
                hammerhead.eventSandbox.message.on(hammerhead.eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);
            }); };
            return hammerhead.Promise.race([this._waitForIframeRemovedOrHidden(), waitForResultMessage()])
                .then(function (status) {
                hammerhead.eventSandbox.message.off(hammerhead.eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, onMessage);
                hammerhead.nativeMethods.clearInterval.call(window, _this.checkIframeInterval);
                return status;
            });
        };
        ChildIframeDriverLink.prototype.sendConfirmationMessage = function (requestMsgId) {
            sendConfirmationMessage({
                requestMsgId: requestMsgId,
                result: { id: this.driverId },
                window: this.driverWindow
            });
        };
        ChildIframeDriverLink.prototype.executeCommand = function (command, testSpeed) {
            var _this = this;
            // NOTE:  We should check if the iframe is visible and exists before executing the next
            // command, because the iframe might be hidden or removed since the previous command.
            return this
                ._ensureIframe()
                .then(function () {
                var msg = new ExecuteCommandMessage(command, testSpeed);
                return hammerhead.Promise.all([
                    sendMessageToDriver(msg, _this.driverWindow, _this.iframeAvailabilityTimeout, CurrentIframeIsNotLoadedError),
                    _this._waitForCommandResult()
                ]);
            })
                .then(function (result) { return result[1]; });
        };
        return ChildIframeDriverLink;
    }());

    var Promise = hammerhead__default.Promise;
    var nativeMethods$2 = hammerhead__default.nativeMethods;
    var WAIT_FOR_NEW_SCRIPTS_DELAY = 25;
    var ScriptExecutionBarrier = /** @class */ (function () {
        function ScriptExecutionBarrier() {
            var _this = this;
            this.watchdog = null;
            this.SCRIPT_LOADING_TIMEOUT = 2000;
            this.BARRIER_TIMEOUT = 3000;
            this.scriptsCount = 0;
            this.resolveWaitingPromise = null;
            this.scriptElementAddedHandler = function (e) { return _this._onScriptElementAdded(e.el); };
            hammerhead__default.on(hammerhead__default.EVENTS.scriptElementAdded, this.scriptElementAddedHandler);
        }
        ScriptExecutionBarrier.prototype._onScriptElementAdded = function (el) {
            var _this = this;
            var scriptSrc = nativeMethods$2.scriptSrcGetter.call(el);
            if (scriptSrc === void 0 || scriptSrc === '')
                return;
            this.scriptsCount++;
            var loadingTimeout = null;
            var done = function () {
                nativeMethods$2.removeEventListener.call(el, 'load', done);
                nativeMethods$2.removeEventListener.call(el, 'error', done);
                nativeMethods$2.clearTimeout.call(window, loadingTimeout);
                _this._onScriptLoadedOrFailed();
            };
            nativeMethods$2.addEventListener.call(el, 'load', done);
            nativeMethods$2.addEventListener.call(el, 'error', done);
            loadingTimeout = nativeMethods$2.setTimeout.call(window, done, this.SCRIPT_LOADING_TIMEOUT);
        };
        ScriptExecutionBarrier.prototype._onScriptLoadedOrFailed = function () {
            var _this = this;
            this.scriptsCount--;
            if (this.scriptsCount)
                return;
            testCafeCore.delay(WAIT_FOR_NEW_SCRIPTS_DELAY)
                .then(function () {
                if (!_this.resolveWaitingPromise)
                    return;
                if (!_this.scriptsCount)
                    _this.resolveWaitingPromise();
            });
        };
        ScriptExecutionBarrier.prototype.wait = function () {
            var _this = this;
            return new Promise(function (resolve) {
                var done = function () {
                    nativeMethods$2.clearTimeout.call(window, _this.watchdog);
                    hammerhead__default.off(hammerhead__default.EVENTS.scriptElementAdded, _this.scriptElementAddedHandler);
                    _this.watchdog = null;
                    _this.resolveWaitingPromise = null;
                    resolve();
                };
                if (!_this.scriptsCount)
                    done();
                else {
                    _this.watchdog = nativeMethods$2.setTimeout.call(window, function () { return done(); }, _this.BARRIER_TIMEOUT);
                    _this.resolveWaitingPromise = function () { return done(); };
                }
            });
        };
        return ScriptExecutionBarrier;
    }());

    function runWithBarriers (action) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var requestBarrier = new testCafeCore.RequestBarrier();
        var scriptExecutionBarrier = new ScriptExecutionBarrier();
        testCafeCore.pageUnloadBarrier.watchForPageNavigationTriggers();
        var actionResult = null;
        var actionPromise = action.apply(void 0, args);
        var barriersPromise = actionPromise
            .then(function (result) {
            actionResult = result;
            return hammerhead.Promise.all([
                // NOTE: script can be added by xhr-request, so we should run
                // script execution barrier waiting after request barrier resolved
                requestBarrier
                    .wait()
                    .then(function () { return scriptExecutionBarrier.wait(); }),
                testCafeCore.pageUnloadBarrier.wait()
            ]);
        })
            .then(function () { return actionResult; });
        return { actionPromise: actionPromise, barriersPromise: barriersPromise };
    }

    // NOTE: save original ctors and methods because they may be overwritten by page code
    var isArray = Array.isArray;
    var Node$2 = window.Node;
    var HTMLCollection = window.HTMLCollection;
    var NodeList = window.NodeList;
    function exists(el) {
        return !!el;
    }
    function visible(el) {
        if (!testCafeCore.domUtils.isDomElement(el) && !testCafeCore.domUtils.isTextNode(el))
            return false;
        if (testCafeCore.domUtils.isOptionElement(el) || testCafeCore.domUtils.getTagName(el) === 'optgroup')
            return testcafeUi.selectElement.isOptionElementVisible(el);
        return testCafeCore.positionUtils.isElementVisible(el);
    }
    function IsNodeCollection(obj) {
        return obj instanceof HTMLCollection || obj instanceof NodeList || isArrayOfNodes(obj);
    }
    function isArrayOfNodes(obj) {
        if (!isArray(obj))
            return false;
        for (var i = 0; i < obj.length; i++) {
            if (!(obj[i] instanceof Node$2))
                return false;
        }
        return true;
    }

    var _a;
    var arrayUtils = testCafeCore__default.arrayUtils;
    var typeUtils = hammerhead__default.utils.types;
    var nativeMethods$3 = hammerhead__default.nativeMethods;
    var SELECTOR_FILTER_ERROR = {
        filterVisible: 1,
        filterHidden: 2,
        nth: 3
    };
    var FILTER_ERROR_TO_API_RE = (_a = {},
        _a[SELECTOR_FILTER_ERROR.filterVisible] = /^\.filterVisible\(\)$/,
        _a[SELECTOR_FILTER_ERROR.filterHidden] = /^\.filterHidden\(\)$/,
        _a[SELECTOR_FILTER_ERROR.nth] = /^\.nth\(\d+\)$/,
        _a);
    var SelectorFilter = /** @class */ (function () {
        function SelectorFilter() {
            this.err = null;
        }
        Object.defineProperty(SelectorFilter.prototype, "error", {
            get: function () {
                return this.err;
            },
            set: function (message) {
                if (this.err === null)
                    this.err = message;
            },
            enumerable: true,
            configurable: true
        });
        SelectorFilter.prototype.filter = function (node, options, apiInfo) {
            var filtered = arrayUtils.filter(node, exists);
            if (options.filterVisible) {
                filtered = filtered.filter(visible);
                this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.filterVisible);
            }
            if (options.filterHidden) {
                filtered = filtered.filter(function (n) { return !visible(n); });
                this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.filterHidden);
            }
            if (options.counterMode) {
                if (options.index !== null)
                    filtered = this.getNodeByIndex(filtered, options.index) ? 1 : 0;
                else
                    filtered = filtered.length;
            }
            else {
                if (options.collectionMode) {
                    if (options.index !== null) {
                        var nodeOnIndex = this.getNodeByIndex(filtered, options.index);
                        filtered = nodeOnIndex ? [nodeOnIndex] : [];
                    }
                }
                else
                    filtered = this.getNodeByIndex(filtered, options.index || 0);
                if (typeof options.index === 'number')
                    this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.nth);
            }
            return filtered;
        };
        SelectorFilter.prototype.cast = function (node) {
            var result = null;
            if (typeUtils.isNullOrUndefined(node))
                result = [];
            else if (node instanceof Node)
                result = [node];
            else if (IsNodeCollection(node))
                result = node;
            else
                throw new InvalidSelectorResultError();
            return result;
        };
        SelectorFilter.prototype.assertFilterError = function (filtered, apiInfo, filterError) {
            if (!filtered || filtered.length === 0)
                this.error = this.getErrorItem(apiInfo, filterError);
        };
        SelectorFilter.prototype.getErrorItem = function (_a, err) {
            var apiFnChain = _a.apiFnChain, apiFnID = _a.apiFnID;
            if (err) {
                for (var i = apiFnID; i < apiFnChain.length; i++) {
                    if (FILTER_ERROR_TO_API_RE[err].test(apiFnChain[i]))
                        return i;
                }
            }
            return null;
        };
        SelectorFilter.prototype.getNodeByIndex = function (collection, index) {
            return index < 0 ? collection[collection.length + index] : collection[index];
        };
        return SelectorFilter;
    }());
    // Selector filter
    nativeMethods$3.objectDefineProperty.call(window, window, '%testCafeSelectorFilter%', {
        value: new SelectorFilter(),
        configurable: true
    });

    var CHECK_ELEMENT_DELAY = 200;
    var SelectorExecutor = /** @class */ (function (_super) {
        __extends(SelectorExecutor, _super);
        function SelectorExecutor(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError) {
            var _this = _super.call(this, command) || this;
            _this.createNotFoundError = createNotFoundError;
            _this.createIsInvisibleError = createIsInvisibleError;
            _this.timeout = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
            _this.counterMode = _this.dependencies.filterOptions.counterMode;
            _this.getVisibleValueMode = _this.dependencies.filterOptions.getVisibleValueMode;
            if (startTime) {
                var elapsed = new Date() - startTime;
                _this.timeout = Math.max(_this.timeout - elapsed, 0);
            }
            var customDOMProperties = _this.dependencies && _this.dependencies.customDOMProperties;
            _this.replicator.addTransforms([new SelectorNodeTransform(customDOMProperties)]);
            return _this;
        }
        SelectorExecutor.prototype._createReplicator = function () {
            return createReplicator([
                new FunctionTransform()
            ]);
        };
        SelectorExecutor.prototype._getTimeoutErrorParams = function () {
            var apiFnIndex = window['%testCafeSelectorFilter%'].error;
            var apiFnChain = this.command.apiFnChain;
            if (typeof apiFnIndex !== 'undefined')
                return { apiFnIndex: apiFnIndex, apiFnChain: apiFnChain };
            return null;
        };
        SelectorExecutor.prototype._getTimeoutError = function (elementExists) {
            return elementExists ? this.createIsInvisibleError : this.createNotFoundError;
        };
        SelectorExecutor.prototype._validateElement = function (args, startTime) {
            var _this = this;
            return hammerhead.Promise.resolve()
                .then(function () { return _this.fn.apply(window, args); })
                .then(function (el) {
                var isElementExists = exists(el);
                var isElementVisible = !_this.command.visibilityCheck || visible(el);
                var isTimeout = new Date() - startTime >= _this.timeout;
                if (isElementExists && isElementVisible)
                    return el;
                if (!isTimeout)
                    return testCafeCore.delay(CHECK_ELEMENT_DELAY).then(function () { return _this._validateElement(args, startTime); });
                var createTimeoutError = _this.getVisibleValueMode ? null : _this._getTimeoutError(isElementExists);
                if (createTimeoutError)
                    throw createTimeoutError(_this._getTimeoutErrorParams());
                return null;
            });
        };
        SelectorExecutor.prototype._executeFn = function (args) {
            if (this.counterMode)
                return _super.prototype._executeFn.call(this, args);
            var startTime = new Date();
            var error = null;
            var element = null;
            return this
                ._validateElement(args, startTime)
                .catch(function (err) {
                error = err;
            })
                .then(function (el) {
                if (error)
                    throw error;
                element = el;
            })
                .then(function () { return element; });
        };
        return SelectorExecutor;
    }(ClientFunctionExecutor));

    var ElementsRetriever = /** @class */ (function () {
        function ElementsRetriever(elementDescriptors, globalSelectorTimeout) {
            var _this = this;
            this.elements = [];
            this.globalSelectorTimeout = globalSelectorTimeout;
            this.ensureElementsPromise = hammerhead.Promise.resolve();
            this.ensureElementsStartTime = new Date();
            elementDescriptors.forEach(function (descriptor) { return _this._ensureElement(descriptor); });
        }
        ElementsRetriever.prototype._ensureElement = function (_a) {
            var _this = this;
            var selector = _a.selector, createNotFoundError = _a.createNotFoundError, createIsInvisibleError = _a.createIsInvisibleError, createHasWrongNodeTypeError = _a.createHasWrongNodeTypeError;
            this.ensureElementsPromise = this.ensureElementsPromise
                .then(function () {
                var selectorExecutor = new SelectorExecutor(selector, _this.globalSelectorTimeout, _this.ensureElementsStartTime, createNotFoundError, createIsInvisibleError);
                return selectorExecutor.getResult();
            })
                .then(function (el) {
                if (!testCafeCore.domUtils.isDomElement(el))
                    throw createHasWrongNodeTypeError(testCafeCore.NODE_TYPE_DESCRIPTIONS[el.nodeType]);
                _this.elements.push(el);
            });
        };
        ElementsRetriever.prototype.getElements = function () {
            var _this = this;
            return this.ensureElementsPromise
                .then(function () { return _this.elements; });
        };
        return ElementsRetriever;
    }());
    function ensureElements(elementDescriptors, globalSelectorTimeout) {
        var elementsRetriever = new ElementsRetriever(elementDescriptors, globalSelectorTimeout);
        return elementsRetriever.getElements();
    }
    function createElementDescriptor(selector) {
        return {
            selector: selector,
            createNotFoundError: function (fn) { return new ActionElementNotFoundError(fn); },
            createIsInvisibleError: function () { return new ActionElementIsInvisibleError(); },
            createHasWrongNodeTypeError: function (nodeDescription) { return new ActionSelectorMatchesWrongNodeTypeError(nodeDescription); }
        };
    }
    function createAdditionalElementDescriptor(selector, elementName) {
        return {
            selector: selector,
            createNotFoundError: function (fn) { return new ActionAdditionalElementNotFoundError(elementName, fn); },
            createIsInvisibleError: function () { return new ActionAdditionalElementIsInvisibleError(elementName); },
            createHasWrongNodeTypeError: function (nodeDescription) { return new ActionAdditionalSelectorMatchesWrongNodeTypeError(elementName, nodeDescription); }
        };
    }

    // Ensure command element properties
    function ensureElementEditable(element) {
        if (!testCafeCore.domUtils.isEditableElement(element))
            throw new ActionElementNonEditableError();
    }
    function ensureTextAreaElement(element) {
        if (!testCafeCore.domUtils.isTextAreaElement(element))
            throw new ActionElementNotTextAreaError();
    }
    function ensureContentEditableElement(element, argumentTitle) {
        if (!testCafeCore.domUtils.isContentEditableElement(element))
            throw new ActionElementNonContentEditableError(argumentTitle);
    }
    function ensureRootContainer(elements) {
        // NOTE: We should find a common element for the nodes to perform the select action
        if (!testCafeCore.contentEditable.getNearestCommonAncestor(elements[0], elements[1]))
            throw new ActionRootContainerNotFoundError();
        return elements;
    }
    function ensureFileInput(element) {
        if (!testCafeCore.domUtils.isFileInput(element))
            throw new ActionElementIsNotFileInputError();
    }
    function ensureOffsetOptions(element, options) {
        var _a = testcafeAutomation.getOffsetOptions(element, options.offsetX, options.offsetY), offsetX = _a.offsetX, offsetY = _a.offsetY;
        options.offsetX = offsetX;
        options.offsetY = offsetY;
    }
    var MAX_DELAY_AFTER_EXECUTION = 2000;
    var CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL = 250;
    var ActionExecutor = /** @class */ (function () {
        function ActionExecutor(command, globalSelectorTimeout, statusBar, testSpeed) {
            this.command = command;
            this.globalSelectorTimeout = globalSelectorTimeout;
            this.statusBar = statusBar;
            this.testSpeed = testSpeed;
            this.targetElement = null;
            this.elements = [];
            this.ensureElementsPromise = null;
            this.ensureElementsStartTime = null;
            this.executionStartTime = null;
            this.executionStartedHandler = null;
            this.commandSelectorTimeout = null;
        }
        ActionExecutor.prototype._getSpecificTimeout = function () {
            var hasSpecificTimeout = this.command.selector && typeof this.command.selector.timeout === 'number';
            return hasSpecificTimeout ? this.command.selector.timeout : this.globalSelectorTimeout;
        };
        ActionExecutor.prototype._delayAfterExecution = function () {
            if (!this.command.options || this.command.options.speed === 1)
                return hammerhead.Promise.resolve();
            return testCafeCore.delay((1 - this.command.options.speed) * MAX_DELAY_AFTER_EXECUTION);
        };
        ActionExecutor.prototype._isExecutionTimeoutExpired = function () {
            return Date.now() - this.executionStartTime >= this.commandSelectorTimeout;
        };
        ActionExecutor.prototype._ensureCommandArguments = function () {
            if (this.command.type === COMMAND_TYPE.pressKey) {
                var parsedKeySequence = testCafeCore.parseKeySequence(this.command.keys);
                if (parsedKeySequence.error)
                    throw new ActionIncorrectKeysError('keys');
            }
        };
        ActionExecutor.prototype._ensureCommandElements = function () {
            var _this = this;
            var elementDescriptors = [];
            if (this.command.selector)
                elementDescriptors.push(createElementDescriptor(this.command.selector));
            if (this.command.type === COMMAND_TYPE.dragToElement)
                elementDescriptors.push(createAdditionalElementDescriptor(this.command.destinationSelector, 'destinationSelector'));
            else if (this.command.type === COMMAND_TYPE.selectEditableContent) {
                elementDescriptors.push(createAdditionalElementDescriptor(this.command.startSelector, 'startSelector'));
                elementDescriptors.push(createAdditionalElementDescriptor(this.command.endSelector || this.command.startSelector, 'endSelector'));
            }
            return ensureElements(elementDescriptors, this.globalSelectorTimeout)
                .then(function (elements) {
                _this.elements = elements;
            });
        };
        ActionExecutor.prototype._ensureCommandElementsProperties = function () {
            if (this.command.type === COMMAND_TYPE.selectText)
                ensureElementEditable(this.elements[0]);
            else if (this.command.type === COMMAND_TYPE.selectTextAreaContent)
                ensureTextAreaElement(this.elements[0]);
            else if (this.command.type === COMMAND_TYPE.selectEditableContent) {
                ensureContentEditableElement(this.elements[0], 'startSelector');
                ensureContentEditableElement(this.elements[1], 'endSelector');
                ensureRootContainer(this.elements);
            }
            else if (this.command.type === COMMAND_TYPE.setFilesToUpload || this.command.type === COMMAND_TYPE.clearUpload)
                ensureFileInput(this.elements[0]);
        };
        ActionExecutor.prototype._ensureCommandOptions = function () {
            if (this.elements.length && this.command.options && 'offsetX' in this.command.options && 'offsetY' in this.command.options)
                ensureOffsetOptions(this.elements[0], this.command.options);
        };
        ActionExecutor.prototype._createAutomation = function () {
            var selectArgs = null;
            switch (this.command.type) {
                case COMMAND_TYPE.click:
                    if (/option|optgroup/.test(testCafeCore.domUtils.getTagName(this.elements[0])))
                        return new testcafeAutomation.SelectChildClick(this.elements[0], this.command.options);
                    return new testcafeAutomation.Click(this.elements[0], this.command.options);
                case COMMAND_TYPE.rightClick:
                    return new testcafeAutomation.RClick(this.elements[0], this.command.options);
                case COMMAND_TYPE.doubleClick:
                    return new testcafeAutomation.DblClick(this.elements[0], this.command.options);
                case COMMAND_TYPE.hover:
                    return new testcafeAutomation.Hover(this.elements[0], this.command.options);
                case COMMAND_TYPE.drag:
                    return new testcafeAutomation.DragToOffset(this.elements[0], this.command.dragOffsetX, this.command.dragOffsetY, this.command.options);
                case COMMAND_TYPE.dragToElement:
                    return new testcafeAutomation.DragToElement(this.elements[0], this.elements[1], this.command.options);
                case COMMAND_TYPE.typeText:
                    // eslint-disable-next-line no-restricted-properties
                    return new testcafeAutomation.Type(this.elements[0], this.command.text, this.command.options);
                case COMMAND_TYPE.selectText:
                case COMMAND_TYPE.selectTextAreaContent:
                    selectArgs = testcafeAutomation.calculateSelectTextArguments(this.elements[0], this.command);
                    return new testcafeAutomation.SelectText(this.elements[0], selectArgs.startPos, selectArgs.endPos, this.command.options);
                case COMMAND_TYPE.selectEditableContent:
                    return new testcafeAutomation.SelectEditableContent(this.elements[0], this.elements[1], this.command.options);
                case COMMAND_TYPE.pressKey:
                    return new testcafeAutomation.Press(testCafeCore.parseKeySequence(this.command.keys).combinations, this.command.options);
                case COMMAND_TYPE.setFilesToUpload:
                    return new testcafeAutomation.Upload(this.elements[0], this.command.filePath, function (filePaths, scannedFilePaths) { return new ActionCannotFindFileToUploadError(filePaths, scannedFilePaths); });
                case COMMAND_TYPE.clearUpload:
                    return new testcafeAutomation.Upload(this.elements[0]);
            }
            return null;
        };
        ActionExecutor.prototype._runAction = function (strictElementCheck) {
            var _this = this;
            return this
                ._ensureCommandElements()
                .then(function () { return _this._ensureCommandElementsProperties(); })
                .then(function () {
                _this._ensureCommandOptions();
                var automation = _this._createAutomation();
                if (automation.TARGET_ELEMENT_FOUND_EVENT) {
                    automation.on(automation.TARGET_ELEMENT_FOUND_EVENT, function (e) {
                        _this.targetElement = e.element;
                        _this.statusBar.hideWaitingElementStatus(true);
                        _this.executionStartedHandler();
                    });
                }
                else {
                    _this.statusBar.hideWaitingElementStatus(true);
                    _this.executionStartedHandler();
                }
                return automation
                    .run(strictElementCheck);
            });
        };
        ActionExecutor.prototype._runRecursively = function () {
            var _this = this;
            var actionFinished = false;
            var strictElementCheck = true;
            return testCafeCore.promiseUtils.whilst(function () { return !actionFinished; }, function () {
                return _this
                    ._runAction(strictElementCheck)
                    .then(function () {
                    actionFinished = true;
                })
                    .catch(function (err) {
                    if (_this._isExecutionTimeoutExpired()) {
                        if (err.message === testcafeAutomation.ERROR_TYPES.foundElementIsNotTarget) {
                            // If we can't get a target element via elementFromPoint but it's
                            // visible we click on the point where the element is located.
                            strictElementCheck = false;
                            return hammerhead.Promise.resolve();
                        }
                        throw err.message === testcafeAutomation.ERROR_TYPES.elementIsInvisibleError ?
                            new ActionElementIsInvisibleError() : err;
                    }
                    return testCafeCore.delay(CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL);
                });
            });
        };
        ActionExecutor.prototype.execute = function () {
            var _this = this;
            if (this.command.options && !this.command.options.speed)
                this.command.options.speed = this.testSpeed;
            var startPromise = new hammerhead.Promise(function (resolve) {
                _this.executionStartedHandler = resolve;
            });
            var completionPromise = new hammerhead.Promise(function (resolve) {
                _this.executionStartTime = new Date();
                try {
                    _this._ensureCommandArguments();
                }
                catch (err) {
                    resolve(new DriverStatus({ isCommandResult: true, executionError: err }));
                    return;
                }
                _this.commandSelectorTimeout = _this._getSpecificTimeout();
                _this.statusBar.showWaitingElementStatus(_this.commandSelectorTimeout);
                var _a = runWithBarriers(function () { return _this._runRecursively(); }), actionPromise = _a.actionPromise, barriersPromise = _a.barriersPromise;
                actionPromise
                    .then(function () { return hammerhead.Promise.all([
                    _this._delayAfterExecution(),
                    barriersPromise
                ]); })
                    .then(function () {
                    var status = { isCommandResult: true };
                    var elements = __spreadArrays(_this.elements);
                    if (_this.targetElement)
                        elements[0] = _this.targetElement;
                    status.result = createReplicator(new SelectorElementActionTransform()).encode(elements);
                    resolve(new DriverStatus(status));
                })
                    .catch(function (err) {
                    return _this.statusBar.hideWaitingElementStatus(false)
                        .then(function () { return resolve(new DriverStatus({ isCommandResult: true, executionError: err })); });
                });
            });
            return { startPromise: startPromise, completionPromise: completionPromise };
        };
        return ActionExecutor;
    }());
    function executeAction(command, globalSelectorTimeout, statusBar, testSpeed) {
        var actionExecutor = new ActionExecutor(command, globalSelectorTimeout, statusBar, testSpeed);
        return actionExecutor.execute();
    }

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    function limitNumber (value, min, max) {
        return Math.min(Math.max(min, value), max);
    }

    function determineDimensionBounds(bounds, maximum) {
        var hasMin = typeof bounds.min === 'number';
        var hasMax = typeof bounds.max === 'number';
        var hasLength = typeof bounds.length === 'number';
        if (hasLength)
            bounds.length = limitNumber(bounds.length, 0, maximum);
        if (hasMin && bounds.min < 0)
            bounds.min += maximum;
        if (hasMax && bounds.max < 0)
            bounds.max += maximum;
        if (!hasMin)
            bounds.min = hasMax && hasLength ? bounds.max - bounds.length : 0;
        if (!hasMax)
            bounds.max = hasLength ? bounds.min + bounds.length : maximum;
        bounds.min = limitNumber(bounds.min, 0, maximum);
        bounds.max = limitNumber(bounds.max, 0, maximum);
        bounds.length = bounds.max - bounds.min;
        return bounds;
    }
    function determineScrollPoint(cropStart, cropEnd, viewportBound) {
        return Math.round(cropStart + limitNumber(cropEnd - cropStart, 0, viewportBound) / 2);
    }
    function ensureCropOptions(element, options) {
        var elementRectangle = element.getBoundingClientRect();
        var elementBounds = {
            left: elementRectangle.left,
            right: elementRectangle.right,
            top: elementRectangle.top,
            bottom: elementRectangle.bottom
        };
        var elementMargin = testCafeCore.styleUtils.getElementMargin(element);
        var elementPadding = testCafeCore.styleUtils.getElementPadding(element);
        var elementBordersWidth = testCafeCore.styleUtils.getBordersWidth(element);
        options.originOffset = { x: 0, y: 0 };
        var scrollRight = elementBounds.left + element.scrollWidth + elementBordersWidth.left + elementBordersWidth.right;
        var scrollBottom = elementBounds.top + element.scrollHeight + elementBordersWidth.top + elementBordersWidth.bottom;
        elementBounds.right = Math.max(elementBounds.right, scrollRight);
        elementBounds.bottom = Math.max(elementBounds.bottom, scrollBottom);
        if (!options.includeBorders || !options.includePaddings) {
            options.originOffset.x += elementBordersWidth.left;
            options.originOffset.y += elementBordersWidth.top;
            elementBounds.left += elementBordersWidth.left;
            elementBounds.top += elementBordersWidth.top;
            elementBounds.right -= elementBordersWidth.right;
            elementBounds.bottom -= elementBordersWidth.bottom;
            if (!options.includePaddings) {
                options.originOffset.x += elementPadding.left;
                options.originOffset.y += elementPadding.top;
                elementBounds.left += elementPadding.left;
                elementBounds.top += elementPadding.top;
                elementBounds.right -= elementPadding.right;
                elementBounds.bottom -= elementPadding.bottom;
            }
        }
        else if (options.includeMargins) {
            options.originOffset.x -= elementMargin.left;
            options.originOffset.y -= elementMargin.top;
            elementBounds.left -= elementMargin.left;
            elementBounds.top -= elementMargin.top;
            elementBounds.right += elementMargin.right;
            elementBounds.bottom += elementMargin.bottom;
        }
        elementBounds.width = elementBounds.right - elementBounds.left;
        elementBounds.height = elementBounds.bottom - elementBounds.top;
        var horizontalCropBounds = determineDimensionBounds({ min: options.crop.left, max: options.crop.right, length: options.crop.width }, elementBounds.width);
        var verticalCropBounds = determineDimensionBounds({ min: options.crop.top, max: options.crop.bottom, length: options.crop.height }, elementBounds.height);
        options.crop.left = horizontalCropBounds.min;
        options.crop.right = horizontalCropBounds.max;
        options.crop.width = horizontalCropBounds.length;
        options.crop.top = verticalCropBounds.min;
        options.crop.bottom = verticalCropBounds.max;
        options.crop.height = verticalCropBounds.length;
        if (options.crop.width <= 0 || options.crop.height <= 0)
            throw new InvalidElementScreenshotDimensionsError(options.crop.width, options.crop.height);
        var viewportDimensions = testCafeCore.styleUtils.getViewportDimensions();
        if (elementBounds.width > viewportDimensions.width || elementBounds.height > viewportDimensions.height)
            options.scrollToCenter = true;
        var hasScrollTargetX = typeof options.scrollTargetX === 'number';
        var hasScrollTargetY = typeof options.scrollTargetY === 'number';
        if (!hasScrollTargetX)
            options.scrollTargetX = determineScrollPoint(options.crop.left, options.crop.right, viewportDimensions.width);
        if (!hasScrollTargetY)
            options.scrollTargetY = determineScrollPoint(options.crop.top, options.crop.bottom, viewportDimensions.height);
        var _a = testcafeAutomation.getOffsetOptions(element, options.scrollTargetX, options.scrollTargetY), offsetX = _a.offsetX, offsetY = _a.offsetY;
        options.scrollTargetX = offsetX;
        options.scrollTargetY = offsetY;
        var isScrollTargetXValid = !hasScrollTargetX || options.scrollTargetX >= options.crop.left && options.scrollTargetX <= options.crop.right;
        var isScrollTargetYValid = !hasScrollTargetY || options.scrollTargetY >= options.crop.top && options.scrollTargetY <= options.crop.bottom;
        if (!isScrollTargetXValid || !isScrollTargetYValid)
            throw new ActionInvalidScrollTargetError(isScrollTargetXValid, isScrollTargetYValid);
    }

    // -------------------------------------------------------------
    // WARNING: this file is used by both the client and the server.
    // Do not use any browser or node-specific API!
    // -------------------------------------------------------------
    function createIntegerValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'number')
                throw new ErrorCtor(name, valType);
            var isInteger = !isNaN(val) &&
                isFinite(val) &&
                val === Math.floor(val);
            if (!isInteger)
                throw new ErrorCtor(name, val);
        };
    }
    function createPositiveIntegerValidator(ErrorCtor) {
        var integerValidator = createIntegerValidator(ErrorCtor);
        return function (name, val) {
            integerValidator(name, val);
            if (val < 0)
                throw new ErrorCtor(name, val);
        };
    }
    function createBooleanValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'boolean')
                throw new ErrorCtor(name, valType);
        };
    }
    function createSpeedValidator(ErrorCtor) {
        return function (name, val) {
            var valType = typeof val;
            if (valType !== 'number')
                throw new ErrorCtor(name, valType);
            if (isNaN(val) || val < 0.01 || val > 1)
                throw new ErrorCtor(name, val);
        };
    }

    // -------------------------------------------------------------
    var integerOption = createIntegerValidator(ActionIntegerOptionError);
    var positiveIntegerOption = createPositiveIntegerValidator(ActionPositiveIntegerOptionError);
    var booleanOption = createBooleanValidator(ActionBooleanOptionError);
    var speedOption = createSpeedValidator(ActionSpeedOptionError);
    // Actions
    var ActionOptions = /** @class */ (function (_super) {
        __extends(ActionOptions, _super);
        function ActionOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.speed = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ActionOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'speed', type: speedOption }
            ];
        };
        return ActionOptions;
    }(Assignable));
    // Offset
    var OffsetOptions = /** @class */ (function (_super) {
        __extends(OffsetOptions, _super);
        function OffsetOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.offsetX = null;
            _this.offsetY = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        OffsetOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'offsetX', type: integerOption },
                { name: 'offsetY', type: integerOption }
            ]);
        };
        return OffsetOptions;
    }(ActionOptions));
    var ScrollOptions = /** @class */ (function (_super) {
        __extends(ScrollOptions, _super);
        function ScrollOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.scrollToCenter = false;
            _this.skipParentFrames = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ScrollOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'scrollToCenter', type: booleanOption },
                { name: 'skipParentFrames', type: booleanOption }
            ]);
        };
        return ScrollOptions;
    }(OffsetOptions));
    // Element Screenshot
    var ElementScreenshotOptions = /** @class */ (function (_super) {
        __extends(ElementScreenshotOptions, _super);
        function ElementScreenshotOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.scrollTargetX = null;
            _this.scrollTargetY = null;
            _this.includeMargins = false;
            _this.includeBorders = true;
            _this.includePaddings = true;
            _this.crop = {
                left: null,
                right: null,
                top: null,
                bottom: null
            };
            _this._assignFrom(obj, validate);
            return _this;
        }
        ElementScreenshotOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'scrollTargetX', type: integerOption },
                { name: 'scrollTargetY', type: integerOption },
                { name: 'crop.left', type: integerOption },
                { name: 'crop.right', type: integerOption },
                { name: 'crop.top', type: integerOption },
                { name: 'crop.bottom', type: integerOption },
                { name: 'includeMargins', type: booleanOption },
                { name: 'includeBorders', type: booleanOption },
                { name: 'includePaddings', type: booleanOption }
            ]);
        };
        return ElementScreenshotOptions;
    }(ActionOptions));
    // Mouse
    var MouseOptions = /** @class */ (function (_super) {
        __extends(MouseOptions, _super);
        function MouseOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.modifiers = {
                ctrl: false,
                alt: false,
                shift: false,
                meta: false
            };
            _this._assignFrom(obj, validate);
            return _this;
        }
        MouseOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'modifiers.ctrl', type: booleanOption },
                { name: 'modifiers.alt', type: booleanOption },
                { name: 'modifiers.shift', type: booleanOption },
                { name: 'modifiers.meta', type: booleanOption }
            ]);
        };
        return MouseOptions;
    }(OffsetOptions));
    // Click
    var ClickOptions = /** @class */ (function (_super) {
        __extends(ClickOptions, _super);
        function ClickOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.caretPos = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ClickOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'caretPos', type: positiveIntegerOption }
            ]);
        };
        return ClickOptions;
    }(MouseOptions));
    // Move
    var MoveOptions = /** @class */ (function (_super) {
        __extends(MoveOptions, _super);
        function MoveOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.speed = null;
            _this.minMovingTime = null;
            _this.holdLeftButton = false;
            _this.skipScrolling = false;
            _this.skipDefaultDragBehavior = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        MoveOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'speed' },
                { name: 'minMovingTime' },
                { name: 'holdLeftButton' },
                { name: 'skipScrolling', type: booleanOption },
                { name: 'skipDefaultDragBehavior', type: booleanOption }
            ]);
        };
        return MoveOptions;
    }(MouseOptions));
    // Type
    var TypeOptions = /** @class */ (function (_super) {
        __extends(TypeOptions, _super);
        function TypeOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.replace = false;
            _this.paste = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        TypeOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'replace', type: booleanOption },
                { name: 'paste', type: booleanOption }
            ]);
        };
        return TypeOptions;
    }(ClickOptions));
    // DragToElement
    var DragToElementOptions = /** @class */ (function (_super) {
        __extends(DragToElementOptions, _super);
        function DragToElementOptions(obj, validate) {
            var _this = _super.call(this, obj, validate) || this;
            _this.destinationOffsetX = null;
            _this.destinationOffsetY = null;
            _this._assignFrom(obj, validate);
            return _this;
        }
        DragToElementOptions.prototype._getAssignableProperties = function () {
            return _super.prototype._getAssignableProperties.call(this).concat([
                { name: 'destinationOffsetX', type: integerOption },
                { name: 'destinationOffsetY', type: integerOption }
            ]);
        };
        return DragToElementOptions;
    }(MouseOptions));
    //ResizeToFitDevice
    var ResizeToFitDeviceOptions = /** @class */ (function (_super) {
        __extends(ResizeToFitDeviceOptions, _super);
        function ResizeToFitDeviceOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.portraitOrientation = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        ResizeToFitDeviceOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'portraitOrientation', type: booleanOption }
            ];
        };
        return ResizeToFitDeviceOptions;
    }(Assignable));
    //Assertion
    var AssertionOptions = /** @class */ (function (_super) {
        __extends(AssertionOptions, _super);
        function AssertionOptions(obj, validate) {
            var _this = _super.call(this) || this;
            _this.timeout = void 0;
            _this.allowUnawaitedPromise = false;
            _this._assignFrom(obj, validate);
            return _this;
        }
        AssertionOptions.prototype._getAssignableProperties = function () {
            return [
                { name: 'timeout', type: positiveIntegerOption },
                { name: 'allowUnawaitedPromise', type: booleanOption }
            ];
        };
        return AssertionOptions;
    }(Assignable));

    var messageSandbox$1 = hammerhead.eventSandbox.message;
    var HIDING_UI_RELAYOUT_DELAY = 500;
    var POSSIBLE_RESIZE_ERROR_DELAY = 200;
    var MANIPULATION_REQUEST_CMD = 'driver|browser-manipulation|request';
    var MANIPULATION_RESPONSE_CMD = 'driver|browser-manipulation|response';
    // Setup cross-iframe interaction
    messageSandbox$1.on(messageSandbox$1.SERVICE_MSG_RECEIVED_EVENT, function (e) {
        if (e.message.cmd === MANIPULATION_REQUEST_CMD) {
            var element = testCafeCore.domUtils.findIframeByWindow(e.source);
            var _a = e.message, command = _a.command, cropDimensions = _a.cropDimensions;
            if (cropDimensions)
                command.options = new ElementScreenshotOptions({ crop: cropDimensions, includePaddings: false });
            var manipulation = new ManipulationExecutor(command);
            manipulation.element = element;
            manipulation
                .execute()
                .then(function (result) { return messageSandbox$1.sendServiceMsg({ cmd: MANIPULATION_RESPONSE_CMD, result: result }, e.source); });
        }
    });
    var ManipulationExecutor = /** @class */ (function () {
        function ManipulationExecutor(command, globalSelectorTimeout, statusBar) {
            this.command = command;
            this.globalSelectorTimeout = globalSelectorTimeout;
            this.statusBar = statusBar;
            this.element = null;
        }
        ManipulationExecutor.prototype._getAbsoluteCropValues = function () {
            var _a = this.element.getBoundingClientRect(), top = _a.top, left = _a.left;
            left += this.command.options.originOffset.x;
            top += this.command.options.originOffset.y;
            var right = left + this.command.options.crop.right;
            var bottom = top + this.command.options.crop.bottom;
            top += this.command.options.crop.top;
            left += this.command.options.crop.left;
            return { top: top, left: left, bottom: bottom, right: right };
        };
        ManipulationExecutor.prototype._createManipulationReadyMessage = function () {
            var dpr = window.devicePixelRatio || 1;
            var message = {
                cmd: TEST_RUN_MESSAGES.readyForBrowserManipulation,
                pageDimensions: {
                    dpr: dpr,
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                    documentWidth: document.documentElement.clientWidth,
                    documentHeight: document.documentElement.clientHeight,
                    bodyWidth: document.body.clientWidth,
                    bodyHeight: document.body.clientHeight
                },
                disableResending: true
            };
            if (this.command.type === COMMAND_TYPE.takeElementScreenshot)
                message.cropDimensions = this._getAbsoluteCropValues();
            return message;
        };
        ManipulationExecutor.prototype._runScrollBeforeScreenshot = function () {
            var _this = this;
            return hammerhead.Promise
                .resolve()
                .then(function () {
                if (_this.element || !_this.command.selector)
                    return hammerhead.Promise.resolve();
                var selectorTimeout = _this.command.selector.timeout;
                var specificSelectorTimeout = typeof selectorTimeout === 'number' ? selectorTimeout : _this.globalSelectorTimeout;
                _this.statusBar.showWaitingElementStatus(specificSelectorTimeout);
                return ensureElements([createElementDescriptor(_this.command.selector)], _this.globalSelectorTimeout)
                    .then(function (elements) {
                    _this.statusBar.hideWaitingElementStatus();
                    _this.element = elements[0];
                })
                    .catch(function (error) {
                    _this.statusBar.hideWaitingElementStatus();
                    throw error;
                });
            })
                .then(function () {
                ensureCropOptions(_this.element, _this.command.options);
                var _a = _this.command.options, scrollTargetX = _a.scrollTargetX, scrollTargetY = _a.scrollTargetY, scrollToCenter = _a.scrollToCenter;
                var scrollAutomation = new testcafeAutomation.Scroll(_this.element, new ScrollOptions({
                    offsetX: scrollTargetX,
                    offsetY: scrollTargetY,
                    scrollToCenter: scrollToCenter,
                    skipParentFrames: true
                }));
                return scrollAutomation.run();
            });
        };
        ManipulationExecutor.prototype._hideUI = function () {
            testcafeUi.hide();
            if (this.command.markData)
                testcafeUi.showScreenshotMark(this.command.markData);
            return testCafeCore.delay(HIDING_UI_RELAYOUT_DELAY);
        };
        ManipulationExecutor.prototype._showUI = function () {
            if (this.command.markData)
                testcafeUi.hideScreenshotMark();
            testcafeUi.show();
        };
        ManipulationExecutor.prototype._requestManipulation = function () {
            if (window.top === window)
                return hammerhead.transport.queuedAsyncServiceMsg(this._createManipulationReadyMessage());
            var cropDimensions = this._getAbsoluteCropValues();
            var iframeRequestPromise = testCafeCore.sendRequestToFrame({
                cmd: MANIPULATION_REQUEST_CMD,
                command: this.command,
                cropDimensions: cropDimensions
            }, MANIPULATION_RESPONSE_CMD, window.parent);
            return iframeRequestPromise
                .then(function (message) {
                if (!message.result)
                    return { result: null };
                var _a = message.result, result = _a.result, executionError = _a.executionError;
                if (executionError)
                    throw executionError;
                return { result: result };
            });
        };
        ManipulationExecutor.prototype._runManipulation = function () {
            var _this = this;
            var manipulationResult = null;
            return hammerhead.Promise
                .resolve()
                .then(function () {
                if (_this.command.type !== COMMAND_TYPE.takeElementScreenshot)
                    return hammerhead.Promise.resolve();
                testCafeCore.scrollController.stopPropagation();
                return _this._runScrollBeforeScreenshot();
            })
                .then(function () {
                if (window.top === window)
                    return _this._hideUI();
                return hammerhead.Promise.resolve();
            })
                .then(function () { return _this._requestManipulation(); })
                .then(function (_a) {
                var result = _a.result, error = _a.error;
                if (error)
                    throw error;
                testCafeCore.scrollController.enablePropagation();
                manipulationResult = result;
                if (window.top === window)
                    _this._showUI();
                return testCafeCore.delay(POSSIBLE_RESIZE_ERROR_DELAY);
            })
                .then(function () { return new DriverStatus({ isCommandResult: true, result: manipulationResult }); })
                .catch(function (err) {
                testCafeCore.scrollController.enablePropagation();
                return new DriverStatus({ isCommandResult: true, executionError: err });
            });
        };
        ManipulationExecutor.prototype.execute = function () {
            var _this = this;
            var barriersPromise = runWithBarriers(function () { return _this._runManipulation(); }).barriersPromise;
            return barriersPromise;
        };
        return ManipulationExecutor;
    }());
    function executeManipulationCommand (command, globalSelectorTimeout, statusBar) {
        var manipulationExecutor = new ManipulationExecutor(command, globalSelectorTimeout, statusBar);
        return manipulationExecutor.execute();
    }

    var createNativeXHR = hammerhead__default.createNativeXHR, utils = hammerhead__default.utils;
    function executeNavigateTo(command) {
        var navigationUrl = utils.url.getNavigationUrl(command.url, window);
        var ensurePagePromise = hammerhead__default.Promise.resolve();
        if (navigationUrl && testCafeCore.browser.isRetryingTestPagesEnabled())
            ensurePagePromise = testCafeCore.browser.fetchPageToCache(navigationUrl, createNativeXHR);
        return ensurePagePromise
            .then(function () {
            var requestBarrier = new testCafeCore.RequestBarrier();
            hammerhead__default.navigateTo(command.url, command.forceReload);
            return hammerhead__default.Promise.all([requestBarrier.wait(), testCafeCore.pageUnloadBarrier.wait()]);
        })
            .then(function () { return new DriverStatus({ isCommandResult: true }); })
            .catch(function (err) { return new DriverStatus({ isCommandResult: true, executionError: err }); });
    }

    function getResult(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError, statusBar) {
        var selectorExecutor = new SelectorExecutor(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError);
        statusBar.showWaitingElementStatus(selectorExecutor.timeout);
        return selectorExecutor.getResult()
            .then(function (el) {
            return statusBar.hideWaitingElementStatus(!!el)
                .then(function () { return el; });
        })
            .catch(function (err) {
            return statusBar.hideWaitingElementStatus(false)
                .then(function () {
                throw err;
            });
        });
    }
    function getResultDriverStatus(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError, statusBar) {
        var selectorExecutor = new SelectorExecutor(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError);
        statusBar.showWaitingElementStatus(selectorExecutor.timeout);
        return selectorExecutor.getResultDriverStatus()
            .then(function (status) {
            return statusBar.hideWaitingElementStatus(!!status.result)
                .then(function () { return status; });
        });
    }

    var Promise$1 = hammerhead__default.Promise;
    function executeChildWindowDriverLinkSelector(selector, childWindowLinks) {
        if (typeof selector === 'string') {
            var foundChildWindowDriverLink = testCafeCore.arrayUtils.find(childWindowLinks, function (link) { return link.windowId === selector; });
            if (!foundChildWindowDriverLink) {
                var error = new ChildWindowNotFoundError();
                return Promise$1.reject(error);
            }
            // NOTE: We cannot pass the driver window of the found child window driver link
            // because the current Promise implementation checks the type of the value passed to the 'resolve' function.
            // It causes an unhandled JavaScript error on accessing to cross-domain iframe.
            return Promise$1.resolve(foundChildWindowDriverLink);
        }
        // TODO:  Query url and title properties of the all driverLinks' windows
        return Promise$1.resolve(null);
    }

    var ChildWindowDriverLink = /** @class */ (function () {
        function ChildWindowDriverLink(driverWindow, windowId) {
            this.driverWindow = driverWindow;
            this.windowId = windowId;
        }
        ChildWindowDriverLink.prototype.setAsMaster = function () {
            var msg = new SetAsMasterMessage();
            return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
        };
        ChildWindowDriverLink.prototype.closeAllChildWindows = function () {
            var msg = new CloseAllChildWindowsMessage();
            return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CloseChildWindowError);
        };
        return ChildWindowDriverLink;
    }());

    var ParentWindowDriverLink = /** @class */ (function () {
        function ParentWindowDriverLink(currentDriverWindow) {
            this.currentDriverWindow = currentDriverWindow;
        }
        ParentWindowDriverLink.prototype._getTopOpenedWindow = function (wnd) {
            var topOpened = wnd;
            while (topOpened.opener)
                topOpened = topOpened.opener;
            return topOpened;
        };
        ParentWindowDriverLink.prototype._setAsMaster = function (wnd) {
            var msg = new SetAsMasterMessage();
            return sendMessageToDriver(msg, wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
        };
        ParentWindowDriverLink.prototype.setTopOpenedWindowAsMaster = function () {
            var wnd = this._getTopOpenedWindow(this.currentDriverWindow);
            return this._setAsMaster(wnd);
        };
        ParentWindowDriverLink.prototype.setParentWindowAsMaster = function () {
            var wnd = this.currentDriverWindow.opener;
            return this._setAsMaster(wnd);
        };
        return ParentWindowDriverLink;
    }());

    var DriverRole = {
        master: 'master',
        replica: 'replica'
    };

    var transport = hammerhead__default.transport;
    var Promise$2 = hammerhead__default.Promise;
    var messageSandbox$2 = hammerhead__default.eventSandbox.message;
    var storages = hammerhead__default.storages;
    var nativeMethods$4 = hammerhead__default.nativeMethods;
    var DateCtor = nativeMethods$4.date;
    var TEST_DONE_SENT_FLAG = 'testcafe|driver|test-done-sent-flag';
    var PENDING_STATUS = 'testcafe|driver|pending-status';
    var EXECUTING_CLIENT_FUNCTION_DESCRIPTOR = 'testcafe|driver|executing-client-function-descriptor';
    var SELECTOR_EXECUTION_START_TIME = 'testcafe|driver|selector-execution-start-time';
    var PENDING_PAGE_ERROR = 'testcafe|driver|pending-page-error';
    var ACTIVE_IFRAME_SELECTOR = 'testcafe|driver|active-iframe-selector';
    var TEST_SPEED = 'testcafe|driver|test-speed';
    var ASSERTION_RETRIES_TIMEOUT = 'testcafe|driver|assertion-retries-timeout';
    var ASSERTION_RETRIES_START_TIME = 'testcafe|driver|assertion-retries-start-time';
    var CONSOLE_MESSAGES = 'testcafe|driver|console-messages';
    var ACTION_IFRAME_ERROR_CTORS = {
        NotLoadedError: ActionIframeIsNotLoadedError,
        NotFoundError: ActionElementNotFoundError,
        IsInvisibleError: ActionElementIsInvisibleError
    };
    var CURRENT_IFRAME_ERROR_CTORS = {
        NotLoadedError: CurrentIframeIsNotLoadedError,
        NotFoundError: CurrentIframeNotFoundError,
        IsInvisibleError: CurrentIframeIsInvisibleError
    };
    var COMMAND_EXECUTION_MAX_TIMEOUT = Math.pow(2, 31) - 1;
    var EMPTY_COMMAND_EVENT_WAIT_TIMEOUT = 30 * 1000;
    var STATUS_WITH_COMMAND_RESULT_EVENT = 'status-with-command-result-event';
    var EMPTY_COMMAND_EVENT = 'empty-command-event';
    var Driver = /** @class */ (function (_super) {
        __extends(Driver, _super);
        function Driver(testRunId, communicationUrls, runInfo, options) {
            var _this = _super.call(this) || this;
            _this.COMMAND_EXECUTING_FLAG = 'testcafe|driver|command-executing-flag';
            _this.EXECUTING_IN_IFRAME_FLAG = 'testcafe|driver|executing-in-iframe-flag';
            _this.PENDING_WINDOW_SWITCHING_FLAG = 'testcafe|driver|pending-window-switching-flag';
            _this.testRunId = testRunId;
            _this.heartbeatUrl = communicationUrls.heartbeat;
            _this.browserStatusUrl = communicationUrls.status;
            _this.browserStatusDoneUrl = communicationUrls.statusDone;
            _this.browserActiveWindowId = communicationUrls.activeWindowId;
            _this.userAgent = runInfo.userAgent;
            _this.fixtureName = runInfo.fixtureName;
            _this.testName = runInfo.testName;
            _this.selectorTimeout = options.selectorTimeout;
            _this.pageLoadTimeout = options.pageLoadTimeout;
            _this.childWindowReadyTimeout = options.childWindowReadyTimeout;
            _this.initialSpeed = options.speed;
            _this.skipJsErrors = options.skipJsErrors;
            _this.dialogHandler = options.dialogHandler;
            _this.customCommandHandlers = {};
            _this.contextStorage = null;
            _this.nativeDialogsTracker = null;
            _this.childIframeDriverLinks = [];
            _this.activeChildIframeDriverLink = null;
            _this.childWindowDriverLinks = [];
            _this.parentWindowDriverLink = null;
            _this.statusBar = null;
            _this.windowId = _this._getCurrentWindowId();
            _this.role = DriverRole.replica;
            _this.setAsMasterInProgress = false;
            _this.checkClosedChildWindowIntervalId = null;
            if (options.retryTestPages)
                testCafeCore.browser.enableRetryingTestPages();
            _this.pageInitialRequestBarrier = new testCafeCore.RequestBarrier();
            _this.readyPromise = testCafeCore.eventUtils
                .documentReady(_this.pageLoadTimeout)
                .then(function () { return _this.pageInitialRequestBarrier.wait(true); });
            _this._initChildDriverListening();
            testCafeCore.pageUnloadBarrier.init();
            testCafeCore.preventRealEvents();
            hammerhead__default.on(hammerhead__default.EVENTS.uncaughtJsError, function (err) { return _this._onJsError(err); });
            hammerhead__default.on(hammerhead__default.EVENTS.unhandledRejection, function (err) { return _this._onJsError(err); });
            hammerhead__default.on(hammerhead__default.EVENTS.consoleMethCalled, function (e) { return _this._onConsoleMessage(e); });
            hammerhead__default.on(hammerhead__default.EVENTS.beforeFormSubmit, function (e) { return _this._onFormSubmit(e); });
            hammerhead__default.on(hammerhead__default.EVENTS.windowOpened, function (e) { return _this._onChildWindowOpened(e); });
            _this.setCustomCommandHandlers(COMMAND_TYPE.unlockPage, function () { return _this._unlockPageAfterTestIsDone(); });
            return _this;
        }
        Object.defineProperty(Driver.prototype, "speed", {
            get: function () {
                return this.contextStorage.getItem(TEST_SPEED);
            },
            set: function (val) {
                this.contextStorage.setItem(TEST_SPEED, val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Driver.prototype, "consoleMessages", {
            get: function () {
                return new BrowserConsoleMessages(this.contextStorage.getItem(CONSOLE_MESSAGES));
            },
            set: function (messages) {
                return this.contextStorage.setItem(CONSOLE_MESSAGES, messages ? messages.getCopy() : null);
            },
            enumerable: true,
            configurable: true
        });
        Driver.prototype._hasPendingActionFlags = function (contextStorage) {
            return contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
                contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);
        };
        Driver.prototype._getCurrentWindowId = function () {
            var currentUrl = window.location.toString();
            var parsedProxyUrl = hammerhead__default.utils.url.parseProxyUrl(currentUrl);
            return parsedProxyUrl && parsedProxyUrl.windowId || null;
        };
        // Error handling
        Driver.prototype._onJsError = function (err) {
            // NOTE: we should not send any message to the server if we've
            // sent the 'test-done' message but haven't got the response.
            if (this.skipJsErrors || this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
                return Promise$2.resolve();
            var error = new UncaughtErrorOnPage(err.stack, err.pageUrl);
            if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
                this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
            return null;
        };
        Driver.prototype._unlockPageAfterTestIsDone = function () {
            testCafeCore.disableRealEventsPreventing();
            return Promise$2.resolve();
        };
        Driver.prototype._failIfClientCodeExecutionIsInterrupted = function () {
            // NOTE: ClientFunction should be used primarily for observation. We raise
            // an error if the page was reloaded during ClientFunction execution.
            var executingClientFnDescriptor = this.contextStorage.getItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR);
            if (executingClientFnDescriptor) {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new ClientFunctionExecutionInterruptionError(executingClientFnDescriptor.instantiationCallsiteName)
                }));
                return true;
            }
            return false;
        };
        Driver.prototype.onCustomClientScriptError = function (err, moduleName) {
            var error = moduleName
                ? new UncaughtErrorInCustomClientScriptLoadedFromModule(err, moduleName)
                : new UncaughtErrorInCustomClientScriptCode(err);
            if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
                this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
        };
        Driver.prototype._addChildWindowDriverLink = function (e) {
            var childWindowDriverLink = new ChildWindowDriverLink(e.window, e.windowId);
            this.childWindowDriverLinks.push(childWindowDriverLink);
            this._ensureClosedChildWindowWatcher();
        };
        Driver.prototype._ensureClosedChildWindowWatcher = function () {
            var _this = this;
            if (this.checkClosedChildWindowIntervalId)
                return;
            this.checkClosedChildWindowIntervalId = nativeMethods$4.setInterval.call(window, function () {
                var firstClosedChildWindowDriverLink = testCafeCore.arrayUtils.find(_this.childWindowDriverLinks, function (childWindowDriverLink) { return childWindowDriverLink.driverWindow.closed; });
                if (!firstClosedChildWindowDriverLink)
                    return;
                testCafeCore.arrayUtils.remove(_this.childWindowDriverLinks, firstClosedChildWindowDriverLink);
                _this._setCurrentWindowAsMaster();
                if (!_this.childWindowDriverLinks.length)
                    nativeMethods$4.clearInterval.call(window, _this.checkClosedChildWindowIntervalId);
            }, CHECK_CHILD_WINDOW_CLOSED_INTERVAL);
        };
        Driver.prototype._setAsMasterInProgressOrCompleted = function () {
            return this.setAsMasterInProgress || this.role === DriverRole.master;
        };
        Driver.prototype._setCurrentWindowAsMaster = function () {
            var _this = this;
            if (this._setAsMasterInProgressOrCompleted())
                return;
            this.setAsMasterInProgress = true;
            Promise$2.resolve()
                .then(function () {
                return testCafeCore.browser.setActiveWindowId(_this.browserActiveWindowId, hammerhead__default.createNativeXHR, _this.windowId);
            })
                .then(function () {
                _this._startInternal({
                    finalizePendingCommand: true,
                    isFirstRequestAfterWindowSwitching: true
                });
                _this.setAsMasterInProgress = false;
            })
                .catch(function () {
                _this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new CannotSwitchToWindowError()
                }));
            });
        };
        Driver.prototype._onChildWindowOpened = function (e) {
            this._addChildWindowDriverLink(e);
            this._switchToChildWindow(e.windowId);
        };
        // HACK: For https://github.com/DevExpress/testcafe/issues/3560
        // We have to cancel every form submit after a test is done
        // to prevent requests to a closed session
        Driver.prototype._onFormSubmit = function (e) {
            // NOTE: We need to refactor this code to avoid the undefined value in contextStorage
            // https://github.com/DevExpress/testcafe/issues/4360
            if (this.contextStorage && this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
                e.preventSubmit = true;
        };
        // Console messages
        Driver.prototype._onConsoleMessage = function (_a) {
            var meth = _a.meth, line = _a.line;
            var messages = this.consoleMessages;
            messages.addMessage(meth, line, this.windowId);
            this.consoleMessages = messages;
        };
        // Status
        Driver.prototype._addPendingErrorToStatus = function (status) {
            var pendingPageError = this.contextStorage.getItem(PENDING_PAGE_ERROR);
            if (pendingPageError) {
                this.contextStorage.setItem(PENDING_PAGE_ERROR, null);
                status.pageError = pendingPageError;
            }
        };
        Driver.prototype._addUnexpectedDialogErrorToStatus = function (status) {
            var dialogError = this.nativeDialogsTracker.getUnexpectedDialogError();
            status.pageError = status.pageError || dialogError;
        };
        Driver.prototype._addConsoleMessagesToStatus = function (status) {
            status.consoleMessages = this.consoleMessages;
            this.consoleMessages = null;
        };
        Driver.prototype._addPendingWindowSwitchingStateToStatus = function (status) {
            status.isPendingWindowSwitching = !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
        };
        Driver.prototype._sendStatusRequest = function (status) {
            var statusRequestOptions = {
                cmd: TEST_RUN_MESSAGES.ready,
                status: status,
                disableResending: true,
                allowRejecting: true
            };
            var requestAttempt = function () { return testCafeCore.getTimeLimitedPromise(transport.asyncServiceMsg(statusRequestOptions), SEND_STATUS_REQUEST_TIME_LIMIT); };
            var retryRequest = function () { return testCafeCore.delay(SEND_STATUS_REQUEST_RETRY_DELAY).then(requestAttempt); };
            var statusPromise = requestAttempt();
            for (var i = 0; i < SEND_STATUS_REQUEST_RETRY_COUNT; i++)
                statusPromise = statusPromise.catch(retryRequest);
            return statusPromise;
        };
        Driver.prototype._sendStatus = function (status) {
            var _this = this;
            // NOTE: We should not modify the status if it is resent after
            // the page load because the server has cached the response
            if (!status.resent) {
                this._addPendingErrorToStatus(status);
                this._addUnexpectedDialogErrorToStatus(status);
                this._addConsoleMessagesToStatus(status);
                this._addPendingWindowSwitchingStateToStatus(status);
            }
            this.contextStorage.setItem(PENDING_STATUS, status);
            var readyCommandResponse = null;
            // NOTE: postpone status sending if the page is unloading
            return testCafeCore.pageUnloadBarrier
                .wait(0)
                .then(function () { return _this._sendStatusRequest(status); })
                //NOTE: do not execute the next command if the page is unloading
                .then(function (res) {
                readyCommandResponse = res;
                return testCafeCore.pageUnloadBarrier.wait(0);
            })
                .then(function () {
                _this.contextStorage.setItem(PENDING_STATUS, null);
                return readyCommandResponse;
            });
        };
        // Iframes and child windows interaction
        Driver.prototype._addChildIframeDriverLink = function (id, driverWindow) {
            var childIframeDriverLink = this._getChildIframeDriverLinkByWindow(driverWindow);
            if (!childIframeDriverLink) {
                var driverId = this.testRunId + "-" + generateId();
                childIframeDriverLink = new ChildIframeDriverLink(driverWindow, driverId);
                this.childIframeDriverLinks.push(childIframeDriverLink);
            }
            childIframeDriverLink.sendConfirmationMessage(id);
        };
        Driver.prototype._handleSetAsMasterMessage = function (msg, wnd) {
            var _this = this;
            // NOTE: The 'setAsMaster' message can be send a few times because
            // the 'sendMessageToDriver' function resend messages if the message confirmation is not received in 1 sec.
            // This message can be send even after driver is started.
            if (this._setAsMasterInProgressOrCompleted())
                return;
            this.setAsMasterInProgress = true;
            sendConfirmationMessage({
                requestMsgId: msg.id,
                window: wnd
            });
            Promise$2.resolve()
                .then(function () {
                return testCafeCore.browser.setActiveWindowId(_this.browserActiveWindowId, hammerhead__default.createNativeXHR, _this.windowId);
            })
                .then(function () {
                _this._startInternal();
                _this.setAsMasterInProgress = false;
            })
                .catch(function () {
                _this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new CannotSwitchToWindowError()
                }));
            });
        };
        Driver.prototype._handleCloseAllWindowsMessage = function (msg, wnd) {
            var _this = this;
            this._closeAllChildWindows()
                .then(function () {
                sendConfirmationMessage({
                    requestMsgId: msg.id,
                    window: wnd
                });
            })
                .catch(function () {
                _this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new CloseChildWindowError()
                }));
            });
        };
        Driver.prototype._initChildDriverListening = function () {
            var _this = this;
            messageSandbox$2.on(messageSandbox$2.SERVICE_MSG_RECEIVED_EVENT, function (e) {
                var msg = e.message;
                var window = e.source;
                if (msg.type === TYPE.establishConnection)
                    _this._addChildIframeDriverLink(msg.id, window);
                else if (msg.type === TYPE.setAsMaster)
                    _this._handleSetAsMasterMessage(msg, window);
                else if (msg.type === TYPE.closeAllChildWindows)
                    _this._handleCloseAllWindowsMessage(msg, window);
            });
        };
        Driver.prototype._getChildIframeDriverLinkByWindow = function (driverWindow) {
            return testCafeCore.arrayUtils.find(this.childIframeDriverLinks, function (link) { return link.driverWindow === driverWindow; });
        };
        Driver.prototype._getChildWindowDriverLinkByWindow = function (childDriverWindow) {
            return testCafeCore.arrayUtils.find(this.childWindowDriverLinks, function (link) { return link.driverWindow === childDriverWindow; });
        };
        Driver.prototype._runInActiveIframe = function (command) {
            var _this = this;
            var runningChain = Promise$2.resolve();
            var activeIframeSelector = this.contextStorage.getItem(ACTIVE_IFRAME_SELECTOR);
            // NOTE: if the page was reloaded we restore the active child driver link via the iframe selector
            if (!this.activeChildIframeDriverLink && activeIframeSelector)
                runningChain = this._switchToIframe(activeIframeSelector, CURRENT_IFRAME_ERROR_CTORS);
            runningChain
                .then(function () {
                _this.contextStorage.setItem(_this.EXECUTING_IN_IFRAME_FLAG, true);
                return _this.activeChildIframeDriverLink.executeCommand(command, _this.speed);
            })
                .then(function (status) { return _this._onCommandExecutedInIframe(status); })
                .catch(function (err) { return _this._onCommandExecutedInIframe(new DriverStatus({
                isCommandResult: true,
                executionError: err
            })); });
        };
        Driver.prototype._onCommandExecutedInIframe = function (status) {
            this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
            this._onReady(status);
        };
        Driver.prototype._ensureChildIframeDriverLink = function (iframeWindow, ErrorCtor, selectorTimeout) {
            var _this = this;
            // NOTE: a child iframe driver should establish connection with the parent when it's loaded.
            // Here we are waiting while the appropriate child iframe driver do this if it didn't do yet.
            return testCafeCore.waitFor(function () { return _this._getChildIframeDriverLinkByWindow(iframeWindow); }, CHECK_IFRAME_DRIVER_LINK_DELAY, selectorTimeout)
                .catch(function () {
                throw new ErrorCtor();
            });
        };
        Driver.prototype._ensureChildWindowDriverLink = function (childWindow, ErrorCtor, timeout) {
            var _this = this;
            // NOTE: a child window driver should establish connection with the parent when it's loaded.
            // Here we are waiting while the appropriate child window driver do this if it didn't do yet.
            return testCafeCore.waitFor(function () { return _this._getChildWindowDriverLinkByWindow(childWindow); }, CHECK_CHILD_WINDOW_DRIVER_LINK_DELAY, timeout)
                .catch(function () {
                throw new ErrorCtor();
            });
        };
        Driver.prototype._switchToIframe = function (selector, iframeErrorCtors) {
            var _this = this;
            var hasSpecificTimeout = typeof selector.timeout === 'number';
            var commandSelectorTimeout = hasSpecificTimeout ? selector.timeout : this.selectorTimeout;
            return getResult(selector, commandSelectorTimeout, null, function (fn) { return new iframeErrorCtors.NotFoundError(fn); }, function () { return new iframeErrorCtors.IsInvisibleError(); }, this.statusBar)
                .then(function (iframe) {
                if (!testCafeCore.domUtils.isIframeElement(iframe))
                    throw new ActionElementNotIframeError();
                return _this._ensureChildIframeDriverLink(nativeMethods$4.contentWindowGetter.call(iframe), iframeErrorCtors.NotLoadedError, commandSelectorTimeout);
            })
                .then(function (childDriverLink) {
                childDriverLink.availabilityTimeout = commandSelectorTimeout;
                _this.activeChildIframeDriverLink = childDriverLink;
                _this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, selector);
            });
        };
        Driver.prototype._createWaitForEventPromise = function (eventName, timeout) {
            var _this = this;
            var eventHandler = null;
            var timeoutPromise = new Promise$2(function (resolve) {
                nativeMethods$4.setTimeout.call(window, function () {
                    _this.off(eventName, eventHandler);
                    resolve();
                }, timeout);
            });
            var resultPromise = new Promise$2(function (resolve) {
                eventHandler = function () {
                    this.off(eventName, eventHandler);
                    resolve();
                };
                _this.on(eventName, eventHandler);
            });
            return Promise$2.race([timeoutPromise, resultPromise]);
        };
        Driver.prototype._waitForCurrentCommandCompletion = function () {
            if (!this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG))
                return Promise$2.resolve();
            return this._createWaitForEventPromise(STATUS_WITH_COMMAND_RESULT_EVENT, COMMAND_EXECUTION_MAX_TIMEOUT);
        };
        Driver.prototype._waitForEmptyCommand = function () {
            return this._createWaitForEventPromise(EMPTY_COMMAND_EVENT, EMPTY_COMMAND_EVENT_WAIT_TIMEOUT);
        };
        Driver.prototype._abortSwitchingToChildWindowIfItClosed = function () {
            if (!this.activeChildWindowDriverLink.driverWindow.closed)
                return;
            testCafeCore.arrayUtils.remove(this.childWindowDriverLinks, this.activeChildWindowDriverLink);
            this.activeChildWindowDriverLink = null;
            throw new ChildWindowClosedBeforeSwitchingError();
        };
        Driver.prototype._switchToChildWindow = function (selector) {
            var _this = this;
            this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, true);
            return executeChildWindowDriverLinkSelector(selector, this.childWindowDriverLinks)
                .then(function (childWindowDriverLink) {
                return _this._ensureChildWindowDriverLink(childWindowDriverLink.driverWindow, ChildWindowIsNotLoadedError, _this.childWindowReadyTimeout);
            })
                .then(function (childWindowDriverLink) {
                _this.activeChildWindowDriverLink = childWindowDriverLink;
                return _this._waitForCurrentCommandCompletion();
            })
                .then(function () {
                return _this._waitForEmptyCommand();
            })
                .then(function () {
                _this._abortSwitchingToChildWindowIfItClosed();
                _this._stopInternal();
                return _this.activeChildWindowDriverLink.setAsMaster();
            })
                .then(function () {
                _this.contextStorage.setItem(_this.PENDING_WINDOW_SWITCHING_FLAG, false);
            })
                .catch(function (err) {
                _this.contextStorage.setItem(_this.PENDING_WINDOW_SWITCHING_FLAG, false);
                if (err instanceof ChildWindowClosedBeforeSwitchingError) {
                    _this._onReady(new DriverStatus());
                    return;
                }
                _this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new CannotSwitchToWindowError()
                }));
            });
        };
        Driver.prototype._switchToTopParentWindow = function () {
            var switchFn = this.parentWindowDriverLink.setTopOpenedWindowAsMaster.bind(this.parentWindowDriverLink);
            this._switchToParentWindowInternal(switchFn);
        };
        Driver.prototype._switchToParentWindow = function () {
            var switchFn = this.parentWindowDriverLink.setParentWindowAsMaster.bind(this.parentWindowDriverLink);
            this._switchToParentWindowInternal(switchFn);
        };
        Driver.prototype._switchToParentWindowInternal = function (parentWindowSwitchFn) {
            var _this = this;
            this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, true);
            return Promise$2.resolve()
                .then(function () {
                _this._stopInternal();
                return parentWindowSwitchFn();
            })
                .then(function () {
                _this.contextStorage.setItem(_this.PENDING_WINDOW_SWITCHING_FLAG, false);
            })
                .catch(function () {
                _this.contextStorage.setItem(_this.PENDING_WINDOW_SWITCHING_FLAG, false);
                _this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError: new CannotSwitchToWindowError()
                }));
            });
        };
        Driver.prototype._switchToMainWindow = function (command) {
            if (this.activeChildIframeDriverLink)
                this.activeChildIframeDriverLink.executeCommand(command);
            this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, null);
            this.activeChildIframeDriverLink = null;
        };
        Driver.prototype._setNativeDialogHandlerInIframes = function (dialogHandler) {
            var msg = new SetNativeDialogHandlerMessage(dialogHandler);
            for (var i = 0; i < this.childIframeDriverLinks.length; i++)
                messageSandbox$2.sendServiceMsg(msg, this.childIframeDriverLinks[i].driverWindow);
        };
        // Commands handling
        Driver.prototype._onActionCommand = function (command) {
            var _this = this;
            var _a = executeAction(command, this.selectorTimeout, this.statusBar, this.speed), startPromise = _a.startPromise, completionPromise = _a.completionPromise;
            startPromise.then(function () { return _this.contextStorage.setItem(_this.COMMAND_EXECUTING_FLAG, true); });
            completionPromise
                .then(function (driverStatus) {
                _this.contextStorage.setItem(_this.COMMAND_EXECUTING_FLAG, false);
                return _this._onReady(driverStatus);
            });
        };
        Driver.prototype._onSetNativeDialogHandlerCommand = function (command) {
            this.nativeDialogsTracker.setHandler(command.dialogHandler);
            this._setNativeDialogHandlerInIframes(command.dialogHandler);
            this._onReady(new DriverStatus({ isCommandResult: true }));
        };
        Driver.prototype._onGetNativeDialogHistoryCommand = function () {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                result: this.nativeDialogsTracker.appearedDialogs
            }));
        };
        Driver.prototype._onGetBrowserConsoleMessagesCommand = function () {
            this._onReady(new DriverStatus({ isCommandResult: true }));
        };
        Driver.prototype._onNavigateToCommand = function (command) {
            var _this = this;
            this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);
            executeNavigateTo(command)
                .then(function (driverStatus) {
                _this.contextStorage.setItem(_this.COMMAND_EXECUTING_FLAG, false);
                return _this._onReady(driverStatus);
            });
        };
        Driver.prototype._onExecuteClientFunctionCommand = function (command) {
            var _this = this;
            this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, { instantiationCallsiteName: command.instantiationCallsiteName });
            var executor = new ClientFunctionExecutor(command);
            executor.getResultDriverStatus()
                .then(function (driverStatus) {
                _this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, null);
                _this._onReady(driverStatus);
            });
        };
        Driver.prototype._onExecuteSelectorCommand = function (command) {
            var _this = this;
            var startTime = this.contextStorage.getItem(SELECTOR_EXECUTION_START_TIME) || new DateCtor();
            var elementNotFoundOrNotVisible = function (fn) { return new CannotObtainInfoForElementSpecifiedBySelectorError(null, fn); };
            var createError = command.needError ? elementNotFoundOrNotVisible : null;
            getResultDriverStatus(command, this.selectorTimeout, startTime, createError, createError, this.statusBar)
                .then(function (driverStatus) {
                _this.contextStorage.setItem(SELECTOR_EXECUTION_START_TIME, null);
                _this._onReady(driverStatus);
            });
        };
        Driver.prototype._onSwitchToMainWindowCommand = function (command) {
            this._switchToMainWindow(command);
            this._onReady(new DriverStatus({ isCommandResult: true }));
        };
        Driver.prototype._onSwitchToIframeCommand = function (command) {
            var _this = this;
            this
                ._switchToIframe(command.selector, ACTION_IFRAME_ERROR_CTORS)
                .then(function () { return _this._onReady(new DriverStatus({ isCommandResult: true })); })
                .catch(function (err) { return _this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError: err
            })); });
        };
        Driver.prototype._onBrowserManipulationCommand = function (command) {
            var _this = this;
            this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);
            executeManipulationCommand(command, this.selectorTimeout, this.statusBar)
                .then(function (driverStatus) {
                _this.contextStorage.setItem(_this.COMMAND_EXECUTING_FLAG, false);
                return _this._onReady(driverStatus);
            });
        };
        Driver.prototype._onSetBreakpointCommand = function (isTestError) {
            var _this = this;
            this.statusBar.showDebuggingStatus(isTestError)
                .then(function (stopAfterNextAction) { return _this._onReady(new DriverStatus({
                isCommandResult: true,
                result: stopAfterNextAction
            })); });
        };
        Driver.prototype._onSetTestSpeedCommand = function (command) {
            this.speed = command.speed;
            this._onReady(new DriverStatus({ isCommandResult: true }));
        };
        Driver.prototype._onShowAssertionRetriesStatusCommand = function (command) {
            this.contextStorage.setItem(ASSERTION_RETRIES_TIMEOUT, command.timeout);
            this.contextStorage.setItem(ASSERTION_RETRIES_START_TIME, Date.now());
            this.statusBar.showWaitingAssertionRetriesStatus(command.timeout);
            this._onReady(new DriverStatus({ isCommandResult: true }));
        };
        Driver.prototype._onHideAssertionRetriesStatusCommand = function (command) {
            var _this = this;
            this.contextStorage.setItem(ASSERTION_RETRIES_TIMEOUT, null);
            this.contextStorage.setItem(ASSERTION_RETRIES_START_TIME, null);
            this.statusBar.hideWaitingAssertionRetriesStatus(command.success)
                .then(function () { return _this._onReady(new DriverStatus({ isCommandResult: true })); });
        };
        Driver.prototype._checkStatus = function () {
            var _this = this;
            return testCafeCore.browser
                .checkStatus(this.browserStatusDoneUrl, hammerhead__default.createNativeXHR, { manualRedirect: true })
                .then(function (_a) {
                var command = _a.command, redirecting = _a.redirecting;
                var isSessionChange = redirecting && command.url.indexOf(_this.testRunId) < 0;
                if (isSessionChange) {
                    storages.clear();
                    storages.lock();
                }
                else
                    _this.contextStorage.setItem(TEST_DONE_SENT_FLAG, false);
                if (redirecting)
                    testCafeCore.browser.redirect(command);
                else
                    _this._onReady({ isCommandResult: false });
            })
                .catch(function () {
                return testCafeCore.delay(CHECK_STATUS_RETRY_DELAY);
            });
        };
        Driver.prototype._onCustomCommand = function (command) {
            var _this = this;
            var handler = this.customCommandHandlers[command.type].handler;
            handler(command).then(function (result) {
                _this._onReady(new DriverStatus({ isCommandResult: true, result: result }));
            });
        };
        Driver.prototype._closeAllChildWindows = function () {
            var _this = this;
            if (!this.childWindowDriverLinks.length)
                return Promise$2.resolve();
            return Promise$2.all(this.childWindowDriverLinks.map(function (childWindowDriverLink) {
                return childWindowDriverLink.closeAllChildWindows();
            }))
                .then(function () {
                nativeMethods$4.arrayForEach.call(_this.childWindowDriverLinks, function (childWindowDriverLink) {
                    childWindowDriverLink.driverWindow.close();
                });
            });
        };
        Driver.prototype._onTestDone = function (status) {
            var _this = this;
            this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);
            if (this.parentWindowDriverLink)
                this._switchToTopParentWindow();
            else {
                this._closeAllChildWindows()
                    .then(function () {
                    return _this._sendStatus(status);
                })
                    .then(function () {
                    _this._checkStatus();
                })
                    .catch(function () {
                    _this._onReady(new DriverStatus({
                        isCommandResult: true,
                        executionError: CloseChildWindowError
                    }));
                });
            }
        };
        Driver.prototype._onBackupStoragesCommand = function () {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                result: storages.backup()
            }));
        };
        Driver.prototype._isStatusWithCommandResultInPendingWindowSwitchingMode = function (status) {
            return status.isCommandResult && !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
        };
        Driver.prototype._isEmptyCommandInPendingWindowSwitchingMode = function (command) {
            return !command && !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
        };
        // Routing
        Driver.prototype._onReady = function (status) {
            var _this = this;
            if (this._isStatusWithCommandResultInPendingWindowSwitchingMode(status))
                this.emit(STATUS_WITH_COMMAND_RESULT_EVENT);
            this._sendStatus(status)
                .then(function (command) {
                if (command)
                    _this._onCommand(command);
                else {
                    if (_this._isEmptyCommandInPendingWindowSwitchingMode(command)) {
                        _this.emit(EMPTY_COMMAND_EVENT);
                        return;
                    }
                    // NOTE: the driver gets an empty response if TestRun doesn't get a new command within 2 minutes
                    _this._onReady(new DriverStatus());
                }
            });
        };
        Driver.prototype._executeCommand = function (command) {
            if (this.customCommandHandlers[command.type])
                this._onCustomCommand(command);
            else if (command.type === COMMAND_TYPE.testDone)
                this._onTestDone(new DriverStatus({ isCommandResult: true }));
            else if (command.type === COMMAND_TYPE.setBreakpoint)
                this._onSetBreakpointCommand(command.isTestError);
            else if (command.type === COMMAND_TYPE.switchToMainWindow)
                this._onSwitchToMainWindowCommand(command);
            else if (command.type === COMMAND_TYPE.switchToIframe)
                this._onSwitchToIframeCommand(command);
            else if (isBrowserManipulationCommand(command))
                this._onBrowserManipulationCommand(command);
            else if (command.type === COMMAND_TYPE.executeClientFunction)
                this._onExecuteClientFunctionCommand(command);
            else if (command.type === COMMAND_TYPE.executeSelector)
                this._onExecuteSelectorCommand(command);
            else if (command.type === COMMAND_TYPE.navigateTo)
                this._onNavigateToCommand(command);
            else if (command.type === COMMAND_TYPE.setNativeDialogHandler)
                this._onSetNativeDialogHandlerCommand(command);
            else if (command.type === COMMAND_TYPE.getNativeDialogHistory)
                this._onGetNativeDialogHistoryCommand(command);
            else if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
                this._onGetBrowserConsoleMessagesCommand(command);
            else if (command.type === COMMAND_TYPE.setTestSpeed)
                this._onSetTestSpeedCommand(command);
            else if (command.type === COMMAND_TYPE.showAssertionRetriesStatus)
                this._onShowAssertionRetriesStatusCommand(command);
            else if (command.type === COMMAND_TYPE.hideAssertionRetriesStatus)
                this._onHideAssertionRetriesStatusCommand(command);
            else if (command.type === COMMAND_TYPE.backupStorages)
                this._onBackupStoragesCommand();
            else
                this._onActionCommand(command);
        };
        Driver.prototype._isExecutableInTopWindowOnly = function (command) {
            if (isExecutableInTopWindowOnly(command))
                return true;
            var customCommandHandler = this.customCommandHandlers[command.type];
            return command.forceExecutionInTopWindowOnly || customCommandHandler && customCommandHandler.isExecutableInTopWindowOnly;
        };
        Driver.prototype._onCommand = function (command) {
            var _this = this;
            // NOTE: the driver sends status to the server as soon as it's created,
            // but it should wait until the page is loaded before executing a command.
            this.readyPromise
                .then(function () {
                // NOTE: we should not execute a command if we already have a pending page error and this command is
                // rejectable by page errors. In this case, we immediately send status with this error to the server.
                var isCommandRejectableByError = isCommandRejectableByPageError(command);
                var pendingPageError = _this.contextStorage.getItem(PENDING_PAGE_ERROR);
                if (pendingPageError && isCommandRejectableByError) {
                    _this._onReady(new DriverStatus({ isCommandResult: true }));
                    return;
                }
                // NOTE: we should execute a command in an iframe if the current execution context belongs to
                // this iframe and the command is not one of those that can be executed only in the top window.
                var isThereActiveIframe = _this.activeChildIframeDriverLink ||
                    _this.contextStorage.getItem(ACTIVE_IFRAME_SELECTOR);
                if (!_this._isExecutableInTopWindowOnly(command) && isThereActiveIframe) {
                    _this._runInActiveIframe(command);
                    return;
                }
                _this._executeCommand(command);
            });
        };
        // API
        Driver.prototype.setCustomCommandHandlers = function (command, handler, executeInTopWindowOnly) {
            this.customCommandHandlers[command] = {
                isExecutableInTopWindowOnly: executeInTopWindowOnly,
                handler: handler
            };
        };
        Driver.prototype._startInternal = function (opts) {
            this.role = DriverRole.master;
            testCafeCore.browser.startHeartbeat(this.heartbeatUrl, hammerhead__default.createNativeXHR);
            this._setupAssertionRetryIndication();
            this._startCommandsProcessing(opts);
        };
        Driver.prototype._stopInternal = function () {
            this.role = DriverRole.replica;
            testCafeCore.browser.stopHeartbeat();
            testcafeAutomation.cursor.hide();
        };
        Driver.prototype._setupAssertionRetryIndication = function () {
            var _this = this;
            this.readyPromise.then(function () {
                _this.statusBar.hidePageLoadingStatus();
                var assertionRetriesTimeout = _this.contextStorage.getItem(ASSERTION_RETRIES_TIMEOUT);
                if (assertionRetriesTimeout) {
                    var startTime = _this.contextStorage.getItem(ASSERTION_RETRIES_START_TIME);
                    var timeLeft = assertionRetriesTimeout - (new Date() - startTime);
                    if (timeLeft > 0)
                        _this.statusBar.showWaitingAssertionRetriesStatus(assertionRetriesTimeout, startTime);
                }
            });
        };
        Driver.prototype._startCommandsProcessing = function (opts) {
            if (opts === void 0) { opts = { finalizePendingCommand: false, isFirstRequestAfterWindowSwitching: false }; }
            var pendingStatus = this.contextStorage.getItem(PENDING_STATUS);
            if (pendingStatus)
                pendingStatus.resent = true;
            // NOTE: we should not send any message to the server if we've
            // sent the 'test-done' message but haven't got the response.
            if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG)) {
                if (pendingStatus)
                    this._onTestDone(pendingStatus);
                else
                    this._checkStatus();
                return;
            }
            if (this._failIfClientCodeExecutionIsInterrupted())
                return;
            var finalizePendingCommand = opts.finalizePendingCommand || this._hasPendingActionFlags(this.contextStorage);
            var status = pendingStatus || new DriverStatus({
                isCommandResult: finalizePendingCommand,
                isFirstRequestAfterWindowSwitching: opts.isFirstRequestAfterWindowSwitching
            });
            this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
            this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
            this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);
            this._onReady(status);
        };
        Driver.prototype._initParentWindowLink = function () {
            if (window.opener)
                this.parentWindowDriverLink = new ParentWindowDriverLink(window);
        };
        Driver.prototype._initConsoleMessages = function () {
            var messages = this.consoleMessages;
            messages.ensureMessageContainer(this.windowId);
            this.consoleMessages = messages;
        };
        Driver.prototype._getDriverRole = function () {
            var _this = this;
            if (!this.windowId)
                return Promise$2.resolve(DriverRole.master);
            return testCafeCore.browser
                .getActiveWindowId(this.browserActiveWindowId, hammerhead__default.createNativeXHR)
                .then(function (_a) {
                var activeWindowId = _a.activeWindowId;
                return activeWindowId === _this.windowId ?
                    DriverRole.master :
                    DriverRole.replica;
            });
        };
        Driver.prototype._init = function () {
            this.contextStorage = new Storage(window, this.testRunId, this.windowId);
            this.nativeDialogsTracker = new NativeDialogTracker(this.contextStorage, this.dialogHandler);
            this.statusBar = new testcafeUi.StatusBar(this.userAgent, this.fixtureName, this.testName, this.contextStorage);
            this.statusBar.on(this.statusBar.UNLOCK_PAGE_BTN_CLICK, testCafeCore.disableRealEventsPreventing);
            this.speed = this.initialSpeed;
            this._initConsoleMessages();
        };
        Driver.prototype.start = function () {
            var _this = this;
            this._init();
            this._getDriverRole()
                .then(function (role) {
                if (role === DriverRole.master)
                    _this._startInternal();
                else
                    _this._initParentWindowLink();
            });
        };
        return Driver;
    }(testCafeCore.serviceUtils.EventEmitter));

    var ParentIframeDriverLink = /** @class */ (function () {
        function ParentIframeDriverLink(parentDriverWindow) {
            this.driverWindow = parentDriverWindow;
        }
        ParentIframeDriverLink.prototype.establishConnection = function () {
            var msg = new EstablishConnectionMessage();
            return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT, CurrentIframeIsNotLoadedError)
                .then(function (response) { return response.result.id; });
        };
        ParentIframeDriverLink.prototype.sendConfirmationMessage = function (requestMsgId) {
            sendConfirmationMessage({
                requestMsgId: requestMsgId,
                window: this.driverWindow
            });
        };
        ParentIframeDriverLink.prototype.onCommandExecuted = function (status) {
            var msg = new CommandExecutedMessage(status);
            hammerhead.eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
        };
        return ParentIframeDriverLink;
    }());

    var messageSandbox$3 = hammerhead__default.eventSandbox.message;
    var IframeNativeDialogTracker = /** @class */ (function (_super) {
        __extends(IframeNativeDialogTracker, _super);
        function IframeNativeDialogTracker(dialogHandler) {
            return _super.call(this, null, dialogHandler) || this;
        }
        IframeNativeDialogTracker.prototype._defaultDialogHandler = function (type) {
            messageSandbox$3.sendServiceMsg({
                type: MESSAGE_TYPE.unexpectedDialog,
                dialogType: type,
                url: NativeDialogTracker._getPageUrl()
            }, window.top);
        };
        IframeNativeDialogTracker.prototype._addAppearedDialogs = function (type, text) {
            messageSandbox$3.sendServiceMsg({
                type: MESSAGE_TYPE.appearedDialog,
                dialogType: type,
                text: text,
                url: NativeDialogTracker._getPageUrl()
            }, window.top);
        };
        IframeNativeDialogTracker.prototype._onHandlerError = function (type, message) {
            messageSandbox$3.sendServiceMsg({
                type: MESSAGE_TYPE.handlerError,
                dialogType: type,
                message: message,
                url: NativeDialogTracker._getPageUrl()
            }, window.top);
        };
        return IframeNativeDialogTracker;
    }(NativeDialogTracker));

    var IframeDriver = /** @class */ (function (_super) {
        __extends(IframeDriver, _super);
        function IframeDriver(testRunId, options) {
            var _this = _super.call(this, testRunId, {}, {}, options) || this;
            _this.lastParentDriverMessageId = null;
            _this.parentDriverLink = new ParentIframeDriverLink(window.parent);
            _this._initParentDriverListening();
            return _this;
        }
        // Errors handling
        IframeDriver.prototype._onJsError = function () {
            // NOTE: do nothing because hammerhead sends js error to the top window directly
        };
        IframeDriver.prototype._onConsoleMessage = function () {
            // NOTE: do nothing because hammerhead sends console messages to the top window directly
        };
        // Messaging between drivers
        IframeDriver.prototype._initParentDriverListening = function () {
            var _this = this;
            hammerhead.eventSandbox.message.on(hammerhead.eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, function (e) {
                var msg = e.message;
                testCafeCore.pageUnloadBarrier
                    .wait(0)
                    .then(function () {
                    // NOTE: the parent driver repeats commands sent to a child driver if it doesn't get a confirmation
                    // from the child in time. However, confirmations sent by child drivers may be delayed when the browser
                    // is heavily loaded. That's why the child driver should ignore repeated messages from its parent.
                    if (msg.type === TYPE.executeCommand) {
                        if (_this.lastParentDriverMessageId === msg.id)
                            return;
                        _this.lastParentDriverMessageId = msg.id;
                        _this.readyPromise.then(function () {
                            _this.speed = msg.testSpeed;
                            _this.parentDriverLink.sendConfirmationMessage(msg.id);
                            _this._onCommand(msg.command);
                        });
                    }
                    if (msg.type === TYPE.setNativeDialogHandler) {
                        _this.nativeDialogsTracker.setHandler(msg.dialogHandler);
                        _this._setNativeDialogHandlerInIframes(msg.dialogHandler);
                    }
                });
            });
        };
        // Commands handling
        IframeDriver.prototype._onSwitchToMainWindowCommand = function (command) {
            this._switchToMainWindow(command);
        };
        // Routing
        IframeDriver.prototype._onReady = function (status) {
            this.parentDriverLink.onCommandExecuted(status);
        };
        // API
        IframeDriver.prototype.start = function () {
            var _this = this;
            this.nativeDialogsTracker = new IframeNativeDialogTracker(this.dialogHandler);
            this.statusBar = new testcafeUi.IframeStatusBar();
            var initializePromise = this.parentDriverLink
                .establishConnection()
                .then(function (id) {
                _this.contextStorage = new Storage(window, id, _this.windowId);
                if (_this._failIfClientCodeExecutionIsInterrupted())
                    return;
                var inCommandExecution = _this.contextStorage.getItem(_this.COMMAND_EXECUTING_FLAG) ||
                    _this.contextStorage.getItem(_this.EXECUTING_IN_IFRAME_FLAG);
                if (inCommandExecution) {
                    _this.contextStorage.setItem(_this.COMMAND_EXECUTING_FLAG, false);
                    _this.contextStorage.setItem(_this.EXECUTING_IN_IFRAME_FLAG, false);
                    _this._onReady(new DriverStatus({ isCommandResult: true }));
                }
            });
            this.readyPromise = hammerhead.Promise.all([this.readyPromise, initializePromise]);
        };
        return IframeDriver;
    }(Driver));

    var embeddingUtils = {
        NodeSnapshot: NodeSnapshot,
        ElementSnapshot: ElementSnapshot,
        SelectorExecutor: SelectorExecutor
    };

    var INTERNAL_PROPERTIES = {
        testCafeDriver: '%testCafeDriver%',
        testCafeIframeDriver: '%testCafeIframeDriver%',
        scriptExecutionBarrier: '%ScriptExecutionBarrier%',
        testCafeEmbeddingUtils: '%testCafeEmbeddingUtils%',
        testCafeDriverInstance: '%testCafeDriverInstance%'
    };

    var nativeMethods$5 = hammerhead__default.nativeMethods;
    var evalIframeScript = hammerhead__default.EVENTS.evalIframeScript;
    nativeMethods$5.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeDriver, { configurable: true, value: Driver });
    nativeMethods$5.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeIframeDriver, { configurable: true, value: IframeDriver });
    nativeMethods$5.objectDefineProperty(window, INTERNAL_PROPERTIES.scriptExecutionBarrier, {
        configurable: true,
        value: ScriptExecutionBarrier
    });
    nativeMethods$5.objectDefineProperty(window, INTERNAL_PROPERTIES.testCafeEmbeddingUtils, { configurable: true, value: embeddingUtils });
    // eslint-disable-next-line no-undef
    hammerhead__default.on(evalIframeScript, function (e) { return initTestCafeClientDrivers(nativeMethods$5.contentWindowGetter.call(e.iframe), true); });

}(window['%hammerhead%'], window['%testCafeCore%'], window['%testCafeAutomation%'], window['%testCafeUI%']));

    }

    initTestCafeClientDrivers(window);
})();
