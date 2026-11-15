import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

it("n33: pitch is clamped to getEffectivePitchMax at the current radius; zooming out past 2R lowers it for good", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.pitch = 1; // radius is 4R here: max pitch is pitchMin
    expect(cam.pitch).toBe(0.001);
    cam.radius = 100;
    expect(cam.pitch).toBe(0.001); // not restored
    setGeospatialOrientation(cam, { radius: 100, pitch: 1 });
    expect(cam.pitch).toBe(1);
    cam.radius = 3 * R; // halfway between 2R and 4R
    expect(cam.pitch).toBeLessThan(1);
    cam.radius = 100;
    expect(cam.pitch).toBeLessThan(1);
});

it("n33b: pitch is clamped at the requested radius before radius is clamped", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.limits.radiusMax = 2 * R;
    setGeospatialOrientation(cam, { radius: 10 * R, pitch: 1 });
    expect(cam.radius).toBe(2 * R);
    expect(cam.pitch).toBe(0.001);
});
