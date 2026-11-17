import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("c41: a NaN in the target goal is not treated as omitted: target becomes NaN and the promise rejects", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    let state = "pending";
    interpolateArcRotateCamera(cam, scene, { target: { x: NaN, y: 0, z: 0 } }, undefined, { interpolationFactor: 0 }).then(() => (state = "resolved"), () => (state = "rejected"));
    tick(scene, 50);
    await new Promise((r) => setTimeout(r, 0));
    expect(Number.isNaN(cam.target.x)).toBe(true);
    expect(state).toBe("rejected");
});
