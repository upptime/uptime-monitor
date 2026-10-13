/** Maximum number of bytes read from the socket before the check stops reading */
export declare const TCP_MAX_BYTES: number;
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
export declare const tcpRead: (options: TcpReadOptions) => Promise<TcpReadResult>;
