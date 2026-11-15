import { describe, expect, it } from "vitest";
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
});
