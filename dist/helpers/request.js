"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curl = void 0;
const node_libcurl_1 = require("node-libcurl");
const environment_1 = require("./environment");
const curl = (site) => new Promise((resolve) => {
    const url = environment_1.replaceEnvironmentVariables(site.url);
    const method = site.method || "GET";
    const maxRedirects = Number.isInteger(site.maxRedirects) ? Number(site.maxRedirects) : 3;
    const curl = new node_libcurl_1.Curl();
    curl.enable(node_libcurl_1.CurlFeature.Raw);
    curl.setOpt("URL", url);
    if (site.headers)
        curl.setOpt(node_libcurl_1.Curl.option.HTTPHEADER, site.headers.map(environment_1.replaceEnvironmentVariables));
    if (site.body)
        curl.setOpt("POSTFIELDS", environment_1.replaceEnvironmentVariables(site.body));
    if (site.__dangerous__insecure || site.__dangerous__disable_verify_peer)
        curl.setOpt("SSL_VERIFYPEER", false);
    if (site.__dangerous__insecure || site.__dangerous__disable_verify_host)
        curl.setOpt("SSL_VERIFYHOST", false);
    curl.setOpt("FOLLOWLOCATION", maxRedirects ? 1 : 0);
    curl.setOpt("MAXREDIRS", maxRedirects);
    curl.setOpt("USERAGENT", "Koj Bot");
    curl.setOpt("CONNECTTIMEOUT", 10);
    curl.setOpt("TIMEOUT", 30);
    curl.setOpt("HEADER", 1);
    if (site.verbose) {
        curl.setOpt("VERBOSE", true);
    }
    else {
        curl.setOpt("VERBOSE", false);
    }
    curl.setOpt("CUSTOMREQUEST", method);
    curl.on("error", (error) => {
        curl.close();
        console.log("Got an error (on error)", error);
        return resolve({ httpCode: 0, totalTime: 0, data: "" });
    });
    curl.on("end", (_, data) => {
        if (typeof data !== "string")
            data = data.toString();
        let httpCode = 0;
        let totalTime = 0;
        try {
            httpCode = Number(curl.getInfo("RESPONSE_CODE"));
            totalTime = Number(curl.getInfo("TOTAL_TIME"));
        }
        catch (error) {
            curl.close();
            console.log("Got an error (on end)", error);
            return resolve({ httpCode, totalTime, data });
        }
        if (httpCode === 0 || totalTime === 0)
            console.log("Didn't get an error but got 0s");
        return resolve({ httpCode, totalTime, data });
    });
    curl.perform();
});
exports.curl = curl;
//# sourceMappingURL=request.js.map