"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../base"));
const runtime_1 = require("../../../errors/runtime");
const types_1 = require("../../../errors/types");
const test_file_1 = __importDefault(require("../../../api/structure/test-file"));
const fixture_1 = __importDefault(require("../../../api/structure/fixture"));
const test_1 = __importDefault(require("../../../api/structure/test"));
const from_object_1 = __importDefault(require("../../../test-run/commands/from-object"));
class RawTestFileCompiler extends base_1.default {
    static _createTestFn(commands) {
        return async (t) => {
            for (let i = 0; i < commands.length; i++) {
                const callsite = commands[i] && commands[i].callsite;
                let command = null;
                try {
                    command = from_object_1.default(commands[i], t.testRun);
                    await t.testRun.executeCommand(command, callsite);
                }
                catch (err) {
                    err.callsite = callsite;
                    throw err;
                }
            }
        };
    }
    static _assignCommonTestingUnitProperties(src, dest) {
        if (src.pageUrl)
            dest.page(src.pageUrl);
        if (src.authCredentials)
            dest.httpAuth(src.authCredentials);
        /* eslint-disable no-unused-expressions */
        if (src.only)
            dest.only;
        if (src.skip)
            dest.skip;
        if (src.disablePageReloads)
            dest.disablePageReloads;
        if (src.enablePageReloads)
            dest.enablePageReloads;
        /* eslint-enable no-unused-expressions */
    }
    static _addTest(testFile, src) {
        const test = new test_1.default(testFile);
        test(src.name, RawTestFileCompiler._createTestFn(src.commands));
        RawTestFileCompiler._assignCommonTestingUnitProperties(src, test);
        if (src.beforeCommands)
            test.before(RawTestFileCompiler._createTestFn(src.beforeCommands));
        if (src.afterCommands)
            test.after(RawTestFileCompiler._createTestFn(src.afterCommands));
        return test;
    }
    static _addFixture(testFile, src) {
        const fixture = new fixture_1.default(testFile);
        fixture(src.name);
        RawTestFileCompiler._assignCommonTestingUnitProperties(src, fixture);
        if (src.beforeEachCommands)
            fixture.beforeEach(RawTestFileCompiler._createTestFn(src.beforeEachCommands));
        if (src.afterEachCommands)
            fixture.afterEach(RawTestFileCompiler._createTestFn(src.afterEachCommands));
        src.tests.forEach(testSrc => RawTestFileCompiler._addTest(testFile, testSrc));
    }
    _hasTests() {
        return true;
    }
    getSupportedExtension() {
        return '.testcafe';
    }
    compile(code, filename) {
        const testFile = new test_file_1.default(filename);
        let data = null;
        try {
            data = JSON.parse(code);
            data.fixtures.forEach(fixtureSrc => RawTestFileCompiler._addFixture(testFile, fixtureSrc));
            return testFile.getTests();
        }
        catch (err) {
            throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.cannotParseRawFile, filename, err.toString());
        }
    }
}
exports.default = RawTestFileCompiler;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBpbGVyL3Rlc3QtZmlsZS9mb3JtYXRzL3Jhdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1EQUEyQztBQUMzQyxxREFBdUQ7QUFDdkQsaURBQXVEO0FBQ3ZELGlGQUF3RDtBQUN4RCw2RUFBcUQ7QUFDckQsdUVBQStDO0FBQy9DLHlGQUE2RTtBQUU3RSxNQUFxQixtQkFBb0IsU0FBUSxjQUFvQjtJQUNqRSxNQUFNLENBQUMsYUFBYSxDQUFFLFFBQVE7UUFDMUIsT0FBTyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7WUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQ3JELElBQUksT0FBTyxHQUFJLElBQUksQ0FBQztnQkFFcEIsSUFBSTtvQkFDQSxPQUFPLEdBQUcscUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFMUQsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3JEO2dCQUNELE9BQU8sR0FBRyxFQUFFO29CQUNSLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO29CQUN4QixNQUFNLEdBQUcsQ0FBQztpQkFDYjthQUNKO1FBQ0wsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBRSxHQUFHLEVBQUUsSUFBSTtRQUNoRCxJQUFJLEdBQUcsQ0FBQyxPQUFPO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMs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QUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUN2RjtJQUNMLENBQUM7Q0FDSjtBQWxHRCxzQ0FrR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVzdEZpbGVDb21waWxlckJhc2UgZnJvbSAnLi4vYmFzZSc7XG5pbXBvcnQgeyBHZW5lcmFsRXJyb3IgfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uLy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgVGVzdEZpbGUgZnJvbSAnLi4vLi4vLi4vYXBpL3N0cnVjdHVyZS90ZXN0LWZpbGUnO1xuaW1wb3J0IEZpeHR1cmUgZnJvbSAnLi4vLi4vLi4vYXBpL3N0cnVjdHVyZS9maXh0dXJlJztcbmltcG9ydCBUZXN0IGZyb20gJy4uLy4uLy4uL2FwaS9zdHJ1Y3R1cmUvdGVzdCc7XG5pbXBvcnQgY3JlYXRlQ29tbWFuZEZyb21PYmplY3QgZnJvbSAnLi4vLi4vLi4vdGVzdC1ydW4vY29tbWFuZHMvZnJvbS1vYmplY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYXdUZXN0RmlsZUNvbXBpbGVyIGV4dGVuZHMgVGVzdEZpbGVDb21waWxlckJhc2Uge1xuICAgIHN0YXRpYyBfY3JlYXRlVGVzdEZuIChjb21tYW5kcykge1xuICAgICAgICByZXR1cm4gYXN5bmMgdCA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1hbmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBjb21tYW5kc1tpXSAmJiBjb21tYW5kc1tpXS5jYWxsc2l0ZTtcbiAgICAgICAgICAgICAgICBsZXQgY29tbWFuZCAgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA9IGNyZWF0ZUNvbW1hbmRGcm9tT2JqZWN0KGNvbW1hbmRzW2ldLCB0LnRlc3RSdW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHQudGVzdFJ1bi5leGVjdXRlQ29tbWFuZChjb21tYW5kLCBjYWxsc2l0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIF9hc3NpZ25Db21tb25UZXN0aW5nVW5pdFByb3BlcnRpZXMgKHNyYywgZGVzdCkge1xuICAgICAgICBpZiAoc3JjLnBhZ2VVcmwpXG4gICAgICAgICAgICBkZXN0LnBhZ2Uoc3JjLnBhZ2VVcmwpO1xuXG4gICAgICAgIGlmIChzcmMuYXV0aENyZWRlbnRpYWxzKVxuICAgICAgICAgICAgZGVzdC5odHRwQXV0aChzcmMuYXV0aENyZWRlbnRpYWxzKTtcblxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cbiAgICAgICAgaWYgKHNyYy5vbmx5KVxuICAgICAgICAgICAgZGVzdC5vbmx5O1xuXG4gICAgICAgIGlmIChzcmMuc2tpcClcbiAgICAgICAgICAgIGRlc3Quc2tpcDtcblxuICAgICAgICBpZiAoc3JjLmRpc2FibGVQYWdlUmVsb2FkcylcbiAgICAgICAgICAgIGRlc3QuZGlzYWJsZVBhZ2VSZWxvYWRzO1xuXG4gICAgICAgIGlmIChzcmMuZW5hYmxlUGFnZVJlbG9hZHMpXG4gICAgICAgICAgICBkZXN0LmVuYWJsZVBhZ2VSZWxvYWRzO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuICAgIH1cblxuICAgIHN0YXRpYyBfYWRkVGVzdCAodGVzdEZpbGUsIHNyYykge1xuICAgICAgICBjb25zdCB0ZXN0ID0gbmV3IFRlc3QodGVzdEZpbGUpO1xuXG4gICAgICAgIHRlc3Qoc3JjLm5hbWUsIFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2NyZWF0ZVRlc3RGbihzcmMuY29tbWFuZHMpKTtcblxuICAgICAgICBSYXdUZXN0RmlsZUNvbXBpbGVyLl9hc3NpZ25Db21tb25UZXN0aW5nVW5pdFByb3BlcnRpZXMoc3JjLCB0ZXN0KTtcblxuICAgICAgICBpZiAoc3JjLmJlZm9yZUNvbW1hbmRzKVxuICAgICAgICAgICAgdGVzdC5iZWZvcmUoUmF3VGVzdEZpbGVDb21waWxlci5fY3JlYXRlVGVzdEZuKHNyYy5iZWZvcmVDb21tYW5kcykpO1xuXG4gICAgICAgIGlmIChzcmMuYWZ0ZXJDb21tYW5kcylcbiAgICAgICAgICAgIHRlc3QuYWZ0ZXIoUmF3VGVzdEZpbGVDb21waWxlci5fY3JlYXRlVGVzdEZuKHNyYy5hZnRlckNvbW1hbmRzKSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIF9hZGRGaXh0dXJlICh0ZXN0RmlsZSwgc3JjKSB7XG4gICAgICAgIGNvbnN0IGZpeHR1cmUgPSBuZXcgRml4dHVyZSh0ZXN0RmlsZSk7XG5cbiAgICAgICAgZml4dHVyZShzcmMubmFtZSk7XG5cbiAgICAgICAgUmF3VGVzdEZpbGVDb21waWxlci5fYXNzaWduQ29tbW9uVGVzdGluZ1VuaXRQcm9wZXJ0aWVzKHNyYywgZml4dHVyZSk7XG5cbiAgICAgICAgaWYgKHNyYy5iZWZvcmVFYWNoQ29tbWFuZHMpXG4gICAgICAgICAgICBmaXh0dXJlLmJlZm9yZUVhY2goUmF3VGVzdEZpbGVDb21waWxlci5fY3JlYXRlVGVzdEZuKHNyYy5iZWZvcmVFYWNoQ29tbWFuZHMpKTtcblxuICAgICAgICBpZiAoc3JjLmFmdGVyRWFjaENvbW1hbmRzKVxuICAgICAgICAgICAgZml4dHVyZS5hZnRlckVhY2goUmF3VGVzdEZpbGVDb21waWxlci5fY3JlYXRlVGVzdEZuKHNyYy5hZnRlckVhY2hDb21tYW5kcykpO1xuXG4gICAgICAgIHNyYy50ZXN0cy5mb3JFYWNoKHRlc3RTcmMgPT4gUmF3VGVzdEZpbGVDb21waWxlci5fYWRkVGVzdCh0ZXN0RmlsZSwgdGVzdFNyYykpO1xuICAgIH1cblxuICAgIF9oYXNUZXN0cyAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldFN1cHBvcnRlZEV4dGVuc2lvbiAoKSB7XG4gICAgICAgIHJldHVybiAnLnRlc3RjYWZlJztcbiAgICB9XG5cbiAgICBjb21waWxlIChjb2RlLCBmaWxlbmFtZSkge1xuICAgICAgICBjb25zdCB0ZXN0RmlsZSA9IG5ldyBUZXN0RmlsZShmaWxlbmFtZSk7XG5cbiAgICAgICAgbGV0IGRhdGEgPSBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShjb2RlKTtcblxuICAgICAgICAgICAgZGF0YS5maXh0dXJlcy5mb3JFYWNoKGZpeHR1cmVTcmMgPT4gUmF3VGVzdEZpbGVDb21waWxlci5fYWRkRml4dHVyZSh0ZXN0RmlsZSwgZml4dHVyZVNyYykpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGVzdEZpbGUuZ2V0VGVzdHMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmNhbm5vdFBhcnNlUmF3RmlsZSwgZmlsZW5hbWUsIGVyci50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==