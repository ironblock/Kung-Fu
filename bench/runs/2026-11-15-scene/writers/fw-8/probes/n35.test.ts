// n35: onBeforeRender has no unregister; callbacks run until disposeScene.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createSceneContext, createTransformNode, disposeScene, onBeforeRender, removeFromScene, stepScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n35 onBeforeRender lifetime", () => {
    it("returns nothing, survives removeFromScene of what it animates, and is cleared by disposeScene", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const node = createTransformNode("spinner");
        addToScene(scene, node);
        let calls = 0;
        const result = onBeforeRender(scene, () => {
            calls++;
            node.rotation.y += 0.1;
        });
        expect(result).toBeUndefined();
        removeFromScene(scene, node);
        stepScene(engine, scene, 16);
        expect(calls).toBe(1);
        disposeScene(scene);
        expect(scene._beforeRender).toHaveLength(0);
    });

    it("a callback can be taken out by splicing scene._beforeRender", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        let calls = 0;
        const cb = (): void => {
            calls++;
        };
        onBeforeRender(scene, cb);
        scene._beforeRender.splice(scene._beforeRender.indexOf(cb), 1);
        stepScene(engine, scene, 16);
        expect(calls).toBe(0);
    });
});
