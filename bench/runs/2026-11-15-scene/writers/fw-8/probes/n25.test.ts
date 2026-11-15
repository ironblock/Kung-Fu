// n25: removeThinInstance swap-removes the matrix; per-instance colors are not moved.
import { makeGpuEngine, translation } from "./scene-helpers";
import { addThinInstance, createBox, removeThinInstance, setThinInstanceColors } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n25 removeThinInstance", () => {
    it("moves the last instance into the removed slot", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        for (let i = 0; i < 4; i++) {
            addThinInstance(box, translation(i, 0, 0) as never);
        }
        removeThinInstance(box, 1);
        const ti = box.thinInstances!;
        expect(ti.count).toBe(3);
        const xs = [0, 1, 2].map((i) => ti.matrices[i * 16 + 12]);
        expect(xs).toEqual([0, 3, 2]);
    });

    it("removing the last index just drops it", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        for (let i = 0; i < 3; i++) {
            addThinInstance(box, translation(i, 0, 0) as never);
        }
        removeThinInstance(box, 2);
        const ti = box.thinInstances!;
        expect([0, 1].map((i) => ti.matrices[i * 16 + 12])).toEqual([0, 1]);
        expect(ti.count).toBe(2);
    });

    it("colors are not moved: slot i keeps the removed instance's color", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        for (let i = 0; i < 3; i++) {
            addThinInstance(box, translation(i, 0, 0) as never);
        }
        const colors = new Float32Array([0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1]);
        setThinInstanceColors(box, colors);
        removeThinInstance(box, 0);
        const ti = box.thinInstances!;
        expect(ti.matrices[12]).toBe(2);
        expect(Array.from(ti.colors!.subarray(0, 4))).toEqual([0, 0, 0, 1]);
    });
});
