"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const device_specs_1 = require("device-specs");
const marker_symbol_1 = __importDefault(require("../../../role/marker-symbol"));
const factories_1 = require("./factories");
const test_run_1 = require("../../../errors/test-run");
const test_page_url_1 = require("../../../api/test-page-url");
const check_file_path_1 = __importDefault(require("../../../utils/check-file-path"));
// Validators
exports.integerArgument = factories_1.createIntegerValidator(test_run_1.ActionIntegerArgumentError);
exports.positiveIntegerArgument = factories_1.createPositiveIntegerValidator(test_run_1.ActionPositiveIntegerArgumentError);
exports.booleanArgument = factories_1.createBooleanValidator(test_run_1.ActionBooleanArgumentError);
exports.setSpeedArgument = factories_1.createSpeedValidator(test_run_1.SetTestSpeedArgumentError);
function actionRoleArgument(name, val) {
    if (!val || !val[marker_symbol_1.default])
        throw new test_run_1.ActionRoleArgumentError(name, typeof val);
}
exports.actionRoleArgument = actionRoleArgument;
function actionOptions(name, val) {
    const type = typeof val;
    if (type !== 'object' && val !== null && val !== void 0)
        throw new test_run_1.ActionOptionsTypeError(type);
}
exports.actionOptions = actionOptions;
function stringArgument(argument, val, createError) {
    if (!createError)
        createError = actualValue => new test_run_1.ActionStringArgumentError(argument, actualValue);
    const type = typeof val;
    if (type !== 'string')
        throw createError(type);
}
exports.stringArgument = stringArgument;
function nonEmptyStringArgument(argument, val, createError) {
    if (!createError)
        createError = actualValue => new test_run_1.ActionStringArgumentError(argument, actualValue);
    stringArgument(argument, val, createError);
    if (!val.length)
        throw createError('""');
}
exports.nonEmptyStringArgument = nonEmptyStringArgument;
function nullableStringArgument(argument, val) {
    const type = typeof val;
    if (type !== 'string' && val !== null)
        throw new test_run_1.ActionNullableStringArgumentError(argument, type);
}
exports.nullableStringArgument = nullableStringArgument;
function urlArgument(name, val) {
    nonEmptyStringArgument(name, val);
    test_page_url_1.assertUrl(val.trim(), 'navigateTo');
}
exports.urlArgument = urlArgument;
function stringOrStringArrayArgument(argument, val) {
    const type = typeof val;
    if (type === 'string') {
        if (!val.length)
            throw new test_run_1.ActionStringOrStringArrayArgumentError(argument, '""');
    }
    else if (Array.isArray(val)) {
        if (!val.length)
            throw new test_run_1.ActionStringOrStringArrayArgumentError(argument, '[]');
        const validateElement = elementIndex => nonEmptyStringArgument(argument, val[elementIndex], actualValue => new test_run_1.ActionStringArrayElementError(argument, actualValue, elementIndex));
        for (let i = 0; i < val.length; i++)
            validateElement(i);
    }
    else
        throw new test_run_1.ActionStringOrStringArrayArgumentError(argument, type);
}
exports.stringOrStringArrayArgument = stringOrStringArrayArgument;
function resizeWindowDeviceArgument(name, val) {
    nonEmptyStringArgument(name, val);
    if (!device_specs_1.isValidDeviceName(val))
        throw new test_run_1.ActionUnsupportedDeviceTypeError(name, val);
}
exports.resizeWindowDeviceArgument = resizeWindowDeviceArgument;
function screenshotPathArgument(name, val) {
    nonEmptyStringArgument(name, val);
    const forbiddenCharsList = check_file_path_1.default(val);
    if (forbiddenCharsList.length)
        throw new test_run_1.ForbiddenCharactersInScreenshotPathError(val, forbiddenCharsList);
}
exports.screenshotPathArgument = screenshotPathArgument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdGVzdC1ydW4vY29tbWFuZHMvdmFsaWRhdGlvbnMvYXJndW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQ0FBaUQ7QUFDakQsZ0ZBQTJEO0FBRTNELDJDQUtxQjtBQUVyQix1REFha0M7QUFFbEMsOERBQXVEO0FBQ3ZELHFGQUEyRDtBQUczRCxhQUFhO0FBQ0EsUUFBQSxlQUFlLEdBQVcsa0NBQXNCLENBQUMscUNBQTBCLENBQUMsQ0FBQztBQUM3RSxRQUFBLHVCQUF1QixHQUFHLDBDQUE4QixDQUFDLDZDQUFrQyxDQUFDLENBQUM7QUFDN0YsUUFBQSxlQUFlLEdBQVcsa0NBQXNCLENBQUMscUNBQTBCLENBQUMsQ0FBQztBQUM3RSxRQUFBLGdCQUFnQixHQUFVLGdDQUFvQixDQUFDLG9DQUF5QixDQUFDLENBQUM7QUFHdkYsU0FBZ0Isa0JBQWtCLENBQUUsSUFBSSxFQUFFLEdBQUc7SUFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBZ0IsQ0FBQztRQUM5QixNQUFNLElBQUksa0NBQXVCLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUhELGdEQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFFLElBQUksRUFBRSxHQUFHO0lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sR0FBRyxDQUFDO0lBRXhCLElBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUM7UUFDbkQsTUFBTSxJQUFJLGlDQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFMRCxzQ0FLQztBQUdELFNBQWdCLGNBQWMsQ0FBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFdBQVc7SUFDdEQsSUFBSSxDQUFDLFdBQVc7UUFDWixXQUFXLEdB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eUJBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUU5QyxJQUFJLGtCQUFrQixDQUFDLE1BQU07UUFDekIsTUFBTSxJQUFJLG1EQUF3QyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFQRCx3REFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzVmFsaWREZXZpY2VOYW1lIH0gZnJvbSAnZGV2aWNlLXNwZWNzJztcbmltcG9ydCByb2xlTWFya2VyU3ltYm9sIGZyb20gJy4uLy4uLy4uL3JvbGUvbWFya2VyLXN5bWJvbCc7XG5cbmltcG9ydCB7XG4gICAgY3JlYXRlQm9vbGVhblZhbGlkYXRvcixcbiAgICBjcmVhdGVJbnRlZ2VyVmFsaWRhdG9yLFxuICAgIGNyZWF0ZVBvc2l0aXZlSW50ZWdlclZhbGlkYXRvcixcbiAgICBjcmVhdGVTcGVlZFZhbGlkYXRvclxufSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cbmltcG9ydCB7XG4gICAgQWN0aW9uT3B0aW9uc1R5cGVFcnJvcixcbiAgICBBY3Rpb25Cb29sZWFuQXJndW1lbnRFcnJvcixcbiAgICBBY3Rpb25TdHJpbmdBcmd1bWVudEVycm9yLFxuICAgIEFjdGlvbk51bGxhYmxlU3RyaW5nQXJndW1lbnRFcnJvcixcbiAgICBBY3Rpb25JbnRlZ2VyQXJndW1lbnRFcnJvcixcbiAgICBBY3Rpb25Sb2xlQXJndW1lbnRFcnJvcixcbiAgICBBY3Rpb25Qb3NpdGl2ZUludGVnZXJBcmd1bWVudEVycm9yLFxuICAgIEFjdGlvblN0cmluZ09yU3RyaW5nQXJyYXlBcmd1bWVudEVycm9yLFxuICAgIEFjdGlvblN0cmluZ0FycmF5RWxlbWVudEVycm9yLFxuICAgIEFjdGlvblVuc3VwcG9ydGVkRGV2aWNlVHlwZUVycm9yLFxuICAgIFNldFRlc3RTcGVlZEFyZ3VtZW50RXJyb3IsXG4gICAgRm9yYmlkZGVuQ2hhcmFjdGVyc0luU2NyZWVuc2hvdFBhdGhFcnJvclxufSBmcm9tICcuLi8uLi8uLi9lcnJvcnMvdGVzdC1ydW4nO1xuXG5pbXBvcnQgeyBhc3NlcnRVcmwgfSBmcm9tICcuLi8uLi8uLi9hcGkvdGVzdC1wYWdlLXVybCc7XG5pbXBvcnQgY2hlY2tGaWxlUGF0aCBmcm9tICcuLi8uLi8uLi91dGlscy9jaGVjay1maWxlLXBhdGgnO1xuXG5cbi8vIFZhbGlkYXRvcnNcbmV4cG9ydCBjb25zdCBpbnRlZ2VyQXJndW1lbnQgICAgICAgICA9IGNyZWF0ZUludGVnZXJWYWxpZGF0b3IoQWN0aW9uSW50ZWdlckFyZ3VtZW50RXJyb3IpO1xuZXhwb3J0IGNvbnN0IHBvc2l0aXZlSW50ZWdlckFyZ3VtZW50ID0gY3JlYXRlUG9zaXRpdmVJbnRlZ2VyVmFsaWRhdG9yKEFjdGlvblBvc2l0aXZlSW50ZWdlckFyZ3VtZW50RXJyb3IpO1xuZXhwb3J0IGNvbnN0IGJvb2xlYW5Bcmd1bWVudCAgICAgICAgID0gY3JlYXRlQm9vbGVhblZhbGlkYXRvcihBY3Rpb25Cb29sZWFuQXJndW1lbnRFcnJvcik7XG5leHBvcnQgY29uc3Qgc2V0U3BlZWRBcmd1bWVudCAgICAgICAgPSBjcmVhdGVTcGVlZFZhbGlkYXRvcihTZXRUZXN0U3BlZWRBcmd1bWVudEVycm9yKTtcblxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uUm9sZUFyZ3VtZW50IChuYW1lLCB2YWwpIHtcbiAgICBpZiAoIXZhbCB8fCAhdmFsW3JvbGVNYXJrZXJTeW1ib2xdKVxuICAgICAgICB0aHJvdyBuZXcgQWN0aW9uUm9sZUFyZ3VtZW50RXJyb3IobmFtZSwgdHlwZW9mIHZhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25PcHRpb25zIChuYW1lLCB2YWwpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcblxuICAgIGlmICh0eXBlICE9PSAnb2JqZWN0JyAmJiB2YWwgIT09IG51bGwgJiYgdmFsICE9PSB2b2lkIDApXG4gICAgICAgIHRocm93IG5ldyBBY3Rpb25PcHRpb25zVHlwZUVycm9yKHR5cGUpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdBcmd1bWVudCAoYXJndW1lbnQsIHZhbCwgY3JlYXRlRXJyb3IpIHtcbiAgICBpZiAoIWNyZWF0ZUVycm9yKVxuICAgICAgICBjcmVhdGVFcnJvciA9IGFjdHVhbFZhbHVlID0+IG5ldyBBY3Rpb25TdHJpbmdBcmd1bWVudEVycm9yKGFyZ3VtZW50LCBhY3R1YWxWYWx1ZSk7XG5cbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcblxuICAgIGlmICh0eXBlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgY3JlYXRlRXJyb3IodHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub25FbXB0eVN0cmluZ0FyZ3VtZW50IChhcmd1bWVudCwgdmFsLCBjcmVhdGVFcnJvcikge1xuICAgIGlmICghY3JlYXRlRXJyb3IpXG4gICAgICAgIGNyZWF0ZUVycm9yID0gYWN0dWFsVmFsdWUgPT4gbmV3IEFjdGlvblN0cmluZ0FyZ3VtZW50RXJyb3IoYXJndW1lbnQsIGFjdHVhbFZhbHVlKTtcblxuICAgIHN0cmluZ0FyZ3VtZW50KGFyZ3VtZW50LCB2YWwsIGNyZWF0ZUVycm9yKTtcblxuICAgIGlmICghdmFsLmxlbmd0aClcbiAgICAgICAgdGhyb3cgY3JlYXRlRXJyb3IoJ1wiXCInKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bGxhYmxlU3RyaW5nQXJndW1lbnQgKGFyZ3VtZW50LCB2YWwpIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbDtcblxuICAgIGlmICh0eXBlICE9PSAnc3RyaW5nJyAmJiB2YWwgIT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBBY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3IoYXJndW1lbnQsIHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXJsQXJndW1lbnQgKG5hbWUsIHZhbCkge1xuICAgIG5vbkVtcHR5U3RyaW5nQXJndW1lbnQobmFtZSwgdmFsKTtcblxuICAgIGFzc2VydFVybCh2YWwudHJpbSgpLCAnbmF2aWdhdGVUbycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50IChhcmd1bWVudCwgdmFsKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWw7XG5cbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCF2YWwubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEFjdGlvblN0cmluZ09yU3RyaW5nQXJyYXlBcmd1bWVudEVycm9yKGFyZ3VtZW50LCAnXCJcIicpO1xuICAgIH1cblxuICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICBpZiAoIXZhbC5sZW5ndGgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgQWN0aW9uU3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50RXJyb3IoYXJndW1lbnQsICdbXScpO1xuXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlRWxlbWVudCA9IGVsZW1lbnRJbmRleCA9PiBub25FbXB0eVN0cmluZ0FyZ3VtZW50KFxuICAgICAgICAgICAgYXJndW1lbnQsXG4gICAgICAgICAgICB2YWxbZWxlbWVudEluZGV4XSxcbiAgICAgICAgICAgIGFjdHVhbFZhbHVlID0+IG5ldyBBY3Rpb25TdHJpbmdBcnJheUVsZW1lbnRFcnJvcihhcmd1bWVudCwgYWN0dWFsVmFsdWUsIGVsZW1lbnRJbmRleClcbiAgICAgICAgKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHZhbGlkYXRlRWxlbWVudChpKTtcbiAgICB9XG5cbiAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBBY3Rpb25TdHJpbmdPclN0cmluZ0FycmF5QXJndW1lbnRFcnJvcihhcmd1bWVudCwgdHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNpemVXaW5kb3dEZXZpY2VBcmd1bWVudCAobmFtZSwgdmFsKSB7XG4gICAgbm9uRW1wdHlTdHJpbmdBcmd1bWVudChuYW1lLCB2YWwpO1xuXG4gICAgaWYgKCFpc1ZhbGlkRGV2aWNlTmFtZSh2YWwpKVxuICAgICAgICB0aHJvdyBuZXcgQWN0aW9uVW5zdXBwb3J0ZWREZXZpY2VUeXBlRXJyb3IobmFtZSwgdmFsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjcmVlbnNob3RQYXRoQXJndW1lbnQgKG5hbWUsIHZhbCkge1xuICAgIG5vbkVtcHR5U3RyaW5nQXJndW1lbnQobmFtZSwgdmFsKTtcblxuICAgIGNvbnN0IGZvcmJpZGRlbkNoYXJzTGlzdCA9IGNoZWNrRmlsZVBhdGgodmFsKTtcblxuICAgIGlmIChmb3JiaWRkZW5DaGFyc0xpc3QubGVuZ3RoKVxuICAgICAgICB0aHJvdyBuZXcgRm9yYmlkZGVuQ2hhcmFjdGVyc0luU2NyZWVuc2hvdFBhdGhFcnJvcih2YWwsIGZvcmJpZGRlbkNoYXJzTGlzdCk7XG59XG4iXX0=