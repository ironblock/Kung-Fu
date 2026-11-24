import { attachDevice } from "./scene-helpers";
import type { FakeDevice } from "./scene-helpers";
import { createDirectionalLight, createNullEngine, createPcfDirectionalShadowGenerator, setShadowGeneratorEnabled } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n25: setShadowGeneratorEnabled(false) skips the map and uploads darkness 1", () => {
    function setup(darkness?: number) {
        const engine = createNullEngine();
        const device: FakeDevice = attachDevice(engine);
        const light = createDirectionalLight([0, -1, 0]);
        const sg = createPcfDirectionalShadowGenerator(engine, light, darkness === undefined ? {} : { darkness });
        let inner = 0;
        sg._renderShadowMap = () => {
            inner++;
            return 3;
        };
        const state = { _task: { record() {}, dispose() {} }, _casterMeshes: [] };
        return { engine, device, sg, state, inner: () => inner };
    }
    const darknessWrites = (device: FakeDevice, ubo: unknown) =>
        device.writes.filter((w) => w.buffer === ubo && w.offset === 80).map((w) => new Float32Array(w.bytes.buffer, w.bytes.byteOffset, 1)[0]);

    it("disabled: no shadow-map render, darkness 1 written to the receiver UBO", () => {
        const { engine, device, sg, state, inner } = setup();
        setShadowGeneratorEnabled(sg, false);
        expect(sg._renderShadowMap!(engine, state)).toBe(0);
        expect(inner()).toBe(0);
        expect(darknessWrites(device, sg._shadowUBO)).toEqual([1]);
    });

    it("re-enabled: renders again and restores the configured darkness (default 0)", () => {
        const { engine, device, sg, state, inner } = setup();
        setShadowGeneratorEnabled(sg, false);
        sg._renderShadowMap!(engine, state);
        setShadowGeneratorEnabled(sg, true);
        expect(sg._renderShadowMap!(engine, state)).toBe(3);
        expect(inner()).toBe(1);
        expect(darknessWrites(device, sg._shadowUBO)).toEqual([1, 0]);
    });

    it("a configured darkness of 0.4 is what comes back", () => {
        const { engine, device, sg, state } = setup(0.4);
        setShadowGeneratorEnabled(sg, false);
        sg._renderShadowMap!(engine, state);
        setShadowGeneratorEnabled(sg, true);
        sg._renderShadowMap!(engine, state);
        expect(darknessWrites(device, sg._shadowUBO)[1]).toBeCloseTo(0.4);
    });
});
