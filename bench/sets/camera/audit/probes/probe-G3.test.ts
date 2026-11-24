import { expect, it } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { flyToPlace } from "../src/fly-to-place";

// Real state: the camera's own yaw/pitch/radius getters, kept before the call.
const R = 1000;
async function flush(): Promise<void> { for (let i = 0; i < 5; i++) await Promise.resolve(); }
async function run(scene: ReturnType<typeof makeScene>, frames: number): Promise<void> { for (let i = 0; i < frames; i++) { tick(scene, 1, 16); await flush(); } }
function rig() {
    const camera = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(camera, { radius: 1800, pitch: 0.2, yaw: 0 });
    const g = (k: string) => Object.getOwnPropertyDescriptor(camera, k)!.get!;
    const [y, p, r] = [g("yaw"), g("pitch"), g("radius")];
    return { camera, scene: makeScene(), real: () => ({ yaw: y.call(camera) as number, pitch: p.call(camera) as number, radius: r.call(camera) as number }) };
}
const centre = { x: R * Math.cos(0.3), y: -R * Math.sin(0.3), z: 0 };

it("G3 a place with yaw 3.5: the camera arrives, and the answer says true", async () => {
    const { camera, scene, real } = rig();
    let value: boolean | undefined;
    flyToPlace(camera, scene, { yaw: 3.5, pitch: 0.6, radius: 900, center: centre }, 400).then((v) => (value = v), () => (value = undefined));
    await run(scene, 60);
    const s = real();
    const wrapped = Math.atan2(Math.sin(s.yaw - 3.5), Math.cos(s.yaw - 3.5));
    console.log(`PROBE yaw3.5 settled ${value} real yaw ${s.yaw.toFixed(4)} (off ${wrapped.toFixed(6)}) pitch ${s.pitch.toFixed(4)} radius ${s.radius.toFixed(2)}`);
    expect(Math.abs(wrapped)).toBeLessThan(1e-3);
    expect(value).toBe(true);
});

for (const field of ["yaw", "pitch", "radius"] as const) {
    it(`G3 a flight that differs from the start only in ${field}, cut short, settles false`, async () => {
        const { camera, scene, real } = rig();
        const place = { yaw: 0, pitch: 0.2, radius: 1800, center: { ...camera.center } };
        if (field === "yaw") place.yaw = 1.0;
        if (field === "pitch") place.pitch = 0.6;
        if (field === "radius") place.radius = 900;
        let value: boolean | undefined;
        flyToPlace(camera, scene, place, 400).then((v) => (value = v), () => (value = undefined));
        await run(scene, 10);
        void flyGeospatialCameraToAsync(camera, scene, { yaw: 0, pitch: 0.2, radius: 1800, center: { ...camera.center }, durationMs: 50 });
        await run(scene, 60);
        console.log(`PROBE cut-${field} settled ${value} real ${JSON.stringify(real())}`);
        expect(value).toBe(false);
    });
}
