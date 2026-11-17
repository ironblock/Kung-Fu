
import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


async function state3(p: Promise<void>) {
    let s = "pending";
    p.then(() => (s = "resolved"), () => (s = "rejected"));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

V3.it("05 (after check 3): a shortest arc that leaves the alpha limits stalls at the bound and never settles", async () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(0.1, 1, 10, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam, { lowerAlphaLimit: 0, upperAlphaLimit: 6.2 });
    const p = L3.interpolateArcRotateCamera(cam, scene, { alpha: 6 });
    H3.tick(scene, 2000);
    V3.expect(cam.alpha).toBe(0);
    V3.expect(await state3(p)).toBe("pending");
});
