import { attachDevice } from "./scene-helpers";
import { createCsmDirectionalShadowGenerator, createDirectionalLight, createNullEngine } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n26: CSM numCascades is capped at 4 without error", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("numCascades 6 gives 4 cascades", () => {
        const sg = createCsmDirectionalShadowGenerator(engine, createDirectionalLight([0, -1, 0]), { numCascades: 6 });
        expect(sg._csmCascadeCount).toBe(4);
    });

    it("numCascades 2 gives 2, and the default is 4", () => {
        expect(createCsmDirectionalShadowGenerator(engine, createDirectionalLight([0, -1, 0]), { numCascades: 2 })._csmCascadeCount).toBe(2);
        expect(createCsmDirectionalShadowGenerator(engine, createDirectionalLight([0, -1, 0]))._csmCascadeCount).toBe(4);
    });
});
