"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = __importDefault(require("./type"));
const selector_builder_1 = __importDefault(require("../../client-functions/selectors/selector-builder"));
const client_function_builder_1 = __importDefault(require("../../client-functions/client-function-builder"));
const builder_symbol_1 = __importDefault(require("../../client-functions/builder-symbol"));
const base_1 = __importDefault(require("./base"));
const options_1 = require("./options");
const initializers_1 = require("./validations/initializers");
const execute_js_expression_1 = require("../execute-js-expression");
const utils_1 = require("./utils");
const argument_1 = require("./validations/argument");
const test_run_1 = require("../../errors/test-run");
const observation_1 = require("./observation");
// Initializers
function initActionOptions(name, val) {
    return new options_1.ActionOptions(val, true);
}
function initClickOptions(name, val) {
    return new options_1.ClickOptions(val, true);
}
function initMouseOptions(name, val) {
    return new options_1.MouseOptions(val, true);
}
function initTypeOptions(name, val) {
    return new options_1.TypeOptions(val, true);
}
function initDragToElementOptions(name, val) {
    return new options_1.DragToElementOptions(val, true);
}
function initDialogHandler(name, val, { skipVisibilityCheck, testRun }) {
    let fn;
    if (utils_1.isJSExpression(val))
        fn = execute_js_expression_1.executeJsExpression(val.value, testRun, { skipVisibilityCheck });
    else
        fn = val.fn;
    if (fn === null || fn instanceof observation_1.ExecuteClientFunctionCommand)
        return fn;
    const options = val.options;
    const methodName = 'setNativeDialogHandler';
    const functionType = typeof fn;
    let builder = fn && fn[builder_symbol_1.default];
    const isSelector = builder instanceof selector_builder_1.default;
    const isClientFunction = builder instanceof client_function_builder_1.default;
    if (functionType !== 'function' || isSelector)
        throw new test_run_1.SetNativeDialogHandlerCodeWrongTypeError(isSelector ? 'Selector' : functionType);
    if (isClientFunction)
        builder = fn.with(options)[builder_symbol_1.default];
    else
        builder = new client_function_builder_1.default(fn, options, { instantiation: methodName, execution: methodName });
    return builder.getCommand([]);
}
// Commands
class ClickCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.click);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initClickOptions, required: true }
        ];
    }
}
exports.ClickCommand = ClickCommand;
class RightClickCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.rightClick);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initClickOptions, required: true }
        ];
    }
}
exports.RightClickCommand = RightClickCommand;
class ExecuteExpressionCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.executeExpression);
    }
    _getAssignableProperties() {
        return [
            { name: 'expression', type: argument_1.nonEmptyStringArgument, required: true },
            { name: 'resultVariableName', type: argument_1.nonEmptyStringArgument, defaultValue: null }
        ];
    }
}
exports.ExecuteExpressionCommand = ExecuteExpressionCommand;
class ExecuteAsyncExpressionCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.executeAsyncExpression);
    }
    _getAssignableProperties() {
        return [
            { name: 'expression', type: argument_1.stringArgument, required: true }
        ];
    }
}
exports.ExecuteAsyncExpressionCommand = ExecuteAsyncExpressionCommand;
class DoubleClickCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.doubleClick);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initClickOptions, required: true }
        ];
    }
}
exports.DoubleClickCommand = DoubleClickCommand;
class HoverCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.hover);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initMouseOptions, required: true }
        ];
    }
}
exports.HoverCommand = HoverCommand;
class TypeTextCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.typeText);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'text', type: argument_1.nonEmptyStringArgument, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initTypeOptions, required: true }
        ];
    }
}
exports.TypeTextCommand = TypeTextCommand;
class DragCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.drag);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'dragOffsetX', type: argument_1.integerArgument, required: true },
            { name: 'dragOffsetY', type: argument_1.integerArgument, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initMouseOptions, required: true }
        ];
    }
}
exports.DragCommand = DragCommand;
class DragToElementCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.dragToElement);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'destinationSelector', init: initializers_1.initSelector, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initDragToElementOptions, required: true }
        ];
    }
}
exports.DragToElementCommand = DragToElementCommand;
class SelectTextCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.selectText);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'startPos', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: argument_1.actionOptions, init: initActionOptions, required: true }
        ];
    }
}
exports.SelectTextCommand = SelectTextCommand;
class SelectEditableContentCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.selectEditableContent);
    }
    _getAssignableProperties() {
        return [
            { name: 'startSelector', init: initializers_1.initSelector, required: true },
            { name: 'endSelector', init: initializers_1.initSelector, defaultValue: null },
            { name: 'options', type: argument_1.actionOptions, init: initActionOptions, required: true }
        ];
    }
}
exports.SelectEditableContentCommand = SelectEditableContentCommand;
class SelectTextAreaContentCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.selectTextAreaContent);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true },
            { name: 'startLine', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'startPos', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'endLine', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: argument_1.positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: argument_1.actionOptions, init: initActionOptions, required: true }
        ];
    }
}
exports.SelectTextAreaContentCommand = SelectTextAreaContentCommand;
class PressKeyCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.pressKey);
    }
    _getAssignableProperties() {
        return [
            { name: 'keys', type: argument_1.nonEmptyStringArgument, required: true },
            { name: 'options', type: argument_1.actionOptions, init: initActionOptions, required: true }
        ];
    }
}
exports.PressKeyCommand = PressKeyCommand;
class NavigateToCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.navigateTo);
    }
    _getAssignableProperties() {
        return [
            { name: 'url', type: argument_1.urlArgument, required: true },
            { name: 'stateSnapshot', type: argument_1.nullableStringArgument, defaultValue: null },
            { name: 'forceReload', type: argument_1.booleanArgument, defaultValue: false }
        ];
    }
}
exports.NavigateToCommand = NavigateToCommand;
class SetFilesToUploadCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.setFilesToUpload);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initUploadSelector, required: true },
            { name: 'filePath', type: argument_1.stringOrStringArrayArgument, required: true }
        ];
    }
}
exports.SetFilesToUploadCommand = SetFilesToUploadCommand;
class ClearUploadCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.clearUpload);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initUploadSelector, required: true }
        ];
    }
}
exports.ClearUploadCommand = ClearUploadCommand;
class SwitchToIframeCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.switchToIframe);
    }
    _getAssignableProperties() {
        return [
            { name: 'selector', init: initializers_1.initSelector, required: true }
        ];
    }
}
exports.SwitchToIframeCommand = SwitchToIframeCommand;
class SwitchToMainWindowCommand {
    constructor() {
        this.type = type_1.default.switchToMainWindow;
    }
}
exports.SwitchToMainWindowCommand = SwitchToMainWindowCommand;
class SetNativeDialogHandlerCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.setNativeDialogHandler);
    }
    _getAssignableProperties() {
        return [
            { name: 'dialogHandler', init: initDialogHandler, required: true }
        ];
    }
}
exports.SetNativeDialogHandlerCommand = SetNativeDialogHandlerCommand;
class GetNativeDialogHistoryCommand {
    constructor() {
        this.type = type_1.default.getNativeDialogHistory;
    }
}
exports.GetNativeDialogHistoryCommand = GetNativeDialogHistoryCommand;
class GetBrowserConsoleMessagesCommand {
    constructor() {
        this.type = type_1.default.getBrowserConsoleMessages;
    }
}
exports.GetBrowserConsoleMessagesCommand = GetBrowserConsoleMessagesCommand;
class SetTestSpeedCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.setTestSpeed);
    }
    _getAssignableProperties() {
        return [
            { name: 'speed', type: argument_1.setSpeedArgument, required: true }
        ];
    }
}
exports.SetTestSpeedCommand = SetTestSpeedCommand;
class SetPageLoadTimeoutCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.setPageLoadTimeout);
    }
    _getAssignableProperties() {
        return [
            { name: 'duration', type: argument_1.positiveIntegerArgument, required: true }
        ];
    }
}
exports.SetPageLoadTimeoutCommand = SetPageLoadTimeoutCommand;
class UseRoleCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.useRole);
    }
    _getAssignableProperties() {
        return [
            { name: 'role', type: argument_1.actionRoleArgument, required: true }
        ];
    }
}
exports.UseRoleCommand = UseRoleCommand;
class RecorderCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.recorder);
    }
    _getAssignableProperties() {
        return [
            { name: 'subtype', type: argument_1.nonEmptyStringArgument, required: true },
            { name: 'forceExecutionInTopWindowOnly', type: argument_1.booleanArgument, defaultValue: false }
        ];
    }
}
exports.RecorderCommand = RecorderCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0LXJ1bi9jb21tYW5kcy9hY3Rpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHlHQUFnRjtBQUNoRiw2R0FBbUY7QUFDbkYsMkZBQTBFO0FBQzFFLGtEQUFpQztBQUNqQyx1Q0FBeUc7QUFDekcsNkRBQThFO0FBQzlFLG9FQUErRDtBQUMvRCxtQ0FBeUM7QUFFekMscURBWWdDO0FBRWhDLG9EQUFpRjtBQUNqRiwrQ0FBNkQ7QUFHN0QsZUFBZTtBQUNmLFNBQVMsaUJBQWlCLENBQUUsSUFBSSxFQUFFLEdBQUc7SUFDakMsT0FBTyxJQUFJLHVCQUFhLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFFLElBQUksRUFBRSxHQUFHO0lBQ2hDLE9BQU8sSUFBSSxzQkFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBRSxJQUFJLEVBQUUsR0FBRztJQUNoQyxPQUFPLElBQUksc0JBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLElBQUksRUFBRSxHQUFHO0lBQy9CLE9BQU8sSUFBSSxxQkFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBRSxJQUFJLEVBQUUsR0FBRztJQUN4QyxPQUFPLElBQUksOEJBQW9CLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUU7SUFDbkUsSUFBSSxFQUFFLENBQUM7SUFFUCxJQUFJLHNC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aW1wb3J0IFRZUEUgZnJvbSAnLi90eXBlJztcbmltcG9ydCBTZWxlY3RvckJ1aWxkZXIgZnJvbSAnLi4vLi4vY2xpZW50LWZ1bmN0aW9ucy9zZWxlY3RvcnMvc2VsZWN0b3ItYnVpbGRlcic7XG5pbXBvcnQgQ2xpZW50RnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uL2NsaWVudC1mdW5jdGlvbnMvY2xpZW50LWZ1bmN0aW9uLWJ1aWxkZXInO1xuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlclN5bWJvbCBmcm9tICcuLi8uLi9jbGllbnQtZnVuY3Rpb25zL2J1aWxkZXItc3ltYm9sJztcbmltcG9ydCBDb21tYW5kQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgQWN0aW9uT3B0aW9ucywgQ2xpY2tPcHRpb25zLCBNb3VzZU9wdGlvbnMsIFR5cGVPcHRpb25zLCBEcmFnVG9FbGVtZW50T3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XG5pbXBvcnQgeyBpbml0U2VsZWN0b3IsIGluaXRVcGxvYWRTZWxlY3RvciB9IGZyb20gJy4vdmFsaWRhdGlvbnMvaW5pdGlhbGl6ZXJzJztcbmltcG9ydCB7IGV4ZWN1dGVKc0V4cHJlc3Npb24gfSBmcm9tICcuLi9leGVjdXRlLWpzLWV4cHJlc3Npb24nO1xuaW1wb3J0IHsgaXNKU0V4cHJlc3Npb24gfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtcbiAgICBhY3Rpb25PcHRpb25zLFxuICAgIGludGVnZXJBcmd1bWVudCxcbiAgICBwb3NpdGl2ZUludGVnZXJBcmd1bWVudCxcbiAgICBzdHJpbmdBcmd1bWVudCxcbiAgICBub25FbXB0eVN0cmluZ0FyZ3VtZW50LFxuICAgIG51bGxhYmxlU3RyaW5nQXJndW1lbnQsXG4gICAgdXJsQXJndW1lbnQsXG4gICAgc3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50LFxuICAgIHNldFNwZWVkQXJndW1lbnQsXG4gICAgYWN0aW9uUm9sZUFyZ3VtZW50LFxuICAgIGJvb2xlYW5Bcmd1bWVudFxufSBmcm9tICcuL3ZhbGlkYXRpb25zL2FyZ3VtZW50JztcblxuaW1wb3J0IHsgU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvZGVXcm9uZ1R5cGVFcnJvciB9IGZyb20gJy4uLy4uL2Vycm9ycy90ZXN0LXJ1bic7XG5pbXBvcnQgeyBFeGVjdXRlQ2xpZW50RnVuY3Rpb25Db21tYW5kIH0gZnJvbSAnLi9vYnNlcnZhdGlvbic7XG5cblxuLy8gSW5pdGlhbGl6ZXJzXG5mdW5jdGlvbiBpbml0QWN0aW9uT3B0aW9ucyAobmFtZSwgdmFsKSB7XG4gICAgcmV0dXJuIG5ldyBBY3Rpb25PcHRpb25zKHZhbCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGluaXRDbGlja09wdGlvbnMgKG5hbWUsIHZhbCkge1xuICAgIHJldHVybiBuZXcgQ2xpY2tPcHRpb25zKHZhbCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGluaXRNb3VzZU9wdGlvbnMgKG5hbWUsIHZhbCkge1xuICAgIHJldHVybiBuZXcgTW91c2VPcHRpb25zKHZhbCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGluaXRUeXBlT3B0aW9ucyAobmFtZSwgdmFsKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlT3B0aW9ucyh2YWwsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBpbml0RHJhZ1RvRWxlbWVudE9wdGlvbnMgKG5hbWUsIHZhbCkge1xuICAgIHJldHVybiBuZXcgRHJhZ1RvRWxlbWVudE9wdGlvbnModmFsLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gaW5pdERpYWxvZ0hhbmRsZXIgKG5hbWUsIHZhbCwgeyBza2lwVmlzaWJpbGl0eUNoZWNrLCB0ZXN0UnVuIH0pIHtcbiAgICBsZXQgZm47XG5cbiAgICBpZiAoaXNKU0V4cHJlc3Npb24odmFsKSlcbiAgICAgICAgZm4gPSBleGVjdXRlSnNFeHByZXNzaW9uKHZhbC52YWx1ZSwgdGVzdFJ1biwgeyBza2lwVmlzaWJpbGl0eUNoZWNrIH0pO1xuICAgIGVsc2VcbiAgICAgICAgZm4gPSB2YWwuZm47XG5cbiAgICBpZiAoZm4gPT09IG51bGwgfHwgZm4gaW5zdGFuY2VvZiBFeGVjdXRlQ2xpZW50RnVuY3Rpb25Db21tYW5kKVxuICAgICAgICByZXR1cm4gZm47XG5cbiAgICBjb25zdCBvcHRpb25zICAgICAgPSB2YWwub3B0aW9ucztcbiAgICBjb25zdCBtZXRob2ROYW1lICAgPSAnc2V0TmF0aXZlRGlhbG9nSGFuZGxlcic7XG4gICAgY29uc3QgZnVuY3Rpb25UeXBlID0gdHlwZW9mIGZuO1xuXG4gICAgbGV0IGJ1aWxkZXIgPSBmbiAmJiBmbltmdW5jdGlvbkJ1aWxkZXJTeW1ib2xdO1xuXG4gICAgY29uc3QgaXNTZWxlY3RvciAgICAgICA9IGJ1aWxkZXIgaW5zdGFuY2VvZiBTZWxlY3RvckJ1aWxkZXI7XG4gICAgY29uc3QgaXNDbGllbnRGdW5jdGlvbiA9IGJ1aWxkZXIgaW5zdGFuY2VvZiBDbGllbnRGdW5jdGlvbkJ1aWxkZXI7XG5cbiAgICBpZiAoZnVuY3Rpb25UeXBlICE9PSAnZnVuY3Rpb24nIHx8IGlzU2VsZWN0b3IpXG4gICAgICAgIHRocm93IG5ldyBTZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29kZVdyb25nVHlwZUVycm9yKGlzU2VsZWN0b3IgPyAnU2VsZWN0b3InIDogZnVuY3Rpb25UeXBlKTtcblxuICAgIGlmIChpc0NsaWVudEZ1bmN0aW9uKVxuICAgICAgICBidWlsZGVyID0gZm4ud2l0aChvcHRpb25zKVtmdW5jdGlvbkJ1aWxkZXJTeW1ib2xdO1xuICAgIGVsc2VcbiAgICAgICAgYnVpbGRlciA9IG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoZm4sIG9wdGlvbnMsIHsgaW5zdGFudGlhdGlvbjogbWV0aG9kTmFtZSwgZXhlY3V0aW9uOiBtZXRob2ROYW1lIH0pO1xuXG4gICAgcmV0dXJuIGJ1aWxkZXIuZ2V0Q29tbWFuZChbXSk7XG5cbn1cblxuLy8gQ29tbWFuZHNcbmV4cG9ydCBjbGFzcyBDbGlja0NvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuY2xpY2spO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ29wdGlvbnMnLCB0eXBlOiBhY3Rpb25PcHRpb25zLCBpbml0OiBpbml0Q2xpY2tPcHRpb25zLCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmlnaHRDbGlja0NvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUucmlnaHRDbGljayk7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3NlbGVjdG9yJywgaW5pdDogaW5pdFNlbGVjdG9yLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRDbGlja09wdGlvbnMsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFeGVjdXRlRXhwcmVzc2lvbkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuZXhlY3V0ZUV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdleHByZXNzaW9uJywgdHlwZTogbm9uRW1wdHlTdHJpbmdBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3Jlc3VsdFZhcmlhYmxlTmFtZScsIHR5cGU6IG5vbkVtcHR5U3RyaW5nQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogbnVsbCB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXhlY3V0ZUFzeW5jRXhwcmVzc2lvbkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuZXhlY3V0ZUFzeW5jRXhwcmVzc2lvbik7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2V4cHJlc3Npb24nLCB0eXBlOiBzdHJpbmdBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIERvdWJsZUNsaWNrQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5kb3VibGVDbGljayk7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3NlbGVjdG9yJywgaW5pdDogaW5pdFNlbGVjdG9yLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRDbGlja09wdGlvbnMsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIb3ZlckNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuaG92ZXIpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ29wdGlvbnMnLCB0eXBlOiBhY3Rpb25PcHRpb25zLCBpbml0OiBpbml0TW91c2VPcHRpb25zLCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHlwZVRleHRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvYmosIHRlc3RSdW4pIHtcbiAgICAgICAgc3VwZXIob2JqLCB0ZXN0UnVuLCBUWVBFLnR5cGVUZXh0KTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAnc2VsZWN0b3InLCBpbml0OiBpbml0U2VsZWN0b3IsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICd0ZXh0JywgdHlwZTogbm9uRW1wdHlTdHJpbmdBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ29wdGlvbnMnLCB0eXBlOiBhY3Rpb25PcHRpb25zLCBpbml0OiBpbml0VHlwZU9wdGlvbnMsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEcmFnQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5kcmFnKTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAnc2VsZWN0b3InLCBpbml0OiBpbml0U2VsZWN0b3IsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdkcmFnT2Zmc2V0WCcsIHR5cGU6IGludGVnZXJBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2RyYWdPZmZzZXRZJywgdHlwZTogaW50ZWdlckFyZ3VtZW50LCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRNb3VzZU9wdGlvbnMsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEcmFnVG9FbGVtZW50Q29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5kcmFnVG9FbGVtZW50KTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAnc2VsZWN0b3InLCBpbml0OiBpbml0U2VsZWN0b3IsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdkZXN0aW5hdGlvblNlbGVjdG9yJywgaW5pdDogaW5pdFNlbGVjdG9yLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXREcmFnVG9FbGVtZW50T3B0aW9ucywgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdFRleHRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvYmosIHRlc3RSdW4pIHtcbiAgICAgICAgc3VwZXIob2JqLCB0ZXN0UnVuLCBUWVBFLnNlbGVjdFRleHQpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0YXJ0UG9zJywgdHlwZTogcG9zaXRpdmVJbnRlZ2VyQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnZW5kUG9zJywgdHlwZTogcG9zaXRpdmVJbnRlZ2VyQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRBY3Rpb25PcHRpb25zLCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0RWRpdGFibGVDb250ZW50Q29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5zZWxlY3RFZGl0YWJsZUNvbnRlbnQpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGFydFNlbGVjdG9yJywgaW5pdDogaW5pdFNlbGVjdG9yLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnZW5kU2VsZWN0b3InLCBpbml0OiBpbml0U2VsZWN0b3IsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRBY3Rpb25PcHRpb25zLCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0VGV4dEFyZWFDb250ZW50Q29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5zZWxlY3RUZXh0QXJlYUNvbnRlbnQpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0YXJ0TGluZScsIHR5cGU6IHBvc2l0aXZlSW50ZWdlckFyZ3VtZW50LCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0YXJ0UG9zJywgdHlwZTogcG9zaXRpdmVJbnRlZ2VyQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnZW5kTGluZScsIHR5cGU6IHBvc2l0aXZlSW50ZWdlckFyZ3VtZW50LCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2VuZFBvcycsIHR5cGU6IHBvc2l0aXZlSW50ZWdlckFyZ3VtZW50LCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ29wdGlvbnMnLCB0eXBlOiBhY3Rpb25PcHRpb25zLCBpbml0OiBpbml0QWN0aW9uT3B0aW9ucywgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByZXNzS2V5Q29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5wcmVzc0tleSk7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2tleXMnLCB0eXBlOiBub25FbXB0eVN0cmluZ0FyZ3VtZW50LCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3B0aW9ucycsIHR5cGU6IGFjdGlvbk9wdGlvbnMsIGluaXQ6IGluaXRBY3Rpb25PcHRpb25zLCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmF2aWdhdGVUb0NvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUubmF2aWdhdGVUbyk7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3VybCcsIHR5cGU6IHVybEFyZ3VtZW50LCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnc3RhdGVTbmFwc2hvdCcsIHR5cGU6IG51bGxhYmxlU3RyaW5nQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnZm9yY2VSZWxvYWQnLCB0eXBlOiBib29sZWFuQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldEZpbGVzVG9VcGxvYWRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvYmosIHRlc3RSdW4pIHtcbiAgICAgICAgc3VwZXIob2JqLCB0ZXN0UnVuLCBUWVBFLnNldEZpbGVzVG9VcGxvYWQpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRVcGxvYWRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2ZpbGVQYXRoJywgdHlwZTogc3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50LCByZXF1aXJlZDogdHJ1ZSB9XG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2xlYXJVcGxvYWRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvYmosIHRlc3RSdW4pIHtcbiAgICAgICAgc3VwZXIob2JqLCB0ZXN0UnVuLCBUWVBFLmNsZWFyVXBsb2FkKTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAnc2VsZWN0b3InLCBpbml0OiBpbml0VXBsb2FkU2VsZWN0b3IsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hUb0lmcmFtZUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuc3dpdGNoVG9JZnJhbWUpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzZWxlY3RvcicsIGluaXQ6IGluaXRTZWxlY3RvciwgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN3aXRjaFRvTWFpbldpbmRvd0NvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy50eXBlID0gVFlQRS5zd2l0Y2hUb01haW5XaW5kb3c7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1bikge1xuICAgICAgICBzdXBlcihvYmosIHRlc3RSdW4sIFRZUEUuc2V0TmF0aXZlRGlhbG9nSGFuZGxlcik7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2RpYWxvZ0hhbmRsZXInLCBpbml0OiBpbml0RGlhbG9nSGFuZGxlciwgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdldE5hdGl2ZURpYWxvZ0hpc3RvcnlDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMudHlwZSA9IFRZUEUuZ2V0TmF0aXZlRGlhbG9nSGlzdG9yeTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHZXRCcm93c2VyQ29uc29sZU1lc3NhZ2VzQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICB0aGlzLnR5cGUgPSBUWVBFLmdldEJyb3dzZXJDb25zb2xlTWVzc2FnZXM7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGVzdFNwZWVkQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5zZXRUZXN0U3BlZWQpO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdzcGVlZCcsIHR5cGU6IHNldFNwZWVkQXJndW1lbnQsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvYmosIHRlc3RSdW4pIHtcbiAgICAgICAgc3VwZXIob2JqLCB0ZXN0UnVuLCBUWVBFLnNldFBhZ2VMb2FkVGltZW91dCk7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2R1cmF0aW9uJywgdHlwZTogcG9zaXRpdmVJbnRlZ2VyQXJndW1lbnQsIHJlcXVpcmVkOiB0cnVlIH1cbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVc2VSb2xlQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS51c2VSb2xlKTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAncm9sZScsIHR5cGU6IGFjdGlvblJvbGVBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY29yZGVyQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5yZWNvcmRlcik7XG4gICAgfVxuXG4gICAgX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzICgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3N1YnR5cGUnLCB0eXBlOiBub25FbXB0eVN0cmluZ0FyZ3VtZW50LCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnZm9yY2VFeGVjdXRpb25JblRvcFdpbmRvd09ubHknLCB0eXBlOiBib29sZWFuQXJndW1lbnQsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfVxuICAgICAgICBdO1xuICAgIH1cbn1cbiJdfQ==