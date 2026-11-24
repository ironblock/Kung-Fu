import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("07 (after check 2): crossed limits make the clamp recurse into a RangeError", () => {
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    V2.expect(() => L2.setCameraLimits(cam, { lowerRadiusLimit: 5, upperRadiusLimit: 3 })).toThrow(RangeError);
    const cam2 = L2.createArcRotateCamera(1, 1, 4, { x: 0, y: 0, z: 0 });
    L2.setCameraLimits(cam2, {});
    cam2.lowerBetaLimit = 2;
    cam2.upperBetaLimit = 1;
    V2.expect(() => { cam2.beta = 1.5; }).toThrow(RangeError);
    // equal limits are fine
    const cam3 = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L2.setCameraLimits(cam3, { lowerRadiusLimit: 4, upperRadiusLimit: 4 });
    V2.expect(cam3.radius).toBe(4);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("07 (after check 3): limits crossed at the call throw there; crossed by hand later, the next changing write throws", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    V3.expect(() => L3.setCameraLimits(cam, { lowerRadiusLimit: 20, upperRadiusLimit: 5 })).toThrow(RangeError);
    const cam2 = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam2, { lowerRadiusLimit: 5 });
    cam2.upperRadiusLimit = 2; // crossed, nothing thrown yet
    V3.expect(() => { cam2.alpha = 1; }).toThrow(RangeError);
});
