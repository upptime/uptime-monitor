"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const overlap_1 = require("./overlap");
describe("checkOverlap", () => {
    it("partial overlap", () => {
        expect((0, overlap_1.checkOverlap)({ start: 14, end: 17 }, { start: 16, end: 19 })).toEqual(1);
    });
    it("partial overlap (opposite)", () => {
        expect((0, overlap_1.checkOverlap)({ start: 16, end: 19 }, { start: 14, end: 17 })).toEqual(1);
    });
    it("full overlap", () => {
        expect((0, overlap_1.checkOverlap)({ start: 14, end: 17 }, { start: 13, end: 18 })).toEqual(3);
    });
    it("no overlap", () => {
        expect((0, overlap_1.checkOverlap)({ start: 14, end: 17 }, { start: 19, end: 21 })).toEqual(0);
    });
});
//# sourceMappingURL=overlap.spec.js.map