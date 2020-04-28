"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const lodash_1 = require("lodash");
const BABEL = require.resolve('babel-core');
const BABEL_MODULES_DIR = BABEL.replace(new RegExp(`^(.*${lodash_1.escapeRegExp(path_1.sep)}node_modules${lodash_1.escapeRegExp(path_1.sep)})(.*)`), '$1');
const BABEL_RELATED = BABEL_MODULES_DIR + 'babel-';
const BABYLON = BABEL_MODULES_DIR + 'babylon' + path_1.sep;
const CORE_JS = BABEL_MODULES_DIR + 'core-js' + path_1.sep;
const REGENERATOR_RUNTIME = BABEL_MODULES_DIR + 'regenerator-runtime' + path_1.sep;
const TESTCAFE_LIB = path_1.join(__dirname, '../');
const TESTCAFE_BIN = path_1.join(__dirname, '../../bin');
const TESTCAFE_HAMMERHEAD = `${path_1.sep}testcafe-hammerhead${path_1.sep}`;
const SOURCE_MAP_SUPPORT = `${path_1.sep}source-map-support${path_1.sep}`;
const INTERNAL = 'internal/';
function createStackFilter(limit) {
    let passedFramesCount = 0;
    return function stackFilter(frame) {
        if (passedFramesCount >= limit)
            return false;
        const filename = frame.getFileName();
        // NOTE: filter out the internals of node, Babel and TestCafe
        const pass = filename &&
            filename.indexOf(path_1.sep) > -1 &&
            filename.indexOf(INTERNAL) !== 0 &&
            filename.indexOf(TESTCAFE_LIB) !== 0 &&
            filename.indexOf(TESTCAFE_BIN) !== 0 &&
            filename.indexOf(TESTCAFE_HAMMERHEAD) < 0 &&
            filename.indexOf(BABEL_RELATED) !== 0 &&
            filename.indexOf(BABYLON) !== 0 &&
            filename.indexOf(CORE_JS) !== 0 &&
            filename.indexOf(REGENERATOR_RUNTIME) !== 0 &&
            filename.indexOf(SOURCE_MAP_SUPPORT) < 0;
        if (pass)
            passedFramesCount++;
        return pass;
    };
}
exports.default = createStackFilter;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXN0YWNrLWZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvY3JlYXRlLXN0YWNrLWZpbHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFpQztBQUNqQyxtQ0FBa0Q7QUFFbEQsTUFBTSxLQUFLLEdBQWUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RCxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxxQkFBUSxDQUFDLFVBQUcsQ0FBQyxlQUFlLHFCQUFRLENBQUMsVUFBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRW5ILE1BQU0sYUFBYSxHQUFTLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztBQUN6RCxNQUFNLE9BQU8sR0FBZSxpQkFBaUIsR0FBRyxTQUFTLEdBQUcsVUFBRyxDQUFDO0FBQ2hFLE1BQU0sT0FBTyxHQUFlLGlCQUFpQixHQUFHLFNBQVMsR0FBRyxVQUFHLENBQUM7QUFDaEUsTUFBTSxtQkFBbUIsR0FBRyxpQkFBaUIsR0FBRyxxQkFBcUIsR0FBRyxVQUFHLENBQUM7QUFFNUUsTUFBTSxZQUFZLEdBQVUsV0FBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuRCxNQUFNLFlBQVksR0FBVSxXQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3pELE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxVQUFHLHNCQUFzQixVQUFHLEVBQUUsQ0FBQztBQUU5RCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsVUFBRyxxQkFBcUIsVUFBRyxFQUFFLENBQUM7QUFFNUQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDO0FBRTdCLFNBQXdCLGlCQUFpQixDQUFFLEtBQUs7SUFDNUMsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFFMUIsT0FBTyxTQUFTLFdBQVcsQ0FBRSxLQUFLO1FBQzlCLElBQUksaUJBQWlCLElBQUksS0FBSztZQUMxQixPQUFPLEtBQUssQ0FBQztRQUVqQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFckMsNkRBQTZEO1FBQzdELE1BQU0sSUFBSSxHQUFHLFFBQVE7WUFDVixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDaEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUNwQyxRQUFRLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztZQUN6QyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDckMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUMvQixRQUFRLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUMzQyxRQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBELElBQUksSUFBSTtZQUNKLGlCQUFpQixFQUFFLENBQUM7UUFFeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQTNCRCxvQ0EyQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzZXAsIGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGVzY2FwZVJlZ0V4cCBhcyBlc2NhcGVSZSB9IGZyb20gJ2xvZGFzaCc7XG5cbmNvbnN0IEJBQkVMICAgICAgICAgICAgID0gcmVxdWlyZS5yZXNvbHZlKCdiYWJlbC1jb3JlJyk7XG5jb25zdCBCQUJFTF9NT0RVTEVTX0RJUiA9IEJBQkVMLnJlcGxhY2UobmV3IFJlZ0V4cChgXiguKiR7ZXNjYXBlUmUoc2VwKX1ub2RlX21vZHVsZXMke2VzY2FwZVJlKHNlcCl9KSguKilgKSwgJyQxJyk7XG5cbmNvbnN0IEJBQkVMX1JFTEFURUQgICAgICAgPSBCQUJFTF9NT0RVTEVTX0RJUiArICdiYWJlbC0nO1xuY29uc3QgQkFCWUxPTiAgICAgICAgICAgICA9IEJBQkVMX01PRFVMRVNfRElSICsgJ2JhYnlsb24nICsgc2VwO1xuY29uc3QgQ09SRV9KUyAgICAgICAgICAgICA9IEJBQkVMX01PRFVMRVNfRElSICsgJ2NvcmUtanMnICsgc2VwO1xuY29uc3QgUkVHRU5FUkFUT1JfUlVOVElNRSA9IEJBQkVMX01PRFVMRVNfRElSICsgJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUnICsgc2VwO1xuXG5jb25zdCBURVNUQ0FGRV9MSUIgICAgICAgID0gam9pbihfX2Rpcm5hbWUsICcuLi8nKTtcbmNvbnN0IFRFU1RDQUZFX0JJTiAgICAgICAgPSBqb2luKF9fZGlybmFtZSwgJy4uLy4uL2JpbicpO1xuY29uc3QgVEVTVENBRkVfSEFNTUVSSEVBRCA9IGAke3NlcH10ZXN0Y2FmZS1oYW1tZXJoZWFkJHtzZXB9YDtcblxuY29uc3QgU09VUkNFX01BUF9TVVBQT1JUID0gYCR7c2VwfXNvdXJjZS1tYXAtc3VwcG9ydCR7c2VwfWA7XG5cbmNvbnN0IElOVEVSTkFMID0gJ2ludGVybmFsLyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVN0YWNrRmlsdGVyIChsaW1pdCkge1xuICAgIGxldCBwYXNzZWRGcmFtZXNDb3VudCA9IDA7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gc3RhY2tGaWx0ZXIgKGZyYW1lKSB7XG4gICAgICAgIGlmIChwYXNzZWRGcmFtZXNDb3VudCA+PSBsaW1pdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGZyYW1lLmdldEZpbGVOYW1lKCk7XG5cbiAgICAgICAgLy8gTk9URTogZmlsdGVyIG91dCB0aGUgaW50ZXJuYWxzIG9mIG5vZGUsIEJhYmVsIGFuZCBUZXN0Q2FmZVxuICAgICAgICBjb25zdCBwYXNzID0gZmlsZW5hbWUgJiZcbiAgICAgICAgICAgICAgICAgICBmaWxlbmFtZS5pbmRleE9mKHNlcCkgPiAtMSAmJlxuICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lLmluZGV4T2YoSU5URVJOQUwpICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZihURVNUQ0FGRV9MSUIpICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZihURVNUQ0FGRV9CSU4pICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZihURVNUQ0FGRV9IQU1NRVJIRUFEKSA8IDAgJiZcbiAgICAgICAgICAgICAgICAgICBmaWxlbmFtZS5pbmRleE9mKEJBQkVMX1JFTEFURUQpICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZihCQUJZTE9OKSAhPT0gMCAmJlxuICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lLmluZGV4T2YoQ09SRV9KUykgIT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICBmaWxlbmFtZS5pbmRleE9mKFJFR0VORVJBVE9SX1JVTlRJTUUpICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZihTT1VSQ0VfTUFQX1NVUFBPUlQpIDwgMDtcblxuICAgICAgICBpZiAocGFzcylcbiAgICAgICAgICAgIHBhc3NlZEZyYW1lc0NvdW50Kys7XG5cbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfTtcbn1cbiJdfQ==