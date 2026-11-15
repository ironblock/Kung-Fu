import { addToScene, createBox, enableThinInstanceWorldBounds, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

const FLOATS_PER_MATRIX = 16;

/**
 * Draws one 1x1x1 crate centred on each point in `centres`, all as a single mesh
 * with one thin instance per crate (instance i is centres[i], unrotated), adds the
 * mesh to the scene and returns it.
 *
 * `material` is optional and is applied before the mesh is added to the scene.
 * createBox leaves the material null, and a mesh added without a material gets no
 * renderable, so a caller that wants the crates drawn should pass one here.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
    material?: Mesh["material"],
): Mesh {
    const mesh = createBox(engine, { size: 1 });
    mesh.name = "crates";
    if (material) {
        mesh.material = material;
    }

    // One translation matrix per crate: identity rotation and scale, translation in
    // elements 12..14. setThinInstances keeps this array without copying it, and
    // nothing writes to it after this call.
    const count = centres.length;
    const matrices = new Float32Array(count * FLOATS_PER_MATRIX);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * FLOATS_PER_MATRIX;
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }
    setThinInstances(mesh, matrices, count);

    // A directional PCF shadow map covers only the box around its casters' bounds
    // (plus 10% padding). This mesh's own bounds are those of a single unit box at its
    // origin. Making its world bounds include every thin instance means the map
    // stretches to cover all the crates, however far apart they are.
    enableThinInstanceWorldBounds(mesh);

    addToScene(scene, mesh);
    return mesh;
}
