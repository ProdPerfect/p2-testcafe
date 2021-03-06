"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tty_1 = __importDefault(require("tty"));
const elegant_spinner_1 = __importDefault(require("elegant-spinner"));
const log_update_async_hook_1 = __importDefault(require("log-update-async-hook"));
const chalk_1 = __importDefault(require("chalk"));
const is_ci_1 = __importDefault(require("is-ci"));
// NOTE: To support piping, we use stderr as the log output
// stream, while stdout is used for the report output.
exports.default = {
    animation: null,
    isAnimated: tty_1.default.isatty(1) && !is_ci_1.default,
    showSpinner() {
        // NOTE: we can use the spinner only if stdout is a TTY and we are not in CI environment (e.g. TravisCI),
        // otherwise we can't repaint animation frames. Thanks https://github.com/sindresorhus/ora for insight.
        if (this.isAnimated) {
            const spinnerFrame = elegant_spinner_1.default();
            this.animation = setInterval(() => {
                const frame = chalk_1.default.cyan(spinnerFrame());
                log_update_async_hook_1.default(frame);
            }, 50);
        }
    },
    hideSpinner(isExit) {
        if (this.animation) {
            clearInterval(this.animation);
            log_update_async_hook_1.default.clear();
            if (isExit)
                log_update_async_hook_1.default.done();
            this.animation = null;
        }
    },
    write(text) {
        if (this.animation)
            this.hideSpinner();
        console.log(text);
        if (this.animation)
            this.showSpinner();
    }
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9sb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw4Q0FBc0I7QUFDdEIsc0VBQTZDO0FBQzdDLGtGQUE4QztBQUM5QyxrREFBMEI7QUFDMUIsa0RBQXlCO0FBRXpCLDJEQUEyRDtBQUMzRCxzREFBc0Q7QUFDdEQsa0JBQWU7SUFDWCxTQUFTLEVBQUcsSUFBSTtJQUNoQixVQUFVLEVBQUUsYUFBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQUk7SUFFbEMsV0FBVztRQUNQLHlHQUF5RztRQUN6Ryx1R0FBdUc7UUFDdkcsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLE1BQU0sWUFBWSxHQUFHLHlCQUFjLEVBQUUsQ0FBQztZQUV0QyxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlCLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztnQkFFekMsK0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDVjtJQUNMLENBQUM7SUFFRCxXQUFXLENBQUUsTUFBTTtRQUNmLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlCLCtCQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFbEIsSUFBSSxNQUFNO2dCQUNOLCtCQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFFLElBQUk7UUFDUCxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQ2QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEIsSUFBSSxJQUFJLENBQUMsU0FBUztZQUNkLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0dHkgZnJvbSAndHR5JztcbmltcG9ydCBlbGVnYW50U3Bpbm5lciBmcm9tICdlbGVnYW50LXNwaW5uZXInO1xuaW1wb3J0IGxvZ1VwZGF0ZSBmcm9tICdsb2ctdXBkYXRlLWFzeW5jLWhvb2snO1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCBpc0NJIGZyb20gJ2lzLWNpJztcblxuLy8gTk9URTogVG8gc3VwcG9ydCBwaXBpbmcsIHdlIHVzZSBzdGRlcnIgYXMgdGhlIGxvZyBvdXRwdXRcbi8vIHN0cmVhbSwgd2hpbGUgc3Rkb3V0IGlzIHVzZWQgZm9yIHRoZSByZXBvcnQgb3V0cHV0LlxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGFuaW1hdGlvbjogIG51bGwsXG4gICAgaXNBbmltYXRlZDogdHR5LmlzYXR0eSgxKSAmJiAhaXNDSSxcblxuICAgIHNob3dTcGlubmVyICgpIHtcbiAgICAgICAgLy8gTk9URTogd2UgY2FuIHVzZSB0aGUgc3Bpbm5lciBvbmx5IGlmIHN0ZG91dCBpcyBhIFRUWSBhbmQgd2UgYXJlIG5vdCBpbiBDSSBlbnZpcm9ubWVudCAoZS5nLiBUcmF2aXNDSSksXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSBjYW4ndCByZXBhaW50IGFuaW1hdGlvbiBmcmFtZXMuIFRoYW5rcyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL29yYSBmb3IgaW5zaWdodC5cbiAgICAgICAgaWYgKHRoaXMuaXNBbmltYXRlZCkge1xuICAgICAgICAgICAgY29uc3Qgc3Bpbm5lckZyYW1lID0gZWxlZ2FudFNwaW5uZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBjaGFsay5jeWFuKHNwaW5uZXJGcmFtZSgpKTtcblxuICAgICAgICAgICAgICAgIGxvZ1VwZGF0ZShmcmFtZSk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZVNwaW5uZXIgKGlzRXhpdCkge1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5hbmltYXRpb24pO1xuICAgICAgICAgICAgbG9nVXBkYXRlLmNsZWFyKCk7XG5cbiAgICAgICAgICAgIGlmIChpc0V4aXQpXG4gICAgICAgICAgICAgICAgbG9nVXBkYXRlLmRvbmUoKTtcblxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHdyaXRlICh0ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbilcbiAgICAgICAgICAgIHRoaXMuaGlkZVNwaW5uZXIoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pXG4gICAgICAgICAgICB0aGlzLnNob3dTcGlubmVyKCk7XG4gICAgfVxufTtcblxuIl19