import { attachDevice } from "./scene-helpers";
import { addThinInstance, createBox, createNullEngine, enableThinInstanceGpuCulling, setThinInstanceColor, setThinInstanceColors } from "@babylonjs/lite";
import type { Mat4 } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as unknown as Mat4;

describe("n21: per-instance color and culling helpers need prior setup", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("setThinInstanceColor throws until setThinInstanceColors gave an array", () => {
        const box = createBox(engine);
        addThinInstance(box, I);
        expect(() => setThinInstanceColor(box, 0, 1, 0, 0, 1)).toThrow(TypeError);
        setThinInstanceColors(box, new Float32Array(4));
        setThinInstanceColor(box, 0, 1, 0, 0, 1);
        expect(Array.from(box.thinInstances!.colors!)).toEqual([1, 0, 0, 1]);
    });

    it("enableThinInstanceGpuCulling throws on a mesh with no thin instances", () => {
        const box = createBox(engine);
        expect(() => enableThinInstanceGpuCulling(box)).toThrow(/thinInstances/);
        addThinInstance(box, I);
        expect(() => enableThinInstanceGpuCulling(box)).not.toThrow();
    });
});
