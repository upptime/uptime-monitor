import { AddressInfo, createServer, Server, Socket } from "net";
import { tcpRead, TCP_MAX_BYTES } from "./tcp";

const listen = (onConnection: (socket: Socket) => void) =>
  new Promise<Server>((resolve) => {
    const server = createServer((socket) => {
      // The client can reset the connection while data is still in flight
      socket.on("error", () => undefined);
      onConnection(socket);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

const portOf = (server: Server) => (server.address() as AddressInfo).port;

const close = (server: Server) => new Promise((resolve) => server.close(resolve));

describe("tcpRead", () => {
  let server: Server | undefined;
  const sockets: Socket[] = [];

  afterEach(async () => {
    sockets.forEach((socket) => socket.destroy());
    sockets.length = 0;
    if (server) await close(server);
    server = undefined;
  });

  const options = { host: "127.0.0.1", connectTimeout: 1000, readTimeout: 200 };

  it("returns the banner that the server sends", async () => {
    server = await listen((socket) => {
      sockets.push(socket);
      socket.write("SSH-2.0-OpenSSH_9.9\r\n");
    });

    const result = await tcpRead({
      ...options,
      port: portOf(server),
      isDone: (data) => data.includes("\n"),
    });

    expect(result.data).toBe("SSH-2.0-OpenSSH_9.9\r\n");
  });

  it("returns empty data when the server accepts the connection but sends nothing", async () => {
    server = await listen((socket) => sockets.push(socket));

    const result = await tcpRead({ ...options, port: portOf(server), isDone: () => false });

    expect(result.data).toBe("");
    expect(result.responseTime).toBeGreaterThanOrEqual(options.readTimeout - 10);
  });

  it("sends the payload and reads the reply", async () => {
    server = await listen((socket) => {
      sockets.push(socket);
      socket.on("data", (data) => {
        if (data.toString() === "PING\r\n") socket.write("+PONG\r\n");
      });
    });

    const result = await tcpRead({
      ...options,
      port: portOf(server),
      payload: "PING\r\n",
      isDone: (data) => data.includes("PONG"),
    });

    expect(result.data).toBe("+PONG\r\n");
  });

  it("returns the data received before the server closes the connection", async () => {
    server = await listen((socket) => socket.end("bye\n"));

    const result = await tcpRead({ ...options, port: portOf(server), isDone: () => false });

    expect(result.data).toBe("bye\n");
  });

  it("stops at the connection when no isDone function is given", async () => {
    server = await listen((socket) => sockets.push(socket));

    const result = await tcpRead({ ...options, port: portOf(server) });

    expect(result.data).toBe("");
    expect(result.responseTime).toBeLessThan(options.readTimeout);
  });

  it("stops reading at the byte cap", async () => {
    server = await listen((socket) => {
      sockets.push(socket);
      socket.write(Buffer.alloc(TCP_MAX_BYTES * 2, "a"));
    });

    const result = await tcpRead({ ...options, port: portOf(server), isDone: () => false });

    expect(result.data.length).toBe(TCP_MAX_BYTES);
  });

  it("rejects when the connection is refused", async () => {
    server = await listen(() => undefined);
    const port = portOf(server);
    await close(server);
    server = undefined;

    await expect(tcpRead({ ...options, port, isDone: () => false })).rejects.toThrow();
  });
});
