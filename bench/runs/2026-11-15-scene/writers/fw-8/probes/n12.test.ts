// n12: directional shadow depth range is orthoMinZ..orthoMaxZ from light.position along direction;
// light.position starts at (0,0,0); the range starts at the light's world position, so parents move it.
import { makeGpuEngine } from "./scene-helpers";
import { createBox, createDirectionalLight, createTransformNode, setParent } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base";
import { describe, expect, it } from "vitest";

/** Shadow-map depth (0..1 is kept) of a world point under the generator's view-projection. */
function depthOf(viewProj: Float32Array, x: number, y: number, z: number): number {
    return viewProj[2]! * x + viewProj[6]! * y + viewProj[10]! * z + viewProj[14]!;
}

describe("n12 directional shadow depth range", () => {
    it("the light starts at the origin, so a caster there falls before the near plane", () => {
        const { engine } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        expect([light.position.x, light.position.y, light.position.z]).toEqual([0, 0, 0]);
        const box = createBox(engine, 1);
        const { _viewProj } = computeDirectionalLightMatrix(light, [box], 1, 10000);
        expect(depthOf(_viewProj, 0, 0, 0)).toBeLessThan(0);
        // 0.5 units in front of the light: still nearer than orthoMinZ = 1.
        expect(depthOf(_viewProj, 0, -0.5, 0)).toBeLessThan(0);
        expect(depthOf(_viewProj, 0, -2, 0)).toBeGreaterThan(0);
    });

    it("moving the light back along -direction brings the caster into 0..1", () => {
        const { engine } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const box = createBox(engine, 1);
        const { _viewProj } = computeDirectionalLightMatrix(light, [box], 1, 10000);
        const d = depthOf(_viewProj, 0, 0, 0);
        expect(d).toBeGreaterThan(0);
        expect(d).toBeLessThan(1);
    });

    it("a caster behind the light position or beyond orthoMaxZ is outside 0..1", () => {
        const { engine } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const box = createBox(engine, 1);
        const { _viewProj } = computeDirectionalLightMatrix(light, [box], 1, 100);
        expect(depthOf(_viewProj, 0, 60, 0)).toBeLessThan(0);
        expect(depthOf(_viewProj, 0, -60, 0)).toBeGreaterThan(1);
    });

    it("a parent's transform moves the start of the range: parent at y=50, light.position (0,0,0) keeps the caster at the origin", () => {
        const { engine } = makeGpuEngine();
        const pivot = createTransformNode("pivot", 0, 50, 0);
        const light = createDirectionalLight([0, -1, 0]);
        setParent(light, pivot);
        light.position.set(0, 0, 0);
        expect([light.position.x, light.position.y, light.position.z]).toEqual([0, 0, 0]);
        const box = createBox(engine, 1);
        const { _viewProj } = computeDirectionalLightMatrix(light, [box], 1, 10000);
        const d = depthOf(_viewProj, 0, 0, 0);
        expect(d).toBeGreaterThan(0);
        expect(d).toBeLessThan(1);
        expect(depthOf(_viewProj, 0, 60, 0)).toBeLessThan(0);
    });
});
