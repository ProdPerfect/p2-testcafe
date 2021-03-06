"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const runtime_info_1 = __importDefault(require("../chrome/runtime-info"));
const promisified_functions_1 = require("../../../../../utils/promisified-functions");
class EdgeRuntimeInfo extends runtime_info_1.default {
    async createTempProfile(proxyHostName, allowMultipleWindows) {
        const tempDir = await super.createTempProfile(proxyHostName, allowMultipleWindows);
        // NOTE: prevents Edge from automatically logging under system credentials
        // and showing the welcome screen
        const preferences = {
            'fre': {
                'has_user_seen_fre': true
            },
            'profiles': {
                'edge_implicitly_signed_in': [{
                        'edge_account_type': 3,
                        'id': ''
                    }]
            }
        };
        await promisified_functions_1.writeFile(path_1.default.join(tempDir.path, 'Local State'), JSON.stringify(preferences));
        return tempDir;
    }
}
exports.default = EdgeRuntimeInfo;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Jyb3dzZXIvcHJvdmlkZXIvYnVpbHQtaW4vZGVkaWNhdGVkL2VkZ2UvcnVudGltZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0RBQXdCO0FBQ3hCLDBFQUF1RDtBQUV2RCxzRkFBdUU7QUFFdkUsTUFBcUIsZUFBZ0IsU0FBUSxzQkFBaUI7SUFDaEQsS0FBSyxDQUFDLGlCQUFpQixDQUFFLGFBQXFCLEVBQUUsb0JBQTZCO1FBQ25GLE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRW5GLDBFQUEwRTtRQUMxRSxpQ0FBaUM7UUFDakMsTUFBTSxXQUFXLEdBQUc7WUFDaEIsS0FBSyxFQUFFO2dCQUNILG1CQUFtQixFQUFFLElBQUk7YUFDNUI7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsMkJBQTJCLEVBQUUsQ0FBQzt3QkFDMUIsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDdEIsSUFBSSxFQUFpQixFQUFFO3FCQUMxQixDQUFDO2FBQ0w7U0FDSixDQUFDO1FBRUYsTUFBTSxpQ0FBUyxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFckYsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKO0FBdEJELGtDQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IENocm9tZVJ1bnRpbWVJbmZvIGZyb20gJy4uL2Nocm9tZS9ydW50aW1lLWluZm8nO1xuaW1wb3J0IFRlbXBEaXJlY3RvcnkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXRpbHMvdGVtcC1kaXJlY3RvcnknO1xuaW1wb3J0IHsgd3JpdGVGaWxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXRpbHMvcHJvbWlzaWZpZWQtZnVuY3Rpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRnZVJ1bnRpbWVJbmZvIGV4dGVuZHMgQ2hyb21lUnVudGltZUluZm8ge1xuICAgIHByb3RlY3RlZCBhc3luYyBjcmVhdGVUZW1wUHJvZmlsZSAocHJveHlIb3N0TmFtZTogc3RyaW5nLCBhbGxvd011bHRpcGxlV2luZG93czogYm9vbGVhbik6IFByb21pc2U8VGVtcERpcmVjdG9yeT4ge1xuICAgICAgICBjb25zdCB0ZW1wRGlyID0gYXdhaXQgc3VwZXIuY3JlYXRlVGVtcFByb2ZpbGUocHJveHlIb3N0TmFtZSwgYWxsb3dNdWx0aXBsZVdpbmRvd3MpO1xuXG4gICAgICAgIC8vIE5PVEU6IHByZXZlbnRzIEVkZ2UgZnJvbSBhdXRvbWF0aWNhbGx5IGxvZ2dpbmcgdW5kZXIgc3lzdGVtIGNyZWRlbnRpYWxzXG4gICAgICAgIC8vIGFuZCBzaG93aW5nIHRoZSB3ZWxjb21lIHNjcmVlblxuICAgICAgICBjb25zdCBwcmVmZXJlbmNlcyA9IHtcbiAgICAgICAgICAgICdmcmUnOiB7XG4gICAgICAgICAgICAgICAgJ2hhc191c2VyX3NlZW5fZnJlJzogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdwcm9maWxlcyc6IHtcbiAgICAgICAgICAgICAgICAnZWRnZV9pbXBsaWNpdGx5X3NpZ25lZF9pbic6IFt7XG4gICAgICAgICAgICAgICAgICAgICdlZGdlX2FjY291bnRfdHlwZSc6IDMsXG4gICAgICAgICAgICAgICAgICAgICdpZCc6ICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUocGF0aC5qb2luKHRlbXBEaXIucGF0aCwgJ0xvY2FsIFN0YXRlJyksIEpTT04uc3RyaW5naWZ5KHByZWZlcmVuY2VzKSk7XG5cbiAgICAgICAgcmV0dXJuIHRlbXBEaXI7XG4gICAgfVxufVxuIl19