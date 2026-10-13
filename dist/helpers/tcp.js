"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tcpRead = exports.TCP_MAX_BYTES = void 0;
const net_1 = require("net");
/** Maximum number of bytes read from the socket before the check stops reading */
exports.TCP_MAX_BYTES = 64 * 1024;
/**
 * Open a TCP connection, optionally send a payload, and read the response.
 * Rejects if the connection cannot be opened. After the connection opens, the
 * promise resolves with the data received so far when `isDone` returns true,
 * the server closes the connection, the byte cap is reached, or no data
 * arrives for `readTimeout` milliseconds.
 */
const tcpRead = (options) => new Promise((resolve, reject) => {
    const start = Date.now();
    const chunks = [];
    let received = 0;
    let connected = false;
    let settled = false;
    const socket = (0, net_1.connect)({ host: options.host, port: options.port, family: options.family });
    socket.setTimeout(options.connectTimeout);
    const data = () => Buffer.concat(chunks).subarray(0, exports.TCP_MAX_BYTES).toString("utf8");
    const finish = () => {
        if (settled)
            return;
        settled = true;
        socket.destroy();
        resolve({ data: data(), responseTime: Date.now() - start });
    };
    const fail = (error) => {
        if (settled)
            return;
        settled = true;
        socket.destroy();
        reject(error);
    };
    socket.on("connect", () => {
        connected = true;
        if (!options.isDone)
            return finish();
        socket.setTimeout(options.readTimeout);
        if (options.payload)
            socket.write(options.payload);
    });
    socket.on("data", (chunk) => {
        chunks.push(chunk);
        received += chunk.length;
        if (received >= exports.TCP_MAX_BYTES || options.isDone?.(data()))
            finish();
    });
    socket.on("timeout", () => {
        if (connected)
            finish();
        else
            fail(Object.assign(new Error("Connection timed out"), { code: "ETIMEDOUT" }));
    });
    socket.on("end", finish);
    socket.on("close", () => connected
        ? finish()
        : fail(Object.assign(new Error("Connection closed"), { code: "ECONNCLOSED" })));
    socket.on("error", (error) => (connected ? finish() : fail(error)));
});
exports.tcpRead = tcpRead;
//# sourceMappingURL=tcp.js.map