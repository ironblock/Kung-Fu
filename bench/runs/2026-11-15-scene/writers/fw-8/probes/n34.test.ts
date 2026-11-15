// n34: removeFromScene(child) leaves it in its parent's children; re-adding the parent re-adds it.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createPointLight, createSceneContext, createTransformNode, removeFromScene, setParent, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n34 removing a child node", () => {
    it("a removed light stays in parent.children and comes back when the parent is added again", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const light = createPointLight([0, 1, 0]);
        setParent(light, root);
        addToScene(scene, root);
        removeFromScene(scene, light);
        expect(light.parent).toBeNull();
        expect(root.children).toContain(light);
        addToScene(scene, root);
        expect(scene.lights).toContain(light);
        expect(light.parent).toBe(root);
    });

    it("a removed mesh child makes a later addToScene(parent) throw once its disposal ran", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const box = createBox(engine);
        setParent(box, root);
        addToScene(scene, root);
        removeFromScene(scene, box);
        await waitForGpuResourceRetirements(engine);
        expect(root.children).toContain(box);
        expect(() => addToScene(scene, root)).toThrow(/disposed/);
    });

    it("setParent(child, null) before removing takes it out of children", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const light = createPointLight([0, 1, 0]);
        setParent(light, root);
        addToScene(scene, root);
        setParent(light, null);
        removeFromScene(scene, light);
        expect(root.children).not.toContain(light);
        addToScene(scene, root);
        expect(scene.lights).not.toContain(light);
    });
});
