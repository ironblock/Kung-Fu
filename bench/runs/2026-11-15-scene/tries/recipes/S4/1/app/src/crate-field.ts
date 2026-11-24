import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    createStandardMaterial,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

/**
 * Draws one 1-unit cube centred on each point in `centres`, as a single mesh
 * using thin instances (one instance per crate, in the given order, unrotated).
 *
 * Thin-instance world bounds are enabled so that the instances are included in
 * the bounds a directional shadow map is fitted to; without this the shadow
 * map would only cover the base cube at the origin.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;

    // One column-major 4x4 per crate: identity rotation/scale, translation in
    // elements 12..14.
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const o = i * 16;
        const [x, y, z] = centres[i];
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }

    const crate = createBox(engine, 1);
    crate.material = createStandardMaterial();
    setThinInstances(crate, matrices, count);
    enableThinInstanceWorldBounds(crate);
    addToScene(scene, crate);

    return crate;
}
