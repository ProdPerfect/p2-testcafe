"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const protocol_1 = require("./protocol");
const unitTypes = __importStar(require("../../api/structure/unit-types"));
const RECURSIVE_PROPERTIES = ['testFile', 'fixture', 'currentFixture', 'collectedTests'];
function isProperty(object, property) {
    return object.hasOwnProperty(property);
}
function isTest(value) {
    return value.unitTypeName === unitTypes.TEST;
}
exports.isTest = isTest;
function isFixture(value) {
    return value.unitTypeName === unitTypes.FIXTURE;
}
exports.isFixture = isFixture;
function mapProperties(object, properties, mapper) {
    for (const property of properties) {
        if (!isProperty(object, property))
            continue;
        const value = object[property];
        if (Array.isArray(value))
            object[property] = value.map(item => mapper({ item, property, object }));
        else
            object[property] = mapper({ item: object[property], property, object });
    }
}
function replaceTestFunctions(unit) {
    mapProperties(unit, protocol_1.TEST_FUNCTION_PROPERTIES, ({ item }) => !!item);
}
function restoreTestFunctions(unit, mapper) {
    mapProperties(unit, protocol_1.TEST_FUNCTION_PROPERTIES, ({ item, object, property }) => item ? mapper(object.id, property) : item);
}
function flattenRecursiveProperties(unit) {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => item.id);
}
function restoreRecursiveProperties(unit, units) {
    mapProperties(unit, RECURSIVE_PROPERTIES, ({ item }) => units[item]);
}
function flatten(tests) {
    const testFiles = lodash_1.uniq(tests.map(test => test.testFile));
    const fixtures = lodash_1.uniq(tests.map(test => test.fixture));
    return lodash_1.keyBy([...tests, ...fixtures, ...testFiles], unit => unit.id);
}
exports.flatten = flatten;
function serialize(units) {
    const result = {};
    for (const unit of Object.values(units)) {
        const copy = Object.assign({}, unit);
        replaceTestFunctions(copy);
        flattenRecursiveProperties(copy);
        result[copy.id] = copy;
    }
    return result;
}
exports.serialize = serialize;
function restore(units, mapper) {
    const list = Object.values(units);
    const result = [];
    for (const unit of list) {
        restoreRecursiveProperties(unit, units);
        restoreTestFunctions(unit, mapper);
    }
    for (const unit of list) {
        if (isTest(unit))
            result.push(unit);
    }
    return result;
}
exports.restore = restore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1zdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvY29tcGlsZXIvdGVzdC1zdHJ1Y3R1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXFDO0FBQ3JDLHlDQUFzRDtBQUd0RCwwRUFBNEQ7QUFHNUQsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQVUsQ0FBQztBQXNCbEcsU0FBUyxVQUFVLENBQW9CLE1BQVMsRUFBRSxRQUFnQjtJQUM5RCxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVELFNBQWdCLE1BQU0sQ0FBRSxLQUFXO0lBQy9CLE9BQU8sS0FBSyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2pELENBQUM7QUFGRCx3QkFFQztBQUVELFNBQWdCLFNBQVMsQ0FBRSxLQUFXO0lBQ2xDLE9BQU8sS0FBSyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ3BELENBQUM7QUFGRCw4QkFFQztBQUVELFNBQVMsYUFBYSxDQUE0RCxNQUFTLEVBQUUsVUFBYSxFQUFFLE1BQTRCO0lBQ3BJLEtBQUssTUFBTSxRQUFRLElBQUksVUFBVSxFQUFFO1FBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztZQUM3QixTQUFTO1FBRWIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9CLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDcEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFB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QUFJLENBQUM7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3pCO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQWhCRCwwQkFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1bmlxLCBrZXlCeSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBURVNUX0ZVTkNUSU9OX1BST1BFUlRJRVMgfSBmcm9tICcuL3Byb3RvY29sJztcblxuaW1wb3J0IHsgRml4dHVyZSwgVGVzdCwgVGVzdEZpbGUgfSBmcm9tICcuLi8uLi9hcGkvc3RydWN0dXJlL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgdW5pdFR5cGVzIGZyb20gJy4uLy4uL2FwaS9zdHJ1Y3R1cmUvdW5pdC10eXBlcyc7XG5cblxuY29uc3QgUkVDVVJTSVZFX1BST1BFUlRJRVMgPSBbJ3Rlc3RGaWxlJywgJ2ZpeHR1cmUnLCAnY3VycmVudEZpeHR1cmUnLCAnY29sbGVjdGVkVGVzdHMnXSBhcyBjb25zdDtcblxuaW50ZXJmYWNlIEZ1bmN0aW9uTWFwcGVyIHtcbiAgICAoaWQ6IHN0cmluZywgZnVuY3Rpb25OYW1lOiB0eXBlb2YgVEVTVF9GVU5DVElPTl9QUk9QRVJUSUVTW251bWJlcl0pOiBGdW5jdGlvbjtcbn1cblxuaW50ZXJmYWNlIE1hcHBlckFyZ3VtZW50czxULCBQPiB7XG4gICAgb2JqZWN0OiBUO1xuICAgIHByb3BlcnR5OiBQO1xuICAgIGl0ZW06IGFueTtcbn1cblxuaW50ZXJmYWNlIE1hcHBlcjxULCBQPiB7XG4gICAgKHsgaXRlbSwgcHJvcGVydHksIG9iamVjdCB9OiBNYXBwZXJBcmd1bWVudHM8VCwgUD4pOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIFVuaXQgPSBUZXN0IHwgRml4dHVyZSB8IFRlc3RGaWxlO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVuaXRzIHtcbiAgICBbaWQ6IHN0cmluZ106IFVuaXQ7XG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHk8VCBleHRlbmRzIG9iamVjdD4gKG9iamVjdDogVCwgcHJvcGVydHk6IHN0cmluZyk6IHByb3BlcnR5IGlzIEV4dHJhY3Q8a2V5b2YgVCwgc3RyaW5nPiB7XG4gICAgcmV0dXJuIG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Rlc3QgKHZhbHVlOiBVbml0KTogdmFsdWUgaXMgVGVzdCB7XG4gICAgcmV0dXJuIHZhbHVlLnVuaXRUeXBlTmFtZSA9PT0gdW5pdFR5cGVzLlRFU1Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZpeHR1cmUgKHZhbHVlOiBVbml0KTogdmFsdWUgaXMgRml4dHVyZSB7XG4gICAgcmV0dXJuIHZhbHVlLnVuaXRUeXBlTmFtZSA9PT0gdW5pdFR5cGVzLkZJWFRVUkU7XG59XG5cbmZ1bmN0aW9uIG1hcFByb3BlcnRpZXM8VCBleHRlbmRzIFJlYWRvbmx5PG9iamVjdD4sIFAgZXh0ZW5kcyBSZWFkb25seTxzdHJpbmdbXT4+IChvYmplY3Q6IFQsIHByb3BlcnRpZXM6IFAsIG1hcHBlcjogTWFwcGVyPFQsIFBbbnVtYmVyXT4pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKCFpc1Byb3BlcnR5KG9iamVjdCwgcHJvcGVydHkpKVxuICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSB2YWx1ZS5tYXAoaXRlbSA9PiBtYXBwZXIoeyBpdGVtLCBwcm9wZXJ0eSwgb2JqZWN0IH0pKSBhcyBhbnk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSBtYXBwZXIoeyBpdGVtOiBvYmplY3RbcHJvcGVydHldLCBwcm9wZXJ0eSwgb2JqZWN0IH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZVRlc3RGdW5jdGlvbnMgKHVuaXQ6IFVuaXQpOiB2b2lkIHtcbiAgICBtYXBQcm9wZXJ0aWVzKHVuaXQsIFRFU1RfRlVOQ1RJT05fUFJPUEVSVElFUywgKHsgaXRlbSB9KSA9PiAhIWl0ZW0pO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlVGVzdEZ1bmN0aW9ucyAodW5pdDogVW5pdCwgbWFwcGVyOiBGdW5jdGlvbk1hcHBlcik6IHZvaWQge1xuICAgIG1hcFByb3BlcnRpZXModW5pdCwgVEVTVF9GVU5DVElPTl9QUk9QRVJUSUVTLCAoeyBpdGVtLCBvYmplY3QsIHByb3BlcnR5IH0pID0+IGl0ZW0gPyBtYXBwZXIob2JqZWN0LmlkLCBwcm9wZXJ0eSkgOiBpdGVtKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlblJlY3Vyc2l2ZVByb3BlcnRpZXMgKHVuaXQ6IFVuaXQpOiB2b2lkIHtcbiAgICBtYXBQcm9wZXJ0aWVzKHVuaXQsIFJFQ1VSU0lWRV9QUk9QRVJUSUVTLCAoeyBpdGVtIH0pID0+IGl0ZW0uaWQpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlUmVjdXJzaXZlUHJvcGVydGllcyAodW5pdDogVW5pdCwgdW5pdHM6IFVuaXRzKTogdm9pZCB7XG4gICAgbWFwUHJvcGVydGllcyh1bml0LCBSRUNVUlNJVkVfUFJPUEVSVElFUywgKHsgaXRlbSB9KSA9PiB1bml0c1tpdGVtXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuICh0ZXN0czogVGVzdFtdKTogVW5pdHMge1xuICAgIGNvbnN0IHRlc3RGaWxlcyA9IHVuaXEodGVzdHMubWFwKHRlc3QgPT4gdGVzdC50ZXN0RmlsZSkpO1xuICAgIGNvbnN0IGZpeHR1cmVzICA9IHVuaXEodGVzdHMubWFwKHRlc3QgPT4gdGVzdC5maXh0dXJlKSk7XG5cbiAgICByZXR1cm4ga2V5QnkoWy4uLnRlc3RzLCAuLi5maXh0dXJlcywgLi4udGVzdEZpbGVzXSwgdW5pdCA9PiB1bml0LmlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZSAodW5pdHM6IFVuaXRzKTogVW5pdHMge1xuICAgIGNvbnN0IHJlc3VsdDogVW5pdHMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgdW5pdCBvZiBPYmplY3QudmFsdWVzKHVuaXRzKSkge1xuICAgICAgICBjb25zdCBjb3B5OiBVbml0ID0geyAuLi51bml0IH07XG5cbiAgICAgICAgcmVwbGFjZVRlc3RGdW5jdGlvbnMoY29weSk7XG4gICAgICAgIGZsYXR0ZW5SZWN1cnNpdmVQcm9wZXJ0aWVzKGNvcHkpO1xuXG4gICAgICAgIHJlc3VsdFtjb3B5LmlkXSA9IGNvcHk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmUgKHVuaXRzOiBVbml0cywgbWFwcGVyOiBGdW5jdGlvbk1hcHBlcik6IFRlc3RbXSB7XG4gICAgY29uc3QgbGlzdCA9IE9iamVjdC52YWx1ZXModW5pdHMpO1xuXG4gICAgY29uc3QgcmVzdWx0OiBUZXN0W10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgdW5pdCBvZiBsaXN0KSB7XG4gICAgICAgIHJlc3RvcmVSZWN1cnNpdmVQcm9wZXJ0aWVzKHVuaXQsIHVuaXRzKTtcbiAgICAgICAgcmVzdG9yZVRlc3RGdW5jdGlvbnModW5pdCwgbWFwcGVyKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHVuaXQgb2YgbGlzdCkge1xuICAgICAgICBpZiAoaXNUZXN0KHVuaXQpKVxuICAgICAgICAgICAgcmVzdWx0LnB1c2godW5pdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==