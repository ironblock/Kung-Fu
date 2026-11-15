import { addToScene, createBox, createStandardMaterial, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/** Half the edge length of a crate (crates are unit cubes). */
const HALF = 0.5;

/**
 * Draws one unit crate centred on each point, as a single thin-instanced mesh
 * (instance i is centres[i], unrotated), adds it to the scene and returns it.
 *
 * The mesh's local bounds are widened to enclose every crate, because a
 * directional shadow map is fitted to a caster's boundMin/boundMax (through its
 * world matrix) only, not to its thin instances.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const n = centres.length;

    const crates = createBox(engine, { size: 1 });
    crates.name = "crateField";
    // Shape factories assign no material, and a mesh without one is never drawn.
    crates.material = createStandardMaterial();

    // One matrix per crate: column-major identity with the centre in [12..14].
    const matrices = new Float32Array(16 * n);
    for (let i = 0; i < n; i++) {
        const o = 16 * i;
        const [x, y, z] = centres[i];
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }
    // Set before the mesh joins the scene, so no markMeshRenderableDirty is needed.
    setThinInstances(crates, matrices, n);

    if (n > 0) {
        // Bounds from the float32 values actually drawn, so rounding of far-off
        // centres cannot push a crate's edge outside them.
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let o = 0; o < matrices.length; o += 16) {
            const x = matrices[o + 12], y = matrices[o + 13], z = matrices[o + 14];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
        }
        crates.boundMin = [minX - HALF, minY - HALF, minZ - HALF];
        crates.boundMax = [maxX + HALF, maxY + HALF, maxZ + HALF];
    }

    addToScene(scene, crates);
    return crates;
}
