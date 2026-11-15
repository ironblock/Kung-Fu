import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const crates = createBox(engine, 1);
    const matrices = new Float32Array(centres.length * 16);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    centres.forEach(([x, y, z], i) => {
        matrices.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1], i * 16);
        for (const [axis, c] of [x, y, z].entries()) {
            min[axis] = Math.min(min[axis]!, c - 0.5);
            max[axis] = Math.max(max[axis]!, c + 0.5);
        }
    });
    setThinInstances(crates, matrices, centres.length);
    // The single-map shadow fit reads only the mesh's own box through its world matrix, not the instances.
    // Publish the union of all placements as that box (the mesh itself stays at the origin).
    if (centres.length > 0) {
        crates.boundMin = min;
        crates.boundMax = max;
    }
    addToScene(scene, crates);
    return crates;
}
