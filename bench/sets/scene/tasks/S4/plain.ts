import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const crates = createBox(engine, 1);
    const matrices = new Float32Array(centres.length * 16);
    centres.forEach(([x, y, z], i) => {
        matrices.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1], i * 16);
    });
    setThinInstances(crates, matrices, centres.length);
    addToScene(scene, crates);
    return crates;
}
