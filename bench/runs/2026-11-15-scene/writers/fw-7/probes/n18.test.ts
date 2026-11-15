import { attachDevice } from "./scene-helpers";
import { addThinInstance, createBox, createNullEngine, setThinInstanceColors, setThinInstances } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const at = (x: number): Mat4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1]) as unknown as Mat4;

describe("n18: setThinInstances keeps your array; growth past capacity swaps it for a new one", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("the passed matrices array is stored, not copied, and capacity equals count", () => {
        const box = createBox(engine);
        const arr = new Float32Array(32);
        setThinInstances(box, arr, 2);
        expect(box.thinInstances!.matrices).toBe(arr);
        expect(box.thinInstances!._capacity).toBe(2);
    });

    it("addThinInstance past capacity moves to a doubled new array; writes to the old one no longer count", () => {
        const box = createBox(engine);
        const arr = new Float32Array(32);
        setThinInstances(box, arr, 2);
        addThinInstance(box, at(9));
        const ti = box.thinInstances!;
        expect(ti.matrices).not.toBe(arr);
        expect(ti._capacity).toBe(4);
        arr[12] = 77;
        expect(ti.matrices[12]).toBe(0);
    });

    it("the first addThinInstance allocates room for 16, then doubles to 32", () => {
        const box = createBox(engine);
        for (let i = 0; i < 16; i++) addThinInstance(box, at(i));
        expect(box.thinInstances!._capacity).toBe(16);
        addThinInstance(box, at(16));
        expect(box.thinInstances!._capacity).toBe(32);
        expect(box.thinInstances!.matrices.length).toBe(32 * 16);
    });

    it("setThinInstanceColors also keeps the passed array", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(16), 1);
        const colors = new Float32Array([1, 1, 1, 1]);
        setThinInstanceColors(box, colors);
        expect(box.thinInstances!.colors).toBe(colors);
    });

    it("after setThinInstances with count 0, addThinInstance throws a RangeError (0 doubled is 0)", () => {
        const box = createBox(engine);
        setThinInstances(box, new Float32Array(0), 0);
        expect(() => addThinInstance(box, at(1))).toThrow(RangeError);
    });
});
