// n29: mirrored (negative-determinant) procedural meshes get reversed winding only after enableMirroredMeshes;
// the first call installs it for every scene; a glTF-authored mesh (sign -1) is judged against its own sign.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createSceneContext, enableMirroredMeshes } from "@babylonjs/lite";
import { _computeMeshFeatures } from "../../babylon-lite/packages/babylon-lite/src/material/mesh-features";
import { describe, expect, it } from "vitest";

const MIRRORED_BIT = 1 << 11;

describe("n29 negative scaling", () => {
    it("without enableMirroredMeshes a mesh with scaling.x = -1 is not marked mirrored; after it, it is", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        box.scaling.x = -1;
        addToScene(scene, box);
        expect(_computeMeshFeatures(box) & MIRRORED_BIT).toBe(0);
        expect((box as { _primitive?: GPUPrimitiveState })._primitive).toBeUndefined();

        await enableMirroredMeshes(scene);
        expect(_computeMeshFeatures(box) & MIRRORED_BIT).toBe(MIRRORED_BIT);
        expect((box as { _primitive?: GPUPrimitiveState })._primitive?.frontFace).toBe("cw");

        const plain = createBox(engine);
        expect(_computeMeshFeatures(plain) & MIRRORED_BIT).toBe(0);
    });

    it("enabling it for scene A also marks a mirrored mesh of scene B; a mesh authored with sign -1 and negative determinant is not marked", async () => {
        const { engine } = makeGpuEngine();
        const a = createSceneContext(engine, { defaultRenderTask: false });
        const b = createSceneContext(engine, { defaultRenderTask: false });
        await enableMirroredMeshes(a);
        const inB = createBox(engine);
        inB.scaling.x = -1;
        addToScene(b, inB);
        expect(_computeMeshFeatures(inB) & MIRRORED_BIT).toBe(MIRRORED_BIT);
        expect((inB as { _primitive?: GPUPrimitiveState })._primitive?.frontFace).toBe("cw");
        const gltfLike = createBox(engine);
        (gltfLike as { _authoredSign?: number })._authoredSign = -1;
        gltfLike.scaling.x = -1;
        expect(_computeMeshFeatures(gltfLike) & MIRRORED_BIT).toBe(0);
    });
});
