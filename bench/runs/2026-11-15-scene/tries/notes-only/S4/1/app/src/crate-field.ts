import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";

// Each crate is a cube 1 unit on a side, so it extends 0.5 either side of its centre.
const HALF_SIZE = 0.5;

/**
 * Draws one unrotated 1-unit crate centred on each point, as a single mesh
 * with one thin instance per crate (in the order given), and adds it to the scene.
 *
 * The mesh's shadow-caster bounds are widened to cover every instance. The
 * directional shadow fit reads boundMin/boundMax under the prototype's
 * worldMatrix only, not under the thin-instance matrices, so without this
 * instances far from the origin would fall outside the sun's shadow map.
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const mesh = createBox(engine);

  // Column-major 4x4 identity with the translation set to the crate centre.
  const matrices = new Float32Array(centres.length * 16);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  centres.forEach(([x, y, z], i) => {
    const o = i * 16;
    matrices[o + 0] = 1;
    matrices[o + 5] = 1;
    matrices[o + 10] = 1;
    matrices[o + 12] = x;
    matrices[o + 13] = y;
    matrices[o + 14] = z;
    matrices[o + 15] = 1;

    const c = [x, y, z];
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], c[k] - HALF_SIZE);
      max[k] = Math.max(max[k], c[k] + HALF_SIZE);
    }
  });

  setThinInstances(mesh, matrices);

  if (centres.length > 0) {
    mesh.boundMin = min;
    mesh.boundMax = max;
  } else {
    // No crates: nothing to cast, so keep the bounds at the origin rather than Infinity.
    mesh.boundMin = [0, 0, 0];
    mesh.boundMax = [0, 0, 0];
  }

  addToScene(scene, mesh);
  return mesh;
}
