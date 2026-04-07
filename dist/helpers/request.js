"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curl = void 0;
const node_libcurl_1 = require("node-libcurl");
const environment_1 = require("./environment");
/** Default maximum number of retries for transient curl errors (HTTP 0) */
const DEFAULT_MAX_RETRIES = 3;
/** Default connect timeout in seconds */
const DEFAULT_CONNECT_TIMEOUT = 30;
/** Default request timeout in seconds */
const DEFAULT_REQUEST_TIMEOUT = 60;
/** Delay in milliseconds between curl retries (doubles each attempt) */
const INITIAL_RETRY_DELAY_MS = 1000;
/** Errors that are considered transient and worth retrying */
const TRANSIENT_ERROR_PATTERNS = [
    "Timeout was reached",
    "Failed sending data to the peer",
    "Connection timed out",
    "Connection reset by peer",
    "Couldn't connect to server",
    "SSL connection timeout",
    "Failure when receiving data from the peer",
    "OpenSSL SSL_read: Connection reset by peer",
    "recv failure",
    "Operation timed out",
    "Empty reply from server",
    "TLS connect error",
    "Could not resolve host",
    "No route to host",
];
/**
 * Determine whether a curl error is transient (i.e. retrying may succeed).
 */
function isTransientError(error) {
    const message = typeof error === "string" ? error : error.message || String(error);
    return TRANSIENT_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}
/**
 * Sleep for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Perform a single curl request for the given site configuration.
 * Returns the HTTP status code, total time, and response body.
 */
const curlOnce = (site) => new Promise((resolve) => {
    const url = (0, environment_1.replaceEnvironmentVariables)(site.url);
    const method = site.method || "GET";
    const maxRedirects = Number.isInteger(site.maxRedirects) ? Number(site.maxRedirects) : 3;
    const connectTimeout = site.connectTimeout || DEFAULT_CONNECT_TIMEOUT;
    const requestTimeout = site.requestTimeout || DEFAULT_REQUEST_TIMEOUT;
    const curlHandle = new node_libcurl_1.Curl();
    curlHandle.enable(node_libcurl_1.CurlFeature.Raw);
    curlHandle.setOpt("URL", url);
    if (site.headers)
        curlHandle.setOpt(node_libcurl_1.Curl.option.HTTPHEADER, site.headers.map(environment_1.replaceEnvironmentVariables));
    if (site.body)
        curlHandle.setOpt("POSTFIELDS", (0, environment_1.replaceEnvironmentVariables)(site.body));
    if (site.__dangerous__insecure || site.__dangerous__disable_verify_peer)
        curlHandle.setOpt("SSL_VERIFYPEER", false);
    if (site.__dangerous__insecure || site.__dangerous__disable_verify_host)
        curlHandle.setOpt("SSL_VERIFYHOST", false);
    curlHandle.setOpt("FOLLOWLOCATION", maxRedirects ? 1 : 0);
    curlHandle.setOpt("MAXREDIRS", maxRedirects);
    curlHandle.setOpt("USERAGENT", "upptime.js.org");
    curlHandle.setOpt("HEADER", 1);
    // Timeouts: use site-level overrides or generous defaults to avoid false positives
    curlHandle.setOpt("CONNECTTIMEOUT", connectTimeout);
    curlHandle.setOpt("TIMEOUT", requestTimeout);
    // Force a fresh connection to avoid stale/broken persistent connections
    // which are a known cause of "Failed sending data to the peer" errors
    // See: https://github.com/curl/curl/issues/10591
    curlHandle.setOpt("FRESH_CONNECT", true);
    curlHandle.setOpt("FORBID_REUSE", true);
    // DNS cache timeout to avoid stale DNS entries
    curlHandle.setOpt("DNS_CACHE_TIMEOUT", 0);
    if (site.verbose) {
        curlHandle.setOpt("VERBOSE", true);
    }
    else {
        curlHandle.setOpt("VERBOSE", false);
    }
    curlHandle.setOpt("CUSTOMREQUEST", method);
    curlHandle.on("error", (error) => {
        curlHandle.close();
        return resolve({ httpCode: 0, totalTime: 0, data: "", error });
    });
    curlHandle.on("end", (_, data) => {
        if (typeof data !== "string")
            data = data.toString();
        let httpCode = 0;
        let totalTime = 0;
        try {
            httpCode = Number(curlHandle.getInfo("RESPONSE_CODE"));
            totalTime = Number(curlHandle.getInfo("TOTAL_TIME"));
        }
        catch (error) {
            curlHandle.close();
            console.log("Got an error extracting curl info (on end)", error);
            return resolve({ httpCode, totalTime, data });
        }
        curlHandle.close();
        return resolve({ httpCode, totalTime, data });
    });
    curlHandle.perform();
});
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
const curl = async (site) => {
    const maxRetries = site.maxRetries ?? DEFAULT_MAX_RETRIES;
    let lastResult = {
        httpCode: 0,
        totalTime: 0,
        data: "",
    };
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        lastResult = await curlOnce(site);
        // If we got a valid HTTP response (any non-zero code), return immediately
        if (lastResult.httpCode !== 0) {
            if (attempt > 1) {
                console.log(`Curl succeeded on attempt ${attempt} with HTTP ${lastResult.httpCode}`);
            }
            return {
                httpCode: lastResult.httpCode,
                totalTime: lastResult.totalTime,
                data: lastResult.data,
            };
        }
        // HTTP 0 — determine if we should retry
        const errorMessage = lastResult.error
            ? lastResult.error.message || String(lastResult.error)
            : "Unknown error";
        console.log(`Curl attempt ${attempt}/${maxRetries} returned HTTP 0: ${errorMessage}`);
        if (attempt < maxRetries) {
            // Only retry if the error looks transient, or if we have no error info
            // (which itself suggests a transient issue like a dropped connection)
            if (!lastResult.error || isTransientError(lastResult.error)) {
                const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(`Retrying in ${delayMs}ms...`);
                await sleep(delayMs);
            }
            else {
                // Non-transient error (e.g., malformed URL) — no point retrying
                console.log(`Error does not appear transient, skipping further retries`);
                break;
            }
        }
    }
    // All retries exhausted or non-transient error
    console.log(`All ${maxRetries} curl attempts failed for ${(0, environment_1.replaceEnvironmentVariables)(site.url)}, returning HTTP 0`);
    return { httpCode: lastResult.httpCode, totalTime: lastResult.totalTime, data: lastResult.data };
};
exports.curl = curl;
//# sourceMappingURL=request.js.map