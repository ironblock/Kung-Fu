// r03: take a mesh off screen for a while and bring it back.
import { makeGpuScene, drawsOfFrame, frame, settle } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createFreeCamera, createStandardMaterial, registerScene, removeFromScene, setMeshVisible } from "@babylonjs/lite";

async function twoBoxes() {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const a = createBox(s.engine, 1);
    a.name = "a";
    a.material = createStandardMaterial() as never;
    const b = createBox(s.engine, 1);
    b.name = "b";
    b.material = createStandardMaterial() as never;
    b.position.x = 3;
    addToScene(s.scene, a);
    addToScene(s.scene, b);
    await registerScene(s.scene);
    frame(s.engine, s.scene);
    return { ...s, a, b };
}

describe("r03 hide and show", () => {
    it("setMeshVisible(false) stops the draw, setMeshVisible(true) brings it back, the mesh stays in the scene", async () => {
        const { scene, engine, log, a } = await twoBoxes();
        setMeshVisible(a, false);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(1);
        expect(a.visible).toBe(false);
        expect(scene.meshes).toContain(a);
        await settle();
        setMeshVisible(a, true);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(2);
    });

    it("with removeFromScene instead: after the next frame its buffers are destroyed and addToScene throws", async () => {
        const { scene, engine, log, a } = await twoBoxes();
        removeFromScene(scene, a);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(1);
        await settle();
        expect((a._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
        expect(() => addToScene(scene, a)).toThrow(/cannot be added: it was disposed/);
    });

    it("added back before that frame: no throw, but its buffers are destroyed all the same and it is drawn from them", async () => {
        const { scene, engine, log, a } = await twoBoxes();
        const pb = a._gpu.positionBuffer as unknown as { destroyed: boolean };
        removeFromScene(scene, a);
        expect(() => addToScene(scene, a)).not.toThrow();
        frame(engine, scene);
        await settle();
        expect(pb.destroyed).toBe(true);
        const draws = drawsOfFrame(engine, scene, log);
        expect(draws).toHaveLength(2);
        expect(draws.filter((d) => d.vertexBuffers.includes(pb))).toHaveLength(1);
        removeFromScene(scene, a);
        expect(() => addToScene(scene, a)).toThrow(/cannot be added: it was disposed/);
    });

    it("in a scene never registered, added back later: no throw, but the buffers are destroyed at the first frame", async () => {
        const s = makeGpuScene();
        addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
        const a = createBox(s.engine, 1);
        a.material = createStandardMaterial() as never;
        addToScene(s.scene, a);
        const pb = a._gpu.positionBuffer as unknown as { destroyed: boolean };
        removeFromScene(s.scene, a);
        await settle();
        expect(() => addToScene(s.scene, a)).not.toThrow();
        await registerScene(s.scene);
        frame(s.engine, s.scene);
        await settle();
        expect(pb.destroyed).toBe(true);
        expect(drawsOfFrame(s.engine, s.scene, s.log).filter((d) => d.vertexBuffers.includes(pb))).toHaveLength(1);
    });
});
