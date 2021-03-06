"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = __importDefault(require("./type"));
const base_1 = __importDefault(require("./base"));
const options_1 = require("./options");
const runtime_1 = require("../../errors/runtime");
const test_run_1 = require("../../errors/test-run");
const execute_js_expression_1 = require("../execute-js-expression");
const utils_1 = require("./utils");
const argument_1 = require("./validations/argument");
// Initializers
function initAssertionOptions(name, val) {
    return new options_1.AssertionOptions(val, true);
}
//Initializers
function initAssertionParameter(name, val, { skipVisibilityCheck, testRun }) {
    try {
        if (utils_1.isJSExpression(val))
            val = execute_js_expression_1.executeJsExpression(val.value, testRun, { skipVisibilityCheck });
        return val;
    }
    catch (err) {
        throw new test_run_1.AssertionExecutableArgumentError(name, val.value, err, err instanceof runtime_1.APIError);
    }
}
// Commands
class AssertionCommand extends base_1.default {
    constructor(obj, testRun) {
        super(obj, testRun, type_1.default.assertion);
    }
    _getAssignableProperties() {
        return [
            { name: 'assertionType', type: argument_1.nonEmptyStringArgument, required: true },
            { name: 'actual', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected2', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'message', type: argument_1.stringArgument, defaultValue: null },
            { name: 'options', type: argument_1.actionOptions, init: initAssertionOptions, required: true }
        ];
    }
}
exports.default = AssertionCommand;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rlc3QtcnVuL2NvbW1hbmRzL2Fzc2VydGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUEwQjtBQUMxQixrREFBaUM7QUFDakMsdUNBQTZDO0FBQzdDLGtEQUFnRDtBQUNoRCxvREFBeUU7QUFDekUsb0VBQStEO0FBQy9ELG1DQUF5QztBQUV6QyxxREFBK0Y7QUFFL0YsZUFBZTtBQUNmLFNBQVMsb0JBQW9CLENBQUUsSUFBSSxFQUFFLEdBQUc7SUFDcEMsT0FBTyxJQUFJLDBCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQsY0FBYztBQUNkLFNBQVMsc0JBQXNCLENBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRTtJQUN4RSxJQUFJO1FBQ0EsSUFBSSxzQkFBYyxDQUFDLEdBQUcsQ0FBQztZQUNuQixHQUFHLEdBQUcsMkNBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFFM0UsT0FBTyxHQUFHLENBQUM7S0FDZDtJQUNELE9BQU8sR0FBRyxFQUFFO1FBQ1IsTUFBTSxJQUFJLDJDQUFnQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLFlBQVksa0JBQVEsQ0FBQyxDQUFDO0tBQzdGO0FBQ0wsQ0FBQztBQUVELFdBQVc7QUFDWCxNQUFxQixnQkFBaUIsU0FBUSxjQUFXO0lBQ3JELFlBQWEsR0FBRyxFQUFFLE9BQU87UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsY0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCx3QkFBd0I7UUFDcEIsT0FBTztZQUNILEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsaUNBQXNCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN2RSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN0RSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN4RSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN6RSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLHlCQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtZQUM3RCxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLHdCQUFhLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7U0FDdkYsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQWZELG1DQWVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRZUEUgZnJvbSAnLi90eXBlJztcbmltcG9ydCBDb21tYW5kQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgQXNzZXJ0aW9uT3B0aW9ucyB9IGZyb20gJy4vb3B0aW9ucyc7XG5pbXBvcnQgeyBBUElFcnJvciB9IGZyb20gJy4uLy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IEFzc2VydGlvbkV4ZWN1dGFibGVBcmd1bWVudEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3Rlc3QtcnVuJztcbmltcG9ydCB7IGV4ZWN1dGVKc0V4cHJlc3Npb24gfSBmcm9tICcuLi9leGVjdXRlLWpzLWV4cHJlc3Npb24nO1xuaW1wb3J0IHsgaXNKU0V4cHJlc3Npb24gfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHsgc3RyaW5nQXJndW1lbnQsIGFjdGlvbk9wdGlvbnMsIG5vbkVtcHR5U3RyaW5nQXJndW1lbnQgfSBmcm9tICcuL3ZhbGlkYXRpb25zL2FyZ3VtZW50JztcblxuLy8gSW5pdGlhbGl6ZXJzXG5mdW5jdGlvbiBpbml0QXNzZXJ0aW9uT3B0aW9ucyAobmFtZSwgdmFsKSB7XG4gICAgcmV0dXJuIG5ldyBBc3NlcnRpb25PcHRpb25zKHZhbCwgdHJ1ZSk7XG59XG5cbi8vSW5pdGlhbGl6ZXJzXG5mdW5jdGlvbiBpbml0QXNzZXJ0aW9uUGFyYW1ldGVyIChuYW1lLCB2YWwsIHsgc2tpcFZpc2liaWxpdHlDaGVjaywgdGVzdFJ1biB9KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzSlNFeHByZXNzaW9uKHZhbCkpXG4gICAgICAgICAgICB2YWwgPSBleGVjdXRlSnNFeHByZXNzaW9uKHZhbC52YWx1ZSwgdGVzdFJ1biwgeyBza2lwVmlzaWJpbGl0eUNoZWNrIH0pO1xuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFzc2VydGlvbkV4ZWN1dGFibGVBcmd1bWVudEVycm9yKG5hbWUsIHZhbC52YWx1ZSwgZXJyLCBlcnIgaW5zdGFuY2VvZiBBUElFcnJvcik7XG4gICAgfVxufVxuXG4vLyBDb21tYW5kc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXNzZXJ0aW9uQ29tbWFuZCBleHRlbmRzIENvbW1hbmRCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuKSB7XG4gICAgICAgIHN1cGVyKG9iaiwgdGVzdFJ1biwgVFlQRS5hc3NlcnRpb24pO1xuICAgIH1cblxuICAgIF9nZXRBc3NpZ25hYmxlUHJvcGVydGllcyAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdhc3NlcnRpb25UeXBlJywgdHlwZTogbm9uRW1wdHlTdHJpbmdBcmd1bWVudCwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2FjdHVhbCcsIGluaXQ6IGluaXRBc3NlcnRpb25QYXJhbWV0ZXIsIGRlZmF1bHRWYWx1ZTogdm9pZCAwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdleHBlY3RlZCcsIGluaXQ6IGluaXRBc3NlcnRpb25QYXJhbWV0ZXIsIGRlZmF1bHRWYWx1ZTogdm9pZCAwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdleHBlY3RlZDInLCBpbml0OiBpbml0QXNzZXJ0aW9uUGFyYW1ldGVyLCBkZWZhdWx0VmFsdWU6IHZvaWQgMCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnbWVzc2FnZScsIHR5cGU6IHN0cmluZ0FyZ3VtZW50LCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ29wdGlvbnMnLCB0eXBlOiBhY3Rpb25PcHRpb25zLCBpbml0OiBpbml0QXNzZXJ0aW9uT3B0aW9ucywgcmVxdWlyZWQ6IHRydWUgfVxuICAgICAgICBdO1xuICAgIH1cbn1cbiJdfQ==