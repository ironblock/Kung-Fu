// n04: removeFromScene takes out the whole subtree, nulls parent links, keeps children arrays.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createPointLight, createSceneContext, createTransformNode, removeFromScene, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n04 removing a node removes its descendants", () => {
    it("meshes and lights below are removed and unparented; children arrays stay", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const box = createBox(engine);
        const inner = createBox(engine);
        const light = createPointLight([0, 1, 0]);
        setParent(box, root);
        setParent(inner, box);
        setParent(light, root);
        addToScene(scene, root);
        expect(scene.meshes).toHaveLength(2);
        expect(scene.lights).toHaveLength(1);

        removeFromScene(scene, root);
        expect(scene.meshes).toHaveLength(0);
        expect(scene.lights).toHaveLength(0);
        expect(box.parent).toBeNull();
        expect(inner.parent).toBeNull();
        expect(light.parent).toBeNull();
        expect(root.children).toEqual([box, light]);
        expect(box.children).toEqual([inner]);
    });

    it("a removed transform node re-added brings its subtree back with parent links", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const light = createPointLight([0, 1, 0]);
        setParent(light, root);
        addToScene(scene, root);
        removeFromScene(scene, root);
        addToScene(scene, root);
        expect(scene.lights).toContain(light);
        expect(light.parent).toBe(root);
    });
});
