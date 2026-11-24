import { expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "../src/globe-tilt";

// Real state: the camera's own pitch/yaw/radius getters and worldMatrix getter, kept before the call.
// The tilt is read from the world matrix: the eye (translation) and the forward axis (third column).
type V = { x: number; y: number; z: number };
function own(camera: GeospatialCamera) {
    const d = (k: string) => Object.getOwnPropertyDescriptor(camera, k)!.get!;
    const g = { pitch: d("pitch"), yaw: d("yaw"), radius: d("radius"), wm: d("worldMatrix") };
    const wm = () => g.wm.call(camera) as unknown as number[];
    wm();
    return {
        pitch: () => g.pitch.call(camera) as number, yaw: () => g.yaw.call(camera) as number, radius: () => g.radius.call(camera) as number,
        view: () => {
            const m = wm();
            const eye = { x: m[12]!, y: m[13]!, z: m[14]! };
            const fwd = { x: m[8]!, y: m[9]!, z: m[10]! };
            const c = camera.center;
            const cl = Math.hypot(c.x, c.y, c.z);
            const toC = { x: c.x - eye.x, y: c.y - eye.y, z: c.z - eye.z };
            const tl = Math.hypot(toC.x, toC.y, toC.z);
            const fl = Math.hypot(fwd.x, fwd.y, fwd.z);
            const aim = (toC.x * fwd.x + toC.y * fwd.y + toC.z * fwd.z) / (tl * fl); // 1 when looking at the centre
            const tilt = Math.acos(Math.max(-1, Math.min(1, -(fwd.x * c.x + fwd.y * c.y + fwd.z * c.z) / (fl * cl))));
            return { aim, tilt, dist: tl };
        },
    };
}

function run(label: string, make: () => GeospatialCamera, pitch: number) {
    const camera = make();
    const o = own(camera);
    const yaw0 = o.yaw(), r0 = o.radius(), c0: V = { ...camera.center };
    tiltGlobeCamera(camera, pitch);
    const v = o.view();
    console.log(`PROBE ${label} real pitch ${o.pitch().toFixed(4)} camera.pitch ${camera.pitch.toFixed(4)} view tilt ${v.tilt.toFixed(4)} aim ${v.aim.toFixed(6)} real yaw ${o.yaw().toFixed(4)} (was ${yaw0.toFixed(4)}) real radius ${o.radius().toFixed(2)} (was ${r0.toFixed(2)}) dist ${v.dist.toFixed(2)}`);
    expect(o.pitch()).toBeCloseTo(pitch, 6);
    expect(v.tilt).toBeCloseTo(pitch, 4);
    expect(v.aim).toBeCloseTo(1, 6);
    expect(o.yaw()).toBeCloseTo(yaw0, 9);
    expect(o.radius()).toBeCloseTo(r0, 6);
    expect(camera.center.x).toBeCloseTo(c0.x, 6);
    expect(camera.center.y).toBeCloseTo(c0.y, 6);
    expect(camera.center.z).toBeCloseTo(c0.z, 6);
    return { camera, o };
}

it("B4 new camera, fully zoomed out", () => {
    run("new", () => createGeospatialCamera({ planetRadius: 1000 }), 0.8);
});

it("B4 new camera, then zoomed nearer: the real view keeps the tilt", () => {
    const { camera, o } = run("new-then-zoom", () => createGeospatialCamera({ planetRadius: 1000 }), 0.6);
    camera.radius = 1500;
    const v = o.view();
    console.log(`PROBE after-zoom real pitch ${o.pitch().toFixed(4)} view tilt ${v.tilt.toFixed(4)} aim ${v.aim.toFixed(6)} dist ${v.dist.toFixed(2)}`);
    expect(o.pitch()).toBeCloseTo(0.6, 6);
    expect(v.tilt).toBeCloseTo(0.6, 4);
    expect(v.aim).toBeCloseTo(1, 6);
});

it("B4 turned heading, moved centre, other planet", () => {
    run("turned", () => {
        const c = createGeospatialCamera({ planetRadius: 6000 });
        const s = Math.SQRT1_2 * 6000;
        setGeospatialOrientation(c, { yaw: 1.0, center: { x: s, y: s * 0.6, z: s * 0.8 } });
        return c;
    }, 0.9);
});
