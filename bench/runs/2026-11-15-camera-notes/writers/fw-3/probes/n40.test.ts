import { expect, test } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

test("flyGeospatialCameraToAsync resolves, not rejects, when a second flight interrupts it, leaving the camera mid-way", async () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    let firstResolved = false;
    const first = flyGeospatialCameraToAsync(cam, scene, { radius: 1000, durationMs: 1000 }).then(() => { firstResolved = true; });
    tick(scene, 30, 16);
    const mid = cam.radius;
    expect(mid).toBeGreaterThan(1000);
    expect(mid).toBeLessThan(4000);
    const second = flyGeospatialCameraToAsync(cam, scene, { yaw: 1, durationMs: 100 });
    await first;
    expect(firstResolved).toBe(true);
    tick(scene, 10, 16);
    await second;
    expect(cam.radius).toBeCloseTo(mid, 6);
    expect(cam.yaw).toBeCloseTo(1, 12);
});
