import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

it("c2-20: on a small planet every re-orbit flips radius between 10 and 4*planetRadius", () => {
    const cam = createGeospatialCamera({ planetRadius: 1 });
    expect(cam.radius).toBe(10);
    cam.yaw = 0.5;
    expect(cam.radius).toBe(4);
    cam.yaw = 0.6;
    expect(cam.radius).toBe(10);
    setGeospatialOrientation(cam, {});
    expect(cam.radius).toBe(4);
    cam.radius = 10; // a write of exactly 10
    expect(cam.radius).toBe(4);
});
