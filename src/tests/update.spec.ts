import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { performGlobalpingTest } from "../update";
import { UpptimeConfig } from "../interfaces";

describe("performGlobalpingTest", () => {
  let createMeasurementMock: any;
  let awaitMeasurementMock: any;
  let mockGlobalping: any;

  beforeEach(() => {
    createMeasurementMock = mock.fn();
    awaitMeasurementMock = mock.fn();
    mockGlobalping = {
      createMeasurement: createMeasurementMock,
      awaitMeasurement: awaitMeasurementMock,
    };
  });

  it("should perform HTTP test successfully", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "https://example.com",
      slug: "test-site",
      type: "globalping",
      location: "world",
      method: "GET",
      headers: ["Authorization: Bearer token", "Content-Type: application/json"],
      port: 443,
      expectedStatusCodes: [200, 201],
      maxResponseTime: 5000,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-123",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "Test response body",
              timings: {
                total: 1500,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "http",
      target: "example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "world" }],
      measurementOptions: {
        request: {
          host: "example.com",
          path: "/",
          query: undefined,
          method: "GET",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
        },
        port: 443,
        protocol: "HTTPS",
      },
    });

    assert.strictEqual(awaitMeasurementMock.mock.calls.length, 1);
    assert.strictEqual(awaitMeasurementMock.mock.calls[0].arguments[0], "measurement-123");

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "1500",
      status: "up",
    });
  });

  it("should perform icmp-ping test successfully", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "example.com",
      type: "globalping",
      location: "US",
      check: "icmp-ping",
      ipv6: true,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-123",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              stats: {
                avg: 500,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "ping",
      target: "example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "US" }],
      measurementOptions: {
        protocol: "ICMP",
        ipVersion: 6,
      },
    });

    assert.strictEqual(awaitMeasurementMock.mock.calls.length, 1);
    assert.strictEqual(awaitMeasurementMock.mock.calls[0].arguments[0], "measurement-123");

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "500",
      status: "up",
    });
  });

  it("should perform tcp-ping test successfully", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "example.com",
      type: "globalping",
      location: "Germany",
      check: "tcp-ping",
      port: 80,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-123",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              stats: {
                avg: 5.44,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "ping",
      target: "example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "Germany" }],
      measurementOptions: {
        protocol: "TCP",
        port: 80,
      },
    });

    assert.strictEqual(awaitMeasurementMock.mock.calls.length, 1);
    assert.strictEqual(awaitMeasurementMock.mock.calls[0].arguments[0], "measurement-123");

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "5",
      status: "up",
    });
  });

  it("should handle HTTP test with degraded performance", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Slow Site",
      url: "https://slow-example.com",
      slug: "slow-site",
      type: "globalping",
      maxResponseTime: 1000,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-456",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "Slow response",
              timings: {
                total: 2500,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "2500",
      status: "degraded",
    });
  });

  it("should replace env variables - HTTP", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "$CUSTOM_URL",
      slug: "test-site",
      type: "globalping",
      location: "$CUSTOM_LOCATION",
      method: "GET",
      // @ts-ignore
      port: "$CUSTOM_PORT",
    };
    process.env.CUSTOM_URL = "https://example.com";
    process.env.CUSTOM_LOCATION = "New York";
    process.env.CUSTOM_PORT = "8080";

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-123",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "Test response body",
              timings: {
                total: 1500,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "http",
      target: "example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "New York" }],
      measurementOptions: {
        request: {
          host: "example.com",
          path: "/",
          query: undefined,
          method: "GET",
          headers: undefined,
        },
        port: 8080,
        protocol: "HTTPS",
      },
    });

    assert.strictEqual(awaitMeasurementMock.mock.calls.length, 1);
    assert.strictEqual(awaitMeasurementMock.mock.calls[0].arguments[0], "measurement-123");

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "1500",
      status: "up",
    });
  });

  it("should replace env variables - tcp-ping", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "$CUSTOM_URL",
      slug: "test-site",
      type: "globalping",
      location: "$CUSTOM_LOCATION",
      method: "GET",
      // @ts-ignore
      port: "$CUSTOM_PORT",
      check: "tcp-ping",
    };
    process.env.CUSTOM_URL = "test.com";
    process.env.CUSTOM_LOCATION = "Japan";
    process.env.CUSTOM_PORT = "300";

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-123",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              stats: {
                avg: 1000,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "ping",
      target: "test.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "Japan" }],
      measurementOptions: {
        port: 300,
        protocol: "TCP",
      },
    });

    assert.strictEqual(awaitMeasurementMock.mock.calls.length, 1);
    assert.strictEqual(awaitMeasurementMock.mock.calls[0].arguments[0], "measurement-123");

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "1000",
      status: "up",
    });
  });

  it("should throw an error for check='ws'", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "WebSocket",
      url: "example.com",
      check: "ws",
      type: "globalping",
    };

    try {
      await performGlobalpingTest(site, mockGlobalping);
      assert.fail("Expected error");
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "ws is not supported with globalping: example.com"
      );
    }
  });

  it("should throw an error for invalid URL", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Down Site",
      url: "",
      slug: "down-site",
      type: "globalping",
    };

    try {
      await performGlobalpingTest(site, mockGlobalping);
      assert.fail("Expected error");
    } catch (error) {
      assert.strictEqual((error as Error).message, "invalid URL: ");
    }
  });

  it("should handle create measurement failure", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Test Site",
      url: "https://example.com",
      slug: "test-site",
      type: "globalping",
    };

    const expectedCreateResponse = {
      ok: false,
      data: "Error creating measurement",
      response: {
        status: 400,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 400,
      },
      responseTime: "0",
      status: "down",
    });
  });

  it("should handle await measurement failure", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Down Site",
      url: "https://down-example.com",
      slug: "down-site",
      type: "globalping",
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-789",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: false,
      response: {
        status: 500,
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 500,
      },
      responseTime: "0",
      status: "down",
    });
  });

  it("should handle IPv6 configuration", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "IPv6 Site",
      url: "https://ipv6-example.com",
      slug: "ipv6-site",
      type: "globalping",
      ipv6: true,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-ipv6",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "IPv6 response",
              timings: {
                total: 1200,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "http",
      target: "ipv6-example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "world" }],
      measurementOptions: {
        request: {
          host: "ipv6-example.com",
          path: "/",
          query: undefined,
          method: "GET",
          headers: undefined,
        },
        protocol: "HTTPS",
        ipVersion: 6,
      },
    });

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "1200",
      status: "up",
    });
  });

  it("should handle IPv4 configuration", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "IPv4 Site",
      url: "https://ipv4-example.com",
      slug: "ipv4-site",
      type: "globalping",
      check: "tcp-ping",
      ipv6: false,
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-ipv4",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              stats: {
                avg: 10,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.strictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "ping",
      target: "ipv4-example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "world" }],
      measurementOptions: {
        protocol: "TCP",
        ipVersion: 4,
      },
    });

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "10",
      status: "up",
    });
  });

  it("should handle URL with query parameters", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Query Site",
      url: "https://example.com/path?param=value&other=test",
      slug: "query-site",
      type: "globalping",
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-query",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "Query response",
              timings: {
                total: 800,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.deepStrictEqual(createMeasurementMock.mock.calls.length, 1);
    assert.deepStrictEqual(createMeasurementMock.mock.calls[0].arguments[0], {
      type: "http",
      target: "example.com",
      inProgressUpdates: false,
      limit: 1,
      locations: [{ magic: "world" }],
      measurementOptions: {
        request: {
          host: "example.com",
          path: "/path",
          query: "param=value&other=test",
          method: "GET",
          headers: undefined,
        },
        protocol: "HTTPS",
      },
    });

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "800",
      status: "up",
    });
  });

  it("should handle body content detection for down status", async () => {
    const site: UpptimeConfig["sites"][number] = {
      name: "Body Check Site",
      url: "https://example.com",
      slug: "body-check-site",
      type: "globalping",
      __dangerous__body_down: "Error occurred",
    };

    const expectedCreateResponse = {
      ok: true,
      data: {
        id: "measurement-body",
      },
      response: {
        status: 200,
      },
    };
    createMeasurementMock.mock.mockImplementation(() => expectedCreateResponse);

    const expectedAwaitResponse = {
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              rawBody: "Response with Error occurred in the content",
              timings: {
                total: 500,
              },
            },
          },
        ],
      },
    };
    awaitMeasurementMock.mock.mockImplementation(() => expectedAwaitResponse);

    const result = await performGlobalpingTest(site, mockGlobalping);

    assert.deepStrictEqual(result, {
      result: {
        httpCode: 200,
      },
      responseTime: "500",
      status: "down",
    });
  });
});
