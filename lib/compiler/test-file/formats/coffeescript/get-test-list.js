"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coffeescript_1 = __importDefault(require("coffeescript"));
const babel_core_1 = require("babel-core");
const compiler_js_1 = __importDefault(require("../es-next/compiler.js"));
const get_test_list_1 = require("../es-next/get-test-list");
class CoffeeScriptTestFileParser extends get_test_list_1.EsNextTestFileParser {
    parse(code) {
        const babelOptions = compiler_js_1.default.getBabelOptions(null, code);
        delete babelOptions.filename;
        babelOptions.ast = true;
        code = coffeescript_1.default.compile(code, {
            bare: true,
            sourceMap: false,
            inlineMap: false,
            header: false
        });
        const ast = babel_core_1.transform(code, babelOptions).ast;
        return this.analyze(ast.program.body);
    }
}
exports.CoffeeScriptTestFileParser = CoffeeScriptTestFileParser;
const parser = new CoffeeScriptTestFileParser();
exports.getCoffeeScriptTestList = parser.getTestList.bind(parser);
exports.getCoffeeScriptTestListFromCode = parser.getTestListFromCode.bind(parser);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXRlc3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy9jb2ZmZWVzY3JpcHQvZ2V0LXRlc3QtbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUF3QztBQUN4QywyQ0FBdUM7QUFDdkMseUVBQTREO0FBQzVELDREQUFnRTtBQUVoRSxNQUFhLDBCQUEyQixTQUFRLG9DQUFvQjtJQUNoRSxLQUFLLENBQUUsSUFBSTtRQUNQLE1BQU0sWUFBWSxHQUFHLHFCQUFzQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFeEUsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBQzdCLFlBQVksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBRXhCLElBQUksR0FBRyxzQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDOUIsSUFBSSxFQUFPLElBQUk7WUFDZixTQUFTLEVBQUUsS0FBSztZQUNoQixTQUFTLEVBQUUsS0FBSztZQUNoQixNQUFNLEVBQUssS0FBSztTQUNuQixDQUFDLENBQUM7UUFFSCxNQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFOUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNKO0FBbEJELGdFQWtCQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksMEJBQTBCLEVBQUUsQ0FBQztBQUVuQyxRQUFBLHVCQUF1QixHQUFXLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xFLFFBQUEsK0JBQStCLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb2ZmZWVTY3JpcHQgZnJvbSAnY29mZmVlc2NyaXB0JztcbmltcG9ydCB7IHRyYW5zZm9ybSB9IGZyb20gJ2JhYmVsLWNvcmUnO1xuaW1wb3J0IEVTTmV4dFRlc3RGaWxlQ29tcGlsZXIgZnJvbSAnLi4vZXMtbmV4dC9jb21waWxlci5qcyc7XG5pbXBvcnQgeyBFc05leHRUZXN0RmlsZVBhcnNlciB9IGZyb20gJy4uL2VzLW5leHQvZ2V0LXRlc3QtbGlzdCc7XG5cbmV4cG9ydCBjbGFzcyBDb2ZmZWVTY3JpcHRUZXN0RmlsZVBhcnNlciBleHRlbmRzIEVzTmV4dFRlc3RGaWxlUGFyc2VyIHtcbiAgICBwYXJzZSAoY29kZSkge1xuICAgICAgICBjb25zdCBiYWJlbE9wdGlvbnMgPSBFU05leHRUZXN0RmlsZUNvbXBpbGVyLmdldEJhYmVsT3B0aW9ucyhudWxsLCBjb2RlKTtcblxuICAgICAgICBkZWxldGUgYmFiZWxPcHRpb25zLmZpbGVuYW1lO1xuICAgICAgICBiYWJlbE9wdGlvbnMuYXN0ID0gdHJ1ZTtcblxuICAgICAgICBjb2RlID0gQ29mZmVlU2NyaXB0LmNvbXBpbGUoY29kZSwge1xuICAgICAgICAgICAgYmFyZTogICAgICB0cnVlLFxuICAgICAgICAgICAgc291cmNlTWFwOiBmYWxzZSxcbiAgICAgICAgICAgIGlubGluZU1hcDogZmFsc2UsXG4gICAgICAgICAgICBoZWFkZXI6ICAgIGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFzdCA9IHRyYW5zZm9ybShjb2RlLCBiYWJlbE9wdGlvbnMpLmFzdDtcblxuICAgICAgICByZXR1cm4gdGhpcy5hbmFseXplKGFzdC5wcm9ncmFtLmJvZHkpO1xuICAgIH1cbn1cblxuY29uc3QgcGFyc2VyID0gbmV3IENvZmZlZVNjcmlwdFRlc3RGaWxlUGFyc2VyKCk7XG5cbmV4cG9ydCBjb25zdCBnZXRDb2ZmZWVTY3JpcHRUZXN0TGlzdCAgICAgICAgID0gcGFyc2VyLmdldFRlc3RMaXN0LmJpbmQocGFyc2VyKTtcbmV4cG9ydCBjb25zdCBnZXRDb2ZmZWVTY3JpcHRUZXN0TGlzdEZyb21Db2RlID0gcGFyc2VyLmdldFRlc3RMaXN0RnJvbUNvZGUuYmluZChwYXJzZXIpO1xuIl19