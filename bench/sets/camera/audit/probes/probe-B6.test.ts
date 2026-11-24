import { expect, it } from "vitest";
import { getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { createChaseCamera } from "../src/chase-camera";

// Real state: the camera's own worldMatrix getter (kept right after creation), and the view a renderer reads.
type V = { x: number; y: number; z: number };
const n = (v: V): V => { const l = Math.hypot(v.x, v.y, v.z); return { x: v.x / l, y: v.y / l, z: v.z / l }; };
const dot = (a: V, b: V) => a.x * b.x + a.y * b.y + a.z * b.z;
const f = (v: V) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
/** The up the picture should have: `up` with its part along the sight taken out. */
const wantUp = (up: V, sight: V): V => { const d = dot(up, sight); return n({ x: up.x - d * sight.x, y: up.y - d * sight.y, z: up.z - d * sight.z }); };

function rig() {
    const chase = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 });
    const cam = chase.camera;
    const ownWm = Object.getOwnPropertyDescriptor(cam, "worldMatrix")!.get!;
    const axes = () => { const m = ownWm.call(cam); return { up: { x: m[4]!, y: m[5]!, z: m[6]! }, fwd: { x: m[8]!, y: m[9]!, z: m[10]! }, eye: { x: m[12]!, y: m[13]!, z: m[14]! } }; };
    const view = () => getViewMatrix(cam as unknown as Camera);
    view();
    return { chase, cam, axes, view };
}

function expectNear(a: V, b: V) { expect(a.x).toBeCloseTo(b.x, 4); expect(a.y).toBeCloseTo(b.y, 4); expect(a.z).toBeCloseTo(b.z, 4); }

it("B6 the camera moves with the car; banks along and across the new sight", () => {
    const r = rig();
    const lean0 = { x: 0.8 * Math.sin(0.5), y: Math.cos(0.5), z: -0.6 * Math.sin(0.5) };
    r.chase.bank(lean0);
    r.view();
    // The car goes over a crest: the camera is moved and now looks along a new line of sight.
    r.cam.position.set(10, 5, 0);
    r.cam.target.set(10, 9, 3);
    r.view();
    const sight = n({ x: 0, y: 4, z: 3 });
    const lean = n({ x: 0.3, y: -0.6, z: 0.8 }); // across the new sight, with a part along it
    r.chase.bank(lean);
    r.view();
    let a = r.axes();
    console.log("PROBE across fwd", f(a.fwd), "want", f(sight), "up", f(a.up), "want", f(wantUp(lean, sight)));
    expectNear(a.fwd, sight);
    expectNear(a.up, wantUp(lean, sight));
    const prevUp = a.up;
    r.chase.bank(sight);
    r.view();
    a = r.axes();
    console.log("PROBE along fwd", f(a.fwd), "want", f(sight), "up", f(a.up), "want", f(prevUp));
    expectNear(a.fwd, sight);
    expectNear(a.up, prevUp);
    r.chase.bank({ x: -sight.x, y: -sight.y, z: -sight.z });
    a = r.axes();
    expectNear(a.fwd, sight);
    expectNear(a.up, prevUp);
    // The view a renderer reads agrees with the world matrix: the target is straight ahead.
    const v = r.view();
    const t = { x: 10, y: 9, z: 3 };
    const vx = t.x * v[0]! + t.y * v[4]! + t.z * v[8]! + v[12]!;
    const vy = t.x * v[1]! + t.y * v[5]! + t.z * v[9]! + v[13]!;
    expect(Math.abs(vx)).toBeLessThan(1e-4);
    expect(Math.abs(vy)).toBeLessThan(1e-4);
});

it("B6 still camera, the view a renderer reads each frame follows every bank", () => {
    const r = rig();
    const sight = { x: 0.6, y: 0, z: 0.8 };
    const viewAxes = () => { const v = r.view(); return { up: { x: v[1]!, y: v[5]!, z: v[9]! }, fwd: { x: v[2]!, y: v[6]!, z: v[10]! } }; };
    let prev: V = { x: 0, y: 1, z: 0 };
    const ups: V[] = [];
    for (let i = 0; i < 8; i++) {
        const a = 0.3 * (i + 1);
        ups.push(n({ x: 0.8 * Math.sin(a), y: Math.cos(a), z: -0.6 * Math.sin(a) }));
        if (i === 3) ups.push(sight);
        if (i === 5) ups.push({ x: -0.6, y: 0, z: -0.8 });
    }
    for (const [i, up] of ups.entries()) {
        viewAxes();
        r.chase.bank(up);
        const want = Math.abs(dot(up, sight)) > 0.999999 ? prev : wantUp(up, sight);
        const got = viewAxes();
        if (i < 3 || Math.abs(got.up.x - want.x) > 1e-4) console.log(`PROBE still #${i} view up ${f(got.up)} want ${f(want)} fwd ${f(got.fwd)}`);
        expectNear(got.fwd, sight);
        expectNear(got.up, want);
        prev = want;
    }
});
