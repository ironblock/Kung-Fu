// r11: switch shadows off and on while running.
import { makeGpuScene, drawsOfFrame, floatsOf, settle } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createFreeCamera,
    createGround,
    createPcfDirectionalShadowGenerator,
    createStandardMaterial,
    registerSceneWithShadowSupport,
    removeFromScene,
    setShadowGeneratorEnabled,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";

async function setup(generatorLate: boolean) {
    const s = makeGpuScene();
    const { scene, engine } = s;
    addToScene(scene, createFreeCamera({ x: 0, y: 5, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(engine, 1);
    box.material = createStandardMaterial() as never;
    box.position.y = 2;
    const ground = createGround(engine, { width: 10, height: 10 });
    ground.material = createStandardMaterial() as never;
    ground.receiveShadows = true;
    const light = createDirectionalLight([0, -1, 0.3]);
    addToScene(scene, box);
    addToScene(scene, ground);
    addToScene(scene, light);
    const make = () => {
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        setShadowTaskCasterMeshes(sg, [box]);
        return sg;
    };
    const early = generatorLate ? null : make();
    await registerSceneWithShadowSupport(scene);
    const sg = early ?? make();
    await settle();
    const look = () => {
        const draws = drawsOfFrame(engine, scene, s.log);
        const colour = Math.max(...draws.map((d) => d.pass));
        return {
            shadowPass: draws.some((d) => d.pass !== colour),
            groundReceives: draws.find((d) => d.pass === colour && d.count === 6)!.groups.includes(2),
        };
    };
    return { ...s, sg, light, box, look };
}

describe("r11 shadows off and on", () => {
    it("setShadowGeneratorEnabled(false): no shadow pass, darkness uploaded as 1, ground keeps its binding; true: darkness back to 0", async () => {
        const r = await setup(false);
        const darkness = () => floatsOf(r.sg._shadowUBO)[20];
        expect(r.look()).toEqual({ shadowPass: true, groundReceives: true });
        setShadowGeneratorEnabled(r.sg, false);
        expect(r.look()).toEqual({ shadowPass: false, groundReceives: true });
        expect(darkness()).toBe(1);
        setShadowGeneratorEnabled(r.sg, true);
        // The map is not redrawn on re-enable (nothing moved); it is redrawn when a caster moves.
        expect(r.look()).toEqual({ shadowPass: false, groundReceives: true });
        expect(darkness()).toBe(0);
        r.box.position.x = 1;
        expect(r.look().shadowPass).toBe(true);
    });

    it("with removeFromScene(scene, sg) instead: the light loses its generator and the shadow pass stops", async () => {
        const r = await setup(false);
        removeFromScene(r.scene, r.sg);
        expect(r.light.shadowGenerator).toBeUndefined();
        expect(r.look().shadowPass).toBe(false);
    });

    it("with the generator created only after registration: the map is drawn but the ground never samples it", async () => {
        const r = await setup(true);
        expect(r.look()).toEqual({ shadowPass: true, groundReceives: false });
    });
});
