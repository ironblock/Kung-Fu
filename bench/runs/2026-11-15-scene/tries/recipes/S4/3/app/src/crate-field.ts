import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

// Each crate is a cube of side 1, so it extends 0.5 either side of its centre.
const HALF_SIDE = 0.5;

/**
 * Draws one unit cube per centre as a single mesh with thin instances
 * (one instance per centre, in the given order, unrotated), adds it to the
 * scene and returns it.
 *
 * The mesh's bounds are set to cover every crate, and thin-instance world
 * bounds are enabled, so a shadow caster fit to the mesh's bounds covers all
 * of the crates, not only the base cube at the origin.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;

        // Column-major 4x4: identity rotation/scale, translation in elements 12..14.
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;

        const c = [x, y, z];
        for (let a = 0; a < 3; a++) {
            min[a] = Math.min(min[a], c[a] - HALF_SIDE);
            max[a] = Math.max(max[a], c[a] + HALF_SIDE);
        }
    }

    const crate = createBox(engine, 1);
    setThinInstances(crate, matrices, count);
    enableThinInstanceWorldBounds(crate);

    if (count > 0) {
        crate.boundMin = min;
        crate.boundMax = max;
    }

    addToScene(scene, crate);
    return crate;
}
