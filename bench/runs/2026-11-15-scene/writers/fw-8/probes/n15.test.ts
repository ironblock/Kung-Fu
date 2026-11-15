// n15: setFog after registerScene leaves Standard shaders fog-free until rebuildSceneRenderables.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createHemisphericLight, createSceneContext, createStandardMaterial, rebuildSceneRenderables, registerScene, setFog } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const TARGET = { _colorFormat: "bgra8unorm", _depthStencilFormat: "depth24plus-stencil8", _sampleCount: 1 } as never;
const FOG = { mode: 1 as const, density: 0.1, start: 0, end: 10, color: [1, 0, 0] as [number, number, number] };

async function build(fogBefore: boolean) {
    const { engine, device } = makeGpuEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const box = createBox(engine);
    box.material = createStandardMaterial() as never;
    addToScene(scene, box);
    addToScene(scene, createHemisphericLight());
    if (fogBefore) {
        setFog(scene, FOG);
    }
    await registerScene(scene);
    if (!fogBefore) {
        setFog(scene, FOG);
    }
    const fogged = (): boolean => {
        device.shaders.length = 0;
        for (const r of scene._renderables) {
            r.bind(engine, TARGET);
        }
        return device.shaders.join("\n").includes("E_FOG");
    };
    return { scene, fogged };
}

describe("n15 fog and registration", () => {
    it("setFog before registerScene: shader has fog", async () => {
        const { fogged } = await build(true);
        expect(fogged()).toBe(true);
    });

    it("setFog after registerScene: no fog until rebuildSceneRenderables", async () => {
        const { scene, fogged } = await build(false);
        expect(fogged()).toBe(false);
        await rebuildSceneRenderables(scene);
        expect(fogged()).toBe(true);
    });
});
