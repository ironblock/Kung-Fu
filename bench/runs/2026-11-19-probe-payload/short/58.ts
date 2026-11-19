import { expect, test } from "vitest";
import { backEase, bezierCurveEase, bounceEase, elasticEase, exponentialEase, powerEase } from "@babylonjs/lite";

test("each easing with parameters left out, and with them written out, at 0.3", () => {
    expect([powerEase(0.3), powerEase(0.3, 2)]).toEqual([0.09, 0.09]);
    expect([exponentialEase(0.3), exponentialEase(0.3, 2)]).toEqual([0.12867609669730534, 0.12867609669730534]);
    expect([backEase(0.3), backEase(0.3, 1)]).toEqual([-0.21570509831248422, -0.21570509831248422]);
    expect([elasticEase(0.3), elasticEase(0.3, 3, 3)]).toEqual([-0.011963626319964088, -0.011963626319964088]);
    expect([bounceEase(0.3), bounceEase(0.3, 3, 2)]).toEqual([0.13875000000000007, 0.13875000000000007]);
    expect([bezierCurveEase(0.3), bezierCurveEase(0.3, 0, 0, 1, 1)]).toEqual([0.3, 0.3]);
});
