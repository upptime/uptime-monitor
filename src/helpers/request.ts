import { Curl, CurlFeature } from "node-libcurl";
import { UpptimeConfig } from "../interfaces";
import { replaceEnvironmentVariables } from "./environment";

export const curl = (
  site: UpptimeConfig["sites"][0]
): Promise<{ httpCode: number; totalTime: number; data: string }> =>
  new Promise((resolve) => {
    const url = replaceEnvironmentVariables(site.url);
    const method = site.method || "GET";
    const maxRedirects = Number.isInteger(site.maxRedirects) ? Number(site.maxRedirects) : 3;
    const curl = new Curl();
    curl.enable(CurlFeature.Raw);
    curl.setOpt("URL", url);
    if (site.headers)
      curl.setOpt(Curl.option.HTTPHEADER, site.headers.map(replaceEnvironmentVariables));
    if (site.body) curl.setOpt("POSTFIELDS", replaceEnvironmentVariables(site.body));
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

    if(site.verbose) {
      curl.setOpt("VERBOSE", true);
    } else {
      curl.setOpt("VERBOSE", false);
    }

    curl.setOpt("CUSTOMREQUEST", method);
    curl.on("error", (error) => {
      curl.close();
      console.log("Got an error (on error)", error);
      return resolve({ httpCode: 0, totalTime: 0, data: "" });
    });
    curl.on("end", (_, data) => {
      if (typeof data !== "string") data = data.toString();
      let httpCode = 0;
      let totalTime = 0;
      try {
        httpCode = Number(curl.getInfo("RESPONSE_CODE"));
        totalTime = Number(curl.getInfo("TOTAL_TIME"));
      } catch (error) {
        curl.close();
        console.log("Got an error (on end)", error);
        return resolve({ httpCode, totalTime, data });
      }
      if (httpCode === 0 || totalTime === 0) console.log("Didn't get an error but got 0s");
      return resolve({ httpCode, totalTime, data });
    });
    curl.perform();
  });
