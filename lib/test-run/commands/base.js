"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assignable_1 = __importDefault(require("../../utils/assignable"));
class CommandBase extends assignable_1.default {
    constructor(obj, testRun, type, validateProperties = true) {
        super();
        this.type = type;
        this._assignFrom(obj, validateProperties, { testRun });
    }
}
exports.default = CommandBase;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0LXJ1bi9jb21tYW5kcy9iYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0VBQWdEO0FBRWhELE1BQXFCLFdBQVksU0FBUSxvQkFBVTtJQUMvQyxZQUFhLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixHQUFHLElBQUk7UUFDdEQsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNKO0FBUkQsOEJBUUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXNzaWduYWJsZSBmcm9tICcuLi8uLi91dGlscy9hc3NpZ25hYmxlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZEJhc2UgZXh0ZW5kcyBBc3NpZ25hYmxlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqLCB0ZXN0UnVuLCB0eXBlLCB2YWxpZGF0ZVByb3BlcnRpZXMgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcblxuICAgICAgICB0aGlzLl9hc3NpZ25Gcm9tKG9iaiwgdmFsaWRhdGVQcm9wZXJ0aWVzLCB7IHRlc3RSdW4gfSk7XG4gICAgfVxufVxuIl19