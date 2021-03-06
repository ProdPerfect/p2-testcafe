"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coffeescript_1 = __importDefault(require("coffeescript"));
const load_babel_libs_1 = __importDefault(require("../../../load-babel-libs"));
const compiler_js_1 = __importDefault(require("../es-next/compiler.js"));
const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|'|")/;
const TEST_RE = /(^|;|\s+)test\s*/;
class CoffeeScriptTestFileCompiler extends compiler_js_1.default {
    _hasTests(code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    }
    _compileCode(code, filename) {
        if (this.cache[filename])
            return this.cache[filename];
        const transpiled = coffeescript_1.default.compile(code, {
            filename,
            bare: true,
            sourceMap: true,
            inlineMap: true,
            header: false
        });
        const { babel } = load_babel_libs_1.default();
        const babelOptions = compiler_js_1.default.getBabelOptions(filename, code);
        const compiled = babel.transform(transpiled.js, babelOptions);
        this.cache[filename] = compiled.code;
        return compiled.code;
    }
    _getRequireCompilers() {
        return { '.coffee': (code, filename) => this._compileCode(code, filename) };
    }
    getSupportedExtension() {
        return '.coffee';
    }
}
exports.default = CoffeeScriptTestFileCompiler;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcGlsZXIvdGVzdC1maWxlL2Zvcm1hdHMvY29mZmVlc2NyaXB0L2NvbXBpbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0VBQXdDO0FBQ3hDLCtFQUFxRDtBQUNyRCx5RUFBNEQ7QUFFNUQsTUFBTSxVQUFVLEdBQUcsZ0NBQWdDLENBQUM7QUFDcEQsTUFBTSxPQUFPLEdBQU0sa0JBQWtCLENBQUM7QUFFdEMsTUFBcUIsNEJBQTZCLFNBQVEscUJBQXNCO0lBQzVFLFNBQVMsQ0FBRSxJQUFJO1FBQ1gsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELFlBQVksQ0FBRSxJQUFJLEVBQUUsUUFBUTtRQUN4QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVoQyxNQUFNLFVBQVUsR0FBRyxzQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDMUMsUUFBUTtZQUNSLElBQUksRUFBTyxJQUFJO1lBQ2YsU0FBUyxFQUFFLElBQUk7WUFDZixTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBSyxLQUFLO1NBQ25CLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBTSx5QkFBYSxFQUFFLENBQUM7UUFDckMsTUFBTSxZQUFZLEdBQUcscUJBQXNCLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxNQUFNLFFBQVEsR0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBRXJDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQsb0JBQW9CO1FBQ2hCLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQ2hGLENBQUM7SUFFRCxxQkFBcUI7UUFDakIsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBakNELCtDQWlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb2ZmZWVTY3JpcHQgZnJvbSAnY29mZmVlc2NyaXB0JztcbmltcG9ydCBsb2FkQmFiZWxMaWJzIGZyb20gJy4uLy4uLy4uL2xvYWQtYmFiZWwtbGlicyc7XG5pbXBvcnQgRVNOZXh0VGVzdEZpbGVDb21waWxlciBmcm9tICcuLi9lcy1uZXh0L2NvbXBpbGVyLmpzJztcblxuY29uc3QgRklYVFVSRV9SRSA9IC8oXnw7fFxccyspZml4dHVyZVxccyooXFwufFxcKHwnfFwiKS87XG5jb25zdCBURVNUX1JFICAgID0gLyhefDt8XFxzKyl0ZXN0XFxzKi87XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZmZlZVNjcmlwdFRlc3RGaWxlQ29tcGlsZXIgZXh0ZW5kcyBFU05leHRUZXN0RmlsZUNvbXBpbGVyIHtcbiAgICBfaGFzVGVzdHMgKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIEZJWFRVUkVfUkUudGVzdChjb2RlKSAmJiBURVNUX1JFLnRlc3QoY29kZSk7XG4gICAgfVxuXG4gICAgX2NvbXBpbGVDb2RlIChjb2RlLCBmaWxlbmFtZSkge1xuICAgICAgICBpZiAodGhpcy5jYWNoZVtmaWxlbmFtZV0pXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVtmaWxlbmFtZV07XG5cbiAgICAgICAgY29uc3QgdHJhbnNwaWxlZCA9IENvZmZlZVNjcmlwdC5jb21waWxlKGNvZGUsIHtcbiAgICAgICAgICAgIGZpbGVuYW1lLFxuICAgICAgICAgICAgYmFyZTogICAgICB0cnVlLFxuICAgICAgICAgICAgc291cmNlTWFwOiB0cnVlLFxuICAgICAgICAgICAgaW5saW5lTWFwOiB0cnVlLFxuICAgICAgICAgICAgaGVhZGVyOiAgICBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB7IGJhYmVsIH0gICAgPSBsb2FkQmFiZWxMaWJzKCk7XG4gICAgICAgIGNvbnN0IGJhYmVsT3B0aW9ucyA9IEVTTmV4dFRlc3RGaWxlQ29tcGlsZXIuZ2V0QmFiZWxPcHRpb25zKGZpbGVuYW1lLCBjb2RlKTtcbiAgICAgICAgY29uc3QgY29tcGlsZWQgICAgID0gYmFiZWwudHJhbnNmb3JtKHRyYW5zcGlsZWQuanMsIGJhYmVsT3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5jYWNoZVtmaWxlbmFtZV0gPSBjb21waWxlZC5jb2RlO1xuXG4gICAgICAgIHJldHVybiBjb21waWxlZC5jb2RlO1xuICAgIH1cblxuICAgIF9nZXRSZXF1aXJlQ29tcGlsZXJzICgpIHtcbiAgICAgICAgcmV0dXJuIHsgJy5jb2ZmZWUnOiAoY29kZSwgZmlsZW5hbWUpID0+IHRoaXMuX2NvbXBpbGVDb2RlKGNvZGUsIGZpbGVuYW1lKSB9O1xuICAgIH1cblxuICAgIGdldFN1cHBvcnRlZEV4dGVuc2lvbiAoKSB7XG4gICAgICAgIHJldHVybiAnLmNvZmZlZSc7XG4gICAgfVxufVxuIl19