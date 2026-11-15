import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Creates one 1-unit cube per centre point as a single thin-instanced mesh,
 * adds it to the scene and returns it.
 *
 * Thin-instance world bounds are enabled so that the directional shadow
 * generator's frustum fit includes every crate, however far apart they are.
 * Without this the caster bounds would only cover the single base cube.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const mesh = createBox(engine, { size: 1 });

    const count = centres.length;
    // One column-major 4x4 matrix per crate: identity rotation/scale, translation in elements 12..14.
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const o = i * 16;
        const [x, y, z] = centres[i];
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
