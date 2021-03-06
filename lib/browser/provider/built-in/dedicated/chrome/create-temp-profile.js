"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const make_dir_1 = __importDefault(require("make-dir"));
const temp_directory_1 = __importDefault(require("../../../../../utils/temp-directory"));
const promisified_functions_1 = require("../../../../../utils/promisified-functions");
async function default_1(proxyHostName, allowMultipleWindows) {
    const tempDir = await temp_directory_1.default.createDirectory('chrome-profile');
    const profileDirName = path_1.default.join(tempDir.path, 'Default');
    await make_dir_1.default(profileDirName);
    const preferences = {
        'credentials_enable_service': false,
        'devtools': {
            'preferences': {
                'currentDockState': '"undocked"',
                'lastDockState': '"bottom"'
            }
        },
        'plugins': {
            'always_open_pdf_externally': true
        },
        'profile': {
            'content_settings': {
                'exceptions': Object.assign({ 'automatic_downloads': {
                        [proxyHostName]: { setting: 1 }
                    } }, allowMultipleWindows && {
                    'popups': {
                        [proxyHostName]: { setting: 1 }
                    }
                })
            },
            'password_manager_enabled': false
        },
        'translate': {
            'enabled': false
        }
    };
    await promisified_functions_1.writeFile(path_1.default.join(profileDirName, 'Preferences'), JSON.stringify(preferences));
    await promisified_functions_1.writeFile(path_1.default.join(tempDir.path, 'First Run'), '');
    return tempDir;
}
exports.default = default_1;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRlbXAtcHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9jaHJvbWUvY3JlYXRlLXRlbXAtcHJvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF3QjtBQUN4Qix3REFBK0I7QUFDL0IseUZBQWdFO0FBQ2hFLHNGQUF1RTtBQUV4RCxLQUFLLG9CQUFXLGFBQXFCLEVBQUUsb0JBQTZCO0lBQy9FLE1BQU0sT0FBTyxHQUFVLE1BQU0sd0JBQWEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM3RSxNQUFNLGNBQWMsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFMUQsTUFBTSxrQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTlCLE1BQU0sV0FBVyxHQUFHO1FBQ2hCLDRCQUE0QixFQUFFLEtBQUs7UUFFbkMsVUFBVSxFQUFFO1lBQ1IsYUFBYSxFQUFFO2dCQUNYLGtCQUFrQixFQUFFLFlBQVk7Z0JBQ2hDLGVBQWUsRUFBSyxVQUFVO2FBQ2pDO1NBQ0o7UUFDRCxTQUFTLEVBQUU7WUFDUCw0QkFBNEIsRUFBRSxJQUFJO1NBQ3JDO1FBQ0QsU0FBUyxFQUFFO1lBQ1Asa0JBQWtCLEVBQUU7Z0JBQ2hCLFlBQVksa0JBQ1IscUJBQXFCLEVBQUU7d0JBQ25CLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO3FCQUNsQyxJQUNFLG9CQUFvQixJQUFJO29CQUN2QixRQUFRLEVBQUU7d0JBQ04sQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7cUJBQ2xDO2lCQUNKLENBQ0o7YUFDSjtZQUVELDBCQUEwQixFQUFFLEtBQUs7U0FDcEM7UUFFRCxXQUFXLEVBQUU7WUFDVCxTQUFTLEVBQUUsS0FBSztTQUNuQjtLQUNKLENBQUM7SUFFRixNQUFNLGlDQUFTLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsYUFBYSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLE1BQU0saUNBQVMsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFMUQsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQTVDRCw0QkE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcbmltcG9ydCBUZW1wRGlyZWN0b3J5IGZyb20gJy4uLy4uLy4uLy4uLy4uL3V0aWxzL3RlbXAtZGlyZWN0b3J5JztcbmltcG9ydCB7IHdyaXRlRmlsZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3V0aWxzL3Byb21pc2lmaWVkLWZ1bmN0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChwcm94eUhvc3ROYW1lOiBzdHJpbmcsIGFsbG93TXVsdGlwbGVXaW5kb3dzOiBib29sZWFuKTogUHJvbWlzZTxUZW1wRGlyZWN0b3J5PiB7XG4gICAgY29uc3QgdGVtcERpciAgICAgICAgPSBhd2FpdCBUZW1wRGlyZWN0b3J5LmNyZWF0ZURpcmVjdG9yeSgnY2hyb21lLXByb2ZpbGUnKTtcbiAgICBjb25zdCBwcm9maWxlRGlyTmFtZSA9IHBhdGguam9pbih0ZW1wRGlyLnBhdGgsICdEZWZhdWx0Jyk7XG5cbiAgICBhd2FpdCBtYWtlRGlyKHByb2ZpbGVEaXJOYW1lKTtcblxuICAgIGNvbnN0IHByZWZlcmVuY2VzID0ge1xuICAgICAgICAnY3JlZGVudGlhbHNfZW5hYmxlX3NlcnZpY2UnOiBmYWxzZSxcblxuICAgICAgICAnZGV2dG9vbHMnOiB7XG4gICAgICAgICAgICAncHJlZmVyZW5jZXMnOiB7XG4gICAgICAgICAgICAgICAgJ2N1cnJlbnREb2NrU3RhdGUnOiAnXCJ1bmRvY2tlZFwiJyxcbiAgICAgICAgICAgICAgICAnbGFzdERvY2tTdGF0ZSc6ICAgICdcImJvdHRvbVwiJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAncGx1Z2lucyc6IHtcbiAgICAgICAgICAgICdhbHdheXNfb3Blbl9wZGZfZXh0ZXJuYWxseSc6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgJ3Byb2ZpbGUnOiB7XG4gICAgICAgICAgICAnY29udGVudF9zZXR0aW5ncyc6IHtcbiAgICAgICAgICAgICAgICAnZXhjZXB0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2F1dG9tYXRpY19kb3dubG9hZHMnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBbcHJveHlIb3N0TmFtZV06IHsgc2V0dGluZzogMSB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLmFsbG93TXVsdGlwbGVXaW5kb3dzICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdwb3B1cHMnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW3Byb3h5SG9zdE5hbWVdOiB7IHNldHRpbmc6IDEgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdwYXNzd29yZF9tYW5hZ2VyX2VuYWJsZWQnOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgICd0cmFuc2xhdGUnOiB7XG4gICAgICAgICAgICAnZW5hYmxlZCc6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgd3JpdGVGaWxlKHBhdGguam9pbihwcm9maWxlRGlyTmFtZSwgJ1ByZWZlcmVuY2VzJyksIEpTT04uc3RyaW5naWZ5KHByZWZlcmVuY2VzKSk7XG4gICAgYXdhaXQgd3JpdGVGaWxlKHBhdGguam9pbih0ZW1wRGlyLnBhdGgsICdGaXJzdCBSdW4nKSwgJycpO1xuXG4gICAgcmV0dXJuIHRlbXBEaXI7XG59XG4iXX0=