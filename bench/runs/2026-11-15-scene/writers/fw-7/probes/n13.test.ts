import { attachDevice } from "./scene-helpers";
import { addToScene, createArcRotateCamera, createFreeCamera, createNullEngine, createSceneContext, removeFromScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n13: the camera added last becomes scene.camera; removing it leaves none", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("a second added camera replaces the first", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const a = createFreeCamera({ x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 0 });
        const b = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        addToScene(scene, a);
        expect(scene.camera).toBe(a);
        addToScene(scene, b);
        expect(scene.camera).toBe(b);
    });

    it("removing the active camera sets scene.camera to null, not back to the earlier one", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const a = createFreeCamera({ x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 0 });
        const b = createFreeCamera({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 0 });
        addToScene(scene, a);
        addToScene(scene, b);
        removeFromScene(scene, b);
        expect(scene.camera).toBeNull();
    });

    it("removing a camera that is not active leaves scene.camera alone", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const a = createFreeCamera({ x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 0 });
        const b = createFreeCamera({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 0 });
        addToScene(scene, a);
        addToScene(scene, b);
        removeFromScene(scene, a);
        expect(scene.camera).toBe(b);
    });
});
