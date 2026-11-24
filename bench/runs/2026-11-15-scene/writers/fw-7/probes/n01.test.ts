import { attachDevice } from "./scene-helpers";
import type { FakeBuffer } from "./scene-helpers";
import {
    addToScene,
    cloneTransformNode,
    createBox,
    createNullEngine,
    createSceneContext,
    removeFromScene,
    setMeshVisible,
    waitForGpuResourceRetirements,
} from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n01: removing a mesh from its last scene retires it once the queued GPU teardown runs", () => {
    const engine = createNullEngine();
    attachDevice(engine);
    const scene = () => createSceneContext(engine, { defaultRenderTask: false });

    it("after the teardown has run, addToScene throws (same scene or another)", async () => {
        const s = scene();
        const box = createBox(engine);
        addToScene(s, box);
        removeFromScene(s, box);
        await waitForGpuResourceRetirements(engine);
        expect(() => addToScene(s, box)).toThrow(/disposed/);
        expect(() => addToScene(scene(), box)).toThrow(/disposed/);
    });

    it("after the teardown has run, cloneTransformNode throws", async () => {
        const s = scene();
        const box = createBox(engine);
        addToScene(s, box);
        removeFromScene(s, box);
        await waitForGpuResourceRetirements(engine);
        expect(() => cloneTransformNode(box)).toThrow(/disposed/);
    });

    it("re-adding before the teardown runs is accepted, then the teardown still destroys its buffers", async () => {
        const s = scene();
        const box = createBox(engine);
        addToScene(s, box);
        removeFromScene(s, box);
        expect(() => addToScene(s, box)).not.toThrow();
        await waitForGpuResourceRetirements(engine);
        expect(s.meshes).toContain(box);
        expect(box._disposed).toBe(true);
        expect((box._gpu.positionBuffer as unknown as FakeBuffer).destroyed).toBe(true);
    });

    it("a mesh still held by another scene stays usable", async () => {
        const a = scene();
        const b = scene();
        const box = createBox(engine);
        addToScene(a, box);
        addToScene(b, box);
        removeFromScene(a, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBeFalsy();
        expect(() => addToScene(a, box)).not.toThrow();
    });

    it("setMeshVisible(false) hides without retiring", async () => {
        const s = scene();
        const box = createBox(engine);
        addToScene(s, box);
        setMeshVisible(box, false);
        await waitForGpuResourceRetirements(engine);
        expect(box.visible).toBe(false);
        expect(box._disposed).toBeFalsy();
        setMeshVisible(box, true);
        expect(box.visible).toBe(true);
        expect(s.meshes).toContain(box);
    });

    it("a re-add before the teardown keeps its buffers when a cloneTransformNode copy still shares them, but stays disposed", async () => {
        const s = scene();
        const box = createBox(engine);
        addToScene(s, box);
        const copy = cloneTransformNode(box);
        removeFromScene(s, box);
        addToScene(s, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBe(true);
        expect((box._gpu.positionBuffer as unknown as FakeBuffer).destroyed).toBe(false);
        expect(copy).toBeDefined();
        expect(() => addToScene(scene(), box)).toThrow(/disposed/);
    });
});
