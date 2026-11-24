// n28: thin-instance helpers on a mesh with no thin instances.
import { makeGpuEngine, translation } from "./scene-helpers";
import { createBox, flushThinInstances, removeThinInstance, setThinInstanceColors, setThinInstanceCount, setThinInstanceMatrix } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n28 helpers before any instance exists", () => {
    it("setThinInstanceCount is a silent no-op", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        setThinInstanceCount(box, 5);
        expect(box.thinInstances ?? null).toBeNull();
    });

    it("setThinInstanceMatrix, removeThinInstance, flushThinInstances and setThinInstanceColors throw TypeError", () => {
        const { engine } = makeGpuEngine();
        const box = createBox(engine);
        expect(() => setThinInstanceMatrix(box, 0, translation(0, 0, 0) as never)).toThrow(TypeError);
        expect(() => removeThinInstance(box, 0)).toThrow(TypeError);
        expect(() => flushThinInstances(box)).toThrow(TypeError);
        expect(() => setThinInstanceColors(box, new Float32Array(4))).toThrow(TypeError);
    });
});
