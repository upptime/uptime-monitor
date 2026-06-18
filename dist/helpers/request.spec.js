"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const request_1 = require("./request");
describe("curl request helper", () => {
    jest.setTimeout(10000);
    let server;
    afterEach(() => new Promise((resolve) => {
        if (!server?.listening) {
            server = undefined;
            return resolve();
        }
        server.close(() => {
            server = undefined;
            resolve();
        });
    }));
    const listenWithHeadResponse = () => new Promise((resolve) => {
        server = (0, http_1.createServer)((req, res) => {
            if (req.method === "HEAD") {
                res.writeHead(200, {
                    "Content-Length": "12345",
                    "Content-Type": "application/octet-stream",
                });
                return res.end();
            }
            res.writeHead(200, {
                "Content-Length": "2",
                "Content-Type": "text/plain",
            });
            return res.end("ok");
        });
        server.listen(0, "127.0.0.1", () => {
            const { port } = server?.address();
            resolve(`http://127.0.0.1:${port}/file.bin`);
        });
    });
    it("treats HEAD as header-only even when Content-Length is present", async () => {
        const url = await listenWithHeadResponse();
        const result = await (0, request_1.curl)({
            name: "Large file",
            url,
            method: "HEAD",
            maxRetries: 1,
            connectTimeout: 5,
            requestTimeout: 1,
        });
        expect(result.httpCode).toBe(200);
    });
});
//# sourceMappingURL=request.spec.js.map