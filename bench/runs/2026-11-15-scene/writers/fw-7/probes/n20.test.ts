import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine, setThinInstanceCount, setThinInstanceDrawCount, setThinInstanceMatrix, setThinInstances } from "@babylonjs/lite";
import { syncThinInstanceGpuData } from "../../babylon-lite/packages/babylon-lite/src/mesh/thin-instance-gpu.ts";
import { describe, expect, it } from "vitest";

describe("n20: setThinInstanceCount checks nothing; setThinInstanceDrawCount checks capacity and a first sync", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("setThinInstanceCount on a mesh without thin instances does nothing", () => {
        const box = createBox(engine);
        setThinInstanceCount(box, 5);
        expect(box.thinInstances ?? null).toBeNull();
    });

    it("setThinInstanceCount accepts a count above capacity", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(32), 2);
        expect(() => setThinInstanceCount(box, 10)).not.toThrow();
        expect(box.thinInstances!.count).toBe(10);
        expect(box.thinInstances!._capacity).toBe(2);
    });

    it("setThinInstanceDrawCount throws before the pool has synced to the GPU", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(64), 4);
        expect(() => setThinInstanceDrawCount(box, 2)).toThrow(/synchronized/);
    });

    it("after a sync it accepts 0..capacity and throws RangeError above", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(64), 4);
        syncThinInstanceGpuData(engine, box.thinInstances!, false);
        setThinInstanceDrawCount(box, 2);
        expect(box.thinInstances!.count).toBe(2);
        expect(() => setThinInstanceDrawCount(box, 5)).toThrow(RangeError);
        setThinInstanceDrawCount(box, 4);
        expect(box.thinInstances!.count).toBe(4);
    });

    it("RangeError comes first, even unsynced; an unchanged count never throws; a write after the sync makes it throw again", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(64), 4);
        expect(() => setThinInstanceDrawCount(box, 9)).toThrow(RangeError);
        expect(() => setThinInstanceDrawCount(box, 4)).not.toThrow();
        syncThinInstanceGpuData(engine, box.thinInstances!, false);
        setThinInstanceMatrix(box, 0, new Float32Array(16) as never);
        expect(() => setThinInstanceDrawCount(box, 2)).toThrow(/synchronized/);
        syncThinInstanceGpuData(engine, box.thinInstances!, false);
        expect(() => setThinInstanceDrawCount(box, 2)).not.toThrow();
    });
});
