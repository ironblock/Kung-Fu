// n30: removeFromScene on a mesh that was never added still disposes it; on a mesh held only by another
// scene it does not dispose it but sets its parent to null and recurses into its children.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createSceneContext, createTransformNode, removeFromScene, setParent, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n30 removing a mesh that is in no scene", () => {
    it("disposes it", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        removeFromScene(scene, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBe(true);
        expect(() => addToScene(scene, box)).toThrow(/disposed/);
    });

    it("removing it from a scene that does not hold it, while another scene does, does not", async () => {
        const { engine } = makeGpuEngine();
        const holder = createSceneContext(engine, { defaultRenderTask: false });
        const stranger = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(holder, box);
        removeFromScene(stranger, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBeUndefined();
    });

    it("on a mesh held only by another scene it still nulls parent and disposes a child held by no scene", async () => {
        const { engine } = makeGpuEngine();
        const holder = createSceneContext(engine, { defaultRenderTask: false });
        const stranger = createSceneContext(engine, { defaultRenderTask: false });
        const pivot = createTransformNode("pivot", 10, 0, 0);
        const box = createBox(engine);
        setParent(box, pivot);
        addToScene(holder, box);
        const kid = createBox(engine);
        setParent(kid, box);
        removeFromScene(stranger, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBeUndefined();
        expect(box.parent).toBeNull();
        expect(kid._disposed).toBe(true);
    });
});
