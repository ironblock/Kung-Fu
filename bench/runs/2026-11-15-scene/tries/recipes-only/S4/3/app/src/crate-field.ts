import {
    addToScene,
    createBox,
    createStandardMaterial,
    createTranslationMat4,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

// One unit cube per centre, drawn as a single mesh with one thin instance per crate.
// Instances are in the order given and unrotated.
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
): Mesh {
    const crate = createBox(engine, 1);
    crate.material = createStandardMaterial();

    const matrices = new Float32Array(centres.length * 16);
    centres.forEach(([x, y, z], i) => {
        matrices.set(createTranslationMat4(x, y, z), i * 16);
    });
    setThinInstances(crate, matrices, centres.length);

    addToScene(scene, crate);
    return crate;
}
