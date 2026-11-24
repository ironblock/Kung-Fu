import { attachDevice, floats } from "./scene-helpers";
import { createBox, createNullEngine, flushThinInstances, setThinInstanceMatrix, setThinInstances } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";
import { syncThinInstanceGpuData } from "../../babylon-lite/packages/babylon-lite/src/mesh/thin-instance-gpu.ts";
import { describe, expect, it } from "vitest";

const at = (x: number): Mat4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1]) as unknown as Mat4;

describe("n19: direct writes into thinInstances.matrices upload only after flushThinInstances", () => {
    it("a direct write is not synced; flushThinInstances makes the next sync upload it", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const box = createBox(engine);
        const arr = new Float32Array(32);
        arr.set(at(1), 0);
        arr.set(at(2), 16);
        setThinInstances(box, arr, 2);
        const ti = box.thinInstances!;
        syncThinInstanceGpuData(engine, ti, false);
        expect(floats(ti._gpuBuffer)[12]).toBe(1);
        arr[12] = 50;
        syncThinInstanceGpuData(engine, ti, false);
        expect(floats(ti._gpuBuffer)[12]).toBe(1);
        flushThinInstances(box);
        syncThinInstanceGpuData(engine, ti, false);
        expect(floats(ti._gpuBuffer)[12]).toBe(50);
    });

    it("setThinInstanceMatrix needs no flush", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(32), 2);
        const ti = box.thinInstances!;
        syncThinInstanceGpuData(engine, ti, false);
        setThinInstanceMatrix(box, 1, at(8));
        syncThinInstanceGpuData(engine, ti, false);
        expect(floats(ti._gpuBuffer)[16 + 12]).toBe(8);
    });

    it("setThinInstanceMatrix marks only its own slot: a direct write to another slot stays stale", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const box = createBox(engine);
        const arr = new Float32Array(32);
        setThinInstances(box, arr, 2);
        const ti = box.thinInstances!;
        syncThinInstanceGpuData(engine, ti, false);
        arr[12] = 50;
        setThinInstanceMatrix(box, 1, at(8));
        syncThinInstanceGpuData(engine, ti, false);
        expect(floats(ti._gpuBuffer)[16 + 12]).toBe(8);
        expect(floats(ti._gpuBuffer)[12]).toBe(0);
    });
});
