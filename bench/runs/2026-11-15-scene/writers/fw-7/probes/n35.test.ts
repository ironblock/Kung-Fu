import { attachDevice } from "./scene-helpers";
import {
    addToScene,
    createBox,
    createNullEngine,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
    createPointLight,
    createSceneContext,
    rebuildSceneRenderables,
    registerScene,
    removeFromScene,
    unregisterScene,
} from "@babylonjs/lite";
import type { Material, SceneContext } from "@babylonjs/lite";
import { processMaterialSwaps } from "../../babylon-lite/packages/babylon-lite/src/scene/scene-material-swap.ts";
import { describe, expect, it } from "vitest";

// A material whose group builder only records the scene's light count each time it runs.
function recordingMaterial(): { material: Material; runs: number[] } {
    const runs: number[] = [];
    const material = {
        _buildGroup: async (scene: SceneContext) => {
            runs.push(scene.lights.length);
            return { renderables: [] };
        },
    } as unknown as Material;
    return { material, runs };
}

describe("n35: material group builders run at registration; a later addToScene(light) does not re-run them", () => {
    it("adding a light to a registered scene, and registering again, runs no build", async () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const { material, runs } = recordingMaterial();
        const box = createBox(engine);
        box.material = material;
        addToScene(scene, box);
        addToScene(scene, createPointLight([0, 1, 0]));
        await registerScene(scene);
        expect(runs).toEqual([1]);
        addToScene(scene, createPointLight([0, 2, 0]));
        await registerScene(scene);
        unregisterScene(scene);
        await registerScene(scene);
        expect(runs).toEqual([1]);
    });

    it("rebuildSceneRenderables(scene) re-runs the builder with the current lights", async () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const { material, runs } = recordingMaterial();
        const box = createBox(engine);
        box.material = material;
        addToScene(scene, box);
        await registerScene(scene);
        addToScene(scene, createPointLight([0, 2, 0]));
        await rebuildSceneRenderables(scene);
        expect(runs).toEqual([0, 1]);
    });

    it("removing a light arms a rebuild that runs on the next unregisterScene/registerScene", async () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const { material, runs } = recordingMaterial();
        const box = createBox(engine);
        box.material = material;
        const light = createPointLight([0, 1, 0]);
        addToScene(scene, box);
        addToScene(scene, light);
        await registerScene(scene);
        removeFromScene(scene, light);
        expect(runs).toEqual([1]);
        unregisterScene(scene);
        await registerScene(scene);
        expect(runs).toEqual([1, 0]);
    });

    it("attaching a shadowGenerator or turning on receiveShadows after registration runs no build either", async () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const { material, runs } = recordingMaterial();
        const box = createBox(engine);
        box.material = material;
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, box);
        addToScene(scene, light);
        await registerScene(scene);
        light.shadowGenerator = createPcfDirectionalShadowGenerator(engine, light);
        box.receiveShadows = true;
        unregisterScene(scene);
        await registerScene(scene);
        expect(runs).toEqual([1]);
        await rebuildSceneRenderables(scene);
        expect(runs).toEqual([1, 1]);
    });

    it("a mesh of a material family first added after registerScene has that family's builder run at runtime", async () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const a = recordingMaterial();
        const b = recordingMaterial();
        const box = createBox(engine);
        box.material = a.material;
        addToScene(scene, box);
        await registerScene(scene);
        const late = createBox(engine);
        late.material = b.material;
        addToScene(scene, late);
        await processMaterialSwaps(scene);
        await new Promise((r) => setTimeout(r, 0));
        expect(a.runs).toEqual([0]);
        expect(b.runs.length).toBe(1);
    });
});
