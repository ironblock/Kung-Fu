import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

// Another right answer: triangles listed one by one, wound so that (b-a)x(c-a) points into the solid,
// the way the library's own box is, with each normal taken as the opposite of that cross product.
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const w = width / 2;
    const A = [-w, 0, 0], B = [w, 0, 0], C = [w, 0, length], D = [-w, 0, length], E = [w, height, length], F = [-w, height, length];
    const tris = [
        [A, C, B], [A, D, C],
        [D, E, C], [D, F, E],
        [A, B, E], [A, E, F],
        [A, F, D],
        [B, C, E],
    ];
    const pos: number[] = [];
    const nrm: number[] = [];
    for (const [a, b, c] of tris) {
        const u = [b![0]! - a![0]!, b![1]! - a![1]!, b![2]! - a![2]!];
        const v = [c![0]! - a![0]!, c![1]! - a![1]!, c![2]! - a![2]!];
        const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
        const l = Math.hypot(n[0]!, n[1]!, n[2]!);
        for (const p of [a, b, c]) {
            pos.push(...p!);
            nrm.push(-n[0]! / l, -n[1]! / l, -n[2]! / l);
        }
    }
    const idx = Uint32Array.from({ length: pos.length / 3 }, (_, i) => i);
    const mesh = createMeshFromData(engine, "ramp", new Float32Array(pos), new Float32Array(nrm), idx);
    addToScene(scene, mesh);
    return mesh;
}
