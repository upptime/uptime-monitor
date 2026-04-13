import { test, describe } from "node:test";
import assert from "node:assert";
import { checkOverlap } from "./overlap";

describe("checkOverlap", () => {
  test("partial overlap", () => {
    assert.strictEqual(checkOverlap({ start: 14, end: 17 }, { start: 16, end: 19 }), 1);
  });

  test("partial overlap (opposite)", () => {
    assert.strictEqual(checkOverlap({ start: 16, end: 19 }, { start: 14, end: 17 }), 1);
  });

  test("full overlap", () => {
    assert.strictEqual(checkOverlap({ start: 14, end: 17 }, { start: 13, end: 18 }), 3);
  });

  test("no overlap", () => {
    assert.strictEqual(checkOverlap({ start: 14, end: 17 }, { start: 19, end: 21 }), 0);
  });
});
