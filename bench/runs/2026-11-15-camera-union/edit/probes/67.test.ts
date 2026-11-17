import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("67 (after check 2): the re-centre clamps pitch against the new radius, which moves the eye with the radius unclamped", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    cam.center = { x: 4000, y: 0, z: 0 };
    L2.setGeospatialOrientation(cam, { radius: 100, pitch: 0.2 });
    L2.attachGeospatialControls(cam, H2.asCanvas(H2.makeCanvas()), scene);
    H2.fire(win, "keydown", H2.key("ArrowUp"));
    H2.tick(scene);
    H2.fire(win, "keyup", H2.key("ArrowUp"));
    const before = { ...cam.position };
    H2.tick(scene);
    const moved = Math.hypot(cam.position.x - before.x, cam.position.y - before.y, cam.position.z - before.z);
    V2.expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(1000, 3);
    V2.expect(cam.radius).toBeGreaterThan(cam.limits.radiusMin);
    V2.expect(cam.radius).toBeLessThan(cam.limits.radiusMax);
    V2.expect(cam.pitch).toBeCloseTo(L2.getEffectivePitchMax(cam.limits, cam.radius), 12);
    V2.expect(moved).toBeGreaterThan(100);
});

V2.it("67 (after check 2): the re-centre clamps with the camera's own limits object, not one assigned to camera.limits later", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L2.setGeospatialOrientation(cam, { radius: 300, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    L2.attachGeospatialControls(cam, H2.asCanvas(H2.makeCanvas()), scene);
    cam.limits = { ...L2.createGeospatialLimits(1000), radiusMax: 200, pitchMin: 0 };
    H2.fire(win, "keydown", H2.key("ArrowUp"));
    H2.tick(scene);
    H2.fire(win, "keyup", H2.key("ArrowUp"));
    H2.tick(scene);
    V2.expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(1000, 3);
    V2.expect(cam.radius).toBeCloseTo(400, 0); // not 200
});
