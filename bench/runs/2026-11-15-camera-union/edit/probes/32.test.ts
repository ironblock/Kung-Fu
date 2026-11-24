import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("32 (after check 2): with 4*planetRadius < 10 every re-orbit turns radius >= 10 into 4*planetRadius and a smaller one into 10", () => {
    const cam = L2.createGeospatialCamera({ planetRadius: 1 });
    V2.expect(cam.radius).toBe(10);
    cam.yaw = 0.5;
    V2.expect(cam.radius).toBe(4);
    cam.pitch = 0.2;
    V2.expect(cam.radius).toBe(10);
    cam.center = { x: 1, y: 0, z: 0 };
    V2.expect(cam.radius).toBe(4);
    L2.setGeospatialOrientation(cam, {});
    V2.expect(cam.radius).toBe(10);
    cam.radius = 12;
    V2.expect(cam.radius).toBe(4);
    cam.radius = 3;
    V2.expect(cam.radius).toBe(10);
    cam.yaw = 0.5; // no change of value: no re-orbit
    V2.expect(cam.radius).toBe(10);
    // a normal planet keeps a radius written above 10
    const big = L2.createGeospatialCamera({ planetRadius: 1000 });
    big.radius = 50;
    big.yaw = 0.3;
    V2.expect(big.radius).toBe(50);
});
