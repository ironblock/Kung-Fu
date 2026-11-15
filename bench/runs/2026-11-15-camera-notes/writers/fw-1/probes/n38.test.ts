import { it, expect } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync, interpolateArcRotateCamera, createArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("n38: an interrupted fly resolves (it does not reject), unlike interpolateArcRotateCamera", async () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    let firstResolved = false;
    const first = flyGeospatialCameraToAsync(cam, scene, { radius: 500 }).then(() => (firstResolved = true));
    tick(scene, 2);
    const second = flyGeospatialCameraToAsync(cam, scene, { radius: 800, durationMs: 100 });
    await first;
    expect(firstResolved).toBe(true);
    expect(cam.radius).not.toBe(500);
    tick(scene, 20);
    await second;
    expect(cam.radius).toBe(800);

    const arc = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(arc, scene, { radius: 20 });
    tick(scene);
    arc.radius = 3;
    tick(scene);
    await expect(p).rejects.toThrow();
});
