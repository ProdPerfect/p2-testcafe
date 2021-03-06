"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const option_names_1 = __importDefault(require("../configuration/option-names"));
const runtime_1 = require("../errors/runtime");
// NOTE: Load the provider pool lazily to reduce startup time
const lazyRequire = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');
async function getBrowserInfo(browser) {
    try {
        return {
            error: null,
            info: await browserProviderPool.getBrowserInfo(browser)
        };
    }
    catch (err) {
        return {
            error: err,
            info: null
        };
    }
}
async function default_1(args, configuration) {
    const browsersOption = configuration.getOption(option_names_1.default.browsers);
    if (!args.opts.browsers || !args.opts.browsers.length)
        return { browsers: [], sources: args.opts.src };
    if (!browsersOption || !browsersOption.length)
        return { browsers: args.opts.browsers, sources: args.opts.src };
    const browserInfo = await Promise.all(args.opts.browsers.map(browser => getBrowserInfo(browser)));
    const [parsedInfo, failedInfo] = lodash_1.partition(browserInfo, info => !info.error);
    if (parsedInfo.length === browserInfo.length)
        return { browsers: args.opts.browsers, sources: args.opts.src };
    if (!parsedInfo.length)
        return { browsers: [], sources: [args.args[0], ...args.opts.src] };
    throw new runtime_1.CompositeError(failedInfo.map(info => info.error));
}
exports.default = default_1;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycmVjdC1icm93c2Vycy1hbmQtc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY29ycmVjdC1icm93c2Vycy1hbmQtc291cmNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1DQUFtQztBQUNuQyxpRkFBeUQ7QUFDekQsK0NBQW1EO0FBRW5ELDZEQUE2RDtBQUM3RCxNQUFNLFdBQVcsR0FBVyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUQsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUdwRSxLQUFLLFVBQVUsY0FBYyxDQUFFLE9BQU87SUFDbEMsSUFBSTtRQUNBLE9BQU87WUFDSCxLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRyxNQUFNLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7U0FDM0QsQ0FBQztLQUNMO0lBQ0QsT0FBTyxHQUFHLEVBQUU7UUFDUixPQUFPO1lBQ0gsS0FBSyxFQUFFLEdBQUc7WUFDVixJQUFJLEVBQUcsSUFBSTtTQUNkLENBQUM7S0FDTDtBQUNMLENBQUM7QUFFYyxLQUFLLG9CQUFXLElBQUksRUFBRSxhQUFhO0lBQzlDLE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsc0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV0RSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO1FBQ2pELE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRXBELElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTTtRQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRXBFLE1BQU0sV0FBVyxHQUFnQixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLGtCQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFN0UsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxNQUFNO1FBQ3hDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFcEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO1FBQ2xCLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFFdkUsTUFBTSxJQUFJLHdCQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFuQkQsNEJBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGFydGl0aW9uIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBPUFRJT05fTkFNRVMgZnJvbSAnLi4vY29uZmlndXJhdGlvbi9vcHRpb24tbmFtZXMnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMvcnVudGltZSc7XG5cbi8vIE5PVEU6IExvYWQgdGhlIHByb3ZpZGVyIHBvb2wgbGF6aWx5IHRvIHJlZHVjZSBzdGFydHVwIHRpbWVcbmNvbnN0IGxhenlSZXF1aXJlICAgICAgICAgPSByZXF1aXJlKCdpbXBvcnQtbGF6eScpKHJlcXVpcmUpO1xuY29uc3QgYnJvd3NlclByb3ZpZGVyUG9vbCA9IGxhenlSZXF1aXJlKCcuLi9icm93c2VyL3Byb3ZpZGVyL3Bvb2wnKTtcblxuXG5hc3luYyBmdW5jdGlvbiBnZXRCcm93c2VySW5mbyAoYnJvd3Nlcikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGluZm86ICBhd2FpdCBicm93c2VyUHJvdmlkZXJQb29sLmdldEJyb3dzZXJJbmZvKGJyb3dzZXIpXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgICAgICBpbmZvOiAgbnVsbFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKGFyZ3MsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICBjb25zdCBicm93c2Vyc09wdGlvbiA9IGNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5icm93c2Vycyk7XG5cbiAgICBpZiAoIWFyZ3Mub3B0cy5icm93c2VycyB8fCAhYXJncy5vcHRzLmJyb3dzZXJzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHsgYnJvd3NlcnM6IFtdLCBzb3VyY2VzOiBhcmdzLm9wdHMuc3JjIH07XG5cbiAgICBpZiAoIWJyb3dzZXJzT3B0aW9uIHx8ICFicm93c2Vyc09wdGlvbi5sZW5ndGgpXG4gICAgICAgIHJldHVybiB7IGJyb3dzZXJzOiBhcmdzLm9wdHMuYnJvd3NlcnMsIHNvdXJjZXM6IGFyZ3Mub3B0cy5zcmMgfTtcblxuICAgIGNvbnN0IGJyb3dzZXJJbmZvICAgICAgICAgICAgICA9IGF3YWl0IFByb21pc2UuYWxsKGFyZ3Mub3B0cy5icm93c2Vycy5tYXAoYnJvd3NlciA9PiBnZXRCcm93c2VySW5mbyhicm93c2VyKSkpO1xuICAgIGNvbnN0IFtwYXJzZWRJbmZvLCBmYWlsZWRJbmZvXSA9IHBhcnRpdGlvbihicm93c2VySW5mbywgaW5mbyA9PiAhaW5mby5lcnJvcik7XG5cbiAgICBpZiAocGFyc2VkSW5mby5sZW5ndGggPT09IGJyb3dzZXJJbmZvLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHsgYnJvd3NlcnM6IGFyZ3Mub3B0cy5icm93c2Vycywgc291cmNlczogYXJncy5vcHRzLnNyYyB9O1xuXG4gICAgaWYgKCFwYXJzZWRJbmZvLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHsgYnJvd3NlcnM6IFtdLCBzb3VyY2VzOiBbYXJncy5hcmdzWzBdLCAuLi5hcmdzLm9wdHMuc3JjXSB9O1xuXG4gICAgdGhyb3cgbmV3IENvbXBvc2l0ZUVycm9yKGZhaWxlZEluZm8ubWFwKGluZm8gPT4gaW5mby5lcnJvcikpO1xufVxuIl19