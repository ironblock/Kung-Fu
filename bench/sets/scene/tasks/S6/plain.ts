import { addToScene, createMeshFromData } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

type V = [number, number, number];

export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
    const w = width / 2;
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    // Counter-clockwise seen from outside, so front faces face out.
    const face = (corners: V[], normal: V): void => {
        const base = positions.length / 3;
        for (const c of corners) {
            positions.push(...c);
            normals.push(...normal);
        }
        for (let i = 1; i + 1 < corners.length; i++) {
            indices.push(base, base + i, base + i + 1);
        }
    };
    const slope = Math.hypot(length, height);
    face([[-w, 0, 0], [w, 0, 0], [w, 0, length], [-w, 0, length]], [0, -1, 0]);
    face([[-w, 0, length], [w, 0, length], [w, height, length], [-w, height, length]], [0, 0, 1]);
    face([[-w, 0, 0], [-w, height, length], [w, height, length], [w, 0, 0]], [0, length / slope, -height / slope]);
    face([[-w, 0, 0], [-w, 0, length], [-w, height, length]], [-1, 0, 0]);
    face([[w, 0, 0], [w, height, length], [w, 0, length]], [1, 0, 0]);
    const mesh = createMeshFromData(engine, "ramp", new Float32Array(positions), new Float32Array(normals), new Uint32Array(indices));
    addToScene(scene, mesh);
    return mesh;
}
