// n08: adding a camera always replaces scene.camera; removing the active one leaves null.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createArcRotateCamera, createSceneContext, removeFromScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

const origin = { x: 0, y: 0, z: 0 } as never;

describe("n08 cameras", () => {
    it("the last added camera becomes scene.camera; removing it does not fall back", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const first = createArcRotateCamera(0, 1, 10, origin);
        const second = createArcRotateCamera(0, 1, 5, origin);
        addToScene(scene, first);
        expect(scene.camera).toBe(first);
        addToScene(scene, second);
        expect(scene.camera).toBe(second);
        removeFromScene(scene, second);
        expect(scene.camera).toBeNull();
    });

    it("removing a camera that is not active leaves scene.camera alone", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const first = createArcRotateCamera(0, 1, 10, origin);
        const second = createArcRotateCamera(0, 1, 5, origin);
        addToScene(scene, first);
        addToScene(scene, second);
        removeFromScene(scene, first);
        expect(scene.camera).toBe(second);
    });
});
