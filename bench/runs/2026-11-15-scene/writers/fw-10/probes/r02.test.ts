// r02: shadows from a directional light — the generator has to be linked, given casters, and the scene
// registered with shadow support; the receiver flag is read when the scene is built.
import { makeGpuScene, frame, shaderCode, taskNames } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createGround,
    createPcfDirectionalShadowGenerator,
    createStandardMaterial,
    registerScene,
    registerSceneWithShadowSupport,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";

interface Opts {
    link?: boolean;
    casters?: boolean;
    receive?: boolean;
    receiveAfter?: boolean;
    shadowSupport?: boolean;
    addGenerator?: boolean;
}

async function build(o: Opts = {}) {
    const { link = true, casters = true, receive = true, receiveAfter = false, shadowSupport = true, addGenerator = false } = o;
    const { engine, scene, device } = makeGpuScene({ renderTask: true });
    const box = createBox(engine, 1);
    box.material = createStandardMaterial();
    box.position.set(0, 1, 0);
    const ground = createGround(engine, { width: 10, height: 10 });
    ground.material = createStandardMaterial();
    const light = createDirectionalLight([0, -1, 0]);
    light.position.set(0, 20, 0);
    addToScene(scene, box);
    addToScene(scene, ground);
    addToScene(scene, light);
    const sg = createPcfDirectionalShadowGenerator(engine, light);
    if (addGenerator) addToScene(scene, sg);
    if (link) light.shadowGenerator = sg;
    if (casters) setShadowTaskCasterMeshes(sg, [box]);
    if (receive && !receiveAfter) ground.receiveShadows = true;
    await (shadowSupport ? registerSceneWithShadowSupport(scene) : registerScene(scene));
    if (receiveAfter) ground.receiveShadows = true;
    const drawsWithShadow = frame(engine, scene);
    const pcfShaders = shaderCode(device).filter((c) => c.includes("computeShadowPCF")).length;
    return { engine, scene, sg, light, drawsWithShadow, pcfShaders };
}

describe("r02 directional shadows", () => {
    it("all steps: a shadow task, a shadow-map draw, and a receiver shader that samples the map", async () => {
        const full = await build();
        const noCasters = await build({ casters: false });
        expect(taskNames(full.scene)).toContain("shadow");
        expect(full.drawsWithShadow).toBe(noCasters.drawsWithShadow + 1);
        expect(full.pcfShaders).toBeGreaterThan(0);
        expect(full.light.shadowGenerator).toBe(full.sg);
    });

    it("without linking light.shadowGenerator: no shadow-map draw and no receiver sampling", async () => {
        const full = await build();
        const r = await build({ link: false });
        expect(r.light.shadowGenerator).toBeUndefined();
        expect(r.drawsWithShadow).toBe(full.drawsWithShadow - 1);
        expect(r.pcfShaders).toBe(0);
    });

    it("addToScene(scene, generator) neither links it nor lists it", async () => {
        const r = await build({ link: false, addGenerator: true });
        expect(r.light.shadowGenerator).toBeUndefined();
        expect(r.scene.shadowGenerators).toHaveLength(0);
    });

    it("without setShadowTaskCasterMeshes: the generator renders no shadow map", async () => {
        const full = await build();
        const r = await build({ casters: false });
        expect(r.drawsWithShadow).toBe(full.drawsWithShadow - 1);
    });

    it("with registerScene instead: there is no shadow task and no shadow-map draw", async () => {
        const full = await build();
        const r = await build({ shadowSupport: false });
        expect(taskNames(r.scene)).not.toContain("shadow");
        expect(r.drawsWithShadow).toBe(full.drawsWithShadow - 1);
    });

    it("without receiveShadows (or set only after registering): no shader samples the map", async () => {
        expect((await build({ receive: false })).pcfShaders).toBe(0);
        expect((await build({ receiveAfter: true })).pcfShaders).toBe(0);
    });
});
