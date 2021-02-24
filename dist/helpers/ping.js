"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = void 0;
const tcp_ping_1 = __importDefault(require("tcp-ping"));
/**
 * Promisified TCP pinging
 * @param options - tcpp.ping options
 */
const ping = (options) => new Promise((resolve, reject) => {
    tcp_ping_1.default.ping(options, (error, data) => {
        if (error)
            return reject(error);
        resolve(data);
    });
});
exports.ping = ping;
//# sourceMappingURL=ping.js.map