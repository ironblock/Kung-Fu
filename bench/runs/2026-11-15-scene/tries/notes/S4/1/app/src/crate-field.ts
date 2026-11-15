import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";

const CRATE_SIZE = 1;
const HALF_SIZE = CRATE_SIZE / 2;

/**
 * Draws one unit cube centred on each point in `centres`, as a single mesh
 * using thin instances (one per crate, in the given order, unrotated), adds it
 * to the scene and returns it.
 *
 * The mesh's bounds are widened to cover every crate, because the shadow-map
 * fit only uses boundMin/boundMax under the prototype's world matrix and does
 * not look at thin-instance matrices.
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  if (centres.length === 0) {
    throw new Error("createCrateField: centres must contain at least one point");
  }

  const mesh = createBox(engine, { size: CRATE_SIZE });
  mesh.name = "crateField";

  const count = centres.length;
  const matrices = new Float32Array(count * 16);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < count; i++) {
    const [x, y, z] = centres[i];
    const o = i * 16;

    // Column-major unrotated, unscaled matrix with translation (x, y, z).
    matrices[o + 0] = 1;
    matrices[o + 5] = 1;
    matrices[o + 10] = 1;
    matrices[o + 15] = 1;
    matrices[o + 12] = x;
    matrices[o + 13] = y;
    matrices[o + 14] = z;

    const c = [x, y, z];
    for (let axis = 0; axis < 3; axis++) {
      if (c[axis] < min[axis]) min[axis] = c[axis];
      if (c[axis] > max[axis]) max[axis] = c[axis];
    }
  }

  // Local bounds of the prototype (its world matrix is identity), covering all instances.
  mesh.boundMin = [min[0] - HALF_SIZE, min[1] - HALF_SIZE, min[2] - HALF_SIZE];
  mesh.boundMax = [max[0] + HALF_SIZE, max[1] + HALF_SIZE, max[2] + HALF_SIZE];

  setThinInstances(mesh, matrices, count);
  addToScene(scene, mesh);
  return mesh;
}
