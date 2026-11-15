import { describe, expect, it } from "vitest";
import { makeEngine, makeSceneOn, project } from "./scene-helpers-s";
import { createDirectionalLight } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base";
import { createCrateField } from "../src/crate-field";

const CENTRES: [number, number, number][] = [
    [0, 0.5, 0],
    [180, 0.5, -40],
    [-150, 1.5, 120],
    [60, 0.5, 210],
    [-90, 0.5, -230],
];

/** The eight corners of each drawn crate: mesh world x instance matrix x the unit cube. */
function crateCorners(mesh: Mesh): [number, number, number][][] {
    const w = mesh.worldMatrix;
    const ti = mesh.thinInstances!;
    const out: [number, number, number][][] = [];
    for (let i = 0; i < ti.count; i++) {
        const m = ti.matrices.subarray(i * 16, i * 16 + 16);
        const corners: [number, number, number][] = [];
        for (let c = 0; c < 8; c++) {
            const p = [c & 1 ? 0.5 : -0.5, c & 2 ? 0.5 : -0.5, c & 4 ? 0.5 : -0.5];
            const q = [0, 1, 2].map((r) => m[r]! * p[0]! + m[4 + r]! * p[1]! + m[8 + r]! * p[2]! + m[12 + r]!);
            corners.push([0, 1, 2].map((r) => w[r]! * q[0]! + w[4 + r]! * q[1]! + w[8 + r]! * q[2]! + w[12 + r]!) as [number, number, number]);
        }
        out.push(corners);
    }
    return out;
}

describe("S4 a yard full of crates", () => {
    it("is one thin-instanced mesh in the scene, one unit crate per centre", () => {
        const engine = makeEngine();
        const scene = makeSceneOn(engine);
        const mesh = createCrateField(engine, scene, CENTRES);
        expect(scene.meshes).toContain(mesh);
        expect(mesh.thinInstances?.count).toBe(CENTRES.length);
        const crates = crateCorners(mesh);
        crates.forEach((corners, i) => {
            for (let a = 0; a < 3; a++) {
                const lo = Math.min(...corners.map((c) => c[a]!));
                const hi = Math.max(...corners.map((c) => c[a]!));
                expect(lo).toBeCloseTo(CENTRES[i]![a]! - 0.5, 4);
                expect(hi).toBeCloseTo(CENTRES[i]![a]! + 0.5, 4);
            }
        });
    });

    it("keeps every crate inside the sun's shadow map", () => {
        for (const dir of [[0.3, -1, 0.2], [-0.7, -0.5, 0.4]] as [number, number, number][]) {
            const engine = makeEngine();
            const scene = makeSceneOn(engine);
            const mesh = createCrateField(engine, scene, CENTRES);
            const sun = createDirectionalLight(dir, 1);
            const len = Math.hypot(...dir);
            sun.position.set((-dir[0] / len) * 2000, (-dir[1] / len) * 2000, (-dir[2] / len) * 2000);
            // The fit a single-map directional generator (PCF or ESM) makes from its casters.
            const { _viewProj } = computeDirectionalLightMatrix(sun, [mesh], 1, 10000);
            for (const corners of crateCorners(mesh)) {
                for (const corner of corners) {
                    const [x, y, z] = project(_viewProj, corner);
                    expect(Math.abs(x)).toBeLessThanOrEqual(1 + 1e-6);
                    expect(Math.abs(y)).toBeLessThanOrEqual(1 + 1e-6);
                    expect(z).toBeGreaterThanOrEqual(0);
                    expect(z).toBeLessThanOrEqual(1);
                }
            }
        }
    });
});
