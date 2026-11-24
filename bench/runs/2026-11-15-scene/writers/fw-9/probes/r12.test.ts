// r12: a mesh added while running also casts a shadow.
import { makeGpuScene, drawsOfFrame, settle } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createFreeCamera,
    createGround,
    createPcfDirectionalShadowGenerator,
    createSphere,
    createStandardMaterial,
    registerSceneWithShadowSupport,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

async function setup() {
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
    const sg = createPcfDirectionalShadowGenerator(engine, light);
    light.shadowGenerator = sg;
    const casters: Mesh[] = [box];
    setShadowTaskCasterMeshes(sg, casters);
    await registerSceneWithShadowSupport(scene);
    await settle();
    const ball = createSphere(engine, { segments: 8 });
    ball.material = createStandardMaterial() as never;
    ball.position.set(2, 2, 0);
    addToScene(scene, ball);
    const shadowDraws = async () => {
        await settle();
        const draws = drawsOfFrame(engine, scene, s.log);
        const colour = Math.max(...draws.map((d) => d.pass));
        return draws.filter((d) => d.pass !== colour).map((d) => d.count);
    };
    return { ...s, sg, casters, ball, shadowDraws };
}

describe("r12 late caster", () => {
    it("pushing the new mesh into the caster array passed to setShadowTaskCasterMeshes puts it in the shadow pass", async () => {
        const r = await setup();
        r.casters.push(r.ball);
        expect(await r.shadowDraws()).toEqual([36, r.ball._gpu.indexCount]);
    });

    it("calling setShadowTaskCasterMeshes again with a new array does the same", async () => {
        const r = await setup();
        setShadowTaskCasterMeshes(r.sg, [...r.casters, r.ball]);
        expect(await r.shadowDraws()).toEqual([36, r.ball._gpu.indexCount]);
    });

    it("with addToScene alone: the new mesh draws in colour but the shadow pass draws only the box", async () => {
        const r = await setup();
        expect(await r.shadowDraws()).toEqual([36]);
        const draws = drawsOfFrame(r.engine, r.scene, r.log);
        expect(draws.some((d) => d.count === r.ball._gpu.indexCount)).toBe(true);
    });
});
