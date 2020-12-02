"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOverlap = void 0;
/**
 * Get the overlap between two numbers
 */
const checkOverlap = (a, b) => {
    const min = a.start < b.start ? a : b;
    const max = min.start === a.start && min.end === a.end ? b : a;
    if (min.end < max.start)
        return 0;
    return (min.end < max.end ? min.end : max.end) - max.start;
};
exports.checkOverlap = checkOverlap;
//# sourceMappingURL=overlap.js.map