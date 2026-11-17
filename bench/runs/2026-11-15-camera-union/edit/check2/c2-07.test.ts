import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

it("c2-07: on a small planet (4*planetRadius < 10) pitch is cleared against the requested radius, not the one applied", () => {
    const cam = createGeospatialCamera({ planetRadius: 1 });
    setGeospatialOrientation(cam, { radius: 1, pitch: 1 });
    expect(cam.radius).toBe(10); // >= 4*planetRadius
    expect(cam.pitch).toBe(1); // not forced to pitchMin
});
