import { expect, test } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

test("geospatial pitch is clamped against the radius at the moment of the write; at radius >= 4R pitch is pitchMin", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.pitch = 1;
    expect(cam.pitch).toBe(0.001);
    cam.radius = 500;
    expect(cam.pitch).toBe(0.001); // the earlier write is lost
    cam.pitch = 1;
    expect(cam.pitch).toBe(1);

    const cam2 = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(cam2, { pitch: 1, radius: 500 });
    expect(cam2.pitch).toBe(1);
    // between 2R and 4R the max pitch falls linearly to pitchMin
    cam2.radius = 3 * R;
    cam2.pitch = 1.5;
    expect(cam2.pitch).toBeCloseTo((Math.PI / 2 - 0.01) * 0.5 + 0.001 * 0.5, 12);
});
