"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dedent_1 = __importDefault(require("dedent"));
const lodash_1 = require("lodash");
const phase_1 = __importDefault(require("../../test-run/phase"));
const types_1 = require("../types");
const SUBTITLES = {
    [phase_1.default.initial]: '',
    [phase_1.default.inFixtureBeforeHook]: '<span class="subtitle">Error in fixture.before hook</span>\n',
    [phase_1.default.inFixtureBeforeEachHook]: '<span class="subtitle">Error in fixture.beforeEach hook</span>\n',
    [phase_1.default.inTestBeforeHook]: '<span class="subtitle">Error in test.before hook</span>\n',
    [phase_1.default.inTest]: '',
    [phase_1.default.inTestAfterHook]: '<span class="subtitle">Error in test.after hook</span>\n',
    [phase_1.default.inFixtureAfterEachHook]: '<span class="subtitle">Error in fixture.afterEach hook</span>\n',
    [phase_1.default.inFixtureAfterHook]: '<span class="subtitle">Error in fixture.after hook</span>\n',
    [phase_1.default.inRoleInitializer]: '<span class="subtitle">Error in Role initializer</span>\n',
    [phase_1.default.inBookmarkRestore]: '<span class="subtitle">Error while restoring configuration after Role switch</span>\n'
};
function renderForbiddenCharsList(forbiddenCharsList) {
    return forbiddenCharsList.map(charInfo => `\t"${charInfo.chars}" at index ${charInfo.index}\n`).join('');
}
exports.renderForbiddenCharsList = renderForbiddenCharsList;
function formatUrl(url) {
    return `<a href="${url}">${url}</a>`;
}
exports.formatUrl = formatUrl;
function formatSelectorCallstack(apiFnChain, apiFnIndex, viewportWidth) {
    if (typeof apiFnIndex === 'undefined')
        return '';
    const emptySpaces = 10;
    const ellipsis = '...)';
    const availableWidth = viewportWidth - emptySpaces;
    return apiFnChain.map((apiFn, index) => {
        let formattedApiFn = String.fromCharCode(160);
        formattedApiFn += index === apiFnIndex ? '>' : ' ';
        formattedApiFn += ' | ';
        formattedApiFn += index !== 0 ? '  ' : '';
        formattedApiFn += apiFn;
        if (formattedApiFn.length > availableWidth)
            return formattedApiFn.substr(0, availableWidth - emptySpaces) + ellipsis;
        return formattedApiFn;
    }).join('\n');
}
exports.formatSelectorCallstack = formatSelectorCallstack;
function formatExpressionMessage(expression, line, column) {
    const expressionStr = lodash_1.escape(expression);
    if (line === void 0 || column === void 0)
        return expressionStr;
    return `${expressionStr}\nat ${line}:${column}`;
}
exports.formatExpressionMessage = formatExpressionMessage;
function replaceLeadingSpacesWithNbsp(str) {
    return str.replace(/^ +/mg, match => {
        return lodash_1.repeat('&nbsp;', match.length);
    });
}
exports.replaceLeadingSpacesWithNbsp = replaceLeadingSpacesWithNbsp;
function shouldSkipCallsite(err) {
    return err.code === types_1.TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode ||
        err.code === types_1.TEST_RUN_ERRORS.unhandledPromiseRejection ||
        err.code === types_1.TEST_RUN_ERRORS.uncaughtException;
}
exports.shouldSkipCallsite = shouldSkipCallsite;
function markup(err, msgMarkup, errCallsite = '') {
    msgMarkup = dedent_1.default(`${SUBTITLES[err.testRunPhase]}<div class="message">${dedent_1.default(msgMarkup)}</div>`);
    const browserStr = `\n\n<strong>Browser:</strong> <span class="user-agent">${err.userAgent}</span>`;
    if (errCallsite)
        msgMarkup += `${browserStr}\n\n${errCallsite}\n`;
    else
        msgMarkup += browserStr;
    if (err.screenshotPath)
        msgMarkup += `\n<div class="screenshot-info"><strong>Screenshot:</strong> <a class="screenshot-path">${lodash_1.escape(err.screenshotPath)}</a></div>`;
    if (!shouldSkipCallsite(err)) {
        const callsiteMarkup = err.getCallsiteMarkup();
        if (callsiteMarkup)
            msgMarkup += `\n\n${callsiteMarkup}`;
    }
    return msgMarkup.replace('\t', '&nbsp;'.repeat(4));
}
exports.markup = markup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXJyb3JzL3Rlc3QtcnVuL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLG1DQUFzRDtBQUN0RCxpRUFBa0Q7QUFDbEQsb0NBQTJDO0FBRTNDLE1BQU0sU0FBUyxHQUFHO0lBQ2QsQ0FBQyxlQUFjLENBQUMsT0FBTyxDQUFDLEVBQWtCLEVBQUU7SUFDNUMsQ0FBQyxlQUFjLENBQUMsbUJBQW1CLENBQUMsRUFBTSw4REFBOEQ7SUFDeEcsQ0FBQyxlQUFjLENBQUMsdUJBQXVCLENBQUMsRUFBRSxrRUFBa0U7SUFDNUcsQ0FBQyxlQUFjLENBQUMsZ0JBQWdCLENBQUMsRUFBUywyREFBMkQ7SUFDckcsQ0FBQyxlQUFjLENBQUMsTUFBTSxDQUFDLEVBQW1CLEVBQUU7SUFDNUMsQ0FBQyxlQUFjLENBQUMsZUFBZSxDQUFDLEVBQVUsMERBQTBEO0lBQ3BHLENBQUMsZUFBYyxDQUFDLHNCQUFzQixDQUFDLEVBQUcsaUVBQWlFO0lBQzNHLENBQUMsZUFBYyxDQUFDLGtCQUFrQixDQUFDLEVBQU8sNkRBQTZEO0lBQ3ZHLENBQUMsZUFBYyxDQUFDLGlCQUFpQixDQUFDLEVBQVEsMkRBQTJEO0lBQ3JHLENBQUMsZUFBYyxDQUFDLGlCQUFpQixDQUFDLEVBQVEsdUZBQXVGO0NBQ3BJLENBQUM7QUFFRixTQUFnQix3QkFBd0IsQ0FBRSxrQkFBa0I7SUFDeEQsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxLQUFLLGNBQWMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdHLENBQUM7QUFGRCw0REFFQztBQUVELFNBQWdCLFNBQVMsQ0FBRSxHQUFHO0lBQzFCLE9BQU8sWUFBWSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDekMsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxhQUFhO0lBQzFFLElBQUksT0FBTyxVQUFVLEtBQUssV0FBVztRQUNqQyxPQUFPLEVBQUUsQ0FBQztJQUVkLE1BQU0sV0FBVyxHQUFNLEVBQUUsQ0FBQztJQUMxQixNQUFNLFFBQVEsR0FBUyxNQUFNLENBQUM7SUFDOUIsTUFBTSxjQUFjLEdBQUcsYUFBYSxHQUFHLFdBQVcsQ0FBQztJQUVuRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU5QyxjQUFjLElBQUksS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDbkQsY0FBYyxJQUFJLEtBQUssQ0FBQztRQUN4QixjQUFjLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUMsY0FBYyxJQUFJLEtBQUssQ0FBQztRQUV4QixJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsY0FBYztZQUN0QyxPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGNBQWMsR0FBRyxXQUFXLENBQUMsR0FBRyxRQUFRLENBQUM7UUFFN0UsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFyQkQsMERBcUJDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNO0lBQzdELE1BQU0sYUFBYSxHQUFHLGVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUU3QyxJQUFJLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDO1FBQ3BDLE9BQU8sYUFBYSxDQUFDO0lBRXpCLE9BQU8sR0FBRyxhQUFhLFFBQVEsSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQ3BELENBQUM7QUFQRCwwREFPQztBQUVELFNBQWdCLDRCQUE0QixDQUFFLEdBQUc7SUFDN0MsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNoQyxPQUFPLGVBQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUpELG9FQUlDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUUsR0FBRztJQUNuQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssdUJBQWUsQ0FBQyxnQ0FBZ0M7UUFDN0QsR0FBRyxDQUFDLElBQUksS0FBSyx1QkFBZSxDQUFDLHlCQUF5QjtRQUN0RCxHQUFHLENBQUMsSUFBSSxLQUFLLHVCQUFlLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsQ0FBQztBQUpELGdEQUlDO0FBRUQsU0FBZ0IsTUFBTSxDQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsV0FBVyxHQUFHLEVBQUU7SUFDcEQsU0FBUyxHQUFHLGdCQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsZ0JBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFcEcsTUFBTSxVQUFVLEdBQUcsMERBQTBELEdBQUcsQ0FBQyxTQUFTLFNBQVMsQ0FBQztJQUVwRyxJQUFJLFdBQVc7UUFDWCxTQUFTLElBQUksR0FBRyxVQUFVLE9BQU8sV0FBVyxJQUFJLENBQUM7O1FBRWpELFNBQVMsSUFBSSxVQUFVLENBQUM7SUFFNUIsSUFBSSxHQUFHLENBQUMsY0FBYztRQUNsQixTQUFTLElBQUksMEZBQTBGLGVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztJQUV0SixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDMUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFL0MsSUFBSSxjQUFjO1lBQ2QsU0FBUyxJQUFJLE9BQU8sY0FBYyxFQUFFLENBQUM7S0FDNUM7SUFFRCxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBckJELHdCQXFCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWRlbnQgZnJvbSAnZGVkZW50JztcbmltcG9ydCB7IGVzY2FwZSBhcyBlc2NhcGVIdG1sLCByZXBlYXQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFRFU1RfUlVOX1BIQVNFIGZyb20gJy4uLy4uL3Rlc3QtcnVuL3BoYXNlJztcbmltcG9ydCB7IFRFU1RfUlVOX0VSUk9SUyB9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3QgU1VCVElUTEVTID0ge1xuICAgIFtURVNUX1JVTl9QSEFTRS5pbml0aWFsXTogICAgICAgICAgICAgICAgICcnLFxuICAgIFtURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVCZWZvcmVIb29rXTogICAgICc8c3BhbiBjbGFzcz1cInN1YnRpdGxlXCI+RXJyb3IgaW4gZml4dHVyZS5iZWZvcmUgaG9vazwvc3Bhbj5cXG4nLFxuICAgIFtURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVCZWZvcmVFYWNoSG9va106ICc8c3BhbiBjbGFzcz1cInN1YnRpdGxlXCI+RXJyb3IgaW4gZml4dHVyZS5iZWZvcmVFYWNoIGhvb2s8L3NwYW4+XFxuJyxcbiAgICBbVEVTVF9SVU5fUEhBU0UuaW5UZXN0QmVmb3JlSG9va106ICAgICAgICAnPHNwYW4gY2xhc3M9XCJzdWJ0aXRsZVwiPkVycm9yIGluIHRlc3QuYmVmb3JlIGhvb2s8L3NwYW4+XFxuJyxcbiAgICBbVEVTVF9SVU5fUEhBU0UuaW5UZXN0XTogICAgICAgICAgICAgICAgICAnJyxcbiAgICBbVEVTVF9SVU5fUEhBU0UuaW5UZXN0QWZ0ZXJIb29rXTogICAgICAgICAnPHNwYW4gY2xhc3M9XCJzdWJ0aXRsZVwiPkVycm9yIGluIHRlc3QuYWZ0ZXIgaG9vazwvc3Bhbj5cXG4nLFxuICAgIFtURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVBZnRlckVhY2hIb29rXTogICc8c3BhbiBjbGFzcz1cInN1YnRpdGxlXCI+RXJyb3IgaW4gZml4dHVyZS5hZnRlckVhY2ggaG9vazwvc3Bhbj5cXG4nLFxuICAgIFtURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVBZnRlckhvb2tdOiAgICAgICc8c3BhbiBjbGFzcz1cInN1YnRpdGxlXCI+RXJyb3IgaW4gZml4dHVyZS5hZnRlciBob29rPC9zcGFuPlxcbicsXG4gICAgW1RFU1RfUlVOX1BIQVNFLmluUm9sZUluaXRpYWxpemVyXTogICAgICAgJzxzcGFuIGNsYXNzPVwic3VidGl0bGVcIj5FcnJvciBpbiBSb2xlIGluaXRpYWxpemVyPC9zcGFuPlxcbicsXG4gICAgW1RFU1RfUlVOX1BIQVNFLmluQm9va21hcmtSZXN0b3JlXTogICAgICAgJzxzcGFuIGNsYXNzPVwic3VidGl0bGVcIj5FcnJvciB3aGlsZSByZXN0b3JpbmcgY29uZmlndXJhdGlvbiBhZnRlciBSb2xlIHN3aXRjaDwvc3Bhbj5cXG4nXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRm9yYmlkZGVuQ2hhcnNMaXN0IChmb3JiaWRkZW5DaGFyc0xpc3QpIHtcbiAgICByZXR1cm4gZm9yYmlkZGVuQ2hhcnNMaXN0Lm1hcChjaGFySW5mbyA9PiBgXFx0XCIke2NoYXJJbmZvLmNoYXJzfVwiIGF0IGluZGV4ICR7Y2hhckluZm8uaW5kZXh9XFxuYCkuam9pbignJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRVcmwgKHVybCkge1xuICAgIHJldHVybiBgPGEgaHJlZj1cIiR7dXJsfVwiPiR7dXJsfTwvYT5gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0U2VsZWN0b3JDYWxsc3RhY2sgKGFwaUZuQ2hhaW4sIGFwaUZuSW5kZXgsIHZpZXdwb3J0V2lkdGgpIHtcbiAgICBpZiAodHlwZW9mIGFwaUZuSW5kZXggPT09ICd1bmRlZmluZWQnKVxuICAgICAgICByZXR1cm4gJyc7XG5cbiAgICBjb25zdCBlbXB0eVNwYWNlcyAgICA9IDEwO1xuICAgIGNvbnN0IGVsbGlwc2lzICAgICAgID0gJy4uLiknO1xuICAgIGNvbnN0IGF2YWlsYWJsZVdpZHRoID0gdmlld3BvcnRXaWR0aCAtIGVtcHR5U3BhY2VzO1xuXG4gICAgcmV0dXJuIGFwaUZuQ2hhaW4ubWFwKChhcGlGbiwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGZvcm1hdHRlZEFwaUZuID0gU3RyaW5nLmZyb21DaGFyQ29kZSgxNjApO1xuXG4gICAgICAgIGZvcm1hdHRlZEFwaUZuICs9IGluZGV4ID09PSBhcGlGbkluZGV4ID8gJz4nIDogJyAnO1xuICAgICAgICBmb3JtYXR0ZWRBcGlGbiArPSAnIHwgJztcbiAgICAgICAgZm9ybWF0dGVkQXBpRm4gKz0gaW5kZXggIT09IDAgPyAnICAnIDogJyc7XG4gICAgICAgIGZvcm1hdHRlZEFwaUZuICs9IGFwaUZuO1xuXG4gICAgICAgIGlmIChmb3JtYXR0ZWRBcGlGbi5sZW5ndGggPiBhdmFpbGFibGVXaWR0aClcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXR0ZWRBcGlGbi5zdWJzdHIoMCwgYXZhaWxhYmxlV2lkdGggLSBlbXB0eVNwYWNlcykgKyBlbGxpcHNpcztcblxuICAgICAgICByZXR1cm4gZm9ybWF0dGVkQXBpRm47XG4gICAgfSkuam9pbignXFxuJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFeHByZXNzaW9uTWVzc2FnZSAoZXhwcmVzc2lvbiwgbGluZSwgY29sdW1uKSB7XG4gICAgY29uc3QgZXhwcmVzc2lvblN0ciA9IGVzY2FwZUh0bWwoZXhwcmVzc2lvbik7XG5cbiAgICBpZiAobGluZSA9PT0gdm9pZCAwIHx8IGNvbHVtbiA9PT0gdm9pZCAwKVxuICAgICAgICByZXR1cm4gZXhwcmVzc2lvblN0cjtcblxuICAgIHJldHVybiBgJHtleHByZXNzaW9uU3RyfVxcbmF0ICR7bGluZX06JHtjb2x1bW59YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VMZWFkaW5nU3BhY2VzV2l0aE5ic3AgKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXiArL21nLCBtYXRjaCA9PiB7XG4gICAgICAgIHJldHVybiByZXBlYXQoJyZuYnNwOycsIG1hdGNoLmxlbmd0aCk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRTa2lwQ2FsbHNpdGUgKGVycikge1xuICAgIHJldHVybiBlcnIuY29kZSA9PT0gVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0Tm9uRXJyb3JPYmplY3RJblRlc3RDb2RlIHx8XG4gICAgICAgICAgIGVyci5jb2RlID09PSBURVNUX1JVTl9FUlJPUlMudW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbiB8fFxuICAgICAgICAgICBlcnIuY29kZSA9PT0gVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXhjZXB0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya3VwIChlcnIsIG1zZ01hcmt1cCwgZXJyQ2FsbHNpdGUgPSAnJykge1xuICAgIG1zZ01hcmt1cCA9IGRlZGVudChgJHtTVUJUSVRMRVNbZXJyLnRlc3RSdW5QaGFzZV19PGRpdiBjbGFzcz1cIm1lc3NhZ2VcIj4ke2RlZGVudChtc2dNYXJrdXApfTwvZGl2PmApO1xuXG4gICAgY29uc3QgYnJvd3NlclN0ciA9IGBcXG5cXG48c3Ryb25nPkJyb3dzZXI6PC9zdHJvbmc+IDxzcGFuIGNsYXNzPVwidXNlci1hZ2VudFwiPiR7ZXJyLnVzZXJBZ2VudH08L3NwYW4+YDtcblxuICAgIGlmIChlcnJDYWxsc2l0ZSlcbiAgICAgICAgbXNnTWFya3VwICs9IGAke2Jyb3dzZXJTdHJ9XFxuXFxuJHtlcnJDYWxsc2l0ZX1cXG5gO1xuICAgIGVsc2VcbiAgICAgICAgbXNnTWFya3VwICs9IGJyb3dzZXJTdHI7XG5cbiAgICBpZiAoZXJyLnNjcmVlbnNob3RQYXRoKVxuICAgICAgICBtc2dNYXJrdXAgKz0gYFxcbjxkaXYgY2xhc3M9XCJzY3JlZW5zaG90LWluZm9cIj48c3Ryb25nPlNjcmVlbnNob3Q6PC9zdHJvbmc+IDxhIGNsYXNzPVwic2NyZWVuc2hvdC1wYXRoXCI+JHtlc2NhcGVIdG1sKGVyci5zY3JlZW5zaG90UGF0aCl9PC9hPjwvZGl2PmA7XG5cbiAgICBpZiAoIXNob3VsZFNraXBDYWxsc2l0ZShlcnIpKSB7XG4gICAgICAgIGNvbnN0IGNhbGxzaXRlTWFya3VwID0gZXJyLmdldENhbGxzaXRlTWFya3VwKCk7XG5cbiAgICAgICAgaWYgKGNhbGxzaXRlTWFya3VwKVxuICAgICAgICAgICAgbXNnTWFya3VwICs9IGBcXG5cXG4ke2NhbGxzaXRlTWFya3VwfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZ01hcmt1cC5yZXBsYWNlKCdcXHQnLCAnJm5ic3A7Jy5yZXBlYXQoNCkpO1xufVxuXG4iXX0=