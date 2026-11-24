import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeScene, makeCanvas, asCanvas, tick } from "./helpers";

test("attachControl's inertia ignores the frame delta: each frame applies the whole offset, then multiplies it by inertia", () => {
    const run = (deltaMs: number): number => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        attachControl(cam, asCanvas(makeCanvas()), scene);
        cam.inertialAlphaOffset = 0.1;
        tick(scene, 3, deltaMs);
        return cam.alpha;
    };
    expect(run(16)).toBeCloseTo(0.1 + 0.09 + 0.081, 12);
    expect(run(100)).toBe(run(16));
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: pan inertia is scaled by radius/1000, decays by panningInertia, and also ignores deltaMs", () => {
    const run = (deltaMs: number): [number, number] => {
        const scene = H.makeScene();
        const cam = L.createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        cam.panningInertia = 0.5;
        L.attachControl(cam, H.asCanvas(H.makeCanvas()), scene);
        cam.inertialPanningX = 0.1;
        H.tick(scene, 1, deltaMs);
        return [Math.hypot(cam.target.x, cam.target.y, cam.target.z), cam.inertialPanningX];
    };
    const [moved, left] = run(16);
    expect(moved).toBeCloseTo(0.1 * 10 / 1000, 12);
    expect(left).toBeCloseTo(0.05, 12);
    expect(run(100)).toEqual(run(16));
});
