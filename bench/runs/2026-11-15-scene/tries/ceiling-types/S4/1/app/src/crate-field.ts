import { addToScene, createBox, enableThinInstanceWorldBounds, setThinInstances } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draw one unit crate centred on each point as a single thin-instanced mesh
 * (one unrotated instance per crate, in the order given), add it to the scene and return it.
 *
 * `material` is optional so the three-argument call still works: `createBox` leaves the
 * material unset, and the library expects it to be assigned before the mesh is added to a scene.
 */
export function createCrateField(
    engine: EngineContext,
    scene: SceneContext,
    centres: [number, number, number][],
    material?: Mesh["material"],
): Mesh {
    const mesh = createBox(engine, 1);

    // The directional shadow fit reads this object-local box through
    // worldMatrix × instanceMatrix and skips meshes that have none. It must stay the
    // single crate's box: widening it to the whole yard would be shifted again by every
    // instance translation and could leave crates outside the fit.
    mesh.boundMin ??= [-0.5, -0.5, -0.5];
    mesh.boundMax ??= [0.5, 0.5, 0.5];

    // One column-major translation matrix per crate.
    const count = centres.length;
    const matrices = new Float32Array(count * 16);
    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * 16;
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;
        matrices[o + 15] = 1;
    }
    setThinInstances(mesh, matrices, count);

    // Opt this hand-built thin-instance mesh into exact world bounds (the union of every
    // instance's box), so the sun's shadow map, fitted to its casters' world bounds,
    // covers every crate rather than just a prototype box at the origin.
    enableThinInstanceWorldBounds(mesh);

    if (material) mesh.material = material;
    addToScene(scene, mesh);
    return mesh;
}
