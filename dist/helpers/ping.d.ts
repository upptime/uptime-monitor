import tcpp from "tcp-ping";
import type { Options } from "tcp-ping";
/**
 * Promisified TCP pinging
 * @param options - tcpp.ping options
 */
export declare const ping: (options: Options) => Promise<tcpp.Result>;
