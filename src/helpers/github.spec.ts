import { retryTransientGitHubRequest } from "./github";

describe("retryTransientGitHubRequest", () => {
  const wait = jest.fn().mockResolvedValue(undefined);
  const log = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retries transient GitHub API failures with exponential backoff", async () => {
    const request = jest
      .fn()
      .mockRejectedValueOnce({ status: 503 })
      .mockRejectedValueOnce({ response: { status: 502 } })
      .mockResolvedValue({ data: ["ok"] });

    await expect(
      retryTransientGitHubRequest(request, { maxAttempts: 3, initialDelayMs: 100, wait, log })
    ).resolves.toEqual({ data: ["ok"] });

    expect(request).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenNthCalledWith(1, 100);
    expect(wait).toHaveBeenNthCalledWith(2, 200);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-transient GitHub API failures", async () => {
    const error = { status: 403 };
    const request = jest.fn().mockRejectedValue(error);

    await expect(
      retryTransientGitHubRequest(request, { maxAttempts: 3, initialDelayMs: 100, wait, log })
    ).rejects.toBe(error);

    expect(request).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it("rethrows the last transient failure after exhausting attempts", async () => {
    const error = { status: 503 };
    const request = jest.fn().mockRejectedValue(error);

    await expect(
      retryTransientGitHubRequest(request, { maxAttempts: 3, initialDelayMs: 100, wait, log })
    ).rejects.toBe(error);

    expect(request).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
  });
});
