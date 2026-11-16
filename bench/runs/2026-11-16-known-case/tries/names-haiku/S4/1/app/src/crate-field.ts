import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

// One unit cube per centre, drawn as thin instances of a single mesh.
// enableThinInstanceWorldBounds makes the mesh's world bounds include every
// instance, so the directional shadow generator fits its ortho frustum to all
// crates rather than only the 1-unit base cube at the origin.
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;
    const matrices = new Float32Array(count * 16);

    for (let i = 0; i < count; i++) {
        const o = i * 16;
        // Identity rotation and scale, translation in the last column (column-major).
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = centres[i][0];
        matrices[o + 13] = centres[i][1];
        matrices[o + 14] = centres[i][2];
    }

    const mesh = createBox(engine, { size: 1 });
    mesh.name = "crate-field";
    setThinInstances(mesh, matrices, count);
    enableThinInstanceWorldBounds(mesh);
    addToScene(scene, mesh);
    return mesh;
}
