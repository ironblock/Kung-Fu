// n33: the directional ortho box is fitted to the casters' bounds, padded 10% per side.
import { makeGpuEngine } from "./scene-helpers";
import { createBox, createDirectionalLight } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base";
import { describe, expect, it } from "vitest";

function clipX(vp: Float32Array, x: number, y: number, z: number): number {
    return vp[0]! * x + vp[4]! * y + vp[8]! * z + vp[12]!;
}

describe("n33 directional shadow extent", () => {
    it("a 2-wide caster maps its edge to 1/1.2 of the map half-width", () => {
        const { engine } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 20, 0);
        const box = createBox(engine, 2);
        const { _viewProj } = computeDirectionalLightMatrix(light, [box], 1, 10000);
        expect(Math.abs(clipX(_viewProj, 1, 0, 0))).toBeCloseTo(1 / 1.2, 5);
        expect(Math.abs(clipX(_viewProj, 1.2, 0, 0))).toBeCloseTo(1, 5);
    });

    it("moving a caster moves the fitted box: a receiver point far from all casters falls outside", () => {
        const { engine } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 20, 0);
        const a = createBox(engine, 2);
        const b = createBox(engine, 2);
        b.position.x = 10;
        const { _viewProj } = computeDirectionalLightMatrix(light, [a, b], 1, 10000);
        expect(Math.abs(clipX(_viewProj, 11, 0, 0))).toBeLessThanOrEqual(1);
        expect(Math.abs(clipX(_viewProj, 30, 0, 0))).toBeGreaterThan(1);
    });
});
