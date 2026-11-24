// r06: many copies of one mesh as thin instances, edited while running.
import { makeGpuScene, drawsOfFrame, floatsOf, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addThinInstance,
    addToScene,
    createBox,
    createFreeCamera,
    createStandardMaterial,
    createTranslationMat4,
    flushThinInstances,
    registerScene,
    removeThinInstance,
    setThinInstanceColor,
    setThinInstanceColors,
    setThinInstances,
} from "@babylonjs/lite";

async function three(withColors: boolean, colorRoom = 3) {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    const matrices = new Float32Array(3 * 16);
    [1, 2, 3].forEach((x, i) => matrices.set(createTranslationMat4(x, 0, 0), i * 16));
    setThinInstances(box, matrices, 3);
    if (withColors) setThinInstanceColors(box, new Float32Array(colorRoom * 4).fill(1));
    addToScene(s.scene, box);
    await registerScene(s.scene);
    frame(s.engine, s.scene);
    const uploadedX = (n: number) => {
        const f = floatsOf(box.thinInstances!._gpuBuffer);
        return Array.from({ length: n }, (_, i) => f[i * 16 + 12]);
    };
    return { ...s, box, matrices, uploadedX };
}

describe("r06 thin instances", () => {
    it("one draw with 3 instances; an in-place edit uploads after flushThinInstances", async () => {
        const { scene, engine, log, box, matrices, uploadedX } = await three(false);
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([3]);
        expect(box.thinInstances!.matrices).toBe(matrices);
        matrices[12] = 10;
        flushThinInstances(box);
        frame(engine, scene);
        expect(uploadedX(3)).toEqual([10, 2, 3]);
    });

    it("without flushThinInstances: the in-place edit is never uploaded", async () => {
        const { scene, engine, matrices, uploadedX } = await three(false);
        matrices[12] = 10;
        frame(engine, scene);
        frame(engine, scene);
        expect(uploadedX(3)).toEqual([1, 2, 3]);
    });

    it("addThinInstance copies the matrices into a new array, and uploads an unflushed edit of m", async () => {
        const { scene, engine, box, matrices, uploadedX } = await three(false);
        matrices[12] = 10;
        addThinInstance(box, createTranslationMat4(4, 0, 0));
        frame(engine, scene);
        expect(uploadedX(4)).toEqual([10, 2, 3, 4]);
        expect(box.thinInstances!.matrices).not.toBe(matrices);
        matrices[16 + 12] = 20; // m is no longer the mesh's array
        flushThinInstances(box);
        frame(engine, scene);
        expect(uploadedX(4)).toEqual([10, 2, 3, 4]);
        box.thinInstances!.matrices[16 + 12] = 20;
        flushThinInstances(box);
        frame(engine, scene);
        expect(uploadedX(4)).toEqual([10, 20, 3, 4]);
    });

    it("removeThinInstance keeps m and also uploads an unflushed edit", async () => {
        const { scene, engine, box, matrices, uploadedX } = await three(false);
        matrices[16 + 12] = 20;
        removeThinInstance(box, 0);
        frame(engine, scene);
        expect(box.thinInstances!.matrices).toBe(matrices);
        expect(uploadedX(2)).toEqual([3, 20]);
    });

    it("removeThinInstance(0) moves the last instance into slot 0", async () => {
        const { scene, engine, log, box, uploadedX } = await three(false);
        removeThinInstance(box, 0);
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([2]);
        expect(uploadedX(2)).toEqual([3, 2]);
    });

    it("without setThinInstanceColors first: setThinInstanceColor throws", async () => {
        const { box } = await three(false);
        expect(() => setThinInstanceColor(box, 0, 1, 0, 0, 1)).toThrow(TypeError);
    });

    it("a colour array with room for 4: the 4th instance added later takes its colour", async () => {
        const { scene, engine, log, box } = await three(true, 4);
        addThinInstance(box, createTranslationMat4(4, 0, 0));
        setThinInstanceColor(box, 3, 1, 0, 0, 1);
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([4]);
        expect(Array.from(box.thinInstances!.colors!.slice(12, 16))).toEqual([1, 0, 0, 1]);
    });

    it("with a colour array sized for 3: a 4th instance added later gets no colour slot, silently", async () => {
        const { scene, engine, log, box } = await three(true);
        addThinInstance(box, createTranslationMat4(4, 0, 0));
        setThinInstanceColor(box, 3, 1, 0, 0, 1);
        expect(drawsOfFrame(engine, scene, log).map((d) => d.instances)).toEqual([4]);
        expect(box.thinInstances!.colors!.length).toBe(12);
        expect(box.thinInstances!.colors![12]).toBeUndefined();
    });
});
