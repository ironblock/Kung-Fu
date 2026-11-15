// Shows on the library itself that the expected answer of S7 is so. Not a check of a subject's answer.
import { describe, expect, it } from "vitest";
import { makeEngine, makeSceneOn } from "./scene-helpers-s";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { addToScene, createBox, createDirectionalLight, createPcfDirectionalShadowGenerator, setShadowTaskCasterMeshes, setThinInstances } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "../notes/shadow-redraws.json"), "utf8")) as {
    rendersInFirstThreeFrames: number;
    afterDirectionChange: boolean;
    afterIntensityChange: boolean;
    afterInPlaceMatrixEdit: boolean;
};

describe("S7: when the PCF shadow map is re-rendered", () => {
    it("renders once, then only when a caster or the light's placement changes through the library", () => {
        const engine = makeEngine();
        const scene = makeSceneOn(engine);
        const sun = createDirectionalLight([0.4, -1, 0.3], 1);
        sun.position.set(-40, 100, -30);
        const shadows = createPcfDirectionalShadowGenerator(engine, sun);
        sun.shadowGenerator = shadows;
        const box = createBox(engine, 2);
        const crates = createBox(engine, 1);
        const m = new Float32Array(32);
        m.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0.5, 0, 1], 0);
        m.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -4, 0.5, 2, 1], 16);
        setThinInstances(crates, m, 2);
        addToScene(scene, sun);
        addToScene(scene, box);
        addToScene(scene, crates);
        setShadowTaskCasterMeshes(shadows, [box, crates]);

        // What the scene's shadow task does each frame for this light (frame-graph/shadow-task.ts execute()):
        // ensure the generator's task state, then ask the generator to render its map. Count the renders.
        const state = shadows._ensureShadowTaskState!(engine, scene, [box, crates]);
        let renders = 0;
        const execute = state._task.execute!.bind(state._task);
        state._task.execute = () => {
            renders++;
            return execute();
        };
        const frame = (): number => {
            const before = renders;
            shadows._renderShadowMap!(engine, state);
            return renders - before;
        };

        const firstThree = frame() + frame() + frame();
        expect(firstThree).toBe(expected.rendersInFirstThreeFrames);

        sun.direction.set(-0.2, -1, 0.5);
        expect(frame() > 0).toBe(expected.afterDirectionChange);
        frame();

        sun.intensity = 2.5;
        expect(frame() > 0).toBe(expected.afterIntensityChange);
        frame();

        crates.thinInstances!.matrices[12] = 9;
        crates.thinInstances!.matrices[14] = -3;
        expect(frame() > 0).toBe(expected.afterInPlaceMatrixEdit);
    });
});
