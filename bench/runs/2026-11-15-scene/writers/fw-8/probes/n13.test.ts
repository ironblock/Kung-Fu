// n13: shadow receiving is baked when the scene registers; late changes on already-built meshes need
// rebuildSceneRenderables, but a mesh added later with receiveShadows samples without one.
import { makeGpuEngine } from "./scene-helpers";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
    createSceneContext,
    createStandardMaterial,
    rebuildSceneRenderables,
    registerSceneWithShadowSupport,
    stepScene,
} from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const TARGET = { _colorFormat: "bgra8unorm", _depthStencilFormat: "depth24plus-stencil8", _sampleCount: 1 } as never;

async function scene(lateGenerator: boolean, lateReceive: boolean) {
    const { engine, device } = makeGpuEngine();
    const s = createSceneContext(engine, { defaultRenderTask: false });
    const box = createBox(engine);
    box.material = createStandardMaterial() as never;
    box.receiveShadows = !lateReceive;
    addToScene(s, box);
    const light = createDirectionalLight([0, -1, 0]);
    addToScene(s, light);
    const sg = createPcfDirectionalShadowGenerator(engine, light);
    if (!lateGenerator) {
        light.shadowGenerator = sg;
    }
    await registerSceneWithShadowSupport(s);
    if (lateGenerator) {
        light.shadowGenerator = sg;
    }
    box.receiveShadows = true;
    stepScene(engine, s, 16);
    const sampled = (): boolean => {
        device.shaders.length = 0;
        for (const r of s._renderables) {
            r.bind(engine, TARGET);
        }
        return device.shaders.join("\n").includes("textureSampleCompare");
    };
    return { s, sampled };
}

describe("n13 shadows set up after registration", () => {
    it("everything set before registering: the receiver samples the shadow map", async () => {
        const { sampled } = await scene(false, false);
        expect(sampled()).toBe(true);
    });

    it("light.shadowGenerator set after registering: no sampling until rebuildSceneRenderables", async () => {
        const { s, sampled } = await scene(true, false);
        expect(sampled()).toBe(false);
        await rebuildSceneRenderables(s);
        expect(sampled()).toBe(true);
    });

    it("receiveShadows set after registering: no sampling until rebuildSceneRenderables", async () => {
        const { s, sampled } = await scene(false, true);
        expect(sampled()).toBe(false);
        await rebuildSceneRenderables(s);
        expect(sampled()).toBe(true);
    });

    async function lateMesh(receive: boolean, lateGenerator: boolean) {
        const { engine, device } = makeGpuEngine();
        const s = createSceneContext(engine, { defaultRenderTask: false });
        const first = createBox(engine);
        first.material = createStandardMaterial() as never;
        first.receiveShadows = true;
        addToScene(s, first);
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(s, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        if (!lateGenerator) {
            light.shadowGenerator = sg;
        }
        await registerSceneWithShadowSupport(s);
        if (lateGenerator) {
            light.shadowGenerator = sg;
        }
        const late = createBox(engine);
        late.material = createStandardMaterial() as never;
        late.receiveShadows = receive;
        addToScene(s, late);
        for (let i = 0; i < 5; i++) {
            stepScene(engine, s, 16);
            await new Promise((r) => setTimeout(r, 0));
        }
        device.shaders.length = 0;
        const r = s._renderables.find((x) => x.mesh === late);
        expect(r).toBeDefined();
        r!.bind(engine, TARGET);
        return device.shaders.join("\n").includes("textureSampleCompare");
    }

    it("a mesh added after registering with receiveShadows = true samples the shadow map without a rebuild", async () => {
        expect(await lateMesh(true, false)).toBe(true);
        expect(await lateMesh(false, false)).toBe(false);
    });

    it("a generator set after registering reaches not even a mesh added later with receiveShadows = true", async () => {
        expect(await lateMesh(true, true)).toBe(false);
    });
});
