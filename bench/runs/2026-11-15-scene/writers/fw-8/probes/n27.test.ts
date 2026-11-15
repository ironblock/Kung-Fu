// n27: addThinInstance starts at capacity 16 and doubles into a new array.
import { makeGpuEngine, translation } from "./scene-helpers";
import { addThinInstance, createBox } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n27 thin instance growth", () => {
    it("16 slots at first, then a new array of twice the size", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        addThinInstance(box, translation(0, 0, 0) as never);
        const ti = box.thinInstances!;
        expect(ti.matrices.length).toBe(16 * 16);
        const before = ti.matrices;
        for (let i = 1; i < 16; i++) {
            addThinInstance(box, translation(i, 0, 0) as never);
        }
        expect(ti.matrices).toBe(before);
        const index = addThinInstance(box, translation(16, 0, 0) as never);
        expect(index).toBe(16);
        expect(ti.matrices).not.toBe(before);
        expect(ti.matrices.length).toBe(32 * 16);
        expect(before[16 * 16 - 4]).toBe(15);
        expect(ti.matrices[16 * 16 + 12]).toBe(16);
    });
});
