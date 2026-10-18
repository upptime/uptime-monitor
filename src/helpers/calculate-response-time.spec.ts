jest.mock("./github", () => ({
  getOctokit: jest.fn(),
}));

import { responseTimeFromCommitMessage } from "./calculate-response-time";

describe("response time from commit message", () => {
  it("reads the response time", () => {
    expect(
      responseTimeFromCommitMessage("🟥 Broken Site is down (500 in 321 ms) [skip ci] [upptime]")
    ).toBe(321);
  });

  it("is not confused by a site name containing ' in '", () => {
    expect(
      responseTimeFromCommitMessage("🟩 Signing in is up (200 in 337 ms) [skip ci] [upptime]")
    ).toBe(337);
    expect(
      responseTimeFromCommitMessage(
        "🟨 Log in in Europe has degraded performance (200 in 4512 ms) [skip ci] [upptime]"
      )
    ).toBe(4512);
  });

  it("returns NaN when there is no response time", () => {
    expect(
      responseTimeFromCommitMessage(":card_file_box: Update status summary [skip ci] [upptime]")
    ).toBeNaN();
  });
});
