import { it, expect } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

async function done(p: Promise<void>) {
    let s = false;
    void p.then(() => (s = true));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

it("53a: timed from the frame deltas: 1000 ms by default; a delta <= 0 counts as 1000/60 ms", async () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    const p = flyGeospatialCameraToAsync(cam, scene, { yaw: 1 });
    tick(scene, 9, 100);
    expect(await done(p)).toBe(false);
    tick(scene, 1, 100);
    expect(await done(p)).toBe(true);
    const p2 = flyGeospatialCameraToAsync(cam, scene, { yaw: 0, durationMs: 100 });
    tick(scene, 5, 0);
    expect(await done(p2)).toBe(false);
    tick(scene, 1, 0);
    expect(await done(p2)).toBe(true);
});

it("53b: yaw turns the short way round", () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { yaw: 3 });
    void flyGeospatialCameraToAsync(cam, scene, { yaw: -3, durationMs: 100 });
    tick(scene, 1, 50);
    expect(Math.abs(cam.yaw)).toBeGreaterThan(3);
    tick(scene, 1, 50);
    expect(cam.yaw).toBeCloseTo(-3, 9);
});
