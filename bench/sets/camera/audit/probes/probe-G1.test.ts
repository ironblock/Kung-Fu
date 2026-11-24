import { expect, it } from "vitest";
import { createGeospatialCamera, createGeospatialLimits, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialLimits } from "@babylonjs/lite";
import { useModeLimits } from "../src/mode-limits";

// Real state: the camera's own radius and yaw getters, kept before the call.
const R = 1000;
function mode(radiusMin: number, radiusMax: number, yawMin: number, yawMax: number): GeospatialLimits {
    const limits = createGeospatialLimits(R);
    Object.assign(limits, { radiusMin, radiusMax, yawMin, yawMax });
    return limits;
}
function rig() {
    const camera = createGeospatialCamera({ planetRadius: R });
    const r = Object.getOwnPropertyDescriptor(camera, "radius")!.get!;
    const y = Object.getOwnPropertyDescriptor(camera, "yaw")!.get!;
    return { camera, realR: () => r.call(camera) as number, realY: () => y.call(camera) as number };
}

it("G1 a mode wider than the camera's defaults (radius 5 to 6000)", () => {
    const { camera, realR } = rig();
    useModeLimits(camera, mode(5, 6000, -Infinity, Infinity));
    camera.radius = 5000;
    const a = realR();
    camera.radius = 7;
    const b = realR();
    console.log(`PROBE wide: wrote 5000 real ${a} (camera.radius ${camera.radius}); wrote 7 real ${b}`);
    expect(a).toBeCloseTo(5000, 6);
    expect(b).toBeCloseTo(7, 6);
});

it("G1 writes through setGeospatialOrientation stay in the mode's ranges", () => {
    const { camera, realR, realY } = rig();
    useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
    setGeospatialOrientation(camera, { radius: 3500, yaw: 1.2 });
    console.log(`PROBE orient: wrote radius 3500 yaw 1.2, real radius ${realR()} real yaw ${realY()}`);
    expect(realR()).toBeCloseTo(2000, 6);
    expect(realY()).toBeCloseTo(0.5, 6);
});
