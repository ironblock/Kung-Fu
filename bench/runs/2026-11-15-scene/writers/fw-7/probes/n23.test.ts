import { attachDevice, transformPoint } from "./scene-helpers";
import { addThinInstance, createBox, createDirectionalLight, createNullEngine } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base.ts";
import { describe, expect, it } from "vitest";

const at = (x: number): Mat4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1]) as unknown as Mat4;

describe("n23: the directional shadow fit ignores thin-instance matrices", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("an instance at x=100 falls outside the map; the fit is the same as with no instances", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const plain = createBox(engine);
        const inst = createBox(engine);
        addThinInstance(inst, at(0));
        addThinInstance(inst, at(100));
        const a = computeDirectionalLightMatrix(light, [plain], 1, 10000);
        const b = computeDirectionalLightMatrix(light, [inst], 1, 10000);
        expect(Array.from(b._viewProj)).toEqual(Array.from(a._viewProj));
        const p = transformPoint(b._viewProj, 100, 0, 0);
        expect(Math.abs(p[0])).toBeGreaterThan(1);
    });

    it("widening boundMin/boundMax to cover the instances brings them into the map", () => {
        const light = createDirectionalLight([0, -1, 0]);
        light.position.set(0, 50, 0);
        const inst = createBox(engine);
        addThinInstance(inst, at(0));
        addThinInstance(inst, at(100));
        inst.boundMin = [-0.5, -0.5, -0.5];
        inst.boundMax = [100.5, 0.5, 0.5];
        const m = computeDirectionalLightMatrix(light, [inst], 1, 10000);
        const p = transformPoint(m._viewProj, 100, 0, 0);
        expect(Math.abs(p[0])).toBeLessThan(1);
    });
});
