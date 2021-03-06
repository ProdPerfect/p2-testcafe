"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const fs_1 = __importDefault(require("fs"));
const LOCKFILE_NAME = '.testcafe-lockfile';
const STALE_LOCKFILE_AGE = 2 * 24 * 60 * 60 * 1000;
const DEBUG_LOGGER = debug_1.default('testcafe:utils:temp-directory:lockfile');
class LockFile {
    constructor(dirPath) {
        this.path = path_1.default.join(dirPath, LOCKFILE_NAME);
    }
    _open({ force = false } = {}) {
        try {
            fs_1.default.writeFileSync(this.path, '', { flag: force ? 'w' : 'wx' });
            return true;
        }
        catch (e) {
            DEBUG_LOGGER('Failed to init lockfile ' + this.path);
            DEBUG_LOGGER(e);
            return false;
        }
    }
    _isStale() {
        const currentMs = Date.now();
        try {
            const { mtimeMs } = fs_1.default.statSync(this.path);
            return currentMs - mtimeMs > STALE_LOCKFILE_AGE;
        }
        catch (e) {
            DEBUG_LOGGER('Failed to check status of lockfile ' + this.path);
            DEBUG_LOGGER(e);
            return false;
        }
    }
    init() {
        if (this._open())
            return true;
        if (this._isStale())
            return this._open({ force: true });
        return false;
    }
    dispose() {
        try {
            fs_1.default.unlinkSync(this.path);
        }
        catch (e) {
            DEBUG_LOGGER('Failed to dispose lockfile ' + this.path);
            DEBUG_LOGGER(e);
        }
    }
}
exports.default = LockFile;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvdGVtcC1kaXJlY3RvcnkvbG9ja2ZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBd0I7QUFDeEIsa0RBQTBCO0FBQzFCLDRDQUFvQjtBQUdwQixNQUFNLGFBQWEsR0FBUSxvQkFBb0IsQ0FBQztBQUNoRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDbkQsTUFBTSxZQUFZLEdBQVMsZUFBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFFM0UsTUFBcUIsUUFBUTtJQUN6QixZQUFhLE9BQU87UUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsS0FBSyxDQUFFLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxHQUFHLEVBQUU7UUFDekIsSUFBSTtZQUNBLFlBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFOUQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ04sWUFBWSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsUUFBUTtRQUNKLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJO1lBQ0EsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLFlBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNDLE9BQU8sU0FBUyxHQUFHLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQztTQUNuRDtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ04sWUFBWSxDQUFDLHFDQUFxQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDO1FBRWhCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSTtZQUNBLFlBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxDQUFDLEVBQUU7WUFDTixZQUFZLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hELFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQjtJQUNMLENBQUM7Q0FDSjtBQXRERCwyQkFzREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5cbmNvbnN0IExPQ0tGSUxFX05BTUUgICAgICA9ICcudGVzdGNhZmUtbG9ja2ZpbGUnO1xuY29uc3QgU1RBTEVfTE9DS0ZJTEVfQUdFID0gMiAqIDI0ICogNjAgKiA2MCAqIDEwMDA7XG5jb25zdCBERUJVR19MT0dHRVIgICAgICAgPSBkZWJ1ZygndGVzdGNhZmU6dXRpbHM6dGVtcC1kaXJlY3Rvcnk6bG9ja2ZpbGUnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9ja0ZpbGUge1xuICAgIGNvbnN0cnVjdG9yIChkaXJQYXRoKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBMT0NLRklMRV9OQU1FKTtcbiAgICB9XG5cbiAgICBfb3BlbiAoeyBmb3JjZSA9IGZhbHNlIH0gPSB7fSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnBhdGgsICcnLCB7IGZsYWc6IGZvcmNlID8gJ3cnIDogJ3d4JyB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIERFQlVHX0xPR0dFUignRmFpbGVkIHRvIGluaXQgbG9ja2ZpbGUgJyArIHRoaXMucGF0aCk7XG4gICAgICAgICAgICBERUJVR19MT0dHRVIoZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pc1N0YWxlICgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudE1zID0gRGF0ZS5ub3coKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBtdGltZU1zIH0gPSBmcy5zdGF0U3luYyh0aGlzLnBhdGgpO1xuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE1zIC0gbXRpbWVNcyA+IFNUQUxFX0xPQ0tGSUxFX0FHRTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKCdGYWlsZWQgdG8gY2hlY2sgc3RhdHVzIG9mIGxvY2tmaWxlICcgKyB0aGlzLnBhdGgpO1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29wZW4oKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1N0YWxlKCkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3Blbih7IGZvcmNlOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBkaXNwb3NlICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmModGhpcy5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKCdGYWlsZWQgdG8gZGlzcG9zZSBsb2NrZmlsZSAnICsgdGhpcy5wYXRoKTtcbiAgICAgICAgICAgIERFQlVHX0xPR0dFUihlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==