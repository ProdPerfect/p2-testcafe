"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("../../../errors/runtime");
const types_1 = require("../../../errors/types");
const HEAD_MASK = 0x01;
const TAIL_MASK = 0x02;
const BYTE_SHIFT = 8;
const BYTE_MASK = 2 ** BYTE_SHIFT - 1;
class Packet {
    static _parseHeader(buffer) {
        const dataSize = buffer[1] << BYTE_SHIFT << BYTE_SHIFT | buffer[2] << BYTE_SHIFT | buffer[3];
        return {
            head: Boolean(buffer[0] & HEAD_MASK),
            tail: Boolean(buffer[0] & TAIL_MASK),
            size: dataSize,
            totalSize: dataSize + Packet.HEADER_SIZE
        };
    }
    static parse(buffer) {
        if (buffer.length < Packet.HEADER_SIZE)
            return void 0;
        const header = Packet._parseHeader(buffer);
        if (header.size > this.MAX_PAYLOAD_SIZE)
            throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.tooLargeIPCPayload);
        if (buffer.length < header.size)
            return void 0;
        return { header, data: buffer.slice(Packet.HEADER_SIZE, Packet.HEADER_SIZE + header.size) };
    }
    static _serializeHeader({ size, head, tail }, buffer) {
        buffer[0] = 0;
        if (head)
            buffer[0] |= HEAD_MASK;
        if (tail)
            buffer[0] |= TAIL_MASK;
        buffer[1] = size >> BYTE_SHIFT >> BYTE_SHIFT & BYTE_MASK;
        buffer[2] = size >> BYTE_SHIFT & BYTE_MASK;
        buffer[3] = size & BYTE_MASK;
    }
    static serialize(data, { head = false, tail = false } = {}) {
        const size = data.length;
        if (size > Packet.MAX_PAYLOAD_SIZE)
            throw new runtime_1.GeneralError(types_1.RUNTIME_ERRORS.tooLargeIPCPayload);
        const buffer = Buffer.alloc(size + Packet.HEADER_SIZE);
        Packet._serializeHeader({ size, head, tail }, buffer);
        data.copy(buffer, Packet.HEADER_SIZE);
        return buffer;
    }
}
exports.Packet = Packet;
// NOTE: Max message size: 64 KiB, header size: 4 B
Packet.MAX_PACKET_SIZE = 64 * 2 ** 10;
Packet.HEADER_SIZE = 4;
Packet.MAX_PAYLOAD_SIZE = Packet.MAX_PACKET_SIZE - Packet.HEADER_SIZE;
exports.default = Packet;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NlcnZpY2VzL3V0aWxzL2lwYy9wYWNrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBdUQ7QUFDdkQsaURBQXVEO0FBR3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUN2QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFFdkIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLE1BQU0sU0FBUyxHQUFJLENBQUMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBb0J2QyxNQUFhLE1BQU07SUFNUCxNQUFNLENBQUMsWUFBWSxDQUFFLE1BQWM7UUFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0YsT0FBTztZQUNILElBQUksRUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUN6QyxJQUFJLEVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDekMsSUFBSSxFQUFPLFFBQVE7WUFDbkIsU0FBUyxFQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVztTQUMzQyxDQUFDO0lBQ04sQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUUsTUFBYztRQUMvQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVc7WUFDbEMsT0FBTyxLQUFLLENBQUMsQ0FBQztRQUVsQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCO1lBQ25DLE1BQU0sSUFBSSxzQkFBWSxDQUFDLHNCQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUU5RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUk7WUFDM0IsT0FBTyxLQUFLLENBQUMsQ0FBQztRQUVsQixPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNoRyxDQUFDO0lBRU8sTUFBTSxDQUFDLGdCQUFnQixDQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQW9CLEVBQUUsTUFBYztRQUNuRixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWQsSUFBSSxJQUFJO1lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUUzQixJQUFJLElBQUk7WUFDSixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksVUFBVSxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDekQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUyxDQUFFLElBQVksRUFBRSxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUUsSUFBSSxHQUFHLEtBQUssS0FBaUMsRUFBRTtRQUNsRyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXpCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7WUFDOUIsTUFBTSxJQUFJLHNCQUFZLENBQUMsc0JBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTlELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV2RCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0QyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOztBQTNETCx3QkE0REM7QUEzREcsbURBQW1EO0FBQzVCLHNCQUFlLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0Isa0JBQVcsR0FBRyxDQUFDLENBQUM7QUFDaEIsdUJBQWdCLEdBQUcsTUFBTSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBMEQxRixrQkFBZSxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHZW5lcmFsRXJyb3IgfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uLy4uL2Vycm9ycy90eXBlcyc7XG5cblxuY29uc3QgSEVBRF9NQVNLID0gMHgwMTtcbmNvbnN0IFRBSUxfTUFTSyA9IDB4MDI7XG5cbmNvbnN0IEJZVEVfU0hJRlQgPSA4O1xuY29uc3QgQllURV9NQVNLICA9IDIgKiogQllURV9TSElGVCAtIDE7XG5cbmludGVyZmFjZSBQYWNrZXRIZWFkZXJGbGFncyB7XG4gICAgaGVhZDogYm9vbGVhbjtcbiAgICB0YWlsOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUGFja2V0SGVhZGVyRGF0YSBleHRlbmRzIFBhY2tldEhlYWRlckZsYWdzIHtcbiAgICBzaXplOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFja2V0SGVhZGVyIGV4dGVuZHMgUGFja2V0SGVhZGVyRGF0YXtcbiAgICB0b3RhbFNpemU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRQYWNrZXQge1xuICAgIGhlYWRlcjogUGFja2V0SGVhZGVyO1xuICAgIGRhdGE6IEJ1ZmZlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFBhY2tldCB7XG4gICAgLy8gTk9URTogTWF4IG1lc3NhZ2Ugc2l6ZTogNjQgS2lCLCBoZWFkZXIgc2l6ZTogNCBCXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQVhfUEFDS0VUX1NJWkUgPSA2NCAqIDIgKiogMTA7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBIRUFERVJfU0laRSA9IDQ7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQVhfUEFZTE9BRF9TSVpFID0gUGFja2V0Lk1BWF9QQUNLRVRfU0laRSAtIFBhY2tldC5IRUFERVJfU0laRTtcblxuICAgIHByaXZhdGUgc3RhdGljIF9wYXJzZUhlYWRlciAoYnVmZmVyOiBCdWZmZXIpOiBQYWNrZXRIZWFkZXIge1xuICAgICAgICBjb25zdCBkYXRhU2l6ZSA9IGJ1ZmZlclsxXSA8PCBCWVRFX1NISUZUIDw8IEJZVEVfU0hJRlQgfCBidWZmZXJbMl0gPDwgQllURV9TSElGVCB8IGJ1ZmZlclszXTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGVhZDogICAgICBCb29sZWFuKGJ1ZmZlclswXSAmIEhFQURfTUFTSyksXG4gICAgICAgICAgICB0YWlsOiAgICAgIEJvb2xlYW4oYnVmZmVyWzBdICYgVEFJTF9NQVNLKSxcbiAgICAgICAgICAgIHNpemU6ICAgICAgZGF0YVNpemUsXG4gICAgICAgICAgICB0b3RhbFNpemU6IGRhdGFTaXplICsgUGFja2V0LkhFQURFUl9TSVpFXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZSAoYnVmZmVyOiBCdWZmZXIpOiBQYXJzZWRQYWNrZXR8dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPCBQYWNrZXQuSEVBREVSX1NJWkUpXG4gICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IFBhY2tldC5fcGFyc2VIZWFkZXIoYnVmZmVyKTtcblxuICAgICAgICBpZiAoaGVhZGVyLnNpemUgPiB0aGlzLk1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLnRvb0xhcmdlSVBDUGF5bG9hZCk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPCBoZWFkZXIuc2l6ZSlcbiAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG5cbiAgICAgICAgcmV0dXJuIHsgaGVhZGVyLCBkYXRhOiBidWZmZXIuc2xpY2UoUGFja2V0LkhFQURFUl9TSVpFLCBQYWNrZXQuSEVBREVSX1NJWkUgKyBoZWFkZXIuc2l6ZSkgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfc2VyaWFsaXplSGVhZGVyICh7IHNpemUsIGhlYWQsIHRhaWwgfTogUGFja2V0SGVhZGVyRGF0YSwgYnVmZmVyOiBCdWZmZXIpOiB2b2lkIHtcbiAgICAgICAgYnVmZmVyWzBdID0gMDtcblxuICAgICAgICBpZiAoaGVhZClcbiAgICAgICAgICAgIGJ1ZmZlclswXSB8PSBIRUFEX01BU0s7XG5cbiAgICAgICAgaWYgKHRhaWwpXG4gICAgICAgICAgICBidWZmZXJbMF0gfD0gVEFJTF9NQVNLO1xuXG4gICAgICAgIGJ1ZmZlclsxXSA9IHNpemUgPj4gQllURV9TSElGVCA+PiBCWVRFX1NISUZUICYgQllURV9NQVNLO1xuICAgICAgICBidWZmZXJbMl0gPSBzaXplID4+IEJZVEVfU0hJRlQgJiBCWVRFX01BU0s7XG4gICAgICAgIGJ1ZmZlclszXSA9IHNpemUgJiBCWVRFX01BU0s7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemUgKGRhdGE6IEJ1ZmZlciwgeyBoZWFkID0gZmFsc2UsIHRhaWwgPSBmYWxzZSB9OiBQYXJ0aWFsPFBhY2tldEhlYWRlckZsYWdzPiA9IHt9KTogQnVmZmVyIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRhdGEubGVuZ3RoO1xuXG4gICAgICAgIGlmIChzaXplID4gUGFja2V0Lk1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLnRvb0xhcmdlSVBDUGF5bG9hZCk7XG5cbiAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKHNpemUgKyBQYWNrZXQuSEVBREVSX1NJWkUpO1xuXG4gICAgICAgIFBhY2tldC5fc2VyaWFsaXplSGVhZGVyKHsgc2l6ZSwgaGVhZCwgdGFpbCB9LCBidWZmZXIpO1xuXG4gICAgICAgIGRhdGEuY29weShidWZmZXIsIFBhY2tldC5IRUFERVJfU0laRSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhY2tldDtcblxuXG4iXX0=