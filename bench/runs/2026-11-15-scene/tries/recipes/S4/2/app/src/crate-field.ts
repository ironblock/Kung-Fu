import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";

const CRATE_HALF = 0.5; // crates are 1 unit cubes centred on each point

/**
 * Creates one unit cube per centre point, drawn as a single thin-instanced mesh,
 * adds it to the scene and returns it.
 *
 * The mesh's local bounds are set to enclose every instance. The directional
 * shadow map is fitted to a caster's boundMin/boundMax (through its world matrix
 * only), so without this the crates outside the single-prototype bounds would
 * fall outside the shadow map and would not cast shadows.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const count = centres.length;
    const matrices = new Float32Array(16 * count);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = 16 * i;
        // Column-major identity rotation/scale with translation in [12..14].
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;

        const c = [x, y, z];
        for (let a = 0; a < 3; a++) {
            if (c[a] < min[a]) min[a] = c[a];
            if (c[a] > max[a]) max[a] = c[a];
        }
    }

    const mesh = createBox(engine, { size: 1 });
    setThinInstances(mesh, matrices, count);

    if (count > 0) {
        mesh.boundMin = [min[0] - CRATE_HALF, min[1] - CRATE_HALF, min[2] - CRATE_HALF];
        mesh.boundMax = [max[0] + CRATE_HALF, max[1] + CRATE_HALF, max[2] + CRATE_HALF];
    }

    addToScene(scene, mesh);
    return mesh;
}
