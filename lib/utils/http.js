"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function respond404(res) {
    res.statusCode = 404;
    res.end();
}
exports.respond404 = respond404;
function respond500(res, err) {
    res.statusCode = 500;
    res.end(err || '');
}
exports.respond500 = respond500;
function redirect(res, url) {
    res.statusCode = 302;
    res.setHeader('location', url);
    res.end();
}
exports.redirect = redirect;
function respondWithJSON(res, data) {
    preventCaching(res);
    res.setHeader('content-type', 'application/json');
    res.end(data ? JSON.stringify(data) : '');
}
exports.respondWithJSON = respondWithJSON;
function preventCaching(res) {
    res.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
    res.setHeader('pragma', 'no-cache');
}
exports.preventCaching = preventCaching;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9odHRwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsVUFBVSxDQUFFLEdBQUc7SUFDM0IsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7SUFDckIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQUhELGdDQUdDO0FBRUQsU0FBZ0IsVUFBVSxDQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2hDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFIRCxnQ0FHQztBQUVELFNBQWdCLFFBQVEsQ0FBRSxHQUFHLEVBQUUsR0FBRztJQUM5QixHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztJQUNyQixHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDZCxDQUFDO0FBSkQsNEJBSUM7QUFFRCxTQUFnQixlQUFlLENBQUUsR0FBRyxFQUFFLElBQUk7SUFDdEMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFKRCwwQ0FJQztBQUVELFNBQWdCLGNBQWMsQ0FBRSxHQUFHO0lBQy9CLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7SUFDdEUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUhELHdDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHJlc3BvbmQ0MDQgKHJlcykge1xuICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgIHJlcy5lbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3BvbmQ1MDAgKHJlcywgZXJyKSB7XG4gICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgcmVzLmVuZChlcnIgfHwgJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkaXJlY3QgKHJlcywgdXJsKSB7XG4gICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XG4gICAgcmVzLnNldEhlYWRlcignbG9jYXRpb24nLCB1cmwpO1xuICAgIHJlcy5lbmQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3BvbmRXaXRoSlNPTiAocmVzLCBkYXRhKSB7XG4gICAgcHJldmVudENhY2hpbmcocmVzKTtcbiAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHJlcy5lbmQoZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudENhY2hpbmcgKHJlcykge1xuICAgIHJlcy5zZXRIZWFkZXIoJ2NhY2hlLWNvbnRyb2wnLCAnbm8tY2FjaGUsIG5vLXN0b3JlLCBtdXN0LXJldmFsaWRhdGUnKTtcbiAgICByZXMuc2V0SGVhZGVyKCdwcmFnbWEnLCAnbm8tY2FjaGUnKTtcbn1cbiJdfQ==