import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

function make() {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    return cam;
}

it("20a: center.x/y/z written in place move no eye until a yaw/pitch/radius write that changes the value", () => {
    const cam = make();
    const p0 = { ...cam.position };
    cam.center.y = 200;
    expect({ ...cam.position }).toEqual(p0);
    cam.radius = cam.radius;
    expect({ ...cam.position }).toEqual(p0);
    cam.radius = 501;
    expect(cam.position.y).not.toBeCloseTo(p0.y, 3);
    expect(cam.center.y).toBe(200);
});

it("20b: assigning any object, camera.center itself included, or setGeospatialOrientation re-orbits at once; the object is copied", () => {
    const cam = make();
    const p0 = { ...cam.position };
    cam.center.y = 200;
    cam.center = cam.center;
    expect(cam.position.y).not.toBeCloseTo(p0.y, 3);
    const cam2 = make();
    const mine = { x: 1000, y: 100, z: 0 };
    cam2.center = mine;
    expect(cam2.center).not.toBe(mine);
    mine.y = 999;
    expect(cam2.center.y).toBe(100);
    const cam3 = make();
    cam3.center.y = 200;
    setGeospatialOrientation(cam3, {});
    expect(cam3.position.y).toBeCloseTo(cam.position.y, 9);
});
