import { describe, expect, it } from "vitest";
import { getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { createChaseCamera } from "../src/chase-camera";

type V = { x: number; y: number; z: number };
const EYE: V = { x: 0, y: 0, z: 0 };
const TARGET: V = { x: 3, y: 0, z: 4 };
const SIGHT: V = { x: 0.6, y: 0, z: 0.8 };
// Unit vectors at right angles to the line of sight.
const LEAN: V = { x: 0.8 * Math.sin(0.5), y: Math.cos(0.5), z: -0.6 * Math.sin(0.5) };
const SIDE: V = { x: 0.8, y: 0, z: -0.6 };

function axes(m: ArrayLike<number>): { up: V; forward: V } {
    return { up: { x: m[4]!, y: m[5]!, z: m[6]! }, forward: { x: m[8]!, y: m[9]!, z: m[10]! } };
}

function expectNear(a: V, b: V): void {
    expect(a.x).toBeCloseTo(b.x, 5);
    expect(a.y).toBeCloseTo(b.y, 5);
    expect(a.z).toBeCloseTo(b.z, 5);
}

describe("B6 chase camera", () => {
    it("starts at the eye, looking at the target, upright", () => {
        const { camera } = createChaseCamera(EYE, TARGET);
        const m = camera.worldMatrix;
        expect([m[12], m[13], m[14]]).toEqual([0, 0, 0]);
        const { up, forward } = axes(m);
        expectNear(forward, SIGHT);
        expectNear(up, { x: 0, y: 1, z: 0 });
    });

    it("rolls to the car's up while still looking at the target", () => {
        const chase = createChaseCamera(EYE, TARGET);
        chase.bank(LEAN);
        let a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, LEAN);

        chase.bank(SIDE);
        a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, SIDE);

        chase.bank({ x: 0, y: 1, z: 0 });
        a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, { x: 0, y: 1, z: 0 });
    });

    it("keeps looking at the target, with its previous roll, when the car's up lies along the line of sight", () => {
        const chase = createChaseCamera(EYE, TARGET);
        chase.bank(LEAN);

        chase.bank(SIGHT);
        let a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, LEAN);

        chase.bank({ x: -SIGHT.x, y: -SIGHT.y, z: -SIGHT.z });
        a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, LEAN);

        chase.bank(SIDE);
        a = axes(chase.camera.worldMatrix);
        expectNear(a.forward, SIGHT);
        expectNear(a.up, SIDE);
    });

    it("follows each bank in the view a renderer reads every frame", () => {
        const chase = createChaseCamera(EYE, TARGET);
        const camera = chase.camera as unknown as Camera;
        let prev: V = { x: 0, y: 1, z: 0 };
        const ups: V[] = [];
        for (let i = 0; i < 8; i++) {
            const a = 0.3 * (i + 1);
            ups.push(unit({ x: 0.8 * Math.sin(a) + 0.2, y: Math.cos(a), z: -0.6 * Math.sin(a) + 0.3 }));
            if (i === 3) ups.push(SIGHT);
            if (i === 5) ups.push({ x: -SIGHT.x, y: -SIGHT.y, z: -SIGHT.z });
        }
        for (const up of ups) {
            getViewMatrix(camera);
            chase.bank(up);
            const want = Math.abs(dot(up, SIGHT)) > 0.999999 ? prev : pictureUp(up, SIGHT);
            const got = viewAxes(getViewMatrix(camera));
            expectNear(got.forward, SIGHT);
            expectNear(got.up, want);
            prev = want;
        }
    });

    it("rides with the car as the app moves the camera, and banks along and across each new line of sight", () => {
        const chase = createChaseCamera(EYE, TARGET);
        const cam = chase.camera;
        const camera = cam as unknown as Camera;
        const ownWorld = Object.getOwnPropertyDescriptor(cam, "worldMatrix")?.get;
        const world = () => (ownWorld ? ownWorld.call(cam) : cam.worldMatrix) as ArrayLike<number>;
        /** One frame: the app moves the camera with the car, then banks it; a renderer reads the view before and after. */
        const frame = (eye: V, target: V, up: V): { forward: V; up: V } => {
            getViewMatrix(camera);
            cam.position.set(eye.x, eye.y, eye.z);
            cam.target.set(target.x, target.y, target.z);
            chase.bank(up);
            const view = getViewMatrix(camera);
            const w = world();
            expectNear({ x: w[12]!, y: w[13]!, z: w[14]! }, eye);
            const ahead = inView(view, target);
            expect(Math.abs(ahead.x)).toBeLessThan(1e-4);
            expect(Math.abs(ahead.y)).toBeLessThan(1e-4);
            expect(ahead.z).toBeGreaterThan(0);
            const v = viewAxes(view);
            const a = axes(w);
            expectNear(a.forward, v.forward);
            expectNear(a.up, v.up);
            return v;
        };

        chase.bank(LEAN);

        // Over a crest: the camera now looks up the track, along a new line of sight.
        let eye: V = { x: 10, y: 5, z: 0 };
        let sight = unit({ x: 0, y: 4, z: 3 });
        const lean = unit({ x: 0.3, y: -0.6, z: 0.8 });
        let got = frame(eye, add(eye, sight, 5), lean);
        expectNear(got.forward, sight);
        expectNear(got.up, pictureUp(lean, sight));
        const rolled = got.up;

        // Up the slope, still on that line: the car's up along the line of sight, either way, keeps the roll.
        eye = add(eye, sight, 2);
        got = frame(eye, add(eye, sight, 5), sight);
        expectNear(got.forward, sight);
        expectNear(got.up, rolled);
        eye = add(eye, sight, 2);
        got = frame(eye, add(eye, sight, 5), { x: -sight.x, y: -sight.y, z: -sight.z });
        expectNear(got.forward, sight);
        expectNear(got.up, rolled);

        // Into a turn: another line of sight. The first line of sight is no longer along it, so it is an up like any other.
        eye = { x: 14, y: 8, z: 2 };
        sight = unit({ x: -0.6, y: 0.2, z: 0.8 });
        got = frame(eye, add(eye, sight, 4), SIGHT);
        expectNear(got.forward, sight);
        expectNear(got.up, pictureUp(SIGHT, sight));

        const side = unit({ x: 0.8, y: 0.5, z: 0.6 });
        got = frame(eye, add(eye, sight, 4), side);
        expectNear(got.forward, sight);
        expectNear(got.up, pictureUp(side, sight));
        const turned = got.up;
        got = frame(eye, add(eye, sight, 4), sight);
        expectNear(got.forward, sight);
        expectNear(got.up, turned);
    });
    it("rolls to the picture-up of a car's up only a few degrees off the line of sight, and still looks at the target when it is a hair off", () => {
        const chase = createChaseCamera(EYE, TARGET);
        const camera = chase.camera as unknown as Camera;
        chase.bank(LEAN);
        let prev: V = LEAN;
        for (const [deg, k] of [[5, 1], [3, -1], [2, 1], [4, -1]] as const) {
            const a = (deg * Math.PI) / 180;
            const up = unit(add({ x: SIGHT.x * Math.cos(a), y: SIGHT.y * Math.cos(a), z: SIGHT.z * Math.cos(a) }, SIDE, k * Math.sin(a)));
            getViewMatrix(camera);
            chase.bank(up);
            const v = viewAxes(getViewMatrix(camera));
            expectNear(v.forward, SIGHT);
            expectNear(v.up, pictureUp(up, SIGHT));
            expectNear(axes(chase.camera.worldMatrix).up, pictureUp(up, SIGHT));
            prev = v.up;
        }
        for (const k of [1, -1]) {
            const up = unit(add(k > 0 ? SIGHT : { x: -SIGHT.x, y: -SIGHT.y, z: -SIGHT.z }, LEAN, 1e-12));
            getViewMatrix(camera);
            chase.bank(up);
            const v = viewAxes(getViewMatrix(camera));
            expectNear(v.forward, SIGHT);
            expectNear(axes(chase.camera.worldMatrix).forward, SIGHT);
            const closest = pictureUp(up, SIGHT);
            const d = Math.min(Math.hypot(v.up.x - prev.x, v.up.y - prev.y, v.up.z - prev.z), Math.hypot(v.up.x - closest.x, v.up.y - closest.y, v.up.z - closest.z));
            expect(d).toBeLessThan(1e-4);
            prev = v.up;
        }
    });
});

function unit(v: V): V {
    const l = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function dot(a: V, b: V): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function add(a: V, b: V, k: number): V {
    return { x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k };
}

/** The up the picture can have that is closest to `up`: `up` with its part along the line of sight taken out. */
function pictureUp(up: V, sight: V): V {
    const d = dot(up, sight);
    return unit({ x: up.x - d * sight.x, y: up.y - d * sight.y, z: up.z - d * sight.z });
}

/** The camera's up and forward, read from a view matrix. */
function viewAxes(v: ArrayLike<number>): { up: V; forward: V } {
    return { up: { x: v[1]!, y: v[5]!, z: v[9]! }, forward: { x: v[2]!, y: v[6]!, z: v[10]! } };
}

/** A world point in the camera's view space. */
function inView(v: ArrayLike<number>, p: V): V {
    return {
        x: p.x * v[0]! + p.y * v[4]! + p.z * v[8]! + v[12]!,
        y: p.x * v[1]! + p.y * v[5]! + p.z * v[9]! + v[13]!,
        z: p.x * v[2]! + p.y * v[6]! + p.z * v[10]! + v[14]!,
    };
}
