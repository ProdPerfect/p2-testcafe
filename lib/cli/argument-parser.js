"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const commander_1 = require("commander");
const dedent_1 = __importDefault(require("dedent"));
const read_file_relative_1 = require("read-file-relative");
const runtime_1 = require("../errors/runtime");
const types_1 = require("../errors/types");
const type_assertions_1 = require("../errors/runtime/type-assertions");
const get_viewport_width_1 = __importDefault(require("../utils/get-viewport-width"));
const string_1 = require("../utils/string");
const get_options_1 = require("../utils/get-options");
const get_filter_fn_1 = __importDefault(require("../utils/get-filter-fn"));
const screenshot_option_names_1 = __importDefault(require("../configuration/screenshot-option-names"));
const run_option_names_1 = __importDefault(require("../configuration/run-option-names"));
const REMOTE_ALIAS_RE = /^remote(?::(\d*))?$/;
const DESCRIPTION = dedent_1.default(`
    In the browser list, you can use browser names (e.g. "ie", "chrome", etc.) as well as paths to executables.

    To run tests against all installed browsers, use the "all" alias.

    To use a remote browser connection (e.g., to connect a mobile device), specify "remote" as the browser alias.
    If you need to connect multiple devices, add a colon and the number of browsers you want to connect (e.g., "remote:3").

    To run tests in a browser accessed through a browser provider plugin, specify a browser alias that consists of two parts - the browser provider name prefix and the name of the browser itself; for example, "saucelabs:chrome@51".

    You can use one or more file paths or glob patterns to specify which tests to run.

    More info: https://devexpress.github.io/testcafe/documentation
`);
class CLIArgumentParser {
    constructor(cwd) {
        this.program = new commander_1.Command('testcafe');
        this.experimental = new commander_1.Command('testcafe-experimental');
        this.cwd = cwd || process.cwd();
        this.remoteCount = 0;
        this.opts = {};
        this.args = [];
        this._describeProgram();
    }
    static _parsePortNumber(value) {
        type_assertions_1.assertType(type_assertions_1.is.nonNegativeNumberString, null, 'Port number', value);
        return parseInt(value, 10);
    }
    static _getDescription() {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + string_1.wordWrap(DESCRIPTION, 2, get_viewport_width_1.default(process.stdout));
    }
    _describeProgram() {
        const version = JSON.parse(read_file_relative_1.readSync('../../package.json')).version;
        this.program
            .version(version, '-v, --version')
            .usage('[options] <comma-separated-browser-list> <file-or-glob ...>')
            .description(CLIArgumentParser._getDescription())
            .option('-b, --list-browsers [provider]', 'output the aliases for local browsers or browsers available through the specified browser provider')
            .option('-r, --reporter <name[:outputFile][,...]>', 'specify the reporters and optionally files where reports are saved')
            .option('-s, --screenshots <option=value[,...]>', 'specify screenshot options')
            .option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails')
            .option('-p, --screenshot-path-pattern <pattern>', 'use patterns to compose screenshot file names and paths: ${BROWSER}, ${BROWSER_VERSION}, ${OS}, etc.')
            .option('-q, --quarantine-mode', 'enable the quarantine mode')
            .option('-d, --debug-mode', 'execute test steps one by one pausing the test after each step')
            .option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page')
            .option('-u, --skip-uncaught-errors', 'ignore uncaught errors and unhandled promise rejections, which occur during test execution')
            .option('-t, --test <name>', 'run only tests with the specified name')
            .option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern')
            .option('-f, --fixture <name>', 'run only fixtures with the specified name')
            .option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern')
            .option('-a, --app <command>', 'launch the tested app using the specified command before running tests')
            .option('-c, --concurrency <number>', 'run tests concurrently')
            .option('-L, --live', 'enable live mode. In this mode, TestCafe watches for changes you make in the test files. These changes immediately restart the tests so that you can see the effect.')
            .option('--test-meta <key=value[,key2=value2,...]>', 'run only tests with matching metadata')
            .option('--fixture-meta <key=value[,key2=value2,...]>', 'run only fixtures with matching metadata')
            .option('--debug-on-fail', 'pause the test if it fails')
            .option('--app-init-delay <ms>', 'specify how much time it takes for the tested app to initialize')
            .option('--selector-timeout <ms>', 'specify the time within which selectors make attempts to obtain a node to be returned')
            .option('--assertion-timeout <ms>', 'specify the time within which assertion should pass')
            .option('--page-load-timeout <ms>', 'specify the time within which TestCafe waits for the `window.load` event to fire on page load before proceeding to the next test action')
            .option('--speed <factor>', 'set the speed of test execution (0.01 ... 1)')
            .option('--ports <port1,port2>', 'specify custom port numbers')
            .option('--hostname <name>', 'specify the hostname')
            .option('--proxy <host>', 'specify the host of the proxy server')
            .option('--proxy-bypass <rules>', 'specify a comma-separated list of rules that define URLs accessed bypassing the proxy server')
            .option('--ssl <options>', 'specify SSL options to run TestCafe proxy server over the HTTPS protocol')
            .option('--video <path>', 'record videos of test runs')
            .option('--video-options <option=value[,...]>', 'specify video recording options')
            .option('--video-encoding-options <option=value[,...]>', 'specify encoding options')
            .option('--dev', 'enables mechanisms to log and diagnose errors')
            .option('--qr-code', 'outputs QR-code that repeats URLs used to connect the remote browsers')
            .option('--sf, --stop-on-first-fail', 'stop an entire test run if any test fails')
            .option('--ts-config-path <path>', 'use a custom TypeScript configuration file and specify its location')
            .option('--cs, --client-scripts <paths>', 'inject scripts into tested pages', this._parseList, [])
            .option('--disable-page-caching', 'disable page caching during test execution')
            .option('--disable-page-reloads', 'disable page reloads between tests')
            .option('--disable-screenshots', 'disable screenshots')
            .option('--screenshots-full-page', 'enable full-page screenshots')
            // NOTE: these options will be handled by chalk internally
            .option('--color', 'force colors in command line')
            .option('--no-color', 'disable colors in command line');
        // NOTE: temporary hide experimental options from --help command
        this.experimental
            .allowUnknownOption()
            .option('-m, --allow-multiple-windows', 'run TestCafe in the multiple windows mode')
            .option('--experimental-compiler-service', 'run compiler in a separate process');
    }
    _parseList(val) {
        return val.split(',');
    }
    _checkAndCountRemotes(browser) {
        const remoteMatch = browser.match(REMOTE_ALIAS_RE);
        if (remoteMatch) {
            this.remoteCount += parseInt(remoteMatch[1], 10) || 1;
            return false;
        }
        return true;
    }
    async _parseFilteringOptions() {
        if (this.opts.testGrep)
            this.opts.testGrep = get_options_1.getGrepOptions('--test-grep', this.opts.testGrep);
        if (this.opts.fixtureGrep)
            this.opts.fixtureGrep = get_options_1.getGrepOptions('--fixture-grep', this.opts.fixtureGrep);
        if (this.opts.testMeta)
            this.opts.testMeta = await get_options_1.getMetaOptions('--test-meta', this.opts.testMeta);
        if (this.opts.fixtureMeta)
            this.opts.fixtureMeta = await get_options_1.getMetaOptions('--fixture-meta', this.opts.fixtureMeta);
        this.opts.filter = get_filter_fn_1.default(this.opts);
    }
    _parseAppInitDelay() {
        if (this.opts.appInitDelay) {
            type_assertions_1.assertType(type_assertions_1.is.nonNegativeNumberString, null, 'Tested app initialization delay', this.opts.appInitDelay);
            this.opts.appInitDelay = parseInt(this.opts.appInitDelay, 10);
        }
    }
    _parseSelectorTimeout() {
        if (this.opts.selectorTimeout) {
            type_assertions_1.assertType(type_assertions_1.is.nonNegativeNumberString, null, 'Selector timeout', this.opts.selectorTimeout);
            this.opts.selectorTimeout = parseInt(this.opts.selectorTimeout, 10);
        }
    }
    _parseAssertionTimeout() {
        if (this.opts.assertionTimeout) {
            type_assertions_1.assertType(type_assertions_1.is.nonNegativeNumberString, null, 'Assertion timeout', this.opts.assertionTimeout);
            this.opts.assertionTimeout = parseInt(this.opts.assertionTimeout, 10);
        }
    }
    _parsePageLoadTimeout() {
        if (this.opts.pageLoadTimeout) {
            type_assertions_1.assertType(type_assertions_1.is.nonNegativeNumberString, null, 'Page load timeout', this.opts.pageLoadTimeout);
            this.opts.pageLoadTimeout = parseInt(this.opts.pageLoadTimeout, 10);
        }
    }
    _parseSpeed() {
        if (this.opts.speed)
            this.opts.speed = parseFloat(this.opts.speed);
    }
    _parseConcurrency() {
        if (this.opts.concurrency)
            this.opts.concurrency = parseInt(this.opts.concurrency, 10);
    }
    _parsePorts() {
        if (this.opts.ports) {
            const parsedPorts = this.opts.ports /* eslint-disable-line no-extra-parens */
                .split(',')
                .map(CLIArgumentParser._parsePortNumber);
            if (parsedPorts.length < 2)
                throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.portsOptionRequiresTwoNumbers);
            this.opts.ports = parsedPorts;
        }
    }
    _parseBrowsersFromArgs() {
        const browsersArg = this.program.args[0] || '';
        this.opts.browsers = string_1.splitQuotedText(browsersArg, ',')
            .filter(browser => browser && this._checkAndCountRemotes(browser));
    }
    async _parseSslOptions() {
        if (this.opts.ssl)
            this.opts.ssl = await get_options_1.getSSLOptions(this.opts.ssl);
    }
    async _parseReporters() {
        const reporters = this.opts.reporter ? this.opts.reporter.split(',') : []; /* eslint-disable-line no-extra-parens*/
        this.opts.reporter = reporters.map((reporter) => {
            const separatorIndex = reporter.indexOf(':');
            if (separatorIndex < 0)
                return { name: reporter };
            const name = reporter.substring(0, separatorIndex);
            const output = reporter.substring(separatorIndex + 1);
            return { name, output };
        });
    }
    _parseFileList() {
        this.opts.src = this.program.args.slice(1);
    }
    async _parseScreenshotOptions() {
        if (this.opts.screenshots)
            this.opts.screenshots = await get_options_1.getScreenshotOptions(this.opts.screenshots);
        else
            this.opts.screenshots = {};
        if (!lodash_1.has(this.opts.screenshots, screenshot_option_names_1.default.pathPattern) && this.opts.screenshotPathPattern)
            this.opts.screenshots[screenshot_option_names_1.default.pathPattern] = this.opts.screenshotPathPattern;
        if (!lodash_1.has(this.opts.screenshots, screenshot_option_names_1.default.takeOnFails) && this.opts.screenshotsOnFails)
            this.opts.screenshots[screenshot_option_names_1.default.takeOnFails] = this.opts.screenshotsOnFails;
    }
    async _parseVideoOptions() {
        if (this.opts.videoOptions)
            this.opts.videoOptions = await get_options_1.getVideoOptions(this.opts.videoOptions);
        if (this.opts.videoEncodingOptions)
            this.opts.videoEncodingOptions = await get_options_1.getVideoOptions(this.opts.videoEncodingOptions);
    }
    _parseListBrowsers() {
        const listBrowserOption = this.opts.listBrowsers;
        this.opts.listBrowsers = !!this.opts.listBrowsers;
        if (!this.opts.listBrowsers)
            return;
        this.opts.providerName = typeof listBrowserOption === 'string' ? listBrowserOption : 'locally-installed';
    }
    async parse(argv) {
        this.program.parse(argv);
        this.experimental.parse(argv);
        this.args = this.program.args;
        this.opts = Object.assign(Object.assign({}, this.experimental.opts()), this.program.opts());
        this._parseListBrowsers();
        // NOTE: the '--list-browsers' option only lists browsers and immediately exits the app.
        // Therefore, we don't need to process other arguments.
        if (this.opts.listBrowsers)
            return;
        this._parseSelectorTimeout();
        this._parseAssertionTimeout();
        this._parsePageLoadTimeout();
        this._parseAppInitDelay();
        this._parseSpeed();
        this._parsePorts();
        this._parseBrowsersFromArgs();
        this._parseConcurrency();
        this._parseFileList();
        await this._parseFilteringOptions();
        await this._parseScreenshotOptions();
        await this._parseVideoOptions();
        await this._parseSslOptions();
        await this._parseReporters();
    }
    getRunOptions() {
        const result = Object.create(null);
        run_option_names_1.default.forEach(optionName => {
            if (optionName in this.opts)
                // @ts-ignore a hack to add an index signature to interface
                result[optionName] = this.opts[optionName];
        });
        return result;
    }
}
exports.default = CLIArgumentParser;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQtcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9hcmd1bWVudC1wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBNkI7QUFDN0IseUNBQW9DO0FBQ3BDLG9EQUE0QjtBQUM1QiwyREFBc0Q7QUFDdEQsK0NBQWlEO0FBQ2pELDJDQUFpRDtBQUNqRCx1RUFBbUU7QUFDbkUscUZBQTJEO0FBQzNELDRDQUE0RDtBQUM1RCxzREFBNEg7QUFDNUgsMkVBQWlEO0FBQ2pELHVHQUErRTtBQUMvRSx5RkFBaUU7QUFJakUsTUFBTSxlQUFlLEdBQUcscUJBQXFCLENBQUM7QUFFOUMsTUFBTSxXQUFXLEdBQUcsZ0JBQU0sQ0FBQzs7Ozs7Ozs7Ozs7OztDQWExQixDQUFDLENBQUM7QUE0QkgsTUFBcUIsaUJBQWlCO0lBUWxDLFlBQW9CLEdBQVc7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBUSxJQUFJLG1CQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxHQUFZLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsR0FBSSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBVyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBVyxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBRSxLQUFhO1FBQzFDLDRCQUFVLENBQUMsb0JBQUUsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRW5FLE9BQU8sUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFF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QUFhO1FBQ2hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsMEJBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLElBQUksVUFBVSxJQUFJLElBQUksQ0FBQyxJQUFJO2dCQUN2QiwyREFBMkQ7Z0JBQzNELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUEwQixDQUFDO0lBQ3RDLENBQUM7Q0FDSjtBQTdSRCxvQ0E2UkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBoYXMgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gJ2NvbW1hbmRlcic7XG5pbXBvcnQgZGVkZW50IGZyb20gJ2RlZGVudCc7XG5pbXBvcnQgeyByZWFkU3luYyBhcyByZWFkIH0gZnJvbSAncmVhZC1maWxlLXJlbGF0aXZlJztcbmltcG9ydCB7IEdlbmVyYWxFcnJvciB9IGZyb20gJy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vZXJyb3JzL3R5cGVzJztcbmltcG9ydCB7IGFzc2VydFR5cGUsIGlzIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUvdHlwZS1hc3NlcnRpb25zJztcbmltcG9ydCBnZXRWaWV3UG9ydFdpZHRoIGZyb20gJy4uL3V0aWxzL2dldC12aWV3cG9ydC13aWR0aCc7XG5pbXBvcnQgeyB3b3JkV3JhcCwgc3BsaXRRdW90ZWRUZXh0IH0gZnJvbSAnLi4vdXRpbHMvc3RyaW5nJztcbmltcG9ydCB7IGdldFNTTE9wdGlvbnMsIGdldFNjcmVlbnNob3RPcHRpb25zLCBnZXRWaWRlb09wdGlvbnMsIGdldE1ldGFPcHRpb25zLCBnZXRHcmVwT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzL2dldC1vcHRpb25zJztcbmltcG9ydCBnZXRGaWx0ZXJGbiBmcm9tICcuLi91dGlscy9nZXQtZmlsdGVyLWZuJztcbmltcG9ydCBTQ1JFRU5TSE9UX09QVElPTl9OQU1FUyBmcm9tICcuLi9jb25maWd1cmF0aW9uL3NjcmVlbnNob3Qtb3B0aW9uLW5hbWVzJztcbmltcG9ydCBSVU5fT1BUSU9OX05BTUVTIGZyb20gJy4uL2NvbmZpZ3VyYXRpb24vcnVuLW9wdGlvbi1uYW1lcyc7XG5pbXBvcnQgeyBEaWN0aW9uYXJ5LCBSZXBvcnRlck9wdGlvbiwgUnVubmVyUnVuT3B0aW9ucyB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24vaW50ZXJmYWNlcyc7XG5cblxuY29uc3QgUkVNT1RFX0FMSUFTX1JFID0gL15yZW1vdGUoPzo6KFxcZCopKT8kLztcblxuY29uc3QgREVTQ1JJUFRJT04gPSBkZWRlbnQoYFxuICAgIEluIHRoZSBicm93c2VyIGxpc3QsIHlvdSBjYW4gdXNlIGJyb3dzZXIgbmFtZXMgKGUuZy4gXCJpZVwiLCBcImNocm9tZVwiLCBldGMuKSBhcyB3ZWxsIGFzIHBhdGhzIHRvIGV4ZWN1dGFibGVzLlxuXG4gICAgVG8gcnVuIHRlc3RzIGFnYWluc3QgYWxsIGluc3RhbGxlZCBicm93c2VycywgdXNlIHRoZSBcImFsbFwiIGFsaWFzLlxuXG4gICAgVG8gdXNlIGEgcmVtb3RlIGJyb3dzZXIgY29ubmVjdGlvbiAoZS5nLiwgdG8gY29ubmVjdCBhIG1vYmlsZSBkZXZpY2UpLCBzcGVjaWZ5IFwicmVtb3RlXCIgYXMgdGhlIGJyb3dzZXIgYWxpYXMuXG4gICAgSWYgeW91IG5lZWQgdG8gY29ubmVjdCBtdWx0aXBsZSBkZXZpY2VzLCBhZGQgYSBjb2xvbiBhbmQgdGhlIG51bWJlciBvZiBicm93c2VycyB5b3Ugd2FudCB0byBjb25uZWN0IChlLmcuLCBcInJlbW90ZTozXCIpLlxuXG4gICAgVG8gcnVuIHRlc3RzIGluIGEgYnJvd3NlciBhY2Nlc3NlZCB0aHJvdWdoIGEgYnJvd3NlciBwcm92aWRlciBwbHVnaW4sIHNwZWNpZnkgYSBicm93c2VyIGFsaWFzIHRoYXQgY29uc2lzdHMgb2YgdHdvIHBhcnRzIC0gdGhlIGJyb3dzZXIgcHJvdmlkZXIgbmFtZSBwcmVmaXggYW5kIHRoZSBuYW1lIG9mIHRoZSBicm93c2VyIGl0c2VsZjsgZm9yIGV4YW1wbGUsIFwic2F1Y2VsYWJzOmNocm9tZUA1MVwiLlxuXG4gICAgWW91IGNhbiB1c2Ugb25lIG9yIG1vcmUgZmlsZSBwYXRocyBvciBnbG9iIHBhdHRlcm5zIHRvIHNwZWNpZnkgd2hpY2ggdGVzdHMgdG8gcnVuLlxuXG4gICAgTW9yZSBpbmZvOiBodHRwczovL2RldmV4cHJlc3MuZ2l0aHViLmlvL3Rlc3RjYWZlL2RvY3VtZW50YXRpb25cbmApO1xuXG5pbnRlcmZhY2UgQ29tbWFuZExpbmVPcHRpb25zIHtcbiAgICB0ZXN0R3JlcD86IHN0cmluZyB8IFJlZ0V4cDtcbiAgICBmaXh0dXJlR3JlcD86IHN0cmluZyB8IFJlZ0V4cDtcbiAgICBzcmM/OiBzdHJpbmdbXTtcbiAgICBicm93c2Vycz86IHN0cmluZ1tdO1xuICAgIGxpc3RCcm93c2Vycz86IGJvb2xlYW4gfCBzdHJpbmc7XG4gICAgdGVzdE1ldGE/OiBzdHJpbmcgfCBEaWN0aW9uYXJ5PHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+O1xuICAgIGZpeHR1cmVNZXRhPzogc3RyaW5nIHwgRGljdGlvbmFyeTxzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuPjtcbiAgICBmaWx0ZXI/OiBGdW5jdGlvbjtcbiAgICBhcHBJbml0RGVsYXk/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgYXNzZXJ0aW9uVGltZW91dD86IHN0cmluZyB8IG51bWJlcjtcbiAgICBzZWxlY3RvclRpbWVvdXQ/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgc3BlZWQ/OiBzdHJpbmcgfCBudW1iZXI7XG4gICAgcGFnZUxvYWRUaW1lb3V0Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIGNvbmN1cnJlbmN5Pzogc3RyaW5nIHwgbnVtYmVyO1xuICAgIHBvcnRzPzogc3RyaW5nIHwgbnVtYmVyW107XG4gICAgcHJvdmlkZXJOYW1lPzogc3RyaW5nO1xuICAgIHNzbD86IHN0cmluZyB8IERpY3Rpb25hcnk8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiA+O1xuICAgIHJlcG9ydGVyPzogc3RyaW5nIHwgUmVwb3J0ZXJPcHRpb25bXTtcbiAgICBzY3JlZW5zaG90cz86IERpY3Rpb25hcnk8c3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbj4gfCBzdHJpbmc7XG4gICAgc2NyZWVuc2hvdFBhdGhQYXR0ZXJuPzogc3RyaW5nO1xuICAgIHNjcmVlbnNob3RzT25GYWlscz86IGJvb2xlYW47XG4gICAgdmlkZW9PcHRpb25zPzogc3RyaW5nIHwgRGljdGlvbmFyeTxudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuPjtcbiAgICB2aWRlb0VuY29kaW5nT3B0aW9ucz86IHN0cmluZyB8IERpY3Rpb25hcnk8bnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbj47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENMSUFyZ3VtZW50UGFyc2VyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByb2dyYW06IENvbW1hbmQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBleHBlcmltZW50YWw6IENvbW1hbmQ7XG4gICAgcHJpdmF0ZSBjd2Q6IHN0cmluZztcbiAgICBwcml2YXRlIHJlbW90ZUNvdW50OiBudW1iZXI7XG4gICAgcHVibGljIG9wdHM6IENvbW1hbmRMaW5lT3B0aW9ucztcbiAgICBwdWJsaWMgYXJnczogc3RyaW5nW107XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IgKGN3ZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbSAgICAgID0gbmV3IENvbW1hbmQoJ3Rlc3RjYWZlJyk7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudGFsID0gbmV3IENvbW1hbmQoJ3Rlc3RjYWZlLWV4cGVyaW1lbnRhbCcpO1xuICAgICAgICB0aGlzLmN3ZCAgICAgICAgICA9IGN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuICAgICAgICB0aGlzLnJlbW90ZUNvdW50ICA9IDA7XG4gICAgICAgIHRoaXMub3B0cyAgICAgICAgID0ge307XG4gICAgICAgIHRoaXMuYXJncyAgICAgICAgID0gW107XG5cbiAgICAgICAgdGhpcy5fZGVzY3JpYmVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3BhcnNlUG9ydE51bWJlciAodmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGFzc2VydFR5cGUoaXMubm9uTmVnYXRpdmVOdW1iZXJTdHJpbmcsIG51bGwsICdQb3J0IG51bWJlcicsIHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0RGVzY3JpcHRpb24gKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIE5PVEU6IGFkZCBlbXB0eSBsaW5lIHRvIHdvcmthcm91bmQgY29tbWFuZGVyLWZvcmNlZCBpbmRlbnRhdGlvbiBvbiB0aGUgZmlyc3QgbGluZS5cbiAgICAgICAgcmV0dXJuICdcXG4nICsgd29yZFdyYXAoREVTQ1JJUFRJT04sIDIsIGdldFZpZXdQb3J0V2lkdGgocHJvY2Vzcy5zdGRvdXQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kZXNjcmliZVByb2dyYW0gKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2ZXJzaW9uID0gSlNPTi5wYXJzZShyZWFkKCcuLi8uLi9wYWNrYWdlLmpzb24nKSBhcyBzdHJpbmcpLnZlcnNpb247XG5cbiAgICAgICAgdGhpcy5wcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbih2ZXJzaW9uLCAnLXYsIC0tdmVyc2lvbicpXG4gICAgICAgICAgICAudXNhZ2UoJ1tvcHRpb25zXSA8Y29tbWEtc2VwYXJhdGVkLWJyb3dzZXItbGlzdD4gPGZpbGUtb3ItZ2xvYiAuLi4+JylcbiAgICAgICAgICAgIC5kZXNjcmlwdGlvbihDTElBcmd1bWVudFBhcnNlci5fZ2V0RGVzY3JpcHRpb24oKSlcblxuICAgICAgICAgICAgLm9wdGlvbignLWIsIC0tbGlzdC1icm93c2VycyBbcHJvdmlkZXJdJywgJ291dHB1dCB0aGUgYWxpYXNlcyBmb3IgbG9jYWwgYnJvd3NlcnMgb3IgYnJvd3NlcnMgYXZhaWxhYmxlIHRocm91Z2ggdGhlIHNwZWNpZmllZCBicm93c2VyIHByb3ZpZGVyJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXJlcG9ydGVyIDxuYW1lWzpvdXRwdXRGaWxlXVssLi4uXT4nLCAnc3BlY2lmeSB0aGUgcmVwb3J0ZXJzIGFuZCBvcHRpb25hbGx5IGZpbGVzIHdoZXJlIHJlcG9ydHMgYXJlIHNhdmVkJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1zLCAtLXNjcmVlbnNob3RzIDxvcHRpb249dmFsdWVbLC4uLl0+JywgJ3NwZWNpZnkgc2NyZWVuc2hvdCBvcHRpb25zJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1TLCAtLXNjcmVlbnNob3RzLW9uLWZhaWxzJywgJ3Rha2UgYSBzY3JlZW5zaG90IHdoZW5ldmVyIGEgdGVzdCBmYWlscycpXG4gICAgICAgICAgICAub3B0aW9uKCctcCwgLS1zY3JlZW5zaG90LXBhdGgtcGF0dGVybiA8cGF0dGVybj4nLCAndXNlIHBhdHRlcm5zIHRvIGNvbXBvc2Ugc2NyZWVuc2hvdCBmaWxlIG5hbWVzIGFuZCBwYXRoczogJHtCUk9XU0VSfSwgJHtCUk9XU0VSX1ZFUlNJT059LCAke09TfSwgZXRjLicpXG4gICAgICAgICAgICAub3B0aW9uKCctcSwgLS1xdWFyYW50aW5lLW1vZGUnLCAnZW5hYmxlIHRoZSBxdWFyYW50aW5lIG1vZGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLWQsIC0tZGVidWctbW9kZScsICdleGVjdXRlIHRlc3Qgc3RlcHMgb25lIGJ5IG9uZSBwYXVzaW5nIHRoZSB0ZXN0IGFmdGVyIGVhY2ggc3RlcCcpXG4gICAgICAgICAgICAub3B0aW9uKCctZSwgLS1za2lwLWpzLWVycm9ycycsICdtYWtlIHRlc3RzIG5vdCBmYWlsIHdoZW4gYSBKUyBlcnJvciBoYXBwZW5zIG9uIGEgcGFnZScpXG4gICAgICAgICAgICAub3B0aW9uKCctdSwgLS1za2lwLXVuY2F1Z2h0LWVycm9ycycsICdpZ25vcmUgdW5jYXVnaHQgZXJyb3JzIGFuZCB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zLCB3aGljaCBvY2N1ciBkdXJpbmcgdGVzdCBleGVjdXRpb24nKVxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tdGVzdCA8bmFtZT4nLCAncnVuIG9ubHkgdGVzdHMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUnKVxuICAgICAgICAgICAgLm9wdGlvbignLVQsIC0tdGVzdC1ncmVwIDxwYXR0ZXJuPicsICdydW4gb25seSB0ZXN0cyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIHBhdHRlcm4nKVxuICAgICAgICAgICAgLm9wdGlvbignLWYsIC0tZml4dHVyZSA8bmFtZT4nLCAncnVuIG9ubHkgZml4dHVyZXMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUnKVxuICAgICAgICAgICAgLm9wdGlvbignLUYsIC0tZml4dHVyZS1ncmVwIDxwYXR0ZXJuPicsICdydW4gb25seSBmaXh0dXJlcyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIHBhdHRlcm4nKVxuICAgICAgICAgICAgLm9wdGlvbignLWEsIC0tYXBwIDxjb21tYW5kPicsICdsYXVuY2ggdGhlIHRlc3RlZCBhcHAgdXNpbmcgdGhlIHNwZWNpZmllZCBjb21tYW5kIGJlZm9yZSBydW5uaW5nIHRlc3RzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1jLCAtLWNvbmN1cnJlbmN5IDxudW1iZXI+JywgJ3J1biB0ZXN0cyBjb25jdXJyZW50bHknKVxuICAgICAgICAgICAgLm9wdGlvbignLUwsIC0tbGl2ZScsICdlbmFibGUgbGl2ZSBtb2RlLiBJbiB0aGlzIG1vZGUsIFRlc3RDYWZlIHdhdGNoZXMgZm9yIGNoYW5nZXMgeW91IG1ha2UgaW4gdGhlIHRlc3QgZmlsZXMuIFRoZXNlIGNoYW5nZXMgaW1tZWRpYXRlbHkgcmVzdGFydCB0aGUgdGVzdHMgc28gdGhhdCB5b3UgY2FuIHNlZSB0aGUgZWZmZWN0LicpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRlc3QtbWV0YSA8a2V5PXZhbHVlWyxrZXkyPXZhbHVlMiwuLi5dPicsICdydW4gb25seSB0ZXN0cyB3aXRoIG1hdGNoaW5nIG1ldGFkYXRhJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZml4dHVyZS1tZXRhIDxrZXk9dmFsdWVbLGtleTI9dmFsdWUyLC4uLl0+JywgJ3J1biBvbmx5IGZpeHR1cmVzIHdpdGggbWF0Y2hpbmcgbWV0YWRhdGEnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kZWJ1Zy1vbi1mYWlsJywgJ3BhdXNlIHRoZSB0ZXN0IGlmIGl0IGZhaWxzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tYXBwLWluaXQtZGVsYXkgPG1zPicsICdzcGVjaWZ5IGhvdyBtdWNoIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSB0ZXN0ZWQgYXBwIHRvIGluaXRpYWxpemUnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1zZWxlY3Rvci10aW1lb3V0IDxtcz4nLCAnc3BlY2lmeSB0aGUgdGltZSB3aXRoaW4gd2hpY2ggc2VsZWN0b3JzIG1ha2UgYXR0ZW1wdHMgdG8gb2J0YWluIGEgbm9kZSB0byBiZSByZXR1cm5lZCcpXG4gICAgICAgICAgICAub3B0aW9uKCctLWFzc2VydGlvbi10aW1lb3V0IDxtcz4nLCAnc3BlY2lmeSB0aGUgdGltZSB3aXRoaW4gd2hpY2ggYXNzZXJ0aW9uIHNob3VsZCBwYXNzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tcGFnZS1sb2FkLXRpbWVvdXQgPG1zPicsICdzcGVjaWZ5IHRoZSB0aW1lIHdpdGhpbiB3aGljaCBUZXN0Q2FmZSB3YWl0cyBmb3IgdGhlIGB3aW5kb3cubG9hZGAgZXZlbnQgdG8gZmlyZSBvbiBwYWdlIGxvYWQgYmVmb3JlIHByb2NlZWRpbmcgdG8gdGhlIG5leHQgdGVzdCBhY3Rpb24nKVxuICAgICAgICAgICAgLm9wdGlvbignLS1zcGVlZCA8ZmFjdG9yPicsICdzZXQgdGhlIHNwZWVkIG9mIHRlc3QgZXhlY3V0aW9uICgwLjAxIC4uLiAxKScpXG4gICAgICAgICAgICAub3B0aW9uKCctLXBvcnRzIDxwb3J0MSxwb3J0Mj4nLCAnc3BlY2lmeSBjdXN0b20gcG9ydCBudW1iZXJzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0taG9zdG5hbWUgPG5hbWU+JywgJ3NwZWNpZnkgdGhlIGhvc3RuYW1lJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tcHJveHkgPGhvc3Q+JywgJ3NwZWNpZnkgdGhlIGhvc3Qgb2YgdGhlIHByb3h5IHNlcnZlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctLXByb3h5LWJ5cGFzcyA8cnVsZXM+JywgJ3NwZWNpZnkgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBydWxlcyB0aGF0IGRlZmluZSBVUkxzIGFjY2Vzc2VkIGJ5cGFzc2luZyB0aGUgcHJveHkgc2VydmVyJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tc3NsIDxvcHRpb25zPicsICdzcGVjaWZ5IFNTTCBvcHRpb25zIHRvIHJ1biBUZXN0Q2FmZSBwcm94eSBzZXJ2ZXIgb3ZlciB0aGUgSFRUUFMgcHJvdG9jb2wnKVxuICAgICAgICAgICAgLm9wdGlvbignLS12aWRlbyA8cGF0aD4nLCAncmVjb3JkIHZpZGVvcyBvZiB0ZXN0IHJ1bnMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS12aWRlby1vcHRpb25zIDxvcHRpb249dmFsdWVbLC4uLl0+JywgJ3NwZWNpZnkgdmlkZW8gcmVjb3JkaW5nIG9wdGlvbnMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS12aWRlby1lbmNvZGluZy1vcHRpb25zIDxvcHRpb249dmFsdWVbLC4uLl0+JywgJ3NwZWNpZnkgZW5jb2Rpbmcgb3B0aW9ucycpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRldicsICdlbmFibGVzIG1lY2hhbmlzbXMgdG8gbG9nIGFuZCBkaWFnbm9zZSBlcnJvcnMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1xci1jb2RlJywgJ291dHB1dHMgUVItY29kZSB0aGF0IHJlcGVhdHMgVVJMcyB1c2VkIHRvIGNvbm5lY3QgdGhlIHJlbW90ZSBicm93c2VycycpXG4gICAgICAgICAgICAub3B0aW9uKCctLXNmLCAtLXN0b3Atb24tZmlyc3QtZmFpbCcsICdzdG9wIGFuIGVudGlyZSB0ZXN0IHJ1biBpZiBhbnkgdGVzdCBmYWlscycpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRzLWNvbmZpZy1wYXRoIDxwYXRoPicsICd1c2UgYSBjdXN0b20gVHlwZVNjcmlwdCBjb25maWd1cmF0aW9uIGZpbGUgYW5kIHNwZWNpZnkgaXRzIGxvY2F0aW9uJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tY3MsIC0tY2xpZW50LXNjcmlwdHMgPHBhdGhzPicsICdpbmplY3Qgc2NyaXB0cyBpbnRvIHRlc3RlZCBwYWdlcycsIHRoaXMuX3BhcnNlTGlzdCwgW10pXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGUtcGFnZS1jYWNoaW5nJywgJ2Rpc2FibGUgcGFnZSBjYWNoaW5nIGR1cmluZyB0ZXN0IGV4ZWN1dGlvbicpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGUtcGFnZS1yZWxvYWRzJywgJ2Rpc2FibGUgcGFnZSByZWxvYWRzIGJldHdlZW4gdGVzdHMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlLXNjcmVlbnNob3RzJywgJ2Rpc2FibGUgc2NyZWVuc2hvdHMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1zY3JlZW5zaG90cy1mdWxsLXBhZ2UnLCAnZW5hYmxlIGZ1bGwtcGFnZSBzY3JlZW5zaG90cycpXG5cbiAgICAgICAgICAgIC8vIE5PVEU6IHRoZXNlIG9wdGlvbnMgd2lsbCBiZSBoYW5kbGVkIGJ5IGNoYWxrIGludGVybmFsbHlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tY29sb3InLCAnZm9yY2UgY29sb3JzIGluIGNvbW1hbmQgbGluZScpXG4gICAgICAgICAgICAub3B0aW9uKCctLW5vLWNvbG9yJywgJ2Rpc2FibGUgY29sb3JzIGluIGNvbW1hbmQgbGluZScpO1xuXG4gICAgICAgIC8vIE5PVEU6IHRlbXBvcmFyeSBoaWRlIGV4cGVyaW1lbnRhbCBvcHRpb25zIGZyb20gLS1oZWxwIGNvbW1hbmRcbiAgICAgICAgdGhpcy5leHBlcmltZW50YWxcbiAgICAgICAgICAgIC5hbGxvd1Vua25vd25PcHRpb24oKVxuICAgICAgICAgICAgLm9wdGlvbignLW0sIC0tYWxsb3ctbXVsdGlwbGUtd2luZG93cycsICdydW4gVGVzdENhZmUgaW4gdGhlIG11bHRpcGxlIHdpbmRvd3MgbW9kZScpXG4gICAgICAgICAgICAub3B0aW9uKCctLWV4cGVyaW1lbnRhbC1jb21waWxlci1zZXJ2aWNlJywgJ3J1biBjb21waWxlciBpbiBhIHNlcGFyYXRlIHByb2Nlc3MnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9wYXJzZUxpc3QgKHZhbDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdmFsLnNwbGl0KCcsJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2hlY2tBbmRDb3VudFJlbW90ZXMgKGJyb3dzZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCByZW1vdGVNYXRjaCA9IGJyb3dzZXIubWF0Y2goUkVNT1RFX0FMSUFTX1JFKTtcblxuICAgICAgICBpZiAocmVtb3RlTWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3RlQ291bnQgKz0gcGFyc2VJbnQocmVtb3RlTWF0Y2hbMV0sIDEwKSB8fCAxO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgX3BhcnNlRmlsdGVyaW5nT3B0aW9ucyAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMudGVzdEdyZXApXG4gICAgICAgICAgICB0aGlzLm9wdHMudGVzdEdyZXAgPSBnZXRHcmVwT3B0aW9ucygnLS10ZXN0LWdyZXAnLCB0aGlzLm9wdHMudGVzdEdyZXAgYXMgc3RyaW5nKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRzLmZpeHR1cmVHcmVwKVxuICAgICAgICAgICAgdGhpcy5vcHRzLmZpeHR1cmVHcmVwID0gZ2V0R3JlcE9wdGlvbnMoJy0tZml4dHVyZS1ncmVwJywgdGhpcy5vcHRzLmZpeHR1cmVHcmVwIGFzIHN0cmluZyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy50ZXN0TWV0YSlcbiAgICAgICAgICAgIHRoaXMub3B0cy50ZXN0TWV0YSA9IGF3YWl0IGdldE1ldGFPcHRpb25zKCctLXRlc3QtbWV0YScsIHRoaXMub3B0cy50ZXN0TWV0YSBhcyBzdHJpbmcpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZml4dHVyZU1ldGEpXG4gICAgICAgICAgICB0aGlzLm9wdHMuZml4dHVyZU1ldGEgPSBhd2FpdCBnZXRNZXRhT3B0aW9ucygnLS1maXh0dXJlLW1ldGEnLCB0aGlzLm9wdHMuZml4dHVyZU1ldGEgYXMgc3RyaW5nKTtcblxuICAgICAgICB0aGlzLm9wdHMuZmlsdGVyID0gZ2V0RmlsdGVyRm4odGhpcy5vcHRzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9wYXJzZUFwcEluaXREZWxheSAoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXBwSW5pdERlbGF5KSB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk5lZ2F0aXZlTnVtYmVyU3RyaW5nLCBudWxsLCAnVGVzdGVkIGFwcCBpbml0aWFsaXphdGlvbiBkZWxheScsIHRoaXMub3B0cy5hcHBJbml0RGVsYXkpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdHMuYXBwSW5pdERlbGF5ID0gcGFyc2VJbnQodGhpcy5vcHRzLmFwcEluaXREZWxheSBhcyBzdHJpbmcsIDEwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3BhcnNlU2VsZWN0b3JUaW1lb3V0ICgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zZWxlY3RvclRpbWVvdXQpIHtcbiAgICAgICAgICAgIGFzc2VydFR5cGUoaXMubm9uTmVnYXRpdmVOdW1iZXJTdHJpbmcsIG51bGwsICdTZWxlY3RvciB0aW1lb3V0JywgdGhpcy5vcHRzLnNlbGVjdG9yVGltZW91dCk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0cy5zZWxlY3RvclRpbWVvdXQgPSBwYXJzZUludCh0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0IGFzIHN0cmluZywgMTApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VBc3NlcnRpb25UaW1lb3V0ICgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hc3NlcnRpb25UaW1lb3V0KSB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk5lZ2F0aXZlTnVtYmVyU3RyaW5nLCBudWxsLCAnQXNzZXJ0aW9uIHRpbWVvdXQnLCB0aGlzLm9wdHMuYXNzZXJ0aW9uVGltZW91dCk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0cy5hc3NlcnRpb25UaW1lb3V0ID0gcGFyc2VJbnQodGhpcy5vcHRzLmFzc2VydGlvblRpbWVvdXQgYXMgc3RyaW5nLCAxMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9wYXJzZVBhZ2VMb2FkVGltZW91dCAoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0KSB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk5lZ2F0aXZlTnVtYmVyU3RyaW5nLCBudWxsLCAnUGFnZSBsb2FkIHRpbWVvdXQnLCB0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0KTtcblxuICAgICAgICAgICAgdGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dCA9IHBhcnNlSW50KHRoaXMub3B0cy5wYWdlTG9hZFRpbWVvdXQgYXMgc3RyaW5nLCAxMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9wYXJzZVNwZWVkICgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zcGVlZClcbiAgICAgICAgICAgIHRoaXMub3B0cy5zcGVlZCA9IHBhcnNlRmxvYXQodGhpcy5vcHRzLnNwZWVkIGFzIHN0cmluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VDb25jdXJyZW5jeSAoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuY29uY3VycmVuY3kpXG4gICAgICAgICAgICB0aGlzLm9wdHMuY29uY3VycmVuY3kgPSBwYXJzZUludCh0aGlzLm9wdHMuY29uY3VycmVuY3kgYXMgc3RyaW5nLCAxMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VQb3J0cyAoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMucG9ydHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFBvcnRzID0gKHRoaXMub3B0cy5wb3J0cyBhcyBzdHJpbmcpIC8qIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXh0cmEtcGFyZW5zICovXG4gICAgICAgICAgICAgICAgLnNwbGl0KCcsJylcbiAgICAgICAgICAgICAgICAubWFwKENMSUFyZ3VtZW50UGFyc2VyLl9wYXJzZVBvcnROdW1iZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFyc2VkUG9ydHMubGVuZ3RoIDwgMilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLnBvcnRzT3B0aW9uUmVxdWlyZXNUd29OdW1iZXJzKTtcblxuICAgICAgICAgICAgdGhpcy5vcHRzLnBvcnRzID0gcGFyc2VkUG9ydHMgYXMgbnVtYmVyW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9wYXJzZUJyb3dzZXJzRnJvbUFyZ3MgKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBicm93c2Vyc0FyZyA9IHRoaXMucHJvZ3JhbS5hcmdzWzBdIHx8ICcnO1xuXG4gICAgICAgIHRoaXMub3B0cy5icm93c2VycyA9IHNwbGl0UXVvdGVkVGV4dChicm93c2Vyc0FyZywgJywnKVxuICAgICAgICAgICAgLmZpbHRlcihicm93c2VyID0+IGJyb3dzZXIgJiYgdGhpcy5fY2hlY2tBbmRDb3VudFJlbW90ZXMoYnJvd3NlcikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBfcGFyc2VTc2xPcHRpb25zICgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zc2wpXG4gICAgICAgICAgICB0aGlzLm9wdHMuc3NsID0gYXdhaXQgZ2V0U1NMT3B0aW9ucyh0aGlzLm9wdHMuc3NsIGFzIHN0cmluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcGFyc2VSZXBvcnRlcnMgKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCByZXBvcnRlcnMgPSB0aGlzLm9wdHMucmVwb3J0ZXIgPyAodGhpcy5vcHRzLnJlcG9ydGVyIGFzIHN0cmluZykuc3BsaXQoJywnKSA6IFtdOyAvKiBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV4dHJhLXBhcmVucyovXG5cbiAgICAgICAgdGhpcy5vcHRzLnJlcG9ydGVyID0gcmVwb3J0ZXJzLm1hcCgocmVwb3J0ZXI6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VwYXJhdG9ySW5kZXggPSByZXBvcnRlci5pbmRleE9mKCc6Jyk7XG5cbiAgICAgICAgICAgIGlmIChzZXBhcmF0b3JJbmRleCA8IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbmFtZTogcmVwb3J0ZXIgfTtcblxuICAgICAgICAgICAgY29uc3QgbmFtZSAgID0gcmVwb3J0ZXIuc3Vic3RyaW5nKDAsIHNlcGFyYXRvckluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IHJlcG9ydGVyLnN1YnN0cmluZyhzZXBhcmF0b3JJbmRleCArIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4geyBuYW1lLCBvdXRwdXQgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VGaWxlTGlzdCAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3B0cy5zcmMgPSB0aGlzLnByb2dyYW0uYXJncy5zbGljZSgxKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9wYXJzZVNjcmVlbnNob3RPcHRpb25zICgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zY3JlZW5zaG90cylcbiAgICAgICAgICAgIHRoaXMub3B0cy5zY3JlZW5zaG90cyA9IGF3YWl0IGdldFNjcmVlbnNob3RPcHRpb25zKHRoaXMub3B0cy5zY3JlZW5zaG90cyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMub3B0cy5zY3JlZW5zaG90cyA9IHt9O1xuXG4gICAgICAgIGlmICghaGFzKHRoaXMub3B0cy5zY3JlZW5zaG90cywgU0NSRUVOU0hPVF9PUFRJT05fTkFNRVMucGF0aFBhdHRlcm4pICYmIHRoaXMub3B0cy5zY3JlZW5zaG90UGF0aFBhdHRlcm4pXG4gICAgICAgICAgICB0aGlzLm9wdHMuc2NyZWVuc2hvdHNbU0NSRUVOU0hPVF9PUFRJT05fTkFNRVMucGF0aFBhdHRlcm5dID0gdGhpcy5vcHRzLnNjcmVlbnNob3RQYXRoUGF0dGVybjtcblxuICAgICAgICBpZiAoIWhhcyh0aGlzLm9wdHMuc2NyZWVuc2hvdHMsIFNDUkVFTlNIT1RfT1BUSU9OX05BTUVTLnRha2VPbkZhaWxzKSAmJiB0aGlzLm9wdHMuc2NyZWVuc2hvdHNPbkZhaWxzKVxuICAgICAgICAgICAgdGhpcy5vcHRzLnNjcmVlbnNob3RzW1NDUkVFTlNIT1RfT1BUSU9OX05BTUVTLnRha2VPbkZhaWxzXSA9IHRoaXMub3B0cy5zY3JlZW5zaG90c09uRmFpbHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcGFyc2VWaWRlb09wdGlvbnMgKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnZpZGVvT3B0aW9ucylcbiAgICAgICAgICAgIHRoaXMub3B0cy52aWRlb09wdGlvbnMgPSBhd2FpdCBnZXRWaWRlb09wdGlvbnModGhpcy5vcHRzLnZpZGVvT3B0aW9ucyBhcyBzdHJpbmcpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMudmlkZW9FbmNvZGluZ09wdGlvbnMpXG4gICAgICAgICAgICB0aGlzLm9wdHMudmlkZW9FbmNvZGluZ09wdGlvbnMgPSBhd2FpdCBnZXRWaWRlb09wdGlvbnModGhpcy5vcHRzLnZpZGVvRW5jb2RpbmdPcHRpb25zIGFzIHN0cmluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VMaXN0QnJvd3NlcnMgKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBsaXN0QnJvd3Nlck9wdGlvbiA9IHRoaXMub3B0cy5saXN0QnJvd3NlcnM7XG5cbiAgICAgICAgdGhpcy5vcHRzLmxpc3RCcm93c2VycyA9ICEhdGhpcy5vcHRzLmxpc3RCcm93c2VycztcblxuICAgICAgICBpZiAoIXRoaXMub3B0cy5saXN0QnJvd3NlcnMpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5vcHRzLnByb3ZpZGVyTmFtZSA9IHR5cGVvZiBsaXN0QnJvd3Nlck9wdGlvbiA9PT0gJ3N0cmluZycgPyBsaXN0QnJvd3Nlck9wdGlvbiA6ICdsb2NhbGx5LWluc3RhbGxlZCc7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHBhcnNlIChhcmd2OiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnByb2dyYW0ucGFyc2UoYXJndik7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudGFsLnBhcnNlKGFyZ3YpO1xuXG4gICAgICAgIHRoaXMuYXJncyA9IHRoaXMucHJvZ3JhbS5hcmdzO1xuXG4gICAgICAgIHRoaXMub3B0cyA9IHsgLi4udGhpcy5leHBlcmltZW50YWwub3B0cygpLCAuLi50aGlzLnByb2dyYW0ub3B0cygpIH07XG5cbiAgICAgICAgdGhpcy5fcGFyc2VMaXN0QnJvd3NlcnMoKTtcblxuICAgICAgICAvLyBOT1RFOiB0aGUgJy0tbGlzdC1icm93c2Vycycgb3B0aW9uIG9ubHkgbGlzdHMgYnJvd3NlcnMgYW5kIGltbWVkaWF0ZWx5IGV4aXRzIHRoZSBhcHAuXG4gICAgICAgIC8vIFRoZXJlZm9yZSwgd2UgZG9uJ3QgbmVlZCB0byBwcm9jZXNzIG90aGVyIGFyZ3VtZW50cy5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5saXN0QnJvd3NlcnMpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fcGFyc2VTZWxlY3RvclRpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NlcnRpb25UaW1lb3V0KCk7XG4gICAgICAgIHRoaXMuX3BhcnNlUGFnZUxvYWRUaW1lb3V0KCk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXBwSW5pdERlbGF5KCk7XG4gICAgICAgIHRoaXMuX3BhcnNlU3BlZWQoKTtcbiAgICAgICAgdGhpcy5fcGFyc2VQb3J0cygpO1xuICAgICAgICB0aGlzLl9wYXJzZUJyb3dzZXJzRnJvbUFyZ3MoKTtcbiAgICAgICAgdGhpcy5fcGFyc2VDb25jdXJyZW5jeSgpO1xuICAgICAgICB0aGlzLl9wYXJzZUZpbGVMaXN0KCk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fcGFyc2VGaWx0ZXJpbmdPcHRpb25zKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3BhcnNlU2NyZWVuc2hvdE9wdGlvbnMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fcGFyc2VWaWRlb09wdGlvbnMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fcGFyc2VTc2xPcHRpb25zKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3BhcnNlUmVwb3J0ZXJzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFJ1bk9wdGlvbnMgKCk6IFJ1bm5lclJ1bk9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIFJVTl9PUFRJT05fTkFNRVMuZm9yRWFjaChvcHRpb25OYW1lID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25OYW1lIGluIHRoaXMub3B0cylcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIGEgaGFjayB0byBhZGQgYW4gaW5kZXggc2lnbmF0dXJlIHRvIGludGVyZmFjZVxuICAgICAgICAgICAgICAgIHJlc3VsdFtvcHRpb25OYW1lXSA9IHRoaXMub3B0c1tvcHRpb25OYW1lXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdCBhcyBSdW5uZXJSdW5PcHRpb25zO1xuICAgIH1cbn1cbiJdfQ==