// r09: frame a thin-instanced field with createDefaultCamera.
import { makeGpuScene } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createDefaultCamera, createStandardMaterial, enableThinInstanceWorldBounds, setThinInstances } from "@babylonjs/lite";

const T = (x: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];

function field(flag: boolean) {
    const { engine, scene } = makeGpuScene();
    const box = createBox(engine, 1);
    box.material = createStandardMaterial();
    setThinInstances(box, new Float32Array([...T(100), ...T(110)]), 2);
    if (flag) enableThinInstanceWorldBounds(box);
    addToScene(scene, box);
    const cam = createDefaultCamera(scene);
    return { scene, cam };
}

describe("r09 framing thin instances", () => {
    it("with enableThinInstanceWorldBounds the camera targets the instances and scene.camera is set", () => {
        const { scene, cam } = field(true);
        expect(scene.camera).toBe(cam);
        expect(cam.target.x).toBeCloseTo(105);
        expect(cam.radius).toBeCloseTo(Math.hypot(11, 1, 1) * 1.5);
    });

    it("without it the camera frames only the prototype box at the origin", () => {
        const { cam } = field(false);
        expect(cam.target.x).toBeCloseTo(0);
        expect(cam.radius).toBeCloseTo(Math.hypot(1, 1, 1) * 1.5);
    });

    it("the call frames what is in scene.meshes at that moment; meshes added later are not framed", () => {
        const { engine, scene } = makeGpuScene();
        const cam = createDefaultCamera(scene);
        expect(cam.radius).toBe(1);
        const box = createBox(engine, 4);
        box.material = createStandardMaterial();
        addToScene(scene, box);
        expect(cam.radius).toBe(1);
    });
});
