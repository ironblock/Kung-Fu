import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBoxData, createMeshFromData, setThinInstances } from "@babylonjs/lite";

const HALF_CRATE = 0.5; // crates are cubes 1 unit on a side, centred on each point

/**
 * Draws one 1-unit crate centred on each point, as a single mesh with one
 * unrotated thin instance per crate (in the order given), and adds it to the scene.
 *
 * The mesh's local bounds are widened to cover every instance. The shadow fit
 * (computeDirectionalLightMatrix) uses only boundMin/boundMax under the mesh's
 * world matrix and ignores thin-instance matrices, so without this the crates
 * far from the prototype would fall outside the shadow map.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const box = createBoxData({ size: 1 });
    const mesh = createMeshFromData(
        engine,
        "crateField",
        box.positions,
        box.normals,
        box.indices,
        box.uvs,
    );

    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        // Column-major identity with translation in elements 12..14 (no rotation or scale).
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        matrices[o + 15] = 1;

        min[0] = Math.min(min[0], x);
        min[1] = Math.min(min[1], y);
        min[2] = Math.min(min[2], z);
        max[0] = Math.max(max[0], x);
        max[1] = Math.max(max[1], y);
        max[2] = Math.max(max[2], z);
    }

    setThinInstances(mesh, matrices, count);

    if (count > 0) {
        mesh.boundMin = [min[0] - HALF_CRATE, min[1] - HALF_CRATE, min[2] - HALF_CRATE];
        mesh.boundMax = [max[0] + HALF_CRATE, max[1] + HALF_CRATE, max[2] + HALF_CRATE];
    }

    addToScene(scene, mesh);
    return mesh;
}
