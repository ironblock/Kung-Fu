// n16: rotation (Euler) is applied X then Y then Z (q = qx*qy*qz), not Babylon.js yaw-pitch-roll.
import { makeGpuEngine } from "./scene-helpers";
import { createBox, createTransformNode } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

type Q = [number, number, number, number];
function mul(a: Q, b: Q): Q {
    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;
    return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
}
const axis = (i: number, a: number): Q => {
    const q: Q = [0, 0, 0, Math.cos(a / 2)];
    q[i] = Math.sin(a / 2);
    return q;
};
/** Babylon.js Quaternion.RotationYawPitchRoll(y, x, z) = qY * qX * qZ. */
const babylon = (x: number, y: number, z: number): Q => mul(mul(axis(1, y), axis(0, x)), axis(2, z));
const xyz = (x: number, y: number, z: number): Q => mul(mul(axis(0, x), axis(1, y)), axis(2, z));
const quat = (n: { rotationQuaternion: { x: number; y: number; z: number; w: number } }): Q => [n.rotationQuaternion.x, n.rotationQuaternion.y, n.rotationQuaternion.z, n.rotationQuaternion.w];
function same(a: Q, b: Q): boolean {
    const d = a.reduce((s, v, i) => s + v * b[i]!, 0);
    return Math.abs(Math.abs(d) - 1) < 1e-9;
}

describe("n16 Euler order", () => {
    it("mesh: x and y both set gives qx*qy*qz, which is not Babylon's result", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        box.rotation.set(0.7, 0.4, 0.2);
        expect(same(quat(box), xyz(0.7, 0.4, 0.2))).toBe(true);
        expect(same(quat(box), babylon(0.7, 0.4, 0.2))).toBe(false);
    });

    it("transform node: per-axis writes compose the same way", () => {
        const node = createTransformNode("n");
        node.rotation.x = 0.5;
        node.rotation.y = 1.1;
        expect(same(quat(node), xyz(0.5, 1.1, 0))).toBe(true);
        expect(same(quat(node), babylon(0.5, 1.1, 0))).toBe(false);
    });

    it("with x or y zero the two orders agree", () => {
        const node = createTransformNode("n");
        node.rotation.set(0.6, 0, 0.9);
        expect(same(quat(node), babylon(0.6, 0, 0.9))).toBe(true);
        node.rotation.set(0, 0.6, 0.9);
        expect(same(quat(node), babylon(0, 0.6, 0.9))).toBe(true);
    });

    it("rotationQuaternion is never null and writing it changes rotation", () => {
        const node = createTransformNode("n");
        expect(node.rotationQuaternion).not.toBeNull();
        node.rotation.set(0.3, 0, 0);
        node.rotationQuaternion.set(0, 0, 0, 1);
        expect(node.rotation.x).toBeCloseTo(0);
    });

    it("with x and y both non-zero the orders can still agree, e.g. at x = y = pi or x = 2pi", () => {
        const node = createTransformNode("n");
        node.rotation.set(Math.PI, Math.PI, 0.3);
        expect(same(quat(node), babylon(Math.PI, Math.PI, 0.3))).toBe(true);
        node.rotation.set(2 * Math.PI, 0.5, 0.3);
        expect(same(quat(node), babylon(2 * Math.PI, 0.5, 0.3))).toBe(true);
    });
});
