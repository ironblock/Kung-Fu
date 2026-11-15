import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, enableThinInstanceWorldBounds, setThinInstances } from "@babylonjs/lite";

/**
 * Builds one mesh holding a 1-unit crate (a cube centred on its origin) per entry in `centres`,
 * using thin instances: one instance per crate, in the given order, unrotated and unscaled.
 *
 * Each instance is a pure translation, so the per-instance world bounds span every crate. Exact
 * per-instance bounds are enabled so that a shadow caster fit (e.g. a directional PCF generator)
 * covers the whole field, however far apart the crates are.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const crate = createBox(engine, { size: 1 });

    const count = centres.length;
    // Column-major 4x4 per instance (16 floats): identity rotation/scale, translation in elements 12..14.
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
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

    setThinInstances(crate, matrices, count);
    enableThinInstanceWorldBounds(crate);
    addToScene(scene, crate);
    return crate;
}
