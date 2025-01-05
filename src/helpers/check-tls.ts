import { connect } from "tls";
import { Options, Results, Result } from "tcp-ping";

export const checkTls = (options: Options) => new Promise<Result>((resolve, reject) => {
    let i = 0;
    const results: Results[] = [];
    const check = () => {
        if (i < (options.attempts || 10)) {
            doConnect();
        } else {
            resolve({
                address: options.address || "localhost",
                port: options.port || 443,
                attempts: options.attempts || 10,
                avg: results.reduce((acc, curr) => acc + (curr.time || 0), 0) / results.length,
                max: results.reduce((acc, curr) => Math.max(acc, curr.time || 0), 0),
                min: results.reduce((acc, curr) => Math.min(acc, curr.time || 0), Infinity),
                results: results,
            })
        }
    }
    const doConnect = () => {
        const start = process.hrtime();
        const socket = connect(options.port || 443, options.address, {
            servername: options.address,
            rejectUnauthorized: true,
            //checkServerIdentity: () => undefined,
        }, () => {
            const timeArr = process.hrtime(start);
            results.push({
                time: (timeArr[0] * 1e9 + timeArr[1]) / 1e6,
                seq: i,
            });
            socket.end();
            socket.destroy();
            i++;
            check();
        });

        socket.setTimeout(options.timeout || 5000, () => {
            results.push({
                time: undefined,
                seq: i,
                err: Error("Request timeout"),
            })
            socket.end();
            socket.destroy();
            i++;
            check();
        })

        socket.on("error", (error) => {
            results.push({
                time: undefined,
                seq: i,
                err: error,
            });
            socket.end();
            socket.destroy();
            i++;
            check();
        });
    }
    doConnect();
})