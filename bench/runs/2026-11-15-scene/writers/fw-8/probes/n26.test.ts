// n26: setThinInstances keeps the caller's array; direct writes need flushThinInstances (or
// setThinInstanceCount, which also marks every instance dirty) to upload; setThinInstanceMatrix(i) sends only slot i.
import { makeGpuEngine, translation } from "./scene-helpers";
import { createBox, flushThinInstances, setThinInstanceCount, setThinInstanceMatrix, setThinInstances } from "@babylonjs/lite";
import { syncThinInstanceGpuData } from "../../babylon-lite/packages/babylon-lite/src/mesh/thin-instance-gpu";
import { describe, expect, it } from "vitest";

describe("n26 setThinInstances array", () => {
    it("the mesh holds the same array, and writing into it uploads nothing until flushThinInstances", () => {
        const { engine, device } = makeGpuEngine();
        const box = createBox(engine);
        const matrices = new Float32Array(32);
        matrices.set(translation(1, 0, 0), 0);
        matrices.set(translation(2, 0, 0), 16);
        setThinInstances(box, matrices, 2);
        const ti = box.thinInstances!;
        expect(ti.matrices).toBe(matrices);
        syncThinInstanceGpuData(engine, ti, false);
        const uploads = () => device.writes.filter((w) => w.buffer === (ti._gpuBuffer as unknown)).length;
        const first = uploads();
        matrices[12] = 9;
        syncThinInstanceGpuData(engine, ti, false);
        expect(uploads()).toBe(first);
        flushThinInstances(box);
        syncThinInstanceGpuData(engine, ti, false);
        expect(uploads()).toBe(first + 1);
    });

    it("setThinInstanceCount uploads a direct write too; setThinInstanceMatrix(mesh, 1) sends only slot 1", () => {
        const { engine, device } = makeGpuEngine();
        const box = createBox(engine);
        const matrices = new Float32Array(32);
        matrices.set(translation(1, 0, 0), 0);
        matrices.set(translation(2, 0, 0), 16);
        setThinInstances(box, matrices, 2);
        const ti = box.thinInstances!;
        syncThinInstanceGpuData(engine, ti, false);
        const mine = () => device.writes.filter((w) => w.buffer === (ti._gpuBuffer as unknown));
        const first = mine().length;
        matrices[12] = 9;
        setThinInstanceMatrix(box, 1, translation(5, 0, 0) as never);
        syncThinInstanceGpuData(engine, ti, false);
        const partial = mine()[first]!;
        expect([partial.offset, partial.bytes]).toEqual([64, 64]);
        setThinInstanceCount(box, 2);
        syncThinInstanceGpuData(engine, ti, false);
        const full = mine()[first + 1]!;
        expect([full.offset, full.bytes]).toEqual([0, 128]);
    });
});
