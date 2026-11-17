import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("14 (after check 2): pitch is capped by the radius asked for, before radiusMin/radiusMax clamp it", () => {
    const cam = L2.createGeospatialCamera({ planetRadius: 1 });
    L2.setGeospatialOrientation(cam, { radius: 1, pitch: 1 });
    V2.expect(cam.radius).toBe(10); // >= 4*planetRadius once clamped
    V2.expect(cam.pitch).toBe(1); // judged at the asked-for radius 1
    const big = L2.createGeospatialCamera({ planetRadius: 1000 });
    big.limits.radiusMax = 2500;
    L2.setGeospatialOrientation(big, { radius: 5000, pitch: 1 });
    V2.expect(big.radius).toBe(2500);
    V2.expect(big.pitch).toBeCloseTo(0.001, 12); // capped as for 5000
    L2.setGeospatialOrientation(big, { pitch: 1 }); // now asked at the stored 2500
    V2.expect(big.pitch).toBe(1);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("14 (after check 3): a radius write re-clamps the current pitch; a smaller radius after does not bring it back", () => {
    const cam = L3.createGeospatialCamera({ planetRadius: 1000 });
    cam.radius = 1000;
    cam.pitch = 1;
    V3.expect(cam.pitch).toBe(1);
    cam.radius = 3000;
    const mid = (Math.PI / 2 - 0.01) * 0.5 + 0.001 * 0.5;
    V3.expect(cam.pitch).toBeCloseTo(mid, 9);
    cam.radius = 1000;
    V3.expect(cam.pitch).toBeCloseTo(mid, 9);
});
