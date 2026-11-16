import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    // Unit cube (1 unit on each side) shared by every crate.
    const mesh = createBox(engine, { size: 1 });

    // One unrotated, unscaled instance per crate, translated to its centre.
    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = centres[i][0];
        matrices[o + 13] = centres[i][1];
        matrices[o + 14] = centres[i][2];
    }
    setThinInstances(mesh, matrices, count);

    // The mesh's own bounds cover only the base cube, so without this the
    // directional shadow fit would ignore crates far from the origin.
    enableThinInstanceWorldBounds(mesh);

    addToScene(scene, mesh);
    return mesh;
}
