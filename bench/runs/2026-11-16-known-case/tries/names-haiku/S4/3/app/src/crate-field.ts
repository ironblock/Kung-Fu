import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene } from "@babylonjs/lite";
import { createBox } from "@babylonjs/lite";
import { setThinInstances } from "@babylonjs/lite";
import { enableThinInstanceWorldBounds } from "@babylonjs/lite";

/**
 * Creates one mesh holding a 1-unit cube per centre point, using thin
 * instances (one per crate, in the given order, unrotated), and adds it to
 * the scene.
 *
 * Thin-instance world bounds are enabled so the shadow fitting sees every
 * crate, not just the base cube, and the whole field stays inside the
 * single directional shadow map.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const mesh = createBox(engine, { size: 1 });
    mesh.name = "crateField";

    // Column-major 4x4 matrices: identity rotation/scale, translation in
    // elements 12, 13, 14.
    const matrices = new Float32Array(centres.length * 16);
    for (let i = 0; i < centres.length; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }

    setThinInstances(mesh, matrices, centres.length);
    enableThinInstanceWorldBounds(mesh);
    addToScene(scene, mesh);

    return mesh;
}
