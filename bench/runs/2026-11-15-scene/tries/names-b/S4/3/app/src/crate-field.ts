import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/** Each crate is a unit cube, so its half-extent is 0.5 on every axis. */
const HALF_SIZE = 0.5;

/**
 * Draws one unit cube centred on each point in `centres`, as a single mesh
 * using thin instances (one per crate, in the given order, unrotated).
 *
 * The mesh's bounds are set to the union of all crate boxes so that shadow
 * casting covers every crate, however far apart the centres are.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const mesh = createBox(engine, { size: 1 });
    const count = centres.length;

    // One 4x4 column-major matrix per crate: identity rotation/scale, translation in elements 12..14.
    const matrices = new Float32Array(count * 16);

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

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

        minX = Math.min(minX, x - HALF_SIZE);
        minY = Math.min(minY, y - HALF_SIZE);
        minZ = Math.min(minZ, z - HALF_SIZE);
        maxX = Math.max(maxX, x + HALF_SIZE);
        maxY = Math.max(maxY, y + HALF_SIZE);
        maxZ = Math.max(maxZ, z + HALF_SIZE);
    }

    if (count === 0) {
        minX = minY = minZ = maxX = maxY = maxZ = 0;
    }

    setThinInstances(mesh, matrices, count);
    enableThinInstanceWorldBounds(mesh);

    // The mesh itself sits at the origin with identity transform, so these
    // bounds are also world-space bounds covering every instance.
    mesh.boundMin = [minX, minY, minZ];
    mesh.boundMax = [maxX, maxY, maxZ];

    addToScene(scene, mesh);
    return mesh;
}
