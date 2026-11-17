import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("19 (after check 2): direct yaw/pitch/radius/center writes and setGeospatialOrientation do not stop a flight; its next frame overwrites them", async () => {
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    L2.setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    let done = false;
    const p = L2.flyGeospatialCameraToAsync(cam, scene, { yaw: 1, durationMs: 1000 }).then(() => (done = true));
    H2.tick(scene, 10);
    const yawMid = cam.yaw;
    cam.center = { x: 0, y: 1000, z: 0 };
    L2.setGeospatialOrientation(cam, { radius: 300, pitch: 0.2 });
    cam.yaw = -2;
    V2.expect(cam.center.y).toBeCloseTo(1000, 6);
    H2.tick(scene);
    await Promise.resolve();
    V2.expect(done).toBe(false);
    V2.expect(cam.center.x).toBeCloseTo(1000, 6);
    V2.expect(cam.center.y).toBeCloseTo(0, 6);
    V2.expect(cam.radius).toBeCloseTo(500, 6);
    V2.expect(cam.pitch).toBeCloseTo(0.5, 6);
    V2.expect(cam.yaw).toBeGreaterThan(yawMid);
    H2.tick(scene, 100);
    await p;
    V2.expect(cam.yaw).toBeCloseTo(1, 12);
});
