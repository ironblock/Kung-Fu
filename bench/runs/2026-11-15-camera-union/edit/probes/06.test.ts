import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("06 (after check 2): a clamp zeroes only the hit channel's offset, setCameraLimits' own clamp too, never the pan offsets", () => {
    const cam = L2.createArcRotateCamera(1, 2, 2, { x: 0, y: 0, z: 0 });
    cam.inertialRadiusOffset = 0.3;
    cam.inertialAlphaOffset = 0.2;
    cam.inertialBetaOffset = 0.1;
    cam.inertialPanningX = 0.4;
    cam.inertialPanningY = 0.5;
    L2.setCameraLimits(cam, { lowerRadiusLimit: 5, upperBetaLimit: 1.5 });
    V2.expect(cam.radius).toBe(5);
    V2.expect(cam.beta).toBe(1.5);
    V2.expect(cam.inertialRadiusOffset).toBe(0);
    V2.expect(cam.inertialBetaOffset).toBe(0);
    V2.expect(cam.inertialAlphaOffset).toBe(0.2);
    V2.expect([cam.inertialPanningX, cam.inertialPanningY]).toEqual([0.4, 0.5]);
    cam.inertialAlphaOffset = 0.2;
    cam.alpha = 1.1; // a write that clamps nothing zeroes nothing
    V2.expect(cam.inertialAlphaOffset).toBe(0.2);
    cam.upperAlphaLimit = 1.2;
    cam.alpha = 3; // the alpha bound is hit
    V2.expect(cam.alpha).toBe(1.2);
    V2.expect(cam.inertialAlphaOffset).toBe(0);
    V2.expect([cam.inertialPanningX, cam.inertialPanningY]).toEqual([0.4, 0.5]);
});


import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("06 (after check 3): attachControl's beta clamp and 0.01 radius floor zero no offset", () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(0, 0.02, 0.02, { x: 0, y: 0, z: 0 });
    L3.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
    cam.inertialBetaOffset = -0.5;
    cam.inertialRadiusOffset = 0.5;
    H3.tick(scene);
    V3.expect(cam.beta).toBeCloseTo(0.01, 9);
    V3.expect(cam.radius).toBeCloseTo(0.01, 9);
    V3.expect(cam.inertialBetaOffset).toBeCloseTo(-0.45, 9);
    V3.expect(cam.inertialRadiusOffset).toBeCloseTo(0.45, 9);
});
