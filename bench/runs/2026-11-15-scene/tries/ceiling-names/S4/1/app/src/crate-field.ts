import { addToScene, createBox, enableThinInstanceWorldBounds, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draws one unit crate (a 1×1×1 cube) centred on each of `centres`, as a single
 * mesh with one thin instance per crate (same order, no rotation), adds the mesh
 * to `scene` and returns it.
 *
 * The mesh's world bounds are made to cover every instance, so a directional
 * shadow map that fits itself to its casters' bounds takes in all the crates,
 * not just the base cube at the origin.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const mesh = createBox(engine, { size: 1 });
    mesh.name = "crateField";

    // One 4×4 matrix per crate: identity plus a translation, which goes in
    // elements 12, 13 and 14.
    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        matrices[o + 15] = 1;
    }
    setThinInstances(mesh, matrices, count);

    // Without this, the mesh's world bounds only cover the base cube, so the
    // sun's shadow map would leave out crates away from the origin.
    enableThinInstanceWorldBounds(mesh);

    addToScene(scene, mesh);
    return mesh;
}
