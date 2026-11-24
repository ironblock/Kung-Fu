import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

it("c2-50: the re-centre after a pan moves the eye, with radius unclamped, when the new radius caps the pitch", () => {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.center = { x: 4000, y: 0, z: 0 }; // a centre above the surface
    setGeospatialOrientation(cam, { radius: 100, pitch: 0.2 });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene);
    fire(win, "keydown", key("ArrowUp"));
    tick(scene);
    fire(win, "keyup", key("ArrowUp"));
    const before = { ...cam.position };
    const pitchBefore = cam.pitch;
    tick(scene); // first frame after the pan stops: re-centre
    const moved = Math.hypot(cam.position.x - before.x, cam.position.y - before.y, cam.position.z - before.z);
    expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(1000, 3); // centre is on the sphere
    expect(cam.radius).toBeGreaterThan(cam.limits.radiusMin);
    expect(cam.radius).toBeLessThan(cam.limits.radiusMax);
    expect(moved).toBeGreaterThan(100);
    expect(cam.pitch).not.toBeCloseTo(pitchBefore, 2);
});
