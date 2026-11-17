
import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("04 (after check 3): NaN is never clamped", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam, { lowerRadiusLimit: 5, upperRadiusLimit: 20, lowerBetaLimit: 0.5 });
    cam.radius = NaN;
    V3.expect(Number.isNaN(cam.radius)).toBe(true);
    cam.beta = NaN;
    V3.expect(Number.isNaN(cam.beta)).toBe(true);
});

V3.it("04 (after check 3): with attachControl's frame-step clamps the narrower range holds; an upper limit below 0.01 wins", () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(0, 0.5, 1, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam, { lowerBetaLimit: 0.005, lowerRadiusLimit: 0.005 });
    L3.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
    cam.inertialBetaOffset = -2;
    cam.inertialRadiusOffset = 5;
    H3.tick(scene);
    V3.expect(cam.beta).toBeCloseTo(0.01, 9); // the frame step's bound is narrower
    V3.expect(cam.radius).toBeCloseTo(0.01, 9);
    const cam2 = L3.createArcRotateCamera(0, 0.5, 1, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam2, { upperBetaLimit: 0.005, upperRadiusLimit: 0.005 });
    L3.attachControl(cam2, H3.asCanvas(H3.makeCanvas()), scene);
    cam2.inertialAlphaOffset = 0.1;
    cam2.inertialRadiusOffset = 1;
    H3.tick(scene);
    V3.expect(cam2.beta).toBeCloseTo(0.005, 9); // below 0.01: the limit wins
    V3.expect(cam2.radius).toBeCloseTo(0.005, 9);
});
