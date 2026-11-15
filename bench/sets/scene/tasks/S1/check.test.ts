import { describe, expect, it } from "vitest";
import { fogUniforms, makeEngine, makeSceneOn } from "./scene-helpers-s";
import { addMist } from "../src/mist";

describe("S1 morning mist", () => {
    it("keeps linear fog from 30 to 120 in the pale grey-blue on the scene", () => {
        const scene = makeSceneOn(makeEngine());
        addMist(scene);
        expect(scene.fog).not.toBeNull();
        expect(scene.fog!.mode).toBe(3);
        expect(scene.fog!.start).toBeCloseTo(30, 5);
        expect(scene.fog!.end).toBeCloseTo(120, 5);
        expect(scene.fog!.color[0]).toBeCloseTo(0.75, 5);
        expect(scene.fog!.color[1]).toBeCloseTo(0.8, 5);
        expect(scene.fog!.color[2]).toBeCloseTo(0.88, 5);
    });

    it("hands those values to the shaders with the next frame's scene uniforms", () => {
        const scene = makeSceneOn(makeEngine());
        addMist(scene);
        const [mode, start, end, , r, g, b] = fogUniforms(scene);
        expect(mode).toBe(3);
        expect(start).toBeCloseTo(30, 5);
        expect(end).toBeCloseTo(120, 5);
        expect(r).toBeCloseTo(0.75, 5);
        expect(g).toBeCloseTo(0.8, 5);
        expect(b).toBeCloseTo(0.88, 5);
    });
});
