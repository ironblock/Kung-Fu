import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

it("c2-47: with a tilted camera the lift turns the local frame, so after the frame the eye is still below planetRadius + radiusMin", () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 200, pitch: 1.2, center: { x: 900, y: 0, z: 0 } });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene, { checkCollisions: true });
    const d0 = Math.hypot(cam.position.x, cam.position.y, cam.position.z);
    tick(scene);
    const d1 = Math.hypot(cam.position.x, cam.position.y, cam.position.z);
    expect(d0).toBeLessThan(1010);
    expect(d1).toBeLessThan(1010 - 1e-3);
});
