// r14: switch a light's shadows off and on while running; what removing the light does to its generator.
import { makeGpuScene, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createGround,
    createPcfDirectionalShadowGenerator,
    createStandardMaterial,
    registerSceneWithShadowSupport,
    removeFromScene,
    setShadowGeneratorEnabled,
    setShadowTaskCasterMeshes,
    setLightDiffuseColor,
    setLightIntensity,
    setThinInstances,
} from "@babylonjs/lite";

async function setup(cfg: { forceRefreshEveryFrame?: boolean } = {}) {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    box.position.set(0, 1, 0);
    const ground = createGround(g.engine, { width: 10, height: 10 });
    ground.material = createStandardMaterial();
    ground.receiveShadows = true;
    const light = createDirectionalLight([0, -1, 0]);
    light.position.set(0, 20, 0);
    addToScene(g.scene, box);
    addToScene(g.scene, ground);
    addToScene(g.scene, light);
    const sg = createPcfDirectionalShadowGenerator(g.engine, light, cfg);
    light.shadowGenerator = sg;
    setShadowTaskCasterMeshes(sg, [box]);
    await registerSceneWithShadowSupport(g.scene);
    const first = frame(g.engine, g.scene);
    return { ...g, box, light, sg, first };
}

describe("r14 shadows on and off", () => {
    it("the map is redrawn only when a caster or the light moves, unless forceRefreshEveryFrame", async () => {
        const s = await setup();
        const still = frame(s.engine, s.scene);
        expect(still).toBe(s.first - 1);
        s.box.position.set(0, 2, 0);
        expect(frame(s.engine, s.scene)).toBe(s.first);
        const f = await setup({ forceRefreshEveryFrame: true });
        expect(frame(f.engine, f.scene)).toBe(f.first);
    });

    it("setShadowGeneratorEnabled(sg, false) stops shadow-map draws; true brings them back", async () => {
        const s = await setup({ forceRefreshEveryFrame: true });
        setShadowGeneratorEnabled(s.sg, false);
        expect(frame(s.engine, s.scene)).toBe(s.first - 1);
        setShadowGeneratorEnabled(s.sg, true);
        expect(frame(s.engine, s.scene)).toBe(s.first);
        expect(s.light.shadowGenerator).toBe(s.sg);
    });

    it("removing the light instead unlinks its generator: light.shadowGenerator is undefined afterwards", async () => {
        const s = await setup({ forceRefreshEveryFrame: true });
        removeFromScene(s.scene, s.light);
        expect(s.light.shadowGenerator).toBeUndefined();
        expect(s.scene.lights).toHaveLength(0);
        addToScene(s.scene, s.light);
        expect(s.light.shadowGenerator).toBeUndefined();
    });

    it("with nothing changed the map is not redrawn; a caster move, new thin instances or a tracked light change redraws it", async () => {
        const s = await setup();
        expect(frame(s.engine, s.scene)).toBe(s.first - 1);
        setLightIntensity(s.light, 2);
        expect(frame(s.engine, s.scene)).toBe(s.first);
        expect(frame(s.engine, s.scene)).toBe(s.first - 1);
        setLightDiffuseColor(s.light, [1, 0.5, 0]);
        expect(frame(s.engine, s.scene)).toBe(s.first);
        s.light.direction.set(0.1, -1, 0);
        expect(frame(s.engine, s.scene)).toBe(s.first);
        expect(frame(s.engine, s.scene)).toBe(s.first - 1);
        s.light.intensity = 3; // plain write: not tracked
        expect(frame(s.engine, s.scene)).toBe(s.first - 1);
        const m = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1]);
        setThinInstances(s.box, m, 1);
        expect(frame(s.engine, s.scene)).toBeGreaterThan(s.first - 1);
    });
});
