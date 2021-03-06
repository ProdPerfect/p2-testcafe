"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const debug_1 = __importDefault(require("debug"));
const base_1 = __importDefault(require("./base"));
const runtime_1 = require("../../errors/runtime");
const promisified_functions_1 = require("../promisified-functions");
const render_template_1 = __importDefault(require("../../utils/render-template"));
const types_1 = require("../../errors/types");
const warning_message_1 = __importDefault(require("../../notifications/warning-message"));
const DEBUG_LOGGER = debug_1.default('testcafe:utils:get-options:ssl');
const MAX_PATH_LENGTH = {
    'Linux': 4096,
    'Windows_NT': 260,
    'Darwin': 1024
};
const OS_MAX_PATH_LENGTH = MAX_PATH_LENGTH[os_1.default.type()];
const OPTIONS_SEPARATOR = ';';
const FILE_OPTION_NAMES = ['cert', 'key', 'pfx'];
async function default_1(optionString) {
    return base_1.default(optionString, {
        optionsSeparator: OPTIONS_SEPARATOR,
        async onOptionParsed(key, value) {
            if (!FILE_OPTION_NAMES.includes(key) || value.length > OS_MAX_PATH_LENGTH)
                return value;
            try {
                await promisified_functions_1.stat(value);
            }
            catch (error) {
                DEBUG_LOGGER(render_template_1.default(warning_message_1.default.cannotFindSSLCertFile, value, key, error.stack));
                return value;
            }
            try {
                return await promisified_functions_1.readFile(value);
            }
            catch (error) {
                throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.cannotReadSSLCertFile, value, key, error.stack);
            }
        }
    });
}
exports.default = default_1;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3NsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2dldC1vcHRpb25zL3NzbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUFvQjtBQUNwQixrREFBMEI7QUFDMUIsa0RBQW9DO0FBQ3BDLGtEQUFvRDtBQUNwRCxvRUFBMEQ7QUFDMUQsa0ZBQXlEO0FBQ3pELDhDQUFvRDtBQUNwRCwwRkFBbUU7QUFHbkUsTUFBTSxZQUFZLEdBQUcsZUFBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFFN0QsTUFBTSxlQUFlLEdBQXVCO0lBQ3hDLE9BQU8sRUFBTyxJQUFJO0lBQ2xCLFlBQVksRUFBRSxHQUFHO0lBQ2pCLFFBQVEsRUFBTSxJQUFJO0NBQ3JCLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxZQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUV0RCxNQUFNLGlCQUFpQixHQUFZLEdBQUcsQ0FBQztBQUN2QyxNQUFNLGlCQUFpQixHQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUUzQyxLQUFLLG9CQUFXLFlBQW9CO0lBQy9DLE9BQU8sY0FBYyxDQUFDLFlBQVksRUFBRTtRQUNoQyxnQkFBZ0IsRUFBRSxpQkFBaUI7UUFFbkMsS0FBSyxDQUFDLGNBQWMsQ0FBRSxHQUFXLEVBQUUsS0FBYTtZQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsa0JBQWtCO2dCQUNyRSxPQUFPLEtBQUssQ0FBQztZQUVqQixJQUFJO2dCQUNBLE1BQU0sNEJBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNyQjtZQUNELE9BQU8sS0FBSyxFQUFFO2dCQUNWLFlBQVksQ0FBQyx5QkFBYyxDQUFDLHlCQUFnQixDQUFDLHFCQUFxQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBRTlGLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsSUFBSTtnQkFDQSxPQUFPLE1BQU0sZ0NBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQztZQUNELE9BQU8sS0FBSyxFQUFFO2dCQUNWLE1BQU0sSUFBSSxzQkFBWSxDQUFDLHNCQUFjLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDekY7UUFDTCxDQUFDO0tBQ0osQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXpCRCw0QkF5QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBiYXNlR2V0T3B0aW9ucyBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9wcm9taXNpZmllZC1mdW5jdGlvbnMnO1xuaW1wb3J0IHJlbmRlclRlbXBsYXRlIGZyb20gJy4uLy4uL3V0aWxzL3JlbmRlci10ZW1wbGF0ZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgV0FSTklOR19NRVNTQUdFUyBmcm9tICcuLi8uLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5pbXBvcnQgeyBEaWN0aW9uYXJ5IH0gZnJvbSAnLi4vLi4vY29uZmlndXJhdGlvbi9pbnRlcmZhY2VzJztcblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOnV0aWxzOmdldC1vcHRpb25zOnNzbCcpO1xuXG5jb25zdCBNQVhfUEFUSF9MRU5HVEg6IERpY3Rpb25hcnk8bnVtYmVyPiA9IHtcbiAgICAnTGludXgnOiAgICAgIDQwOTYsXG4gICAgJ1dpbmRvd3NfTlQnOiAyNjAsXG4gICAgJ0Rhcndpbic6ICAgICAxMDI0XG59O1xuXG5jb25zdCBPU19NQVhfUEFUSF9MRU5HVEggPSBNQVhfUEFUSF9MRU5HVEhbb3MudHlwZSgpXTtcblxuY29uc3QgT1BUSU9OU19TRVBBUkFUT1IgICAgICAgICAgPSAnOyc7XG5jb25zdCBGSUxFX09QVElPTl9OQU1FUyAgICAgICAgICA9IFsnY2VydCcsICdrZXknLCAncGZ4J107XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChvcHRpb25TdHJpbmc6IHN0cmluZyk6IFByb21pc2U8RGljdGlvbmFyeTxzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyPj4ge1xuICAgIHJldHVybiBiYXNlR2V0T3B0aW9ucyhvcHRpb25TdHJpbmcsIHtcbiAgICAgICAgb3B0aW9uc1NlcGFyYXRvcjogT1BUSU9OU19TRVBBUkFUT1IsXG5cbiAgICAgICAgYXN5bmMgb25PcHRpb25QYXJzZWQgKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAoIUZJTEVfT1BUSU9OX05BTUVTLmluY2x1ZGVzKGtleSkgfHwgdmFsdWUubGVuZ3RoID4gT1NfTUFYX1BBVEhfTEVOR1RIKVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzdGF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIERFQlVHX0xPR0dFUihyZW5kZXJUZW1wbGF0ZShXQVJOSU5HX01FU1NBR0VTLmNhbm5vdEZpbmRTU0xDZXJ0RmlsZSwgdmFsdWUsIGtleSwgZXJyb3Iuc3RhY2spKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVhZEZpbGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RSZWFkU1NMQ2VydEZpbGUsIHZhbHVlLCBrZXksIGVycm9yLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4iXX0=