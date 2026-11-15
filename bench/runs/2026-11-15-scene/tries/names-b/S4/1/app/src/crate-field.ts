import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draws one 1-unit cube centred on each point in `centres`, as a single mesh
 * using thin instances (one instance per crate, in the given order, unrotated).
 *
 * The mesh's world bounds are expanded to cover every instance, so shadow
 * casting (e.g. the sun's single PCF shadow map) fits all crates regardless of
 * how far apart they are.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const mesh = createBox(engine, { size: 1 });

    // Column-major 4x4 translation matrices, identity rotation and scale.
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
    // Make the mesh's bounds cover all instances, not just the unit cube.
    enableThinInstanceWorldBounds(mesh);

    addToScene(scene, mesh);
    return mesh;
}
