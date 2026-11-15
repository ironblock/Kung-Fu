import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

const CRATE_HALF_SIZE = 0.5; // crates are 1 unit cubes

/**
 * Creates one unit cube per centre point as a single thin-instanced mesh,
 * adds it to the scene and returns it.
 *
 * The mesh's bounds are set to cover every crate, so a shadow caster fit
 * (e.g. the PCF directional shadow map) includes all of them regardless of
 * how far apart the centres are.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;
    const mesh = createBox(engine, { size: 1 });

    if (count > 0) {
        // One column-major 4x4 matrix per crate: identity rotation/scale, translation = centre.
        const matrices = new Float32Array(count * 16);
        const min: [number, number, number] = [Infinity, Infinity, Infinity];
        const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

        for (let i = 0; i < count; i++) {
            const c = centres[i];
            const o = i * 16;
            matrices[o + 0] = 1;
            matrices[o + 5] = 1;
            matrices[o + 10] = 1;
            matrices[o + 15] = 1;
            matrices[o + 12] = c[0];
            matrices[o + 13] = c[1];
            matrices[o + 14] = c[2];

            for (let k = 0; k < 3; k++) {
                min[k] = Math.min(min[k], c[k] - CRATE_HALF_SIZE);
                max[k] = Math.max(max[k], c[k] + CRATE_HALF_SIZE);
            }
        }

        setThinInstances(mesh, matrices, count);
        mesh.boundMin = min;
        mesh.boundMax = max;
        enableThinInstanceWorldBounds(mesh);
    }

    addToScene(scene, mesh);
    return mesh;
}
