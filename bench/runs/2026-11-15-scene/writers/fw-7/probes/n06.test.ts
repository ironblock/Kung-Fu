import { attachDevice } from "./scene-helpers";
import { addToScene, createBox, createNullEngine, createPointLight, createSceneContext, createTransformNode, removeFromScene, setParent } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n06: removeFromScene removes the children too and nulls parent links", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("removing a parent mesh removes its child mesh and light, and sets their parent to null", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const parent = createBox(engine);
        const child = createBox(engine);
        const light = createPointLight([0, 0, 0]);
        parent.children.push(child, light);
        addToScene(scene, parent);
        removeFromScene(scene, parent);
        expect(scene.meshes).toHaveLength(0);
        expect(scene.lights).toHaveLength(0);
        expect(child.parent).toBeNull();
        expect(light.parent).toBeNull();
        expect(parent.children).toEqual([child, light]);
    });

    it("removing a child set with setParent detaches it from its parent link but leaves it in parent.children", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root", 3, 0, 0);
        const box = createBox(engine);
        addToScene(scene, root);
        addToScene(scene, box);
        setParent(box, root);
        removeFromScene(scene, box);
        expect(box.parent).toBeNull();
        expect(root.children).toContain(box);
    });

    it("removing a transform node also sets its own parent to null", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const top = createTransformNode("top");
        const mid = createTransformNode("mid");
        top.children.push(mid);
        addToScene(scene, top);
        expect(mid.parent).toBe(top);
        removeFromScene(scene, mid);
        expect(mid.parent).toBeNull();
    });
});
