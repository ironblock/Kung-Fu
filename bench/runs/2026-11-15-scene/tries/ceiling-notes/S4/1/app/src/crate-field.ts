import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";

const FLOATS_PER_MATRIX = 16;

/**
 * Draws one unit crate centred on each of `centres` as a single thin-instanced
 * box mesh (one unrotated, unscaled instance per crate, in the given order),
 * adds the mesh to `scene` and returns it.
 *
 * The directional shadow fit (computeDirectionalLightMatrix) only looks at a
 * caster's local boundMin/boundMax under its worldMatrix and ignores
 * thin-instance matrices, so the mesh's local bounds are widened here to
 * enclose every crate. That way the PCF shadow map's X/Y extent covers all of
 * them, wherever they are, once the mesh is passed in as a shadow caster.
 */
export function createCrateField(engine: EngineContext, scene: SceneContext, centres: [number, number, number][]): Mesh {
    const mesh = createBox(engine, { size: 1 });

    // Local bounds of a single crate as the box factory reports them (a unit
    // cube is ±0.5 on each axis); fall back to that if none were set.
    const crateMin = mesh.boundMin ?? [-0.5, -0.5, -0.5];
    const crateMax = mesh.boundMax ?? [0.5, 0.5, 0.5];

    const count = centres.length;
    const matrices = new Float32Array(count * FLOATS_PER_MATRIX);

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < count; i++) {
        const [x, y, z] = centres[i];
        const o = i * FLOATS_PER_MATRIX;

        // Identity rotation/scale, translation in elements 12..14.
        matrices[o] = 1;
        matrices[o + 5] = 1;
        matrices[o + 10] = 1;
        matrices[o + 15] = 1;
        matrices[o + 12] = x;
        matrices[o + 13] = y;
        matrices[o + 14] = z;

        // Read the translation back so the bounds match the float32 values
        // that are actually drawn, even for very distant crates.
        const tx = matrices[o + 12];
        const ty = matrices[o + 13];
        const tz = matrices[o + 14];
        if (tx < minX) minX = tx;
        if (ty < minY) minY = ty;
        if (tz < minZ) minZ = tz;
        if (tx > maxX) maxX = tx;
        if (ty > maxY) maxY = ty;
        if (tz > maxZ) maxZ = tz;
    }

    setThinInstances(mesh, matrices, count);

    if (minX <= maxX && minY <= maxY && minZ <= maxZ) {
        mesh.boundMin = [minX + crateMin[0], minY + crateMin[1], minZ + crateMin[2]];
        mesh.boundMax = [maxX + crateMax[0], maxY + crateMax[1], maxZ + crateMax[2]];
    }

    addToScene(scene, mesh);
    return mesh;
}
