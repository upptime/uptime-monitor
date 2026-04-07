import { UpptimeConfig } from "../interfaces";
/**
 * Perform an HTTP request with automatic retries for transient failures.
 *
 * When curl returns HTTP 0 (meaning no valid HTTP response was received),
 * the request is retried up to `maxRetries` times with exponential backoff.
 * This addresses false-positive downtime reports caused by:
 *   - Transient network issues on GitHub Actions runners
 *   - Stale/broken persistent connections ("Failed sending data to the peer")
 *   - Temporary DNS resolution failures
 *   - Brief SSL handshake timeouts
 *   - Servers that occasionally drop connections under load
 *
 * See: https://github.com/upptime/upptime/issues/171
 * See: https://github.com/upptime/upptime/issues/495
 * See: https://github.com/upptime/upptime/issues/1083
 */
export declare const curl: (site: UpptimeConfig["sites"][0]) => Promise<{
    httpCode: number;
    totalTime: number;
    data: string;
}>;
