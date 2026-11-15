import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import {
    addToScene,
    createBox,
    createStandardMaterial,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";

/**
 * Draws one 1x1x1 crate centred on each point, as a single box mesh with one
 * unrotated thin instance per crate (in the order given), adds it to the scene
 * and returns it.
 *
 * The returned mesh can be handed to a directional light's shadow generator as
 * a caster: its world bounds cover every instance, so the shadow map is fitted
 * around all the crates rather than just the base box at the origin.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const crates = createBox(engine, 1);
    crates.name = "crate-field";
    // Factories leave material null, and a mesh with no material is never drawn.
    crates.material = createStandardMaterial();

    const count = centres.length;
    // One column-major 4x4 per 16 floats: identity rotation/scale, translation in 12..14.
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }
    setThinInstances(crates, matrices, count);

    // By default a mesh's bounds are those of its own geometry (the unit box at the
    // origin), and the PCF directional shadow map is fitted to the casters' bounds.
    // Make the bounds include every thin instance so that every crate is inside the map.
    enableThinInstanceWorldBounds(crates);

    // Instances and material are set before the mesh is added, so they are part of its first build.
    addToScene(scene, crates);
    return crates;
}
