// n36: disposeScene disposes the meshes whose last scene it was; they cannot join another scene.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createSceneContext, disposeScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n36 disposeScene and meshes", () => {
    it("a mesh only in the disposed scene is disposed at once; a mesh also in another scene is not", () => {
        const { engine } = makeGpuEngine();
        const a = createSceneContext(engine, { defaultRenderTask: false });
        const b = createSceneContext(engine, { defaultRenderTask: false });
        const only = createBox(engine);
        const shared = createBox(engine);
        addToScene(a, only);
        addToScene(a, shared);
        addToScene(b, shared);
        disposeScene(a);
        expect(only._disposed).toBe(true);
        expect((only._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
        expect(shared._disposed).toBeUndefined();
        expect(() => addToScene(b, only)).toThrow(/disposed/);
        expect(a.meshes).toHaveLength(0);
    });
});
