import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

// Another right answer: move the mesh to the middle of the yard, place the instances relative to it, and give
// the mesh a box, in its own frame, that holds every crate.
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const mesh = createBox(engine, { size: 1 });
    const n = centres.length;
    const mid = [0, 1, 2].map((a) => (n ? centres.reduce((s, c) => s + c[a]!, 0) / n : 0)) as [number, number, number];
    mesh.position.set(mid[0], mid[1], mid[2]);
    const m = new Float32Array(16 * n);
    let reach = [0.5, 0.5, 0.5];
    for (let i = 0; i < n; i++) {
        const local = [centres[i]![0] - mid[0], centres[i]![1] - mid[1], centres[i]![2] - mid[2]];
        m.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, local[0]!, local[1]!, local[2]!, 1], i * 16);
        reach = reach.map((r, a) => Math.max(r, Math.abs(local[a]!) + 0.5));
    }
    setThinInstances(mesh, m, n);
    mesh.boundMin = [-reach[0]!, -reach[1]!, -reach[2]!];
    mesh.boundMax = [reach[0]!, reach[1]!, reach[2]!];
    addToScene(scene, mesh);
    return mesh;
}
