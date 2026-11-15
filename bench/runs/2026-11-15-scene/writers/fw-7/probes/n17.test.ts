import { attachDevice } from "./scene-helpers";
import { addThinInstance, createBox, createNullEngine, removeThinInstance, setThinInstanceColors } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const at = (x: number): Mat4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1]) as unknown as Mat4;

describe("n17: removeThinInstance moves the last instance into the gap and leaves colors where they were", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("removing index 0 of [0,1,2] gives matrices [2,1]", () => {
        const box = createBox(engine);
        addThinInstance(box, at(0));
        addThinInstance(box, at(1));
        addThinInstance(box, at(2));
        removeThinInstance(box, 0);
        const ti = box.thinInstances!;
        expect(ti.count).toBe(2);
        expect(ti.matrices[12]).toBe(2);
        expect(ti.matrices[16 + 12]).toBe(1);
    });

    it("removing the last index only drops the count", () => {
        const box = createBox(engine);
        addThinInstance(box, at(0));
        addThinInstance(box, at(1));
        removeThinInstance(box, 1);
        expect(box.thinInstances!.count).toBe(1);
        expect(box.thinInstances!.matrices[12]).toBe(0);
    });

    it("the per-instance colors are not moved, so slot 0 keeps instance 0's color", () => {
        const box = createBox(engine);
        addThinInstance(box, at(0));
        addThinInstance(box, at(1));
        addThinInstance(box, at(2));
        setThinInstanceColors(box, new Float32Array([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1]));
        removeThinInstance(box, 0);
        expect(Array.from(box.thinInstances!.colors!.slice(0, 4))).toEqual([1, 0, 0, 1]);
        expect(box.thinInstances!.matrices[12]).toBe(2);
    });
});
