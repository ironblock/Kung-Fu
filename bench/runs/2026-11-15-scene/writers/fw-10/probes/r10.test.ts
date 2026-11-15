// r10: fog. setFog both compiles fog into the shaders (only if called before the scene is built) and
// registers the writer of the fog uniforms; a plain scene.fog write does only the first.
import { makeGpuScene, frame, sceneUniformUploads, shaderCode } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createDefaultCamera, createBox, createDirectionalLight, createStandardMaterial, rebuildSceneRenderables, registerScene, setFog } from "@babylonjs/lite";
import type { FogConfig } from "@babylonjs/lite";

const fog = (): FogConfig => ({ mode: 3, density: 0, start: 10, end: 60, color: [0.5, 0.6, 0.7] });

async function build(how: "setFogBefore" | "setFogAfter" | "setFogAfterRebuild" | "plainWrite" | "editInPlace" | "setFogAgain") {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    addToScene(g.scene, box);
    addToScene(g.scene, createDirectionalLight([0, -1, 0]));
    createDefaultCamera(g.scene);
    const cfg = fog();
    if (how === "setFogBefore" || how === "editInPlace" || how === "setFogAgain") setFog(g.scene, cfg);
    if (how === "plainWrite") g.scene.fog = fog();
    await registerScene(g.scene);
    if (how === "setFogAfter" || how === "setFogAfterRebuild") setFog(g.scene, fog());
    if (how === "setFogAfterRebuild") await rebuildSceneRenderables(g.scene);
    frame(g.engine, g.scene);
    if (how === "editInPlace") cfg.end = 30;
    if (how === "setFogAgain") setFog(g.scene, { ...cfg, end: 30 });
    frame(g.engine, g.scene);
    const fogShaders = shaderCode(g.device).filter((c) => c.includes("calcFogFactor")).length;
    const last = sceneUniformUploads(g.device).at(-1);
    const fogOffWhenModeZero = shaderCode(g.device).some((c) => c.includes("if (scene.vFogInfos.x > 0.0)"));
    return { fogShaders, fogOffWhenModeZero, fogSlice: last ? Array.from(last.slice(80, 87)).map((v) => +v.toFixed(3)) : null };
}

describe("r10 fog", () => {
    it("setFog before registerScene: fog in the shader and mode/start/end/density/color in the scene uniforms", async () => {
        const r = await build("setFogBefore");
        expect(r.fogShaders).toBeGreaterThan(0);
        expect(r.fogSlice).toEqual([3, 10, 60, 0, 0.5, 0.6, 0.7]);
    });

    it("setFog after registerScene: no fog in any shader, until rebuildSceneRenderables", async () => {
        expect((await build("setFogAfter")).fogShaders).toBe(0);
        expect((await build("setFogAfterRebuild")).fogShaders).toBeGreaterThan(0);
    });

    it("without setFog (scene.fog = ... before register): fog is compiled in but its uniforms stay 0, and mode 0 is off", async () => {
        const r = await build("plainWrite");
        expect(r.fogShaders).toBeGreaterThan(0);
        expect(r.fogSlice).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(r.fogOffWhenModeZero).toBe(true);
    });

    it("editing the fog object in place is not uploaded; a new object through setFog is", async () => {
        expect((await build("editInPlace")).fogSlice![2]).toBe(60);
        expect((await build("setFogAgain")).fogSlice![2]).toBe(30);
    });
});
