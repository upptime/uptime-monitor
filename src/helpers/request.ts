import { Curl, CurlFeature } from "node-libcurl";
import { UpptimeConfig } from "../interfaces";
import { replaceEnvironmentVariables } from "./environment";

export const curl = (
  site: UpptimeConfig["sites"][0]
): Promise<{ httpCode: number; totalTime: number; data: string }> =>
  new Promise((resolve) => {
    const url = replaceEnvironmentVariables(site.url);
    const method = site.method || "GET";
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
    curl.setOpt("FOLLOWLOCATION", 1);
    curl.setOpt("MAXREDIRS", 3);
    curl.setOpt("USERAGENT", "Koj Bot");
    curl.setOpt("CONNECTTIMEOUT", 10);
    curl.setOpt("TIMEOUT", 30);
    curl.setOpt("HEADER", 1);
    curl.setOpt("VERBOSE", false);
    curl.setOpt("CUSTOMREQUEST", method);
    curl.on("error", () => {
      curl.close();
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
        return resolve({ httpCode, totalTime, data });
      }
      return resolve({ httpCode, totalTime, data });
    });
    curl.perform();
  });
