"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const builder_symbol_1 = __importDefault(require("../builder-symbol"));
const snapshot_properties_1 = require("./snapshot-properties");
const get_callsite_1 = require("../../errors/get-callsite");
const client_function_builder_1 = __importDefault(require("../client-function-builder"));
const re_executable_promise_1 = __importDefault(require("../../utils/re-executable-promise"));
const type_assertions_1 = require("../../errors/runtime/type-assertions");
const make_reg_exp_1 = __importDefault(require("../../utils/make-reg-exp"));
const selector_text_filter_1 = __importDefault(require("./selector-text-filter"));
const selector_attribute_filter_1 = __importDefault(require("./selector-attribute-filter"));
const prepare_api_args_1 = __importDefault(require("./prepare-api-args"));
const VISIBLE_PROP_NAME = 'visible';
const filterNodes = (new client_function_builder_1.default((nodes, filter, querySelectorRoot, originNode, ...filterArgs) => {
    if (typeof filter === 'number') {
        const matchingNode = filter < 0 ? nodes[nodes.length + filter] : nodes[filter];
        return matchingNode ? [matchingNode] : [];
    }
    const result = [];
    if (typeof filter === 'string') {
        // NOTE: we can search for elements only in document or element.
        if (querySelectorRoot.nodeType !== 1 && querySelectorRoot.nodeType !== 9)
            return null;
        const matching = querySelectorRoot.querySelectorAll(filter);
        const matchingArr = [];
        for (let i = 0; i < matching.length; i++)
            matchingArr.push(matching[i]);
        filter = node => matchingArr.indexOf(node) > -1;
    }
    if (typeof filter === 'function') {
        for (let j = 0; j < nodes.length; j++) {
            if (filter(nodes[j], j, originNode, ...filterArgs))
                result.push(nodes[j]);
        }
    }
    return result;
})).getFunction();
const expandSelectorResults = (new client_function_builder_1.default((selector, populateDerivativeNodes) => {
    const nodes = selector();
    if (!nodes.length)
        return null;
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
        const derivativeNodes = populateDerivativeNodes(nodes[i]);
        if (derivativeNodes) {
            for (let j = 0; j < derivativeNodes.length; j++) {
                if (result.indexOf(derivativeNodes[j]) < 0)
                    result.push(derivativeNodes[j]);
            }
        }
    }
    return result;
})).getFunction();
async function getSnapshot(getSelector, callsite, SelectorBuilder, getVisibleValueMode) {
    let node = null;
    const selector = new SelectorBuilder(getSelector(), { getVisibleValueMode, needError: true }, { instantiation: 'Selector' }).getFunction();
    try {
        node = await selector();
    }
    catch (err) {
        err.callsite = callsite;
        throw err;
    }
    return node;
}
function assertAddCustomDOMPropertiesOptions(properties) {
    type_assertions_1.assertType(type_assertions_1.is.nonNullObject, 'addCustomDOMProperties', '"addCustomDOMProperties" option', properties);
    Object.keys(properties).forEach(prop => {
        type_assertions_1.assertType(type_assertions_1.is.function, 'addCustomDOMProperties', `Custom DOM properties method '${prop}'`, properties[prop]);
    });
}
function assertAddCustomMethods(properties, opts) {
    type_assertions_1.assertType(type_assertions_1.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', properties);
    if (opts !== void 0)
        type_assertions_1.assertType(type_assertions_1.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', opts);
    Object.keys(properties).forEach(prop => {
        type_assertions_1.assertType(type_assertions_1.is.function, 'addCustomMethods', `Custom method '${prop}'`, properties[prop]);
    });
}
function getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, additionalDependencies) {
    return Object.assign({}, options, { selectorFn, apiFn, filter, additionalDependencies });
}
function addSnapshotProperties(obj, getSelector, SelectorBuilder, properties) {
    properties.forEach(prop => {
        Object.defineProperty(obj, prop, {
            get: () => {
                const callsite = get_callsite_1.getCallsiteForMethod('get');
                return re_executable_promise_1.default.fromFn(async () => {
                    const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
                    return snapshot[prop];
                });
            }
        });
    });
}
function addVisibleProperty({ obj, getSelector, SelectorBuilder }) {
    Object.defineProperty(obj, VISIBLE_PROP_NAME, {
        get: () => {
            const callsite = get_callsite_1.getCallsiteForMethod('get');
            return re_executable_promise_1.default.fromFn(async () => {
                const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder, true);
                return !!snapshot && snapshot[VISIBLE_PROP_NAME];
            });
        }
    });
}
function addCustomMethods(obj, getSelector, SelectorBuilder, customMethods) {
    const customMethodProps = customMethods ? Object.keys(customMethods) : [];
    customMethodProps.forEach(prop => {
        const { returnDOMNodes = false, method } = customMethods[prop];
        const dependencies = {
            customMethod: method,
            selector: getSelector()
        };
        const callsiteNames = { instantiation: prop };
        if (returnDOMNodes) {
            obj[prop] = (...args) => {
                const selectorFn = () => {
                    /* eslint-disable no-undef */
                    const nodes = selector();
                    return customMethod.apply(customMethod, [nodes].concat(args));
                    /* eslint-enable no-undef */
                };
                const apiFn = prepare_api_args_1.default(prop, ...args);
                const filter = () => true;
                const additionalDependencies = {
                    args,
                    customMethod: method
                };
                return createDerivativeSelectorWithFilter({ getSelector, SelectorBuilder, selectorFn, apiFn, filter, additionalDependencies });
            };
        }
        else {
            obj[prop] = (new client_function_builder_1.default((...args) => {
                /* eslint-disable no-undef */
                const node = selector();
                return customMethod.apply(customMethod, [node].concat(args));
                /* eslint-enable no-undef */
            }, { dependencies }, callsiteNames)).getFunction();
        }
    });
}
exports.addCustomMethods = addCustomMethods;
function prepareSnapshotPropertyList(customDOMProperties) {
    let properties = [...snapshot_properties_1.SNAPSHOT_PROPERTIES];
    // NOTE: The 'visible' snapshot property has a separate handler.
    lodash_1.pull(properties, VISIBLE_PROP_NAME);
    if (customDOMProperties)
        properties = properties.concat(Object.keys(customDOMProperties));
    return properties;
}
function addSnapshotPropertyShorthands({ obj, getSelector, SelectorBuilder, customDOMProperties, customMethods }) {
    const properties = prepareSnapshotPropertyList(customDOMProperties);
    addSnapshotProperties(obj, getSelector, SelectorBuilder, properties);
    addCustomMethods(obj, getSelector, SelectorBuilder, customMethods);
    obj.getStyleProperty = prop => {
        const callsite = get_callsite_1.getCallsiteForMethod('getStyleProperty');
        return re_executable_promise_1.default.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
            return snapshot.style ? snapshot.style[prop] : void 0;
        });
    };
    obj.getAttribute = attrName => {
        const callsite = get_callsite_1.getCallsiteForMethod('getAttribute');
        return re_executable_promise_1.default.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
            return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
        });
    };
    obj.hasAttribute = attrName => {
        const callsite = get_callsite_1.getCallsiteForMethod('hasAttribute');
        return re_executable_promise_1.default.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
            return snapshot.attributes ? snapshot.attributes.hasOwnProperty(attrName) : false;
        });
    };
    obj.getBoundingClientRectProperty = prop => {
        const callsite = get_callsite_1.getCallsiteForMethod('getBoundingClientRectProperty');
        return re_executable_promise_1.default.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
            return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
        });
    };
    obj.hasClass = name => {
        const callsite = get_callsite_1.getCallsiteForMethod('hasClass');
        return re_executable_promise_1.default.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);
            return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
        });
    };
}
function createCounter(getSelector, SelectorBuilder) {
    const builder = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    const counter = builder.getFunction();
    const callsite = get_callsite_1.getCallsiteForMethod('get');
    return async () => {
        try {
            return await counter();
        }
        catch (err) {
            err.callsite = callsite;
            throw err;
        }
    };
}
function addCounterProperties({ obj, getSelector, SelectorBuilder }) {
    Object.defineProperty(obj, 'count', {
        get: () => {
            const counter = createCounter(getSelector, SelectorBuilder);
            return re_executable_promise_1.default.fromFn(() => counter());
        }
    });
    Object.defineProperty(obj, 'exists', {
        get: () => {
            const counter = createCounter(getSelector, SelectorBuilder);
            return re_executable_promise_1.default.fromFn(async () => await counter() > 0);
        }
    });
}
function convertFilterToClientFunctionIfNecessary(callsiteName, filter, dependencies) {
    if (typeof filter === 'function') {
        const builder = filter[builder_symbol_1.default];
        const fn = builder ? builder.fn : filter;
        const options = builder ? lodash_1.assign({}, builder.options, { dependencies }) : { dependencies };
        return (new client_function_builder_1.default(fn, options, { instantiation: callsiteName })).getFunction();
    }
    return filter;
}
function createDerivativeSelectorWithFilter({ getSelector, SelectorBuilder, selectorFn, apiFn, filter, additionalDependencies }) {
    const collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });
    const customDOMProperties = collectionModeSelectorBuilder.options.customDOMProperties;
    const customMethods = collectionModeSelectorBuilder.options.customMethods;
    let dependencies = {
        selector: collectionModeSelectorBuilder.getFunction(),
        filter: filter,
        filterNodes: filterNodes
    };
    const { boundTestRun, timeout, visibilityCheck, apiFnChain } = collectionModeSelectorBuilder.options;
    dependencies = lodash_1.assign(dependencies, additionalDependencies);
    const builder = new SelectorBuilder(selectorFn, {
        dependencies,
        customDOMProperties,
        customMethods,
        boundTestRun,
        timeout,
        visibilityCheck,
        apiFnChain,
        apiFn
    }, { instantiation: 'Selector' });
    return builder.getFunction();
}
const filterByText = convertFilterToClientFunctionIfNecessary('filter', selector_text_filter_1.default);
const filterByAttr = convertFilterToClientFunctionIfNecessary('filter', selector_attribute_filter_1.default);
function ensureRegExpContext(str) {
    // NOTE: if a regexp is created in a separate context (via the 'vm' module) we
    // should wrap it with new RegExp() to make the `instanceof RegExp` check successful.
    if (typeof str !== 'string' && !(str instanceof RegExp))
        return new RegExp(str);
    return str;
}
function addFilterMethods(options) {
    const { obj, getSelector, SelectorBuilder } = options;
    obj.nth = index => {
        type_assertions_1.assertType(type_assertions_1.is.number, 'nth', '"index" argument', index);
        const apiFn = prepare_api_args_1.default('nth', index);
        const builder = new SelectorBuilder(getSelector(), { index, apiFn }, { instantiation: 'Selector' });
        return builder.getFunction();
    };
    obj.withText = text => {
        type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.regExp], 'withText', '"text" argument', text);
        const apiFn = prepare_api_args_1.default('withText', text);
        text = ensureRegExpContext(text);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();
            if (!nodes.length)
                return null;
            return filterNodes(nodes, filter, document, void 0, textRe);
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByText, { textRe: make_reg_exp_1.default(text) });
        return createDerivativeSelectorWithFilter(args);
    };
    obj.withExactText = text => {
        type_assertions_1.assertType(type_assertions_1.is.string, 'withExactText', '"text" argument', text);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();
            if (!nodes.length)
                return null;
            return filterNodes(nodes, filter, document, void 0, exactText);
            /* eslint-enable no-undef */
        };
        const apiFn = prepare_api_args_1.default('withExactText', text);
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByText, { exactText: text });
        return createDerivativeSelectorWithFilter(args);
    };
    obj.withAttribute = (attrName, attrValue) => {
        type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.regExp], 'withAttribute', '"attrName" argument', attrName);
        const apiFn = prepare_api_args_1.default('withAttribute', attrName, attrValue);
        attrName = ensureRegExpContext(attrName);
        if (attrValue !== void 0) {
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.regExp], 'withAttribute', '"attrValue" argument', attrValue);
            attrValue = ensureRegExpContext(attrValue);
        }
        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();
            if (!nodes.length)
                return null;
            return filterNodes(nodes, filter, document, void 0, attrName, attrValue);
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByAttr, {
            attrName,
            attrValue
        });
        return createDerivativeSelectorWithFilter(args);
    };
    obj.filter = (filter, dependencies) => {
        type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function], 'filter', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('filter', filter);
        filter = convertFilterToClientFunctionIfNecessary('filter', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();
            if (!nodes.length)
                return null;
            return filterNodes(nodes, filter, document, void 0);
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter);
        return createDerivativeSelectorWithFilter(args);
    };
    obj.filterVisible = () => {
        const apiFn = prepare_api_args_1.default('filterVisible');
        const builder = new SelectorBuilder(getSelector(), { filterVisible: true, apiFn }, { instantiation: 'Selector' });
        return builder.getFunction();
    };
    obj.filterHidden = () => {
        const apiFn = prepare_api_args_1.default('filterHidden');
        const builder = new SelectorBuilder(getSelector(), { filterHidden: true, apiFn }, { instantiation: 'Selector' });
        return builder.getFunction();
    };
}
function addCustomDOMPropertiesMethod({ obj, getSelector, SelectorBuilder }) {
    obj.addCustomDOMProperties = customDOMProperties => {
        assertAddCustomDOMPropertiesOptions(customDOMProperties);
        const builder = new SelectorBuilder(getSelector(), { customDOMProperties }, { instantiation: 'Selector' });
        return builder.getFunction();
    };
}
function addCustomMethodsMethod({ obj, getSelector, SelectorBuilder }) {
    obj.addCustomMethods = function (methods, opts) {
        assertAddCustomMethods(methods, opts);
        const customMethods = {};
        Object.keys(methods).forEach(methodName => {
            customMethods[methodName] = {
                method: methods[methodName],
                returnDOMNodes: opts && !!opts.returnDOMNodes
            };
        });
        const builder = new SelectorBuilder(getSelector(), { customMethods }, { instantiation: 'Selector' });
        return builder.getFunction();
    };
}
function addHierarchicalSelectors(options) {
    const { obj } = options;
    // Find
    obj.find = (filter, dependencies) => {
        type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function], 'find', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('find', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                if (typeof filter === 'string') {
                    return typeof node.querySelectorAll === 'function' ?
                        node.querySelectorAll(filter) :
                        null;
                }
                const results = [];
                const visitNode = currentNode => {
                    const cnLength = currentNode.childNodes.length;
                    for (let i = 0; i < cnLength; i++) {
                        const child = currentNode.childNodes[i];
                        results.push(child);
                        visitNode(child);
                    }
                };
                visitNode(node);
                return filterNodes(results, filter, null, node);
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
    // Parent
    obj.parent = (filter, dependencies) => {
        if (filter !== void 0)
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function, type_assertions_1.is.number], 'parent', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('parent', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parents = [];
                for (let parent = node.parentNode; parent; parent = parent.parentNode)
                    parents.push(parent);
                return filter !== void 0 ? filterNodes(parents, filter, document, node) : parents;
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
    // Child
    obj.child = (filter, dependencies) => {
        if (filter !== void 0)
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function, type_assertions_1.is.number], 'child', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('child', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const childElements = [];
                const cnLength = node.childNodes.length;
                for (let i = 0; i < cnLength; i++) {
                    const child = node.childNodes[i];
                    if (child.nodeType === 1)
                        childElements.push(child);
                }
                return filter !== void 0 ? filterNodes(childElements, filter, node, node) : childElements;
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
    // Sibling
    obj.sibling = (filter, dependencies) => {
        if (filter !== void 0)
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function, type_assertions_1.is.number], 'sibling', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('sibling', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;
                if (!parent)
                    return null;
                const siblings = [];
                const cnLength = parent.childNodes.length;
                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];
                    if (child.nodeType === 1 && child !== node)
                        siblings.push(child);
                }
                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
    // Next sibling
    obj.nextSibling = (filter, dependencies) => {
        if (filter !== void 0)
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function, type_assertions_1.is.number], 'nextSibling', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('nextSibling', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;
                if (!parent)
                    return null;
                const siblings = [];
                const cnLength = parent.childNodes.length;
                let afterNode = false;
                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];
                    if (child === node)
                        afterNode = true;
                    else if (afterNode && child.nodeType === 1)
                        siblings.push(child);
                }
                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
    // Prev sibling
    obj.prevSibling = (filter, dependencies) => {
        if (filter !== void 0)
            type_assertions_1.assertType([type_assertions_1.is.string, type_assertions_1.is.function, type_assertions_1.is.number], 'prevSibling', '"filter" argument', filter);
        const apiFn = prepare_api_args_1.default('prevSibling', filter);
        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);
        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;
                if (!parent)
                    return null;
                const siblings = [];
                const cnLength = parent.childNodes.length;
                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];
                    if (child === node)
                        break;
                    if (child.nodeType === 1)
                        siblings.push(child);
                }
                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });
        return createDerivativeSelectorWithFilter(args);
    };
}
function addAPI(selector, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    const options = { obj: selector, getSelector, SelectorBuilder, customDOMProperties, customMethods };
    addFilterMethods(options);
    addHierarchicalSelectors(options);
    addSnapshotPropertyShorthands(options);
    addCustomDOMPropertiesMethod(options);
    addCustomMethodsMethod(options);
    addCounterProperties(options);
    addVisibleProperty(options);
}
exports.addAPI = addAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQtZnVuY3Rpb25zL3NlbGVjdG9ycy9hZGQtYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbUNBQWdEO0FBQ2hELHVFQUE0RDtBQUM1RCwrREFBNEQ7QUFDNUQsNERBQWlFO0FBQ2pFLHlGQUErRDtBQUMvRCw4RkFBb0U7QUFDcEUsMEVBQXNFO0FBQ3RFLDRFQUFrRDtBQUNsRCxrRkFBd0Q7QUFDeEQsNEZBQWtFO0FBQ2xFLDBFQUFrRDtBQUVsRCxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUVwQyxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksaUNBQXFCLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxHQUFHLFVBQVUsRUFBRSxFQUFFO0lBQzNHLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQzVCLE1BQU0sWUFBWSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0UsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUM3QztJQUVELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVsQixJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUM1QixnRUFBZ0U7UUFDaEUsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsS0FBSyxDQUFDO1lBQ3BFLE9BQU8sSUFBSSxDQUFDO1FBRWhCLE1BQU0sUUFBUSxHQUFNLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFD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LEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ3RGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsNEJBQTRCO1FBQ2hDLENBQUMsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFHLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQztRQUV0RyxPQUFPLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFnQixNQUFNLENBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsYUFBYTtJQUM5RixNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsQ0FBQztJQUVwRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQix3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2Qyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBVkQsd0JBVUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NpZ24sIHB1bGwgYXMgcmVtb3ZlIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBjbGllbnRGdW5jdGlvbkJ1aWxkZXJTeW1ib2wgZnJvbSAnLi4vYnVpbGRlci1zeW1ib2wnO1xuaW1wb3J0IHsgU05BUFNIT1RfUFJPUEVSVElFUyB9IGZyb20gJy4vc25hcHNob3QtcHJvcGVydGllcyc7XG5pbXBvcnQgeyBnZXRDYWxsc2l0ZUZvck1ldGhvZCB9IGZyb20gJy4uLy4uL2Vycm9ycy9nZXQtY2FsbHNpdGUnO1xuaW1wb3J0IENsaWVudEZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi9jbGllbnQtZnVuY3Rpb24tYnVpbGRlcic7XG5pbXBvcnQgUmVFeGVjdXRhYmxlUHJvbWlzZSBmcm9tICcuLi8uLi91dGlscy9yZS1leGVjdXRhYmxlLXByb21pc2UnO1xuaW1wb3J0IHsgYXNzZXJ0VHlwZSwgaXMgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZS90eXBlLWFzc2VydGlvbnMnO1xuaW1wb3J0IG1ha2VSZWdFeHAgZnJvbSAnLi4vLi4vdXRpbHMvbWFrZS1yZWctZXhwJztcbmltcG9ydCBzZWxlY3RvclRleHRGaWx0ZXIgZnJvbSAnLi9zZWxlY3Rvci10ZXh0LWZpbHRlcic7XG5pbXBvcnQgc2VsZWN0b3JBdHRyaWJ1dGVGaWx0ZXIgZnJvbSAnLi9zZWxlY3Rvci1hdHRyaWJ1dGUtZmlsdGVyJztcbmltcG9ydCBwcmVwYXJlQXBpRm5BcmdzIGZyb20gJy4vcHJlcGFyZS1hcGktYXJncyc7XG5cbmNvbnN0IFZJU0lCTEVfUFJPUF9OQU1FID0gJ3Zpc2libGUnO1xuXG5jb25zdCBmaWx0ZXJOb2RlcyA9IChuZXcgQ2xpZW50RnVuY3Rpb25CdWlsZGVyKChub2RlcywgZmlsdGVyLCBxdWVyeVNlbGVjdG9yUm9vdCwgb3JpZ2luTm9kZSwgLi4uZmlsdGVyQXJncykgPT4ge1xuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBtYXRjaGluZ05vZGUgPSBmaWx0ZXIgPCAwID8gbm9kZXNbbm9kZXMubGVuZ3RoICsgZmlsdGVyXSA6IG5vZGVzW2ZpbHRlcl07XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTm9kZSA/IFttYXRjaGluZ05vZGVdIDogW107XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gTk9URTogd2UgY2FuIHNlYXJjaCBmb3IgZWxlbWVudHMgb25seSBpbiBkb2N1bWVudCBvciBlbGVtZW50LlxuICAgICAgICBpZiAocXVlcnlTZWxlY3RvclJvb3Qubm9kZVR5cGUgIT09IDEgJiYgcXVlcnlTZWxlY3RvclJvb3Qubm9kZVR5cGUgIT09IDkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtYXRjaGluZyAgICA9IHF1ZXJ5U2VsZWN0b3JSb290LnF1ZXJ5U2VsZWN0b3JBbGwoZmlsdGVyKTtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdBcnIgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hdGNoaW5nLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgbWF0Y2hpbmdBcnIucHVzaChtYXRjaGluZ1tpXSk7XG5cbiAgICAgICAgZmlsdGVyID0gbm9kZSA9PiBtYXRjaGluZ0Fyci5pbmRleE9mKG5vZGUpID4gLTE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2Rlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGZpbHRlcihub2Rlc1tqXSwgaiwgb3JpZ2luTm9kZSwgLi4uZmlsdGVyQXJncykpXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZXNbal0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn0pKS5nZXRGdW5jdGlvbigpO1xuXG5jb25zdCBleHBhbmRTZWxlY3RvclJlc3VsdHMgPSAobmV3IENsaWVudEZ1bmN0aW9uQnVpbGRlcigoc2VsZWN0b3IsIHBvcHVsYXRlRGVyaXZhdGl2ZU5vZGVzKSA9PiB7XG4gICAgY29uc3Qgbm9kZXMgPSBzZWxlY3RvcigpO1xuXG4gICAgaWYgKCFub2Rlcy5sZW5ndGgpXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRlcml2YXRpdmVOb2RlcyA9IHBvcHVsYXRlRGVyaXZhdGl2ZU5vZGVzKG5vZGVzW2ldKTtcblxuICAgICAgICBpZiAoZGVyaXZhdGl2ZU5vZGVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRlcml2YXRpdmVOb2Rlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaW5kZXhPZihkZXJpdmF0aXZlTm9kZXNbal0pIDwgMClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZGVyaXZhdGl2ZU5vZGVzW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG5cbn0pKS5nZXRGdW5jdGlvbigpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTbmFwc2hvdCAoZ2V0U2VsZWN0b3IsIGNhbGxzaXRlLCBTZWxlY3RvckJ1aWxkZXIsIGdldFZpc2libGVWYWx1ZU1vZGUpIHtcbiAgICBsZXQgbm9kZSAgICAgICA9IG51bGw7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgZ2V0VmlzaWJsZVZhbHVlTW9kZSwgbmVlZEVycm9yOiB0cnVlIH0sIHsgaW5zdGFudGlhdGlvbjogJ1NlbGVjdG9yJyB9KS5nZXRGdW5jdGlvbigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbm9kZSA9IGF3YWl0IHNlbGVjdG9yKCk7XG4gICAgfVxuXG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBlcnIuY2FsbHNpdGUgPSBjYWxsc2l0ZTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRBZGRDdXN0b21ET01Qcm9wZXJ0aWVzT3B0aW9ucyAocHJvcGVydGllcykge1xuICAgIGFzc2VydFR5cGUoaXMubm9uTnVsbE9iamVjdCwgJ2FkZEN1c3RvbURPTVByb3BlcnRpZXMnLCAnXCJhZGRDdXN0b21ET01Qcm9wZXJ0aWVzXCIgb3B0aW9uJywgcHJvcGVydGllcyk7XG5cbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLmZ1bmN0aW9uLCAnYWRkQ3VzdG9tRE9NUHJvcGVydGllcycsIGBDdXN0b20gRE9NIHByb3BlcnRpZXMgbWV0aG9kICcke3Byb3B9J2AsIHByb3BlcnRpZXNbcHJvcF0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRBZGRDdXN0b21NZXRob2RzIChwcm9wZXJ0aWVzLCBvcHRzKSB7XG4gICAgYXNzZXJ0VHlwZShpcy5ub25OdWxsT2JqZWN0LCAnYWRkQ3VzdG9tTWV0aG9kcycsICdcImFkZEN1c3RvbU1ldGhvZHNcIiBvcHRpb24nLCBwcm9wZXJ0aWVzKTtcblxuICAgIGlmIChvcHRzICE9PSB2b2lkIDApXG4gICAgICAgIGFzc2VydFR5cGUoaXMubm9uTnVsbE9iamVjdCwgJ2FkZEN1c3RvbU1ldGhvZHMnLCAnXCJhZGRDdXN0b21NZXRob2RzXCIgb3B0aW9uJywgb3B0cyk7XG5cbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLmZ1bmN0aW9uLCAnYWRkQ3VzdG9tTWV0aG9kcycsIGBDdXN0b20gbWV0aG9kICcke3Byb3B9J2AsIHByb3BlcnRpZXNbcHJvcF0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzIChvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCBhZGRpdGlvbmFsRGVwZW5kZW5jaWVzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHsgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgYWRkaXRpb25hbERlcGVuZGVuY2llcyB9KTtcbn1cblxuZnVuY3Rpb24gYWRkU25hcHNob3RQcm9wZXJ0aWVzIChvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIHtcbiAgICAgICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxzaXRlID0gZ2V0Q2FsbHNpdGVGb3JNZXRob2QoJ2dldCcpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNuYXBzaG90W3Byb3BdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkVmlzaWJsZVByb3BlcnR5ICh7IG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciB9KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgVklTSUJMRV9QUk9QX05BTUUsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdnZXQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldFNuYXBzaG90KGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiAhIXNuYXBzaG90ICYmIHNuYXBzaG90W1ZJU0lCTEVfUFJPUF9OQU1FXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRDdXN0b21NZXRob2RzIChvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIGN1c3RvbU1ldGhvZHMpIHtcbiAgICBjb25zdCBjdXN0b21NZXRob2RQcm9wcyA9IGN1c3RvbU1ldGhvZHMgPyBPYmplY3Qua2V5cyhjdXN0b21NZXRob2RzKSA6IFtdO1xuXG4gICAgY3VzdG9tTWV0aG9kUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgY29uc3QgeyByZXR1cm5ET01Ob2RlcyA9IGZhbHNlLCBtZXRob2QgfSA9IGN1c3RvbU1ldGhvZHNbcHJvcF07XG5cbiAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0ge1xuICAgICAgICAgICAgY3VzdG9tTWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBzZWxlY3RvcjogICAgIGdldFNlbGVjdG9yKClcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjYWxsc2l0ZU5hbWVzID0geyBpbnN0YW50aWF0aW9uOiBwcm9wIH07XG5cbiAgICAgICAgaWYgKHJldHVybkRPTU5vZGVzKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gc2VsZWN0b3IoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VzdG9tTWV0aG9kLmFwcGx5KGN1c3RvbU1ldGhvZCwgW25vZGVzXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncyhwcm9wLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSAoKSA9PiB0cnVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbERlcGVuZGVuY2llcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyxcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tTWV0aG9kOiBtZXRob2RcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoeyBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCBhZGRpdGlvbmFsRGVwZW5kZW5jaWVzIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IChuZXcgQ2xpZW50RnVuY3Rpb25CdWlsZGVyKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gc2VsZWN0b3IoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjdXN0b21NZXRob2QuYXBwbHkoY3VzdG9tTWV0aG9kLCBbbm9kZV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICB9LCB7IGRlcGVuZGVuY2llcyB9LCBjYWxsc2l0ZU5hbWVzKSkuZ2V0RnVuY3Rpb24oKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlU25hcHNob3RQcm9wZXJ0eUxpc3QgKGN1c3RvbURPTVByb3BlcnRpZXMpIHtcbiAgICBsZXQgcHJvcGVydGllcyA9IFsuLi5TTkFQU0hPVF9QUk9QRVJUSUVTXTtcblxuICAgIC8vIE5PVEU6IFRoZSAndmlzaWJsZScgc25hcHNob3QgcHJvcGVydHkgaGFzIGEgc2VwYXJhdGUgaGFuZGxlci5cbiAgICByZW1vdmUocHJvcGVydGllcywgVklTSUJMRV9QUk9QX05BTUUpO1xuXG4gICAgaWYgKGN1c3RvbURPTVByb3BlcnRpZXMpXG4gICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzLmNvbmNhdChPYmplY3Qua2V5cyhjdXN0b21ET01Qcm9wZXJ0aWVzKSk7XG5cbiAgICByZXR1cm4gcHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gYWRkU25hcHNob3RQcm9wZXJ0eVNob3J0aGFuZHMgKHsgb2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21ET01Qcm9wZXJ0aWVzLCBjdXN0b21NZXRob2RzIH0pIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gcHJlcGFyZVNuYXBzaG90UHJvcGVydHlMaXN0KGN1c3RvbURPTVByb3BlcnRpZXMpO1xuXG4gICAgYWRkU25hcHNob3RQcm9wZXJ0aWVzKG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciwgcHJvcGVydGllcyk7XG4gICAgYWRkQ3VzdG9tTWV0aG9kcyhvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIGN1c3RvbU1ldGhvZHMpO1xuXG4gICAgb2JqLmdldFN0eWxlUHJvcGVydHkgPSBwcm9wID0+IHtcbiAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnZ2V0U3R5bGVQcm9wZXJ0eScpO1xuXG4gICAgICAgIHJldHVybiBSZUV4ZWN1dGFibGVQcm9taXNlLmZyb21Gbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldFNuYXBzaG90KGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNuYXBzaG90LnN0eWxlID8gc25hcHNob3Quc3R5bGVbcHJvcF0gOiB2b2lkIDA7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvYmouZ2V0QXR0cmlidXRlID0gYXR0ck5hbWUgPT4ge1xuICAgICAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdnZXRBdHRyaWJ1dGUnKTtcblxuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5hdHRyaWJ1dGVzID8gc25hcHNob3QuYXR0cmlidXRlc1thdHRyTmFtZV0gOiB2b2lkIDA7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvYmouaGFzQXR0cmlidXRlID0gYXR0ck5hbWUgPT4ge1xuICAgICAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdoYXNBdHRyaWJ1dGUnKTtcblxuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5hdHRyaWJ1dGVzID8gc25hcHNob3QuYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkgOiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9iai5nZXRCb3VuZGluZ0NsaWVudFJlY3RQcm9wZXJ0eSA9IHByb3AgPT4ge1xuICAgICAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdnZXRCb3VuZGluZ0NsaWVudFJlY3RQcm9wZXJ0eScpO1xuXG4gICAgICAgIHJldHVybiBSZUV4ZWN1dGFibGVQcm9taXNlLmZyb21Gbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldFNuYXBzaG90KGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNuYXBzaG90LmJvdW5kaW5nQ2xpZW50UmVjdCA/IHNuYXBzaG90LmJvdW5kaW5nQ2xpZW50UmVjdFtwcm9wXSA6IHZvaWQgMDtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9iai5oYXNDbGFzcyA9IG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdoYXNDbGFzcycpO1xuXG4gICAgICAgIHJldHVybiBSZUV4ZWN1dGFibGVQcm9taXNlLmZyb21Gbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldFNuYXBzaG90KGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNuYXBzaG90LmNsYXNzTmFtZXMgPyBzbmFwc2hvdC5jbGFzc05hbWVzLmluZGV4T2YobmFtZSkgPiAtMSA6IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb3VudGVyIChnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyKSB7XG4gICAgY29uc3QgYnVpbGRlciAgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgY291bnRlck1vZGU6IHRydWUgfSwgeyBpbnN0YW50aWF0aW9uOiAnU2VsZWN0b3InIH0pO1xuICAgIGNvbnN0IGNvdW50ZXIgID0gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xuICAgIGNvbnN0IGNhbGxzaXRlID0gZ2V0Q2FsbHNpdGVGb3JNZXRob2QoJ2dldCcpO1xuXG4gICAgcmV0dXJuIGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBjb3VudGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBlcnIuY2FsbHNpdGUgPSBjYWxsc2l0ZTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFkZENvdW50ZXJQcm9wZXJ0aWVzICh7IG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciB9KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ2NvdW50Jywge1xuICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ZXIgPSBjcmVhdGVDb3VudGVyKGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oKCkgPT4gY291bnRlcigpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ2V4aXN0cycsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb3VudGVyID0gY3JlYXRlQ291bnRlcihnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IGF3YWl0IGNvdW50ZXIoKSA+IDApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkgKGNhbGxzaXRlTmFtZSwgZmlsdGVyLCBkZXBlbmRlbmNpZXMpIHtcbiAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBidWlsZGVyID0gZmlsdGVyW2NsaWVudEZ1bmN0aW9uQnVpbGRlclN5bWJvbF07XG4gICAgICAgIGNvbnN0IGZuICAgICAgPSBidWlsZGVyID8gYnVpbGRlci5mbiA6IGZpbHRlcjtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGJ1aWxkZXIgPyBhc3NpZ24oe30sIGJ1aWxkZXIub3B0aW9ucywgeyBkZXBlbmRlbmNpZXMgfSkgOiB7IGRlcGVuZGVuY2llcyB9O1xuXG4gICAgICAgIHJldHVybiAobmV3IENsaWVudEZ1bmN0aW9uQnVpbGRlcihmbiwgb3B0aW9ucywgeyBpbnN0YW50aWF0aW9uOiBjYWxsc2l0ZU5hbWUgfSkpLmdldEZ1bmN0aW9uKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbHRlcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlciAoeyBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCBhZGRpdGlvbmFsRGVwZW5kZW5jaWVzIH0pIHtcbiAgICBjb25zdCBjb2xsZWN0aW9uTW9kZVNlbGVjdG9yQnVpbGRlciA9IG5ldyBTZWxlY3RvckJ1aWxkZXIoZ2V0U2VsZWN0b3IoKSwgeyBjb2xsZWN0aW9uTW9kZTogdHJ1ZSB9KTtcbiAgICBjb25zdCBjdXN0b21ET01Qcm9wZXJ0aWVzICAgICAgICAgICA9IGNvbGxlY3Rpb25Nb2RlU2VsZWN0b3JCdWlsZGVyLm9wdGlvbnMuY3VzdG9tRE9NUHJvcGVydGllcztcbiAgICBjb25zdCBjdXN0b21NZXRob2RzICAgICAgICAgICAgICAgICA9IGNvbGxlY3Rpb25Nb2RlU2VsZWN0b3JCdWlsZGVyLm9wdGlvbnMuY3VzdG9tTWV0aG9kcztcblxuICAgIGxldCBkZXBlbmRlbmNpZXMgPSB7XG4gICAgICAgIHNlbGVjdG9yOiAgICBjb2xsZWN0aW9uTW9kZVNlbGVjdG9yQnVpbGRlci5nZXRGdW5jdGlvbigpLFxuICAgICAgICBmaWx0ZXI6ICAgICAgZmlsdGVyLFxuICAgICAgICBmaWx0ZXJOb2RlczogZmlsdGVyTm9kZXNcbiAgICB9O1xuXG4gICAgY29uc3QgeyBib3VuZFRlc3RSdW4sIHRpbWVvdXQsIHZpc2liaWxpdHlDaGVjaywgYXBpRm5DaGFpbiB9ID0gY29sbGVjdGlvbk1vZGVTZWxlY3RvckJ1aWxkZXIub3B0aW9ucztcblxuICAgIGRlcGVuZGVuY2llcyA9IGFzc2lnbihkZXBlbmRlbmNpZXMsIGFkZGl0aW9uYWxEZXBlbmRlbmNpZXMpO1xuXG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTZWxlY3RvckJ1aWxkZXIoc2VsZWN0b3JGbiwge1xuICAgICAgICBkZXBlbmRlbmNpZXMsXG4gICAgICAgIGN1c3RvbURPTVByb3BlcnRpZXMsXG4gICAgICAgIGN1c3RvbU1ldGhvZHMsXG4gICAgICAgIGJvdW5kVGVzdFJ1bixcbiAgICAgICAgdGltZW91dCxcbiAgICAgICAgdmlzaWJpbGl0eUNoZWNrLFxuICAgICAgICBhcGlGbkNoYWluLFxuICAgICAgICBhcGlGblxuICAgIH0sIHsgaW5zdGFudGlhdGlvbjogJ1NlbGVjdG9yJyB9KTtcblxuICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG59XG5cbmNvbnN0IGZpbHRlckJ5VGV4dCA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbHRlcicsIHNlbGVjdG9yVGV4dEZpbHRlcik7XG5jb25zdCBmaWx0ZXJCeUF0dHIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaWx0ZXInLCBzZWxlY3RvckF0dHJpYnV0ZUZpbHRlcik7XG5cbmZ1bmN0aW9uIGVuc3VyZVJlZ0V4cENvbnRleHQgKHN0cikge1xuICAgIC8vIE5PVEU6IGlmIGEgcmVnZXhwIGlzIGNyZWF0ZWQgaW4gYSBzZXBhcmF0ZSBjb250ZXh0ICh2aWEgdGhlICd2bScgbW9kdWxlKSB3ZVxuICAgIC8vIHNob3VsZCB3cmFwIGl0IHdpdGggbmV3IFJlZ0V4cCgpIHRvIG1ha2UgdGhlIGBpbnN0YW5jZW9mIFJlZ0V4cGAgY2hlY2sgc3VjY2Vzc2Z1bC5cbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycgJiYgIShzdHIgaW5zdGFuY2VvZiBSZWdFeHApKVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChzdHIpO1xuXG4gICAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gYWRkRmlsdGVyTWV0aG9kcyAob3B0aW9ucykge1xuICAgIGNvbnN0IHsgb2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyIH0gPSBvcHRpb25zO1xuXG4gICAgb2JqLm50aCA9IGluZGV4ID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5udW1iZXIsICdudGgnLCAnXCJpbmRleFwiIGFyZ3VtZW50JywgaW5kZXgpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuICAgPSBwcmVwYXJlQXBpRm5BcmdzKCdudGgnLCBpbmRleCk7XG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgaW5kZXgsIGFwaUZuIH0sIHsgaW5zdGFudGlhdGlvbjogJ1NlbGVjdG9yJyB9KTtcblxuICAgICAgICByZXR1cm4gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xuICAgIH07XG5cbiAgICBvYmoud2l0aFRleHQgPSB0ZXh0ID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5yZWdFeHBdLCAnd2l0aFRleHQnLCAnXCJ0ZXh0XCIgYXJndW1lbnQnLCB0ZXh0KTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ3dpdGhUZXh0JywgdGV4dCk7XG5cbiAgICAgICAgdGV4dCA9IGVuc3VyZVJlZ0V4cENvbnRleHQodGV4dCk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyTm9kZXMobm9kZXMsIGZpbHRlciwgZG9jdW1lbnQsIHZvaWQgMCwgdGV4dFJlKTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyQnlUZXh0LCB7IHRleHRSZTogbWFrZVJlZ0V4cCh0ZXh0KSB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgb2JqLndpdGhFeGFjdFRleHQgPSB0ZXh0ID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICd3aXRoRXhhY3RUZXh0JywgJ1widGV4dFwiIGFyZ3VtZW50JywgdGV4dCk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyTm9kZXMobm9kZXMsIGZpbHRlciwgZG9jdW1lbnQsIHZvaWQgMCwgZXhhY3RUZXh0KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ3dpdGhFeGFjdFRleHQnLCB0ZXh0KTtcbiAgICAgICAgY29uc3QgYXJncyAgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXJCeVRleHQsIHsgZXhhY3RUZXh0OiB0ZXh0IH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICBvYmoud2l0aEF0dHJpYnV0ZSA9IChhdHRyTmFtZSwgYXR0clZhbHVlKSA9PiB7XG4gICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMucmVnRXhwXSwgJ3dpdGhBdHRyaWJ1dGUnLCAnXCJhdHRyTmFtZVwiIGFyZ3VtZW50JywgYXR0ck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnd2l0aEF0dHJpYnV0ZScsIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuXG4gICAgICAgIGF0dHJOYW1lID0gZW5zdXJlUmVnRXhwQ29udGV4dChhdHRyTmFtZSk7XG5cbiAgICAgICAgaWYgKGF0dHJWYWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKFtpcy5zdHJpbmcsIGlzLnJlZ0V4cF0sICd3aXRoQXR0cmlidXRlJywgJ1wiYXR0clZhbHVlXCIgYXJndW1lbnQnLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgYXR0clZhbHVlID0gZW5zdXJlUmVnRXhwQ29udGV4dChhdHRyVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyTm9kZXMobm9kZXMsIGZpbHRlciwgZG9jdW1lbnQsIHZvaWQgMCwgYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXJncyA9IGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3Mob3B0aW9ucywgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlckJ5QXR0ciwge1xuICAgICAgICAgICAgYXR0ck5hbWUsXG4gICAgICAgICAgICBhdHRyVmFsdWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoYXJncyk7XG4gICAgfTtcblxuICAgIG9iai5maWx0ZXIgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbl0sICdmaWx0ZXInLCAnXCJmaWx0ZXJcIiBhcmd1bWVudCcsIGZpbHRlcik7XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCdmaWx0ZXInLCBmaWx0ZXIpO1xuXG4gICAgICAgIGZpbHRlciA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbHRlcicsIGZpbHRlciwgZGVwZW5kZW5jaWVzKTtcblxuICAgICAgICBjb25zdCBzZWxlY3RvckZuID0gKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gc2VsZWN0b3IoKTtcblxuICAgICAgICAgICAgaWYgKCFub2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJOb2Rlcyhub2RlcywgZmlsdGVyLCBkb2N1bWVudCwgdm9pZCAwKTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIpO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICBvYmouZmlsdGVyVmlzaWJsZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYXBpRm4gICA9IHByZXBhcmVBcGlGbkFyZ3MoJ2ZpbHRlclZpc2libGUnKTtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IG5ldyBTZWxlY3RvckJ1aWxkZXIoZ2V0U2VsZWN0b3IoKSwgeyBmaWx0ZXJWaXNpYmxlOiB0cnVlLCBhcGlGbiB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICB9O1xuXG4gICAgb2JqLmZpbHRlckhpZGRlbiA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYXBpRm4gICA9IHByZXBhcmVBcGlGbkFyZ3MoJ2ZpbHRlckhpZGRlbicpO1xuICAgICAgICBjb25zdCBidWlsZGVyID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IGZpbHRlckhpZGRlbjogdHJ1ZSwgYXBpRm4gfSwgeyBpbnN0YW50aWF0aW9uOiAnU2VsZWN0b3InIH0pO1xuXG4gICAgICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQ3VzdG9tRE9NUHJvcGVydGllc01ldGhvZCAoeyBvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIgfSkge1xuICAgIG9iai5hZGRDdXN0b21ET01Qcm9wZXJ0aWVzID0gY3VzdG9tRE9NUHJvcGVydGllcyA9PiB7XG4gICAgICAgIGFzc2VydEFkZEN1c3RvbURPTVByb3BlcnRpZXNPcHRpb25zKGN1c3RvbURPTVByb3BlcnRpZXMpO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgY3VzdG9tRE9NUHJvcGVydGllcyB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhZGRDdXN0b21NZXRob2RzTWV0aG9kICh7IG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciB9KSB7XG4gICAgb2JqLmFkZEN1c3RvbU1ldGhvZHMgPSBmdW5jdGlvbiAobWV0aG9kcywgb3B0cykge1xuICAgICAgICBhc3NlcnRBZGRDdXN0b21NZXRob2RzKG1ldGhvZHMsIG9wdHMpO1xuXG4gICAgICAgIGNvbnN0IGN1c3RvbU1ldGhvZHMgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgICAgICAgICAgY3VzdG9tTWV0aG9kc1ttZXRob2ROYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICAgICAgICAgbWV0aG9kc1ttZXRob2ROYW1lXSxcbiAgICAgICAgICAgICAgICByZXR1cm5ET01Ob2Rlczogb3B0cyAmJiAhIW9wdHMucmV0dXJuRE9NTm9kZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgY3VzdG9tTWV0aG9kcyB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhZGRIaWVyYXJjaGljYWxTZWxlY3RvcnMgKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IG9iaiB9ID0gb3B0aW9ucztcblxuICAgIC8vIEZpbmRcbiAgICBvYmouZmluZCA9IChmaWx0ZXIsIGRlcGVuZGVuY2llcykgPT4ge1xuICAgICAgICBhc3NlcnRUeXBlKFtpcy5zdHJpbmcsIGlzLmZ1bmN0aW9uXSwgJ2ZpbmQnLCAnXCJmaWx0ZXJcIiBhcmd1bWVudCcsIGZpbHRlcik7XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCdmaW5kJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaW5kJywgZmlsdGVyLCBkZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZFNlbGVjdG9yUmVzdWx0cyhzZWxlY3Rvciwgbm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygbm9kZS5xdWVyeVNlbGVjdG9yQWxsID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucXVlcnlTZWxlY3RvckFsbChmaWx0ZXIpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdmlzaXROb2RlID0gY3VycmVudE5vZGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbkxlbmd0aCA9IGN1cnJlbnROb2RlLmNoaWxkTm9kZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY25MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjdXJyZW50Tm9kZS5jaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpdE5vZGUoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZpc2l0Tm9kZShub2RlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJOb2RlcyhyZXN1bHRzLCBmaWx0ZXIsIG51bGwsIG5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXJncyA9IGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3Mob3B0aW9ucywgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgeyBleHBhbmRTZWxlY3RvclJlc3VsdHMgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoYXJncyk7XG4gICAgfTtcblxuICAgIC8vIFBhcmVudFxuICAgIG9iai5wYXJlbnQgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbiwgaXMubnVtYmVyXSwgJ3BhcmVudCcsICdcImZpbHRlclwiIGFyZ3VtZW50JywgZmlsdGVyKTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ3BhcmVudCcsIGZpbHRlcik7XG5cbiAgICAgICAgZmlsdGVyID0gY29udmVydEZpbHRlclRvQ2xpZW50RnVuY3Rpb25JZk5lY2Vzc2FyeSgnZmluZCcsIGZpbHRlciwgZGVwZW5kZW5jaWVzKTtcblxuICAgICAgICBjb25zdCBzZWxlY3RvckZuID0gKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIHJldHVybiBleHBhbmRTZWxlY3RvclJlc3VsdHMoc2VsZWN0b3IsIG5vZGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTsgcGFyZW50OyBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKHBhcmVudCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyICE9PSB2b2lkIDAgPyBmaWx0ZXJOb2RlcyhwYXJlbnRzLCBmaWx0ZXIsIGRvY3VtZW50LCBub2RlKSA6IHBhcmVudHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCB7IGV4cGFuZFNlbGVjdG9yUmVzdWx0cyB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gQ2hpbGRcbiAgICBvYmouY2hpbGQgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbiwgaXMubnVtYmVyXSwgJ2NoaWxkJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnY2hpbGQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGZpbHRlciA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbmQnLCBmaWx0ZXIsIGRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICByZXR1cm4gZXhwYW5kU2VsZWN0b3JSZXN1bHRzKHNlbGVjdG9yLCBub2RlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsZW1lbnRzID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgY25MZW5ndGggICAgICA9IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkTm9kZXNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRFbGVtZW50cy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyICE9PSB2b2lkIDAgPyBmaWx0ZXJOb2RlcyhjaGlsZEVsZW1lbnRzLCBmaWx0ZXIsIG5vZGUsIG5vZGUpIDogY2hpbGRFbGVtZW50cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIHsgZXhwYW5kU2VsZWN0b3JSZXN1bHRzIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBTaWJsaW5nXG4gICAgb2JqLnNpYmxpbmcgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbiwgaXMubnVtYmVyXSwgJ3NpYmxpbmcnLCAnXCJmaWx0ZXJcIiBhcmd1bWVudCcsIGZpbHRlcik7XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCdzaWJsaW5nJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaW5kJywgZmlsdGVyLCBkZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZFNlbGVjdG9yUmVzdWx0cyhzZWxlY3Rvciwgbm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2libGluZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbkxlbmd0aCA9IHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY25MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHBhcmVudC5jaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSAmJiBjaGlsZCAhPT0gbm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpYmxpbmdzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIgIT09IHZvaWQgMCA/IGZpbHRlck5vZGVzKHNpYmxpbmdzLCBmaWx0ZXIsIHBhcmVudCwgbm9kZSkgOiBzaWJsaW5ncztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIHsgZXhwYW5kU2VsZWN0b3JSZXN1bHRzIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBOZXh0IHNpYmxpbmdcbiAgICBvYmoubmV4dFNpYmxpbmcgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbiwgaXMubnVtYmVyXSwgJ25leHRTaWJsaW5nJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnbmV4dFNpYmxpbmcnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGZpbHRlciA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbmQnLCBmaWx0ZXIsIGRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICByZXR1cm4gZXhwYW5kU2VsZWN0b3JSZXN1bHRzKHNlbGVjdG9yLCBub2RlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5ncyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNuTGVuZ3RoID0gcGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCBhZnRlck5vZGUgID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBwYXJlbnQuY2hpbGROb2Rlc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgPT09IG5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlck5vZGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFmdGVyTm9kZSAmJiBjaGlsZC5ub2RlVHlwZSA9PT0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpYmxpbmdzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIgIT09IHZvaWQgMCA/IGZpbHRlck5vZGVzKHNpYmxpbmdzLCBmaWx0ZXIsIHBhcmVudCwgbm9kZSkgOiBzaWJsaW5ncztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIHsgZXhwYW5kU2VsZWN0b3JSZXN1bHRzIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBQcmV2IHNpYmxpbmdcbiAgICBvYmoucHJldlNpYmxpbmcgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbiwgaXMubnVtYmVyXSwgJ3ByZXZTaWJsaW5nJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygncHJldlNpYmxpbmcnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGZpbHRlciA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbmQnLCBmaWx0ZXIsIGRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICByZXR1cm4gZXhwYW5kU2VsZWN0b3JSZXN1bHRzKHNlbGVjdG9yLCBub2RlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5ncyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNuTGVuZ3RoID0gcGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gcGFyZW50LmNoaWxkTm9kZXNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBub2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2libGluZ3MucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlciAhPT0gdm9pZCAwID8gZmlsdGVyTm9kZXMoc2libGluZ3MsIGZpbHRlciwgcGFyZW50LCBub2RlKSA6IHNpYmxpbmdzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXJncyA9IGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3Mob3B0aW9ucywgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgeyBleHBhbmRTZWxlY3RvclJlc3VsdHMgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoYXJncyk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEFQSSAoc2VsZWN0b3IsIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIGN1c3RvbURPTVByb3BlcnRpZXMsIGN1c3RvbU1ldGhvZHMpIHtcbiAgICBjb25zdCBvcHRpb25zID0geyBvYmo6IHNlbGVjdG9yLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21ET01Qcm9wZXJ0aWVzLCBjdXN0b21NZXRob2RzIH07XG5cbiAgICBhZGRGaWx0ZXJNZXRob2RzKG9wdGlvbnMpO1xuICAgIGFkZEhpZXJhcmNoaWNhbFNlbGVjdG9ycyhvcHRpb25zKTtcbiAgICBhZGRTbmFwc2hvdFByb3BlcnR5U2hvcnRoYW5kcyhvcHRpb25zKTtcbiAgICBhZGRDdXN0b21ET01Qcm9wZXJ0aWVzTWV0aG9kKG9wdGlvbnMpO1xuICAgIGFkZEN1c3RvbU1ldGhvZHNNZXRob2Qob3B0aW9ucyk7XG4gICAgYWRkQ291bnRlclByb3BlcnRpZXMob3B0aW9ucyk7XG4gICAgYWRkVmlzaWJsZVByb3BlcnR5KG9wdGlvbnMpO1xufVxuIl19