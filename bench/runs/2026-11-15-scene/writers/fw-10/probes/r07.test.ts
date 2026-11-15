// r07: many copies of one mesh with thin instances; edit, add and remove them.
import { makeGpuScene, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addThinInstance, addToScene, createStandardMaterial, registerScene, createBox, flushThinInstances, removeThinInstance, setThinInstanceMatrix, setThinInstances } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";

const T = (x: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
const xs = (m: { thinInstances?: { matrices: ArrayLike<number>; count: number } | null }): number[] =>
    Array.from({ length: m.thinInstances!.count }, (_, i) => m.thinInstances!.matrices[i * 16 + 12]!);

describe("r07 thin instances", () => {
    it("setThinInstances keeps your array; edit it in place then flushThinInstances to mark it for upload", () => {
        const { engine } = makeGpuScene();
        const box = createBox(engine, 1);
        const data = new Float32Array([...T(0), ...T(2), ...T(4)]);
        setThinInstances(box, data, 3);
        expect(box.thinInstances!.matrices).toBe(data);
        const v = box.thinInstances!._version;
        data[16 + 12] = 9;
        expect(box.thinInstances!._version).toBe(v);
        flushThinInstances(box);
        expect(box.thinInstances!._version).toBe(v + 1);
        expect(xs(box)).toEqual([0, 9, 4]);
    });

    it("removeThinInstance moves the LAST instance into the removed slot", () => {
        const { engine } = makeGpuScene();
        const box = createBox(engine, 1);
        setThinInstances(box, new Float32Array([...T(0), ...T(1), ...T(2), ...T(3)]), 4);
        removeThinInstance(box, 1);
        expect(xs(box)).toEqual([0, 3, 2]);
        const v = box.thinInstances!._version;
        setThinInstanceMatrix(box, 1, T(7) as unknown as Mat4);
        expect(box.thinInstances!._version).toBe(v + 1);
        expect(xs(box)).toEqual([0, 7, 2]);
    });

    it("addThinInstance past capacity replaces the matrices array: later edits to your old array are not seen", () => {
        const { engine } = makeGpuScene();
        const box = createBox(engine, 1);
        const data = new Float32Array([...T(0), ...T(1)]);
        setThinInstances(box, data, 2);
        expect(addThinInstance(box, T(5) as unknown as Mat4)).toBe(2);
        expect(box.thinInstances!.matrices).not.toBe(data);
        data[12] = 99;
        flushThinInstances(box);
        expect(xs(box)).toEqual([0, 1, 5]);
    });

    it("addThinInstance on a plain mesh starts a pool with room for 16", () => {
        const { engine } = makeGpuScene();
        const box = createBox(engine, 1);
        expect(addThinInstance(box, T(3) as unknown as Mat4)).toBe(0);
        expect(box.thinInstances!.matrices.length).toBe(16 * 16);
        expect(xs(box)).toEqual([3]);
    });

    it("on a running scene: an in-place edit is uploaded only after flushThinInstances", async () => {
        const { engine, scene, device } = makeGpuScene({ renderTask: true });
        const box = createBox(engine, 1);
        box.material = createStandardMaterial();
        const data = new Float32Array([...T(0), ...T(2)]);
        setThinInstances(box, data, 2);
        addToScene(scene, box);
        await registerScene(scene);
        frame(engine, scene);
        await new Promise((r) => setTimeout(r, 0));
        frame(engine, scene);
        const buf = box.thinInstances!._gpuBuffer;
        expect(buf).toBeTruthy();
        const writes = () => device.log.writes.filter((w) => w.target === buf).length;
        const n = writes();
        data[16 + 12] = 8;
        frame(engine, scene);
        expect(writes()).toBe(n);
        flushThinInstances(box);
        frame(engine, scene);
        expect(writes()).toBe(n + 1);
    });
});
