import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

/** Half the edge length of a crate (crates are 1 unit cubes). */
const CRATE_HALF_SIZE = 0.5;

/**
 * Creates one 1-unit crate centred on each point in `centres`, drawn as a single
 * thin-instanced mesh (one instance per crate, in the given order, unrotated),
 * and adds it to the scene.
 *
 * The mesh's bounds are set to cover every crate, so that a directional shadow
 * map fitted to the casters includes all of them, however far apart they are.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;

    // Column-major 4x4 translation-only matrices, one per crate (scale 1, no rotation).
    const matrices = new Float32Array(count * 16);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        growBounds(min, max, x, y, z);
    }

    const mesh = createBox(engine, { size: 1 });
    setThinInstances(mesh, matrices, count);

    if (count > 0) {
        // Let the renderer account for each instance's world position when bounding casters.
        enableThinInstanceWorldBounds(mesh);

        // Also make the mesh's own bounds cover every crate, so that a single
        // directional shadow map fitted to the casters includes all of them.
        mesh.boundMin = [
            min[0] - CRATE_HALF_SIZE,
            min[1] - CRATE_HALF_SIZE,
            min[2] - CRATE_HALF_SIZE,
        ];
        mesh.boundMax = [
            max[0] + CRATE_HALF_SIZE,
            max[1] + CRATE_HALF_SIZE,
            max[2] + CRATE_HALF_SIZE,
        ];
    }

    addToScene(scene, mesh);
    return mesh;
}

function growBounds(
    min: [number, number, number],
    max: [number, number, number],
    x: number,
    y: number,
    z: number,
): void {
    if (x < min[0]) min[0] = x;
    if (y < min[1]) min[1] = y;
    if (z < min[2]) min[2] = z;
    if (x > max[0]) max[0] = x;
    if (y > max[1]) max[1] = y;
    if (z > max[2]) max[2] = z;
}
