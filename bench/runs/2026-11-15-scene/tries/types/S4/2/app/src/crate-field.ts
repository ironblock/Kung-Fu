import {
    addToScene,
    createBox,
    enableThinInstanceWorldBounds,
    setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draws one 1-unit crate (cube) centred on each point, as a single thin-instanced mesh
 * (one instance per crate, in the order given, unrotated), and adds it to the scene.
 *
 * The instance bounds are enabled so the sun's shadow fit covers every crate, however
 * far apart they are; without them the shadow fit only sees the single prototype cube.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const count = centres.length;

    // One column-major 4x4 per crate: identity rotation/scale, translation in elements 12..14.
    // Always allocate at least one slot so the buffer is never empty; `count` controls how many draw.
    const matrices = new Float32Array(Math.max(count, 1) * 16);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o + 0] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
    }

    // Unit cube: size 1, so it spans -0.5..0.5 around the origin of each instance.
    const mesh = createBox(engine, { size: 1 });
    mesh.name = "crate-field";

    setThinInstances(mesh, matrices, count);
    // Must follow setThinInstances and precede addToScene: the shadow fit reads these bounds.
    enableThinInstanceWorldBounds(mesh);

    addToScene(scene, mesh);
    return mesh;
}
