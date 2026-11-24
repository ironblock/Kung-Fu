import {
  addToScene,
  createBox,
  enableThinInstanceWorldBounds,
  setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Builds one mesh holding a unit cube (1 unit on a side) per centre point,
 * drawn as thin instances in the order given, unrotated.
 *
 * Thin-instance world bounds are enabled so that the mesh's bounds (which
 * directional PCF shadow maps use to size their coverage) include every crate,
 * not just the single cube at the origin.
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const crate = createBox(engine, { size: 1 });

  // One 4x4 matrix per crate: identity rotation/scale, translation to the centre.
  // Translation lives in elements 12, 13, 14 (column-major, as Babylon uses).
  const matrices = new Float32Array(centres.length * 16);
  for (let i = 0; i < centres.length; i++) {
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

  setThinInstances(crate, matrices, centres.length);
  enableThinInstanceWorldBounds(crate);
  addToScene(scene, crate);
  return crate;
}
