"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const debug_1 = __importDefault(require("debug"));
const packet_1 = __importDefault(require("./packet"));
const message_1 = require("./message");
const async_event_emitter_1 = __importDefault(require("../../../utils/async-event-emitter"));
const debugLogger = debug_1.default('testcafe:services:utils:ipc:io');
class AsyncReader extends async_event_emitter_1.default {
    constructor(stream) {
        super();
        this.parser = new message_1.MessageParser();
        this.stream = stream;
        this.processMessages = Promise.resolve();
    }
    _onData(data) {
        const messages = this.parser.parse(data);
        if (!messages.length)
            return;
        this.processMessages = this.processMessages.then(() => this._processMessages(messages));
    }
    async _processMessages(messages) {
        for (const message of messages) {
            try {
                await this.emit('data', message);
            }
            catch (e) {
                debugLogger(e);
            }
        }
    }
    read() {
        this.stream.on('data', data => this._onData(data));
    }
}
exports.AsyncReader = AsyncReader;
class AsyncWriter {
    constructor(stream) {
        this.serializer = new message_1.MessageSerializer();
        this.stream = stream;
        this.batchPromise = Promise.resolve();
    }
    _write(buffer) {
        if (this.stream.write(buffer))
            return Promise.resolve();
        return new Promise(r => this.stream.once('drain', r));
    }
    _writeBuffers(buffers) {
        this.batchPromise = this.batchPromise
            .catch(() => { })
            .then(async () => {
            for (const buffer of buffers)
                await this._write(buffer);
        });
        return this.batchPromise;
    }
    async write(message) {
        const buffers = this.serializer.serialize(message);
        return await this._writeBuffers(buffers);
    }
}
exports.AsyncWriter = AsyncWriter;
class SyncReader {
    constructor(fd) {
        this.parser = new message_1.MessageParser();
        this.fd = fd;
        this.messageQueue = [];
    }
    _readSync() {
        const buffer = Buffer.alloc(packet_1.default.MAX_PACKET_SIZE);
        const readLength = fs_1.default.readSync(this.fd, buffer, 0, packet_1.default.MAX_PACKET_SIZE, null);
        return buffer.slice(0, readLength);
    }
    _addMessagesToQueue() {
        let messages = this.parser.parse(this._readSync());
        while (!messages.length)
            messages = this.parser.parse(this._readSync());
        this.messageQueue.push(...messages);
    }
    readSync() {
        let message = this.messageQueue.shift();
        while (!message) {
            this._addMessagesToQueue();
            message = this.messageQueue.shift();
        }
        return message;
    }
}
exports.SyncReader = SyncReader;
class SyncWriter {
    constructor(fd) {
        this.serializer = new message_1.MessageSerializer();
        this.fd = fd;
    }
    _writeSync(buffer) {
        fs_1.default.writeSync(this.fd, buffer);
    }
    writeSync(message) {
        const buffers = this.serializer.serialize(message);
        for (const buffer of buffers)
            this._writeSync(buffer);
    }
}
exports.SyncWriter = SyncWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2VydmljZXMvdXRpbHMvaXBjL2lvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNENBQW9CO0FBQ3BCLGtEQUEwQjtBQUMxQixzREFBOEI7QUFDOUIsdUNBQTZEO0FBQzdELDZGQUE4RDtBQUc5RCxNQUFNLFdBQVcsR0FBRyxlQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUU1RCxNQUFhLFdBQVksU0FBUSw2QkFBWTtJQUt6QyxZQUFvQixNQUE2QjtRQUM3QyxLQUFLLEVBQUUsQ0FBQztRQUVSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVPLE9BQU8sQ0FBRSxJQUFZO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTtZQUNoQixPQUFPO1FBRVgsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRU8sS0FBSyxDQUFDLGdCQUFnQixDQUFFLFFBQWtCO1FBQzlDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzVCLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNwQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtT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QUFDLG1CQUFtQixFQUFFLENBQUM7WUFFM0IsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdkM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUF2Q0QsZ0NBdUNDO0FBRUQsTUFBYSxVQUFVO0lBSW5CLFlBQW9CLEVBQVU7UUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLDJCQUFpQixFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLEVBQUUsR0FBVyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVPLFVBQVUsQ0FBRSxNQUFjO1FBQzlCLFlBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sU0FBUyxDQUFFLE9BQWU7UUFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbkQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPO1lBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBbkJELGdDQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IFBhY2tldCBmcm9tICcuL3BhY2tldCc7XG5pbXBvcnQgeyBNZXNzYWdlUGFyc2VyLCBNZXNzYWdlU2VyaWFsaXplciB9IGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuXG5cbmNvbnN0IGRlYnVnTG9nZ2VyID0gZGVidWcoJ3Rlc3RjYWZlOnNlcnZpY2VzOnV0aWxzOmlwYzppbycpO1xuXG5leHBvcnQgY2xhc3MgQXN5bmNSZWFkZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcGFyc2VyOiBNZXNzYWdlUGFyc2VyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RyZWFtOiBOb2RlSlMuUmVhZGFibGVTdHJlYW07XG4gICAgcHJpdmF0ZSBwcm9jZXNzTWVzc2FnZXM6IFByb21pc2U8dm9pZD47XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IgKHN0cmVhbTogTm9kZUpTLlJlYWRhYmxlU3RyZWFtKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5wYXJzZXIgPSBuZXcgTWVzc2FnZVBhcnNlcigpO1xuICAgICAgICB0aGlzLnN0cmVhbSA9IHN0cmVhbTtcblxuICAgICAgICB0aGlzLnByb2Nlc3NNZXNzYWdlcyA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29uRGF0YSAoZGF0YTogQnVmZmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5wYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzTWVzc2FnZXMgPSB0aGlzLnByb2Nlc3NNZXNzYWdlcy50aGVuKCgpID0+IHRoaXMuX3Byb2Nlc3NNZXNzYWdlcyhtZXNzYWdlcykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NNZXNzYWdlcyAobWVzc2FnZXM6IG9iamVjdFtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBtZXNzYWdlcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2RhdGEnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZGVidWdMb2dnZXIoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVhZCAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3RyZWFtLm9uKCdkYXRhJywgZGF0YSA9PiB0aGlzLl9vbkRhdGEoZGF0YSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFzeW5jV3JpdGVyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlcmlhbGl6ZXI6IE1lc3NhZ2VTZXJpYWxpemVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RyZWFtOiBOb2RlSlMuV3JpdGFibGVTdHJlYW07XG5cbiAgICBwcml2YXRlIGJhdGNoUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciAoc3RyZWFtOiBOb2RlSlMuV3JpdGFibGVTdHJlYW0pIHtcbiAgICAgICAgdGhpcy5zZXJpYWxpemVyID0gbmV3IE1lc3NhZ2VTZXJpYWxpemVyKCk7XG4gICAgICAgIHRoaXMuc3RyZWFtICAgICA9IHN0cmVhbTtcblxuICAgICAgICB0aGlzLmJhdGNoUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3dyaXRlIChidWZmZXI6IEJ1ZmZlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy5zdHJlYW0ud3JpdGUoYnVmZmVyKSlcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UociA9PiB0aGlzLnN0cmVhbS5vbmNlKCdkcmFpbicsIHIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF93cml0ZUJ1ZmZlcnMgKGJ1ZmZlcnM6IEJ1ZmZlcltdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuYmF0Y2hQcm9taXNlID0gdGhpcy5iYXRjaFByb21pc2VcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7fSlcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGJ1ZmZlciBvZiBidWZmZXJzKVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl93cml0ZShidWZmZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYmF0Y2hQcm9taXNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB3cml0ZSAobWVzc2FnZTogb2JqZWN0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlcnMgPSB0aGlzLnNlcmlhbGl6ZXIuc2VyaWFsaXplKG1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl93cml0ZUJ1ZmZlcnMoYnVmZmVycyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3luY1JlYWRlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBwYXJzZXI6IE1lc3NhZ2VQYXJzZXI7XG4gICAgcHJpdmF0ZSByZWFkb25seSBmZDogbnVtYmVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVzc2FnZVF1ZXVlOiBvYmplY3RbXTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciAoZmQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnBhcnNlciA9IG5ldyBNZXNzYWdlUGFyc2VyKCk7XG4gICAgICAgIHRoaXMuZmQgICAgID0gZmQ7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUgPSBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWFkU3luYyAoKTogQnVmZmVyIHtcbiAgICAgICAgY29uc3QgYnVmZmVyICAgICA9IEJ1ZmZlci5hbGxvYyhQYWNrZXQuTUFYX1BBQ0tFVF9TSVpFKTtcbiAgICAgICAgY29uc3QgcmVhZExlbmd0aCA9IGZzLnJlYWRTeW5jKHRoaXMuZmQsIGJ1ZmZlciwgMCwgUGFja2V0Lk1BWF9QQUNLRVRfU0laRSwgbnVsbCk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlci5zbGljZSgwLCByZWFkTGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRNZXNzYWdlc1RvUXVldWUgKCk6IHZvaWQge1xuICAgICAgICBsZXQgbWVzc2FnZXMgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLl9yZWFkU3luYygpKTtcblxuICAgICAgICB3aGlsZSAoIW1lc3NhZ2VzLmxlbmd0aClcbiAgICAgICAgICAgIG1lc3NhZ2VzID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5fcmVhZFN5bmMoKSk7XG5cbiAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUucHVzaCguLi5tZXNzYWdlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlYWRTeW5jICgpOiBvYmplY3Qge1xuICAgICAgICBsZXQgbWVzc2FnZSA9IHRoaXMubWVzc2FnZVF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgd2hpbGUgKCFtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRNZXNzYWdlc1RvUXVldWUoKTtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IHRoaXMubWVzc2FnZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTeW5jV3JpdGVyIHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlcmlhbGl6ZXI6IE1lc3NhZ2VTZXJpYWxpemVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZmQ6IG51bWJlcjtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciAoZmQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNlcmlhbGl6ZXIgPSBuZXcgTWVzc2FnZVNlcmlhbGl6ZXIoKTtcbiAgICAgICAgdGhpcy5mZCAgICAgICAgID0gZmQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfd3JpdGVTeW5jIChidWZmZXI6IEJ1ZmZlcik6IHZvaWQge1xuICAgICAgICBmcy53cml0ZVN5bmModGhpcy5mZCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd3JpdGVTeW5jIChtZXNzYWdlOiBvYmplY3QpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgYnVmZmVycyA9IHRoaXMuc2VyaWFsaXplci5zZXJpYWxpemUobWVzc2FnZSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBidWZmZXIgb2YgYnVmZmVycylcbiAgICAgICAgICAgIHRoaXMuX3dyaXRlU3luYyhidWZmZXIpO1xuICAgIH1cbn1cbiJdfQ==