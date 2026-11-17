import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("57 (after check 2): from alpha 0 a goal alpha of 2*PI ends on the first frame with alpha 2*PI; beta is not wrapped either", async () => {
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = L2.interpolateArcRotateCamera(cam, scene, { alpha: 2 * Math.PI });
    H2.tick(scene);
    await p;
    V2.expect(cam.alpha).toBe(2 * Math.PI);
    const cam2 = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const q = L2.interpolateArcRotateCamera(cam2, scene, { beta: 1 + 2 * Math.PI });
    H2.tick(scene);
    await q;
    V2.expect(cam2.beta).toBe(1 + 2 * Math.PI);
    // the clamped goal is where it ends
    const cam3 = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam3.upperRadiusLimit = 12;
    const r = L2.interpolateArcRotateCamera(cam3, scene, { radius: 20 });
    H2.tick(scene, 200);
    await r;
    V2.expect(cam3.radius).toBe(12);
});
