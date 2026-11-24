import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Builds one unit cube (1 unit on each side) per centre point, drawn as a
 * single thin-instanced mesh. Instances are in the order given and unrotated.
 *
 * The mesh has per-instance world bounds enabled so that the directional
 * shadow generator sees the full extent of the field, not just the single
 * base cube, and every crate falls inside the shadow map.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const mesh = createBox(engine, { size: 1 });

    // 4x4 column-major matrix per instance: identity rotation/scale,
    // translation in elements 12..14.
    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        matrices[o + 15] = 1;
    }

    setThinInstances(mesh, matrices, count);
    enableThinInstanceWorldBounds(mesh);
    addToScene(scene, mesh);
    return mesh;
}
