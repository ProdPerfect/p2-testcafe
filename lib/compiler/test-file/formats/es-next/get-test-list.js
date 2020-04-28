"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const babel_core_1 = require("babel-core");
const compiler_1 = __importDefault(require("./compiler"));
const test_file_parser_base_1 = require("../../test-file-parser-base");
const TOKEN_TYPE = {
    Identifier: 'Identifier',
    PropertyAccessExpression: 'MemberExpression',
    CallExpression: 'CallExpression',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateLiteral: 'TemplateLiteral',
    StringLiteral: 'StringLiteral',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    FunctionExpression: 'FunctionExpression',
    ExpressionStatement: 'ExpressionStatement',
    ReturnStatement: 'ReturnStatement',
    FunctionDeclaration: 'FunctionDeclaration',
    VariableStatement: 'VariableStatement',
    VariableDeclaration: 'VariableDeclaration',
    ObjectLiteralExpression: 'ObjectExpression'
};
class EsNextTestFileParser extends test_file_parser_base_1.TestFileParserBase {
    constructor() {
        super(TOKEN_TYPE);
    }
    static getTagStrValue(exp) {
        //NOTE: we set <computed name> if template literal has at least one computed substring ${...}
        return exp.expressions.length ? EsNextTestFileParser.formatComputedName(exp.loc.start.line) : exp.quasis[0].value.raw;
    }
    isAsyncFn(token) {
        return token.async || token.generator;
    }
    getTokenType(token) {
        return token.type;
    }
    getRValue(token) {
        return token.declarations[0].init;
    }
    getStringValue(token) {
        const stringTypes = [this.tokenType.StringLiteral, this.tokenType.TemplateLiteral, this.tokenType.Identifier];
        if (stringTypes.indexOf(token.type) > -1)
            return this.formatFnArg(token);
        return null;
    }
    getFunctionBody(token) {
        return token.body && token.body.body ? token.body.body : [];
    }
    getCalleeToken(token) {
        return token.callee;
    }
    getMemberFnName(token) {
        return token.callee.property.name;
    }
    formatFnData(name, value, token, meta = [{}]) {
        return {
            fnName: name,
            value: value,
            loc: token.loc,
            start: token.start,
            end: token.end,
            meta: lodash_1.merge({}, ...meta)
        };
    }
    getKeyValue(prop) {
        const { key, value } = prop;
        return {
            key: key.name || this.formatFnArg(key),
            value: this.getStringValue(value)
        };
    }
    analyzeMemberExp(token) {
        let exp = token;
        const tokenType = this.tokenType;
        const callStack = [exp];
        while (exp.type !== tokenType.Identifier) {
            if (exp.type === tokenType.CallExpression)
                exp = exp.callee;
            else if (exp.type === tokenType.PropertyAccessExpression)
                exp = exp.object;
            else if (exp.type === tokenType.TaggedTemplateExpression)
                exp = exp.tag;
            else
                return null;
            if (exp.type !== tokenType.Identifier)
                callStack.push(exp);
        }
        if (!this.isApiFn(exp.name))
            return null;
        const meta = this.getMetaInfo(callStack.slice());
        let parentExp = callStack.pop();
        if (parentExp.type === tokenType.CallExpression)
            return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token, meta);
        if (parentExp.type === tokenType.TaggedTemplateExpression)
            return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token, meta);
        if (parentExp.type === tokenType.PropertyAccessExpression) {
            while (parentExp) {
                if (parentExp.type === tokenType.CallExpression && parentExp.callee) {
                    const calleeType = parentExp.callee.type;
                    const calleeMemberFn = parentExp.callee.property && parentExp.callee.property.name;
                    if (this.checkExpDefineTargetName(calleeType, calleeMemberFn))
                        return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token, meta);
                }
                if (parentExp.type === tokenType.TaggedTemplateExpression && parentExp.tag) {
                    const tagType = parentExp.tag.type;
                    const tagMemberFn = parentExp.tag.property && parentExp.tag.property.name;
                    if (this.checkExpDefineTargetName(tagType, tagMemberFn))
                        return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token, meta);
                }
                parentExp = callStack.pop();
            }
        }
        return null;
    }
    formatFnArg(arg) {
        if (arg.type === this.tokenType.Identifier)
            return EsNextTestFileParser.formatComputedName(arg.loc.start.line);
        if (arg.type === this.tokenType.TemplateLiteral)
            return EsNextTestFileParser.getTagStrValue(arg);
        if (arg.type === this.tokenType.StringLiteral)
            return arg.value;
        return null;
    }
    getFnCall(token) {
        if (!this.isApiFn(token.callee.name))
            return null;
        return this.formatFnData(token.callee.name, this.formatFnArg(token.arguments[0]), token);
    }
    getTaggedTemplateExp(token) {
        return this.formatFnData(token.tag.name, EsNextTestFileParser.getTagStrValue(token.quasi), token);
    }
    analyzeFnCall(token) {
        const tokenType = this.tokenType;
        if (token.type === tokenType.PropertyAccessExpression)
            return this.analyzeMemberExp(token);
        if (token.type === tokenType.CallExpression) {
            const calleeType = token.callee.type;
            if (calleeType === tokenType.PropertyAccessExpression || calleeType === tokenType.CallExpression)
                return this.analyzeMemberExp(token);
            if (calleeType === tokenType.FunctionExpression || calleeType === tokenType.ArrowFunctionExpression)
                return this.collectTestCafeCalls(token.callee.body.body);
            return this.getFnCall(token);
        }
        if (token.type === tokenType.TaggedTemplateExpression) {
            if (token.tag.type === tokenType.PropertyAccessExpression)
                return this.analyzeMemberExp(token);
            return this.getTaggedTemplateExp(token);
        }
        return null;
    }
    parse(code) {
        const compilerOptions = compiler_1.default.getBabelOptions(null, code);
        delete compilerOptions.filename;
        const opts = lodash_1.assign(compilerOptions, { ast: true });
        const ast = babel_core_1.transform(code, opts).ast;
        return this.analyze(ast.program.body);
    }
}
exports.EsNextTestFileParser = EsNextTestFileParser;
const parser = new EsNextTestFileParser();
exports.getTestList = parser.getTestList.bind(parser);
exports.getTestListFromCode = parser.getTestListFromCode.bind(parser);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXRlc3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy9lcy1uZXh0L2dldC10ZXN0LWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsMkNBQXVDO0FBQ3ZDLDBEQUFnRDtBQUNoRCx1RUFBaUU7QUFFakUsTUFBTSxVQUFVLEdBQUc7SUFDZixVQUFVLEVBQWdCLFlBQVk7SUFDdEMsd0JBQXdCLEVBQUUsa0JBQWtCO0lBQzVDLGNBQWMsRUFBWSxnQkFBZ0I7SUFDMUMsd0JBQXdCLEVBQUUsMEJBQTBCO0lBQ3BELGVBQWUsRUFBVyxpQkFBaUI7SUFDM0MsYUFBYSxFQUFhLGVBQWU7SUFDekMsdUJBQXVCLEVBQUcseUJBQXlCO0lBQ25ELGtCQUFrQixFQUFRLG9CQUFvQjtJQUM5QyxtQkFBbUIsRUFBTyxxQkFBcUI7SUFDL0MsZUFBZSxFQUFXLGlCQUFpQjtJQUMzQyxtQkFBbUIsRUFBTyxxQkFBcUI7SUFDL0MsaUJBQWlCLEVBQVMsbUJBQW1CO0lBQzdDLG1CQUFtQixFQUFPLHFCQUFxQjtJQUMvQyx1QkFBdUIsRUFBRyxrQkFBa0I7Q0FDL0MsQ0FBQztBQUVGLE1BQWEsb0JBQXFCLFNBQVEsMENBQWtCO0lBQ3hEO1FBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxNQUFNLENBQUMsY0FBYyxDQUFFLEdBQUc7UUFDdEIsNkZBQTZGO1FBQzdGLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDMUgsQ0FB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QUFXLEdBQVcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEQsUUFBQSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXNzaWduLCBtZXJnZSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyB0cmFuc2Zvcm0gfSBmcm9tICdiYWJlbC1jb3JlJztcbmltcG9ydCBFU05leHRUZXN0RmlsZUNvbXBpbGVyIGZyb20gJy4vY29tcGlsZXInO1xuaW1wb3J0IHsgVGVzdEZpbGVQYXJzZXJCYXNlIH0gZnJvbSAnLi4vLi4vdGVzdC1maWxlLXBhcnNlci1iYXNlJztcblxuY29uc3QgVE9LRU5fVFlQRSA9IHtcbiAgICBJZGVudGlmaWVyOiAgICAgICAgICAgICAgICdJZGVudGlmaWVyJyxcbiAgICBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb246ICdNZW1iZXJFeHByZXNzaW9uJyxcbiAgICBDYWxsRXhwcmVzc2lvbjogICAgICAgICAgICdDYWxsRXhwcmVzc2lvbicsXG4gICAgVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uOiAnVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uJyxcbiAgICBUZW1wbGF0ZUxpdGVyYWw6ICAgICAgICAgICdUZW1wbGF0ZUxpdGVyYWwnLFxuICAgIFN0cmluZ0xpdGVyYWw6ICAgICAgICAgICAgJ1N0cmluZ0xpdGVyYWwnLFxuICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uOiAgJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJyxcbiAgICBGdW5jdGlvbkV4cHJlc3Npb246ICAgICAgICdGdW5jdGlvbkV4cHJlc3Npb24nLFxuICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQ6ICAgICAgJ0V4cHJlc3Npb25TdGF0ZW1lbnQnLFxuICAgIFJldHVyblN0YXRlbWVudDogICAgICAgICAgJ1JldHVyblN0YXRlbWVudCcsXG4gICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogICAgICAnRnVuY3Rpb25EZWNsYXJhdGlvbicsXG4gICAgVmFyaWFibGVTdGF0ZW1lbnQ6ICAgICAgICAnVmFyaWFibGVTdGF0ZW1lbnQnLFxuICAgIFZhcmlhYmxlRGVjbGFyYXRpb246ICAgICAgJ1ZhcmlhYmxlRGVjbGFyYXRpb24nLFxuICAgIE9iamVjdExpdGVyYWxFeHByZXNzaW9uOiAgJ09iamVjdEV4cHJlc3Npb24nXG59O1xuXG5leHBvcnQgY2xhc3MgRXNOZXh0VGVzdEZpbGVQYXJzZXIgZXh0ZW5kcyBUZXN0RmlsZVBhcnNlckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoVE9LRU5fVFlQRSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFRhZ1N0clZhbHVlIChleHApIHtcbiAgICAgICAgLy9OT1RFOiB3ZSBzZXQgPGNvbXB1dGVkIG5hbWU+IGlmIHRlbXBsYXRlIGxpdGVyYWwgaGFzIGF0IGxlYXN0IG9uZSBjb21wdXRlZCBzdWJzdHJpbmcgJHsuLi59XG4gICAgICAgIHJldHVybiBleHAuZXhwcmVzc2lvbnMubGVuZ3RoID8gRXNOZXh0VGVzdEZpbGVQYXJzZXIuZm9ybWF0Q29tcHV0ZWROYW1lKGV4cC5sb2Muc3RhcnQubGluZSkgOiBleHAucXVhc2lzWzBdLnZhbHVlLnJhdztcbiAgICB9XG5cbiAgICBpc0FzeW5jRm4gKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi5hc3luYyB8fCB0b2tlbi5nZW5lcmF0b3I7XG4gICAgfVxuXG4gICAgZ2V0VG9rZW5UeXBlICh0b2tlbikge1xuICAgICAgICByZXR1cm4gdG9rZW4udHlwZTtcbiAgICB9XG5cbiAgICBnZXRSVmFsdWUgKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi5kZWNsYXJhdGlvbnNbMF0uaW5pdDtcbiAgICB9XG5cbiAgICBnZXRTdHJpbmdWYWx1ZSAodG9rZW4pIHtcbiAgICAgICAgY29uc3Qgc3RyaW5nVHlwZXMgPSBbdGhpcy50b2tlblR5cGUuU3RyaW5nTGl0ZXJhbCwgdGhpcy50b2tlblR5cGUuVGVtcGxhdGVMaXRlcmFsLCB0aGlzLnRva2VuVHlwZS5JZGVudGlmaWVyXTtcblxuICAgICAgICBpZiAoc3RyaW5nVHlwZXMuaW5kZXhPZih0b2tlbi50eXBlKSA+IC0xKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5BcmcodG9rZW4pO1xuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldEZ1bmN0aW9uQm9keSAodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRva2VuLmJvZHkgJiYgdG9rZW4uYm9keS5ib2R5ID8gdG9rZW4uYm9keS5ib2R5IDogW107XG4gICAgfVxuXG4gICAgZ2V0Q2FsbGVlVG9rZW4gKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi5jYWxsZWU7XG4gICAgfVxuXG4gICAgZ2V0TWVtYmVyRm5OYW1lICh0b2tlbikge1xuICAgICAgICByZXR1cm4gdG9rZW4uY2FsbGVlLnByb3BlcnR5Lm5hbWU7XG4gICAgfVxuXG4gICAgZm9ybWF0Rm5EYXRhIChuYW1lLCB2YWx1ZSwgdG9rZW4sIG1ldGEgPSBbe31dKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmbk5hbWU6IG5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogIHZhbHVlLFxuICAgICAgICAgICAgbG9jOiAgICB0b2tlbi5sb2MsXG4gICAgICAgICAgICBzdGFydDogIHRva2VuLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiAgICB0b2tlbi5lbmQsXG4gICAgICAgICAgICBtZXRhOiAgIG1lcmdlKHt9LCAuLi5tZXRhKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldEtleVZhbHVlIChwcm9wKSB7XG4gICAgICAgIGNvbnN0IHsga2V5LCB2YWx1ZSB9ID0gcHJvcDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiAgIGtleS5uYW1lIHx8IHRoaXMuZm9ybWF0Rm5Bcmcoa2V5KSxcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLmdldFN0cmluZ1ZhbHVlKHZhbHVlKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFuYWx5emVNZW1iZXJFeHAgKHRva2VuKSB7XG4gICAgICAgIGxldCBleHAgICAgICAgICA9IHRva2VuO1xuICAgICAgICBjb25zdCB0b2tlblR5cGUgPSB0aGlzLnRva2VuVHlwZTtcbiAgICAgICAgY29uc3QgY2FsbFN0YWNrID0gW2V4cF07XG5cbiAgICAgICAgd2hpbGUgKGV4cC50eXBlICE9PSB0b2tlblR5cGUuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgaWYgKGV4cC50eXBlID09PSB0b2tlblR5cGUuQ2FsbEV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgZXhwID0gZXhwLmNhbGxlZTtcblxuICAgICAgICAgICAgZWxzZSBpZiAoZXhwLnR5cGUgPT09IHRva2VuVHlwZS5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgZXhwID0gZXhwLm9iamVjdDtcblxuICAgICAgICAgICAgZWxzZSBpZiAoZXhwLnR5cGUgPT09IHRva2VuVHlwZS5UYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgZXhwID0gZXhwLnRhZztcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICBpZiAoZXhwLnR5cGUgIT09IHRva2VuVHlwZS5JZGVudGlmaWVyKVxuICAgICAgICAgICAgICAgIGNhbGxTdGFjay5wdXNoKGV4cCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNBcGlGbihleHAubmFtZSkpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGEgPSB0aGlzLmdldE1ldGFJbmZvKGNhbGxTdGFjay5zbGljZSgpKTtcblxuICAgICAgICBsZXQgcGFyZW50RXhwID0gY2FsbFN0YWNrLnBvcCgpO1xuXG4gICAgICAgIGlmIChwYXJlbnRFeHAudHlwZSA9PT0gdG9rZW5UeXBlLkNhbGxFeHByZXNzaW9uKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5EYXRhKGV4cC5uYW1lLCB0aGlzLmZvcm1hdEZuQXJnKHBhcmVudEV4cC5hcmd1bWVudHNbMF0pLCB0b2tlbiwgbWV0YSk7XG5cbiAgICAgICAgaWYgKHBhcmVudEV4cC50eXBlID09PSB0b2tlblR5cGUuVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5EYXRhKGV4cC5uYW1lLCBFc05leHRUZXN0RmlsZVBhcnNlci5nZXRUYWdTdHJWYWx1ZShwYXJlbnRFeHAucXVhc2kpLCB0b2tlbiwgbWV0YSk7XG5cbiAgICAgICAgaWYgKHBhcmVudEV4cC50eXBlID09PSB0b2tlblR5cGUuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICB3aGlsZSAocGFyZW50RXhwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEV4cC50eXBlID09PSB0b2tlblR5cGUuQ2FsbEV4cHJlc3Npb24gJiYgcGFyZW50RXhwLmNhbGxlZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWxsZWVUeXBlICAgICA9IHBhcmVudEV4cC5jYWxsZWUudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbGVlTWVtYmVyRm4gPSBwYXJlbnRFeHAuY2FsbGVlLnByb3BlcnR5ICYmIHBhcmVudEV4cC5jYWxsZWUucHJvcGVydHkubmFtZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0V4cERlZmluZVRhcmdldE5hbWUoY2FsbGVlVHlwZSwgY2FsbGVlTWVtYmVyRm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5EYXRhKGV4cC5uYW1lLCB0aGlzLmZvcm1hdEZuQXJnKHBhcmVudEV4cC5hcmd1bWVudHNbMF0pLCB0b2tlbiwgbWV0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEV4cC50eXBlID09PSB0b2tlblR5cGUuVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uICYmIHBhcmVudEV4cC50YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFnVHlwZSAgICAgPSBwYXJlbnRFeHAudGFnLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhZ01lbWJlckZuID0gcGFyZW50RXhwLnRhZy5wcm9wZXJ0eSAmJiBwYXJlbnRFeHAudGFnLnByb3BlcnR5Lm5hbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tFeHBEZWZpbmVUYXJnZXROYW1lKHRhZ1R5cGUsIHRhZ01lbWJlckZuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcm1hdEZuRGF0YShleHAubmFtZSwgRXNOZXh0VGVzdEZpbGVQYXJzZXIuZ2V0VGFnU3RyVmFsdWUocGFyZW50RXhwLnF1YXNpKSwgdG9rZW4sIG1ldGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudEV4cCA9IGNhbGxTdGFjay5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvcm1hdEZuQXJnIChhcmcpIHtcbiAgICAgICAgaWYgKGFyZy50eXBlID09PSB0aGlzLnRva2VuVHlwZS5JZGVudGlmaWVyKVxuICAgICAgICAgICAgcmV0dXJuIEVzTmV4dFRlc3RGaWxlUGFyc2VyLmZvcm1hdENvbXB1dGVkTmFtZShhcmcubG9jLnN0YXJ0LmxpbmUpO1xuXG4gICAgICAgIGlmIChhcmcudHlwZSA9PT0gdGhpcy50b2tlblR5cGUuVGVtcGxhdGVMaXRlcmFsKVxuICAgICAgICAgICAgcmV0dXJuIEVzTmV4dFRlc3RGaWxlUGFyc2VyLmdldFRhZ1N0clZhbHVlKGFyZyk7XG5cbiAgICAgICAgaWYgKGFyZy50eXBlID09PSB0aGlzLnRva2VuVHlwZS5TdHJpbmdMaXRlcmFsKVxuICAgICAgICAgICAgcmV0dXJuIGFyZy52YWx1ZTtcblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRGbkNhbGwgKHRva2VuKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FwaUZuKHRva2VuLmNhbGxlZS5uYW1lKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5EYXRhKHRva2VuLmNhbGxlZS5uYW1lLCB0aGlzLmZvcm1hdEZuQXJnKHRva2VuLmFyZ3VtZW50c1swXSksIHRva2VuKTtcbiAgICB9XG5cbiAgICBnZXRUYWdnZWRUZW1wbGF0ZUV4cCAodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0Rm5EYXRhKHRva2VuLnRhZy5uYW1lLCBFc05leHRUZXN0RmlsZVBhcnNlci5nZXRUYWdTdHJWYWx1ZSh0b2tlbi5xdWFzaSksIHRva2VuKTtcbiAgICB9XG5cbiAgICBhbmFseXplRm5DYWxsICh0b2tlbikge1xuICAgICAgICBjb25zdCB0b2tlblR5cGUgPSB0aGlzLnRva2VuVHlwZTtcblxuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gdG9rZW5UeXBlLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFuYWx5emVNZW1iZXJFeHAodG9rZW4pO1xuXG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSB0b2tlblR5cGUuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlZVR5cGUgPSB0b2tlbi5jYWxsZWUudHlwZTtcblxuICAgICAgICAgICAgaWYgKGNhbGxlZVR5cGUgPT09IHRva2VuVHlwZS5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gfHwgY2FsbGVlVHlwZSA9PT0gdG9rZW5UeXBlLkNhbGxFeHByZXNzaW9uKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFuYWx5emVNZW1iZXJFeHAodG9rZW4pO1xuXG4gICAgICAgICAgICBpZiAoY2FsbGVlVHlwZSA9PT0gdG9rZW5UeXBlLkZ1bmN0aW9uRXhwcmVzc2lvbiB8fCBjYWxsZWVUeXBlID09PSB0b2tlblR5cGUuQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24pXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdFRlc3RDYWZlQ2FsbHModG9rZW4uY2FsbGVlLmJvZHkuYm9keSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZuQ2FsbCh0b2tlbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gdG9rZW5UeXBlLlRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgaWYgKHRva2VuLnRhZy50eXBlID09PSB0b2tlblR5cGUuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFuYWx5emVNZW1iZXJFeHAodG9rZW4pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRUYWdnZWRUZW1wbGF0ZUV4cCh0b2tlbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwYXJzZSAoY29kZSkge1xuICAgICAgICBjb25zdCBjb21waWxlck9wdGlvbnMgPSBFU05leHRUZXN0RmlsZUNvbXBpbGVyLmdldEJhYmVsT3B0aW9ucyhudWxsLCBjb2RlKTtcblxuICAgICAgICBkZWxldGUgY29tcGlsZXJPcHRpb25zLmZpbGVuYW1lO1xuXG4gICAgICAgIGNvbnN0IG9wdHMgPSBhc3NpZ24oY29tcGlsZXJPcHRpb25zLCB7IGFzdDogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgYXN0ICA9IHRyYW5zZm9ybShjb2RlLCBvcHRzKS5hc3Q7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYW5hbHl6ZShhc3QucHJvZ3JhbS5ib2R5KTtcbiAgICB9XG59XG5cbmNvbnN0IHBhcnNlciA9IG5ldyBFc05leHRUZXN0RmlsZVBhcnNlcigpO1xuXG5leHBvcnQgY29uc3QgZ2V0VGVzdExpc3QgICAgICAgICA9IHBhcnNlci5nZXRUZXN0TGlzdC5iaW5kKHBhcnNlcik7XG5leHBvcnQgY29uc3QgZ2V0VGVzdExpc3RGcm9tQ29kZSA9IHBhcnNlci5nZXRUZXN0TGlzdEZyb21Db2RlLmJpbmQocGFyc2VyKTtcbiJdfQ==