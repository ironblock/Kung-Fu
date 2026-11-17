import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

it("62a: north is +Z: at a center on +X, yaw 0 heads to +Z, yaw PI/2 (east) to -Y; pitch 0 looks straight down", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 1, yaw: 0 });
    expect(cam._lookAt.z).toBeGreaterThan(0.8);
    expect(cam._lookAt.y).toBeCloseTo(0, 9);
    setGeospatialOrientation(cam, { yaw: Math.PI / 2 });
    expect(cam._lookAt.y).toBeLessThan(-0.8);
    expect(cam._lookAt.z).toBeCloseTo(0, 9);
    cam.limits.pitchMin = 0;
    setGeospatialOrientation(cam, { pitch: 0 });
    expect(cam._lookAt.x).toBeCloseTo(-1, 9);
});

it("62b: yaw and pitch are wrapped to [-PI, PI) before the limits clamp them", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.yaw = 4;
    expect(cam.yaw).toBeCloseTo(4 - 2 * Math.PI, 12);
    cam.yaw = Math.PI;
    expect(cam.yaw).toBeCloseTo(-Math.PI, 12);
    cam.radius = 500;
    cam.pitch = 2 * Math.PI + 0.5;
    expect(cam.pitch).toBeCloseTo(0.5, 12);
    cam.pitch = -0.5;
    expect(cam.pitch).toBe(0.001);
    cam.limits.yawMax = 1;
    cam.yaw = 2 * Math.PI + 1.5;
    expect(cam.yaw).toBe(1);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


type Lite3 = typeof import("@babylonjs/lite");
async function load3(rightHanded: boolean): Promise<Lite3> {
    V3.vi.resetModules();
    V3.vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        V3.vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite3;
}

V3.it("62 (after check 3): yaw PI/2 heads toward -Y at a center on +X, toward +Y in a right-handed build", async () => {
    for (const rh of [false, true]) {
        const F = await load3(rh);
        const cam = F.createGeospatialCamera({ planetRadius: 1000 });
        F.setGeospatialOrientation(cam, { radius: 500, pitch: 1, yaw: Math.PI / 2 });
        V3.expect(Math.sign(cam._lookAt.y)).toBe(rh ? 1 : -1);
        V3.expect(cam._lookAt.z).toBeCloseTo(0, 9);
    }
});
