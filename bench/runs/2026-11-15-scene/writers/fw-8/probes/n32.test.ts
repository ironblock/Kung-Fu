// n32: setShadowGeneratorEnabled(false) skips the map and writes darkness 1 for receivers.
import { makeGpuEngine } from "./scene-helpers";
import { createDirectionalLight, createPcfDirectionalShadowGenerator, setShadowGeneratorEnabled } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n32 setShadowGeneratorEnabled", () => {
    it("false: no shadow-map render, receivers get darkness 1; true: renders again with its darkness", () => {
        const { engine, device } = makeGpuEngine();
        const light = createDirectionalLight([0, -1, 0]);
        const sg = createPcfDirectionalShadowGenerator(engine, light, { darkness: 0.3 });
        let renders = 0;
        sg._renderShadowMap = () => {
            renders++;
            return 1;
        };
        const values: number[] = [];
        const write = device as unknown as { writes: unknown[] };
        void write;
        const realWrite = (engine._device.queue.writeBuffer as unknown as (...a: unknown[]) => void).bind(engine._device.queue);
        (engine._device.queue as unknown as { writeBuffer: unknown }).writeBuffer = (buffer: unknown, offset: number, data: Float32Array) => {
            if (buffer === sg._shadowUBO && offset === 80) {
                values.push(data[0]!);
            }
            realWrite(buffer, offset, data);
        };
        setShadowGeneratorEnabled(sg, false);
        expect(sg._renderShadowMap!(engine, {} as never)).toBe(0);
        expect(renders).toBe(0);
        expect(values).toEqual([1]);
        setShadowGeneratorEnabled(sg, true);
        expect(sg._renderShadowMap!(engine, {} as never)).toBe(1);
        expect(renders).toBe(1);
        expect(values[1]).toBeCloseTo(0.3);
    });
});
