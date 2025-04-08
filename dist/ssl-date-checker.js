"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checker = void 0;
const https_1 = __importDefault(require("https"));
function checkHost(newHost) {
    if (!newHost) {
        throw new Error("Invalid host");
    }
    return true;
}
function checkPort(newPort) {
    const portVal = newPort || 443;
    const numericPort = !isNaN(parseFloat(portVal.toString())) && isFinite(portVal);
    if (numericPort === false) {
        throw new Error("Invalid port");
    }
    return true;
}
async function checker(host, port) {
    if (host === null || port === null) {
        throw new Error("Invalid host or port");
    }
    checkHost(host);
    checkPort(port);
    return new Promise((resolve, reject) => {
        const options = {
            host,
            port,
            method: "GET",
            rejectUnauthorized: false,
        };
        const req = https_1.default.request(options, function (res) {
            res.on("data", (d) => {
                // process.stdout.write(d);
            });
            const certificateInfo = res.socket.getPeerCertificate();
            console.log(certificateInfo);
            const dateInfo = {
                valid_from: certificateInfo.valid_from,
                valid_to: certificateInfo.valid_to,
                serialNumber: certificateInfo.serialNumber,
                fingerprint: certificateInfo.fingerprint,
            };
            resolve(dateInfo);
        });
        req.on("error", (e) => {
            reject(e);
        });
        req.end();
    });
}
exports.checker = checker;
module.exports = checker;
//# sourceMappingURL=ssl-date-checker.js.map