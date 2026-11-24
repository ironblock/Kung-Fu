import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function run(checkCollisions?: boolean) {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    // eye below the surface: center at 900 from the origin, looking straight down from 20 above it
    cam.limits.pitchMin = 0;
    setGeospatialOrientation(cam, { radius: 20, pitch: 0, center: { x: 900, y: 0, z: 0 } });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene, checkCollisions === undefined ? undefined : { checkCollisions });
    tick(scene);
    return Math.hypot(cam.position.x, cam.position.y, cam.position.z);
}

it("63: checkCollisions (default false) lifts center each frame; looking straight down the eye ends at planetRadius + radiusMin", () => {
    expect(run()).toBeCloseTo(920, 6);
    expect(run(false)).toBeCloseTo(920, 6);
    expect(run(true)).toBeCloseTo(1010, 6);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function eyeAfter(pitch: number, radius: number) {
    (globalThis as Record<string, unknown>).window = H2.makeCanvas();
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L2.setGeospatialOrientation(cam, { radius, pitch, center: { x: 900, y: 0, z: 0 } });
    L2.attachGeospatialControls(cam, H2.asCanvas(H2.makeCanvas()), scene, { checkCollisions: true });
    const d0 = Math.hypot(cam.position.x, cam.position.y, cam.position.z);
    H2.tick(scene);
    return [d0, Math.hypot(cam.position.x, cam.position.y, cam.position.z)];
}

V2.it("63 (after check 2): a tilted eye ends short of planetRadius + radiusMin; looking straight down it reaches it", () => {
    const [d0, d1] = eyeAfter(1.2, 200);
    V2.expect(d0).toBeLessThan(d1);
    V2.expect(d1).toBeLessThan(1010 - 1e-3);
    V2.expect(eyeAfter(0, 20)[1]).toBeCloseTo(1010, 6);
});
