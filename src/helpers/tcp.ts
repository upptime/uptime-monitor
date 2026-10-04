import { connect } from "net";

/** Maximum number of bytes read from the socket before the check stops reading */
export const TCP_MAX_BYTES = 64 * 1024;

export interface TcpReadOptions {
  host: string;
  port: number;
  /** Data written to the socket after it connects */
  payload?: string;
  /** IP address family used to resolve the host */
  family?: 4 | 6;
  /** Milliseconds to wait for the connection */
  connectTimeout: number;
  /** Milliseconds without data, after the connection opens, before the read stops */
  readTimeout: number;
  /** Return true to stop reading; called after each chunk. Without it, the read stops on connect. */
  isDone?: (data: string) => boolean;
}

export interface TcpReadResult {
  /** Data received from the server (at most TCP_MAX_BYTES) */
  data: string;
  /** Milliseconds from the start of the connection to the end of the read */
  responseTime: number;
}

/**
 * Open a TCP connection, optionally send a payload, and read the response.
 * Rejects if the connection cannot be opened. After the connection opens, the
 * promise resolves with the data received so far when `isDone` returns true,
 * the server closes the connection, the byte cap is reached, or no data
 * arrives for `readTimeout` milliseconds.
 */
export const tcpRead = (options: TcpReadOptions) =>
  new Promise<TcpReadResult>((resolve, reject) => {
    const start = Date.now();
    const chunks: Buffer[] = [];
    let received = 0;
    let connected = false;
    let settled = false;

    const socket = connect({ host: options.host, port: options.port, family: options.family });
    socket.setTimeout(options.connectTimeout);

    const data = () => Buffer.concat(chunks).subarray(0, TCP_MAX_BYTES).toString("utf8");
    const finish = () => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ data: data(), responseTime: Date.now() - start });
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(error);
    };

    socket.on("connect", () => {
      connected = true;
      if (!options.isDone) return finish();
      socket.setTimeout(options.readTimeout);
      if (options.payload) socket.write(options.payload);
    });
    socket.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      received += chunk.length;
      if (received >= TCP_MAX_BYTES || options.isDone?.(data())) finish();
    });
    socket.on("timeout", () => {
      if (connected) finish();
      else fail(Object.assign(new Error("Connection timed out"), { code: "ETIMEDOUT" }));
    });
    socket.on("end", finish);
    socket.on("close", () =>
      connected
        ? finish()
        : fail(Object.assign(new Error("Connection closed"), { code: "ECONNCLOSED" }))
    );
    socket.on("error", (error) => (connected ? finish() : fail(error)));
  });
