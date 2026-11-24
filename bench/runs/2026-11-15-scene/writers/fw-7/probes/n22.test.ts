import { attachDevice, transformPoint } from "./scene-helpers";
import { createBox, createDirectionalLight, createNullEngine, createTransformNode } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base.ts";
import { describe, expect, it } from "vitest";

// Depth of a world point in the shadow map's clip space: inside the map when 0 <= z <= 1.
function depth(viewProj: Float32Array, x: number, y: number, z: number): number {
    const p = transformPoint(viewProj, x, y, z);
    return p[2] / p[3];
}

describe("n22: directional shadow depth runs orthoMinZ..orthoMaxZ from light.position along direction", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("with the default position [0,0,0], a caster above a downward light is outside the depth range", () => {
        const light = createDirectionalLight([0, -1, 0]);
        expect([light.position.x, light.position.y, light.position.z]).toEqual([0, 0, 0]);
        const box = createBox(engine);
        box.position.set(0, 5, 0);
        const m = computeDirectionalLightMatrix(light, [box], 1, 10000);
        expect(depth(m._viewProj, 0, 5, 0)).toBeLessThan(0);
    });

    it("a caster within 1 unit in front of the light is also outside (orthoMinZ 1)", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 10, 0);
        const m = computeDirectionalLightMatrix(light, [createBox(engine)], 1, 10000);
        expect(depth(m._viewProj, 0, 9.5, 0)).toBeLessThan(0);
    });

    it("raising light.position above the caster puts it inside", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const box = createBox(engine);
        box.position.set(0, 5, 0);
        const m = computeDirectionalLightMatrix(light, [box], 1, 10000);
        const d = depth(m._viewProj, 0, 5, 0);
        expect(d).toBeGreaterThan(0);
        expect(d).toBeLessThan(1);
    });

    it("X/Y are fitted to the caster box with 10% padding on each side", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const box = createBox(engine, 2);
        const m = computeDirectionalLightMatrix(light, [box], 1, 10000);
        const edge = transformPoint(m._viewProj, 1, 0, 0);
        const width = 2 * 1.2;
        expect(Math.abs(edge[0])).toBeCloseTo(2 / width);
    });

    it("depth starts at the light's WORLD position: under a parent at y=50, light.position [0,0,0] still covers a caster at y=5", () => {
        const light = createDirectionalLight([0, -1, 0]);
        const p = createTransformNode("p", 0, 50, 0);
        light.parent = p;
        expect([light.position.x, light.position.y, light.position.z]).toEqual([0, 0, 0]);
        const box = createBox(engine);
        box.position.set(0, 5, 0);
        const m = computeDirectionalLightMatrix(light, [box], 1, 10000);
        const d = depth(m._viewProj, 0, 5, 0);
        expect(d).toBeGreaterThan(0);
        expect(d).toBeLessThan(1);
    });
});
