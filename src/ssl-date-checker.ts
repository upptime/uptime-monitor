// Source: https://github.com/rheh/ssl-date-checker/blob/master/src/Checker.js
import https from "https";
import { TLSSocket } from "tls";

function checkHost(newHost: string) {
  if (!newHost) {
    throw new Error("Invalid host");
  }

  return true;
}

function checkPort(newPort: number) {
  const portVal = newPort || 443;
  const numericPort = !isNaN(parseFloat(portVal.toString())) && isFinite(portVal);

  if (numericPort === false) {
    throw new Error("Invalid port");
  }

  return true;
}

export async function checker(
  host: string,
  port: number
): Promise<{
  valid_from: string;
  valid_to: string;
  serialNumber: string;
  fingerprint: string;
}> {
  if (host === null || port === null) {
    throw new Error("Invalid host or port");
  }

  checkHost(host);
  checkPort(port);

  return new Promise((resolve, reject) => {
    const options = {
      host,
      port,
      method: "GET",
      rejectUnauthorized: false,
    };

    const req = https.request(options, function (res) {
      res.on("data", (d) => {
        // process.stdout.write(d);
      });

      const certificateInfo = (res.socket as TLSSocket).getPeerCertificate();

      console.log(certificateInfo);

      const dateInfo = {
        valid_from: certificateInfo.valid_from,
        valid_to: certificateInfo.valid_to,
        serialNumber: certificateInfo.serialNumber,
        fingerprint: certificateInfo.fingerprint,
      };

      resolve(dateInfo);
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}
