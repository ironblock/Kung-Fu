import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draws one 1-unit cube crate centred on each point in `centres`, as a single
 * mesh with one thin instance per crate (in the order given, unrotated, unscaled),
 * adds it to the scene and returns it.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    // Unit cube; the factory's default size is 1.
    const crate = createBox(engine);

    // One 4x4 matrix per crate, column-major (translation in elements 12..14),
    // identity rotation and scale, translated to the crate centre.
    const matrices = new Float32Array(centres.length * 16);
    for (let i = 0; i < centres.length; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        matrices[o + 15] = 1;
    }

    setThinInstances(crate, matrices, centres.length);
    addToScene(scene, crate);
    return crate;
}
