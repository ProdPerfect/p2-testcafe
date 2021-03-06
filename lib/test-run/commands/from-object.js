"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = __importDefault(require("./type"));
const actions_1 = require("./actions");
const assertion_1 = __importDefault(require("./assertion"));
const browser_manipulation_1 = require("./browser-manipulation");
const observation_1 = require("./observation");
function getCmdCtor(type) {
    switch (type) {
        case type_1.default.click:
            return actions_1.ClickCommand;
        case type_1.default.rightClick:
            return actions_1.RightClickCommand;
        case type_1.default.doubleClick:
            return actions_1.DoubleClickCommand;
        case type_1.default.hover:
            return actions_1.HoverCommand;
        case type_1.default.drag:
            return actions_1.DragCommand;
        case type_1.default.dragToElement:
            return actions_1.DragToElementCommand;
        case type_1.default.typeText:
            return actions_1.TypeTextCommand;
        case type_1.default.selectText:
            return actions_1.SelectTextCommand;
        case type_1.default.selectTextAreaContent:
            return actions_1.SelectTextAreaContentCommand;
        case type_1.default.selectEditableContent:
            return actions_1.SelectEditableContentCommand;
        case type_1.default.pressKey:
            return actions_1.PressKeyCommand;
        case type_1.default.wait:
            return observation_1.WaitCommand;
        case type_1.default.navigateTo:
            return actions_1.NavigateToCommand;
        case type_1.default.setFilesToUpload:
            return actions_1.SetFilesToUploadCommand;
        case type_1.default.clearUpload:
            return actions_1.ClearUploadCommand;
        case type_1.default.takeScreenshot:
            return browser_manipulation_1.TakeScreenshotCommand;
        case type_1.default.takeElementScreenshot:
            return browser_manipulation_1.TakeElementScreenshotCommand;
        case type_1.default.resizeWindow:
            return browser_manipulation_1.ResizeWindowCommand;
        case type_1.default.resizeWindowToFitDevice:
            return browser_manipulation_1.ResizeWindowToFitDeviceCommand;
        case type_1.default.maximizeWindow:
            return browser_manipulation_1.MaximizeWindowCommand;
        case type_1.default.switchToIframe:
            return actions_1.SwitchToIframeCommand;
        case type_1.default.switchToMainWindow:
            return actions_1.SwitchToMainWindowCommand;
        case type_1.default.setNativeDialogHandler:
            return actions_1.SetNativeDialogHandlerCommand;
        case type_1.default.setTestSpeed:
            return actions_1.SetTestSpeedCommand;
        case type_1.default.setPageLoadTimeout:
            return actions_1.SetPageLoadTimeoutCommand;
        case type_1.default.assertion:
            return assertion_1.default;
        case type_1.default.debug:
            return observation_1.DebugCommand;
        case type_1.default.executeExpression:
            return actions_1.ExecuteExpressionCommand;
        case type_1.default.executeAsyncExpression:
            return actions_1.ExecuteAsyncExpressionCommand;
        case type_1.default.recorder:
            return actions_1.RecorderCommand;
        default:
            return null;
    }
}
// Create command from object
function createCommandFromObject(obj, testRun) {
    const CmdCtor = getCmdCtor(obj.type);
    return CmdCtor && new CmdCtor(obj, testRun);
}
exports.default = createCommandFromObject;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1vYmplY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdGVzdC1ydW4vY29tbWFuZHMvZnJvbS1vYmplY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFFMUIsdUNBdUJtQjtBQUVuQiw0REFBMkM7QUFFM0MsaUVBTWdDO0FBRWhDLCtDQUEwRDtBQUUxRCxTQUFTLFVBQVUsQ0FBRSxJQUFJO0lBQ3JCLFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxjQUFJLENBQUMsS0FBSztZQUNYLE9BQU8sc0JBQVksQ0FBQztRQUV4QixLQUFLLGNBQUksQ0FBQyxVQUFVO1lBQ2hCLE9BQU8sMkJBQWlCLENBQUM7UUFFN0IsS0FBSyxjQUFJLENBQUMsV0FBVztZQUNqQixPQUFPLDRCQUFrQixDQUFDO1FBRTlCLEtBQUssY0FBSSxDQUFDLEtBQUs7WUFDWCxPQUFPLHNCQUFZLENBQUM7UUFFeEIsS0FBSyxjQUFJLENBQUMsSUFBSTtZQUNWLE9BQU8scUJBQVcsQ0FBQztRQUV2QixLQUFLLGNBQUksQ0FBQyxhQUFhO1lBQ25CLE9BQU8sOEJBQW9CLENBQUM7UUFFaEMsS0FBSyxjQUFJLENBQUMsUUFBUTtZQUNkLE9BQU8seUJBQWUsQ0FBQztRQUUzQixLQUFLLGNBQUksQ0FBQyxVQUFVO1lBQ2hCLE9BQU8sMkJBQWlCLENBQUM7UUFFN0IsS0FBSyxjQUFJLENBQUMscUJBQXFCO1lBQzNCLE9BQU8sc0NBQTRCLENBQUM7UUFFeEMsS0FBSyxjQUFJLENBQUMscUJBQXFCO1lBQzNCLE9BQU8sc0NBQTRCLENBQUM7UUFFeEMsS0FBSyxjQUFJLENBQUMsUUFBUTtZQUNkLE9BQU8seUJBQWUsQ0FBQztRQUUzQixLQUFLLGNBQUksQ0FBQyxJQUFJO1lBQ1YsT0FBTyx5QkFBVyxDQUFDO1FBRXZCLEtBQUssY0FBSSxDQUFDLFVBQVU7WUFDaEIsT0FBTywyQkFBaUIsQ0FBQztRQUU3QixLQUFLLGNBQUksQ0FBQyxnQkFBZ0I7WUFDdEIsT0FBTyxpQ0FBdUIsQ0FBQztRQUVuQyxLQUFLLGNBQUksQ0FBQyxXQUFXO1lBQ2pCLE9BQU8sNEJBQWtCLENBQUM7UUFFOUIsS0FBSyxjQUFJLENBQUMsY0FBYztZQUNwQixPQUFPLDRDQUFxQixDQUFDO1FBRWpDLEtBQUssY0FBSSxDQUFDLHFCQUFxQjtZQUMzQixPQUFPLG1EQUE0QixDQUFDO1FBRXhDLEtBQUssY0FBSSxDQUFDLFlBQVk7WUFDbEIsT0FBTywwQ0FBbUIsQ0FBQztRQUUvQixLQUFLLGNBQUksQ0FBQyx1QkFBdUI7WUFDN0IsT0FBTyxxREFBOEIsQ0FBQztRQUUxQyxLQUFLLGNBQUksQ0FBQyxjQUFjO1lBQ3BCLE9BQU8sNENBQXFCLENBQUM7UUFFakMsS0FBSyxjQUFJLENBQUMsY0FBYztZQUNwQixPQUFPLCtCQUFxQixDQUFDO1FBRWpDLEtBQUssY0FBSSxDQUFDLGtCQUFrQjtZQUN4QixPQUFPLG1DQUF5QixDQUFDO1FBRXJDLEtBQUssY0FBSSxDQUFDLHNCQUFzQjtZQUM1QixPQUFPLHVDQUE2QixDQUFDO1FBRXpDLEtBQUssY0FBSSxDQUFDLFlBQVk7WUFDbEIsT0FBTyw2QkFBbUIsQ0FBQztRQUUvQixLQUFLLGNBQUksQ0FBQyxrQkFBa0I7WUFDeEIsT0FBTyxtQ0FBeUIsQ0FBQztRQUVyQyxLQUFLLGNBQUksQ0FBQyxTQUFTO1lBQ2YsT0FBTyxtQkFBZ0IsQ0FBQztRQUU1QixLQUFLLGNBQUksQ0FBQyxLQUFLO1lBQ1gsT0FBTywwQkFBWSxDQUFDO1FBRXhCLEtBQUssY0FBSSxDQUFDLGlCQUFpQjtZQUN2QixPQUFPLGtDQUF3QixDQUFDO1FBRXBDLEtBQUssY0FBSSxDQUFDLHNCQUFzQjtZQUM1QixPQUFPLHVDQUE2QixDQUFDO1FBRXpDLEtBQUssY0FBSSxDQUFDLFFBQVE7WUFDZCxPQUFPLHlCQUFlLENBQUM7UUFFM0I7WUFDSSxPQUFPLElBQUksQ0FBQztLQUNuQjtBQUNMLENBQUM7QUFFRCw2QkFBNkI7QUFDN0IsU0FBd0IsdUJBQXVCLENBQUUsR0FBRyxFQUFFLE9BQU87SUFDekQsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVyQyxPQUFPLE9BQU8sSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUpELDBDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRZUEUgZnJvbSAnLi90eXBlJztcblxuaW1wb3J0IHtcbiAgICBDbGlja0NvbW1hbmQsXG4gICAgUmlnaHRDbGlja0NvbW1hbmQsXG4gICAgRG91YmxlQ2xpY2tDb21tYW5kLFxuICAgIEhvdmVyQ29tbWFuZCxcbiAgICBEcmFnQ29tbWFuZCxcbiAgICBEcmFnVG9FbGVtZW50Q29tbWFuZCxcbiAgICBUeXBlVGV4dENvbW1hbmQsXG4gICAgU2VsZWN0VGV4dENvbW1hbmQsXG4gICAgU2VsZWN0VGV4dEFyZWFDb250ZW50Q29tbWFuZCxcbiAgICBTZWxlY3RFZGl0YWJsZUNvbnRlbnRDb21tYW5kLFxuICAgIFByZXNzS2V5Q29tbWFuZCxcbiAgICBOYXZpZ2F0ZVRvQ29tbWFuZCxcbiAgICBTZXRGaWxlc1RvVXBsb2FkQ29tbWFuZCxcbiAgICBDbGVhclVwbG9hZENvbW1hbmQsXG4gICAgU3dpdGNoVG9JZnJhbWVDb21tYW5kLFxuICAgIFN3aXRjaFRvTWFpbldpbmRvd0NvbW1hbmQsXG4gICAgU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvbW1hbmQsXG4gICAgU2V0VGVzdFNwZWVkQ29tbWFuZCxcbiAgICBTZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kLFxuICAgIEV4ZWN1dGVFeHByZXNzaW9uQ29tbWFuZCxcbiAgICBFeGVjdXRlQXN5bmNFeHByZXNzaW9uQ29tbWFuZCxcbiAgICBSZWNvcmRlckNvbW1hbmRcbn0gZnJvbSAnLi9hY3Rpb25zJztcblxuaW1wb3J0IEFzc2VydGlvbkNvbW1hbmQgZnJvbSAnLi9hc3NlcnRpb24nO1xuXG5pbXBvcnQge1xuICAgIFRha2VTY3JlZW5zaG90Q29tbWFuZCxcbiAgICBUYWtlRWxlbWVudFNjcmVlbnNob3RDb21tYW5kLFxuICAgIFJlc2l6ZVdpbmRvd0NvbW1hbmQsXG4gICAgUmVzaXplV2luZG93VG9GaXREZXZpY2VDb21tYW5kLFxuICAgIE1heGltaXplV2luZG93Q29tbWFuZFxufSBmcm9tICcuL2Jyb3dzZXItbWFuaXB1bGF0aW9uJztcblxuaW1wb3J0IHsgV2FpdENvbW1hbmQsIERlYnVnQ29tbWFuZCB9IGZyb20gJy4vb2JzZXJ2YXRpb24nO1xuXG5mdW5jdGlvbiBnZXRDbWRDdG9yICh0eXBlKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgVFlQRS5jbGljazpcbiAgICAgICAgICAgIHJldHVybiBDbGlja0NvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnJpZ2h0Q2xpY2s6XG4gICAgICAgICAgICByZXR1cm4gUmlnaHRDbGlja0NvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLmRvdWJsZUNsaWNrOlxuICAgICAgICAgICAgcmV0dXJuIERvdWJsZUNsaWNrQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuaG92ZXI6XG4gICAgICAgICAgICByZXR1cm4gSG92ZXJDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5kcmFnOlxuICAgICAgICAgICAgcmV0dXJuIERyYWdDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5kcmFnVG9FbGVtZW50OlxuICAgICAgICAgICAgcmV0dXJuIERyYWdUb0VsZW1lbnRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS50eXBlVGV4dDpcbiAgICAgICAgICAgIHJldHVybiBUeXBlVGV4dENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnNlbGVjdFRleHQ6XG4gICAgICAgICAgICByZXR1cm4gU2VsZWN0VGV4dENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnNlbGVjdFRleHRBcmVhQ29udGVudDpcbiAgICAgICAgICAgIHJldHVybiBTZWxlY3RUZXh0QXJlYUNvbnRlbnRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zZWxlY3RFZGl0YWJsZUNvbnRlbnQ6XG4gICAgICAgICAgICByZXR1cm4gU2VsZWN0RWRpdGFibGVDb250ZW50Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUucHJlc3NLZXk6XG4gICAgICAgICAgICByZXR1cm4gUHJlc3NLZXlDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS53YWl0OlxuICAgICAgICAgICAgcmV0dXJuIFdhaXRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5uYXZpZ2F0ZVRvOlxuICAgICAgICAgICAgcmV0dXJuIE5hdmlnYXRlVG9Db21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zZXRGaWxlc1RvVXBsb2FkOlxuICAgICAgICAgICAgcmV0dXJuIFNldEZpbGVzVG9VcGxvYWRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5jbGVhclVwbG9hZDpcbiAgICAgICAgICAgIHJldHVybiBDbGVhclVwbG9hZENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnRha2VTY3JlZW5zaG90OlxuICAgICAgICAgICAgcmV0dXJuIFRha2VTY3JlZW5zaG90Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUudGFrZUVsZW1lbnRTY3JlZW5zaG90OlxuICAgICAgICAgICAgcmV0dXJuIFRha2VFbGVtZW50U2NyZWVuc2hvdENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnJlc2l6ZVdpbmRvdzpcbiAgICAgICAgICAgIHJldHVybiBSZXNpemVXaW5kb3dDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5yZXNpemVXaW5kb3dUb0ZpdERldmljZTpcbiAgICAgICAgICAgIHJldHVybiBSZXNpemVXaW5kb3dUb0ZpdERldmljZUNvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLm1heGltaXplV2luZG93OlxuICAgICAgICAgICAgcmV0dXJuIE1heGltaXplV2luZG93Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc3dpdGNoVG9JZnJhbWU6XG4gICAgICAgICAgICByZXR1cm4gU3dpdGNoVG9JZnJhbWVDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zd2l0Y2hUb01haW5XaW5kb3c6XG4gICAgICAgICAgICByZXR1cm4gU3dpdGNoVG9NYWluV2luZG93Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc2V0TmF0aXZlRGlhbG9nSGFuZGxlcjpcbiAgICAgICAgICAgIHJldHVybiBTZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc2V0VGVzdFNwZWVkOlxuICAgICAgICAgICAgcmV0dXJuIFNldFRlc3RTcGVlZENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnNldFBhZ2VMb2FkVGltZW91dDpcbiAgICAgICAgICAgIHJldHVybiBTZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5hc3NlcnRpb246XG4gICAgICAgICAgICByZXR1cm4gQXNzZXJ0aW9uQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuZGVidWc6XG4gICAgICAgICAgICByZXR1cm4gRGVidWdDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5leGVjdXRlRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiBFeGVjdXRlRXhwcmVzc2lvbkNvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLmV4ZWN1dGVBc3luY0V4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gRXhlY3V0ZUFzeW5jRXhwcmVzc2lvbkNvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnJlY29yZGVyOlxuICAgICAgICAgICAgcmV0dXJuIFJlY29yZGVyQ29tbWFuZDtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyBDcmVhdGUgY29tbWFuZCBmcm9tIG9iamVjdFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZEZyb21PYmplY3QgKG9iaiwgdGVzdFJ1bikge1xuICAgIGNvbnN0IENtZEN0b3IgPSBnZXRDbWRDdG9yKG9iai50eXBlKTtcblxuICAgIHJldHVybiBDbWRDdG9yICYmIG5ldyBDbWRDdG9yKG9iaiwgdGVzdFJ1bik7XG59XG4iXX0=