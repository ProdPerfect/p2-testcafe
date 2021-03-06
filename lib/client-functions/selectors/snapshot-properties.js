"use strict";
// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_SNAPSHOT_PROPERTIES = [
    'nodeType',
    'textContent',
    'childNodeCount',
    'hasChildNodes',
    'childElementCount',
    'hasChildElements'
];
exports.ELEMENT_ACTION_SNAPSHOT_PROPERTIES = [
    'tagName',
    'attributes'
];
exports.ELEMENT_SNAPSHOT_PROPERTIES = [
    'tagName',
    'visible',
    'focused',
    'attributes',
    'boundingClientRect',
    'classNames',
    'style',
    'innerText',
    'namespaceURI',
    'id',
    'value',
    'checked',
    'selected',
    'selectedIndex',
    'scrollWidth',
    'scrollHeight',
    'scrollLeft',
    'scrollTop',
    'offsetWidth',
    'offsetHeight',
    'offsetLeft',
    'offsetTop',
    'clientWidth',
    'clientHeight',
    'clientLeft',
    'clientTop'
];
exports.SNAPSHOT_PROPERTIES = exports.NODE_SNAPSHOT_PROPERTIES.concat(exports.ELEMENT_SNAPSHOT_PROPERTIES);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QtcHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQtZnVuY3Rpb25zL3NlbGVjdG9ycy9zbmFwc2hvdC1wcm9wZXJ0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRUFBZ0U7QUFDaEUsZ0VBQWdFO0FBQ2hFLCtDQUErQztBQUMvQyxnRUFBZ0U7O0FBRW5ELFFBQUEsd0JBQXdCLEdBQUc7SUFDcEMsVUFBVTtJQUNWLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsZUFBZTtJQUNmLG1CQUFtQjtJQUNuQixrQkFBa0I7Q0FDckIsQ0FBQztBQUVXLFFBQUEsa0NBQWtDLEdBQUc7SUFDOUMsU0FBUztJQUNULFlBQVk7Q0FDZixDQUFDO0FBRVcsUUFBQSwyQkFBMkIsR0FBRztJQUN2QyxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxZQUFZO0lBQ1osb0JBQW9CO0lBQ3BCLFlBQVk7SUFDWixPQUFPO0lBQ1AsV0FBVztJQUNYLGNBQWM7SUFDZCxJQUFJO0lBQ0osT0FBTztJQUNQLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLGFBQWE7SUFDYixjQUFjO0lBQ2QsWUFBWTtJQUNaLFdBQVc7SUFDWCxhQUFhO0lBQ2IsY0FBYztJQUNkLFlBQVk7SUFDWixXQUFXO0lBQ1gsYUFBYTtJQUNiLGNBQWM7SUFDZCxZQUFZO0lBQ1osV0FBVztDQUNkLENBQUM7QUFFVyxRQUFBLG1CQUFtQixHQUFHLGdDQUF3QixDQUFDLE1BQU0sQ0FBQyxtQ0FBMkIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gV0FSTklORzogdGhpcyBmaWxlIGlzIHVzZWQgYnkgYm90aCB0aGUgY2xpZW50IGFuZCB0aGUgc2VydmVyLlxuLy8gRG8gbm90IHVzZSBhbnkgYnJvd3NlciBvciBub2RlLXNwZWNpZmljIEFQSSFcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IE5PREVfU05BUFNIT1RfUFJPUEVSVElFUyA9IFtcbiAgICAnbm9kZVR5cGUnLFxuICAgICd0ZXh0Q29udGVudCcsXG4gICAgJ2NoaWxkTm9kZUNvdW50JyxcbiAgICAnaGFzQ2hpbGROb2RlcycsXG4gICAgJ2NoaWxkRWxlbWVudENvdW50JyxcbiAgICAnaGFzQ2hpbGRFbGVtZW50cydcbl07XG5cbmV4cG9ydCBjb25zdCBFTEVNRU5UX0FDVElPTl9TTkFQU0hPVF9QUk9QRVJUSUVTID0gW1xuICAgICd0YWdOYW1lJyxcbiAgICAnYXR0cmlidXRlcydcbl07XG5cbmV4cG9ydCBjb25zdCBFTEVNRU5UX1NOQVBTSE9UX1BST1BFUlRJRVMgPSBbXG4gICAgJ3RhZ05hbWUnLFxuICAgICd2aXNpYmxlJyxcbiAgICAnZm9jdXNlZCcsXG4gICAgJ2F0dHJpYnV0ZXMnLFxuICAgICdib3VuZGluZ0NsaWVudFJlY3QnLFxuICAgICdjbGFzc05hbWVzJyxcbiAgICAnc3R5bGUnLFxuICAgICdpbm5lclRleHQnLFxuICAgICduYW1lc3BhY2VVUkknLFxuICAgICdpZCcsXG4gICAgJ3ZhbHVlJyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ3NlbGVjdGVkJyxcbiAgICAnc2VsZWN0ZWRJbmRleCcsXG4gICAgJ3Njcm9sbFdpZHRoJyxcbiAgICAnc2Nyb2xsSGVpZ2h0JyxcbiAgICAnc2Nyb2xsTGVmdCcsXG4gICAgJ3Njcm9sbFRvcCcsXG4gICAgJ29mZnNldFdpZHRoJyxcbiAgICAnb2Zmc2V0SGVpZ2h0JyxcbiAgICAnb2Zmc2V0TGVmdCcsXG4gICAgJ29mZnNldFRvcCcsXG4gICAgJ2NsaWVudFdpZHRoJyxcbiAgICAnY2xpZW50SGVpZ2h0JyxcbiAgICAnY2xpZW50TGVmdCcsXG4gICAgJ2NsaWVudFRvcCdcbl07XG5cbmV4cG9ydCBjb25zdCBTTkFQU0hPVF9QUk9QRVJUSUVTID0gTk9ERV9TTkFQU0hPVF9QUk9QRVJUSUVTLmNvbmNhdChFTEVNRU5UX1NOQVBTSE9UX1BST1BFUlRJRVMpO1xuIl19