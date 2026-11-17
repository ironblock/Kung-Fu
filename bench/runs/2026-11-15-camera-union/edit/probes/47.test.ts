import { it, expect } from "vitest";
import { createGeospatialCamera, createGeospatialLimits, setGeospatialOrientation } from "@babylonjs/lite";

function make() {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    return cam;
}

it("47a: a change to a limits field applies at the next changing yaw/pitch/radius write, or any center assignment", () => {
    const cam = make();
    cam.limits.radiusMin = 600;
    expect(cam.radius).toBe(500);
    cam.radius = 500;
    expect(cam.radius).toBe(500);
    cam.yaw = 0.1;
    expect(cam.radius).toBe(600);
    const cam2 = make();
    cam2.limits.radiusMin = 600;
    cam2.center = cam2.center;
    expect(cam2.radius).toBe(600);
});

it("47b: assigning a new object to camera.limits does not change the camera's own clamping", () => {
    const cam = make();
    const fresh = createGeospatialLimits(1000);
    fresh.radiusMin = 600;
    cam.limits = fresh;
    cam.radius = 450;
    expect(cam.radius).toBe(450);
    cam.radius = 5;
    expect(cam.radius).toBe(10);
});

it("47c: pitchDisabledRadiusScale = null allows pitch up to pitchMax at any radius", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchDisabledRadiusScale = null;
    cam.pitch = 1;
    expect(cam.radius).toBe(4000);
    expect(cam.pitch).toBe(1);
    cam.pitch = 1.6;
    expect(cam.pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("47 (after check 2): setGeospatialOrientation also applies a changed limits field", () => {
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    L2.setGeospatialOrientation(cam, { radius: 500 });
    cam.limits.radiusMax = 300;
    V2.expect(cam.radius).toBe(500);
    L2.setGeospatialOrientation(cam, {});
    V2.expect(cam.radius).toBe(300);
});
