import { checkTls } from "./check-tls";

test("checkTls", async () => {
  const tcpResult = await checkTls({
    address: "smtp.gmail.com",
    port: 465,
  });
  expect(tcpResult.results.every(
    (result) => Object.prototype.toString.call((result as any).err) === "[object Error]"
  )).toBe(false);
  expect(tcpResult.avg || -1).toBeGreaterThan(0);
  expect(tcpResult.avg || 0).toBeLessThan(60000);
});

test("checkTls2", async () => {
  const tcpResult = await checkTls({
    address: "wrong.host.badssl.com",
  });
  expect(tcpResult.results.every(
    (result) => Object.prototype.toString.call((result as any).err) === "[object Error]"
  )).toBe(true);
  expect(tcpResult.avg).toBe(0);
});

test("checkTls3", async () => {
  const tcpResult = await checkTls({
    address: "expired.host.badssl.com",
  });
  expect(tcpResult.results.every(
    (result) => Object.prototype.toString.call((result as any).err) === "[object Error]"
  )).toBe(true);
  expect(tcpResult.avg).toBe(0);
});

test("checkTls4", async () => {
  const tcpResult = await checkTls({
    address: "self-signed.badssl.com",
  });
  expect(tcpResult.results.every(
    (result) => Object.prototype.toString.call((result as any).err) === "[object Error]"
  )).toBe(true);
  expect(tcpResult.avg).toBe(0);
});
