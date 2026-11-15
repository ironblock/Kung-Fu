import {
  addToScene,
  createBox,
  createStandardMaterial,
  setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

const CRATE_HALF_SIZE = 0.5; // crates are 1 unit on a side

/**
 * Draws one unit cube centred on each given point, as a single mesh with one
 * unrotated thin instance per crate (in the order given), and adds it to the scene.
 *
 * The mesh's local bounds are set to enclose every instance, so a directional
 * shadow generator fitted to this mesh covers all of the crates, however far
 * apart they are.
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const crate = createBox(engine, { size: 1 });
  crate.material = createStandardMaterial();

  if (centres.length > 0) {
    const n = centres.length;
    const mats = new Float32Array(16 * n);
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < n; i++) {
      const [x, y, z] = centres[i];
      const o = 16 * i;
      // Column-major identity rotation/scale, translation in [12..14].
      mats[o + 0] = 1;
      mats[o + 5] = 1;
      mats[o + 10] = 1;
      mats[o + 15] = 1;
      mats[o + 12] = x;
      mats[o + 13] = y;
      mats[o + 14] = z;

      for (let k = 0; k < 3; k++) {
        const c = centres[i][k];
        if (c < min[k]) min[k] = c;
        if (c > max[k]) max[k] = c;
      }
    }

    setThinInstances(crate, mats, n);

    // Local bounds (the mesh sits at the origin) enclosing every crate.
    crate.boundMin = [
      min[0] - CRATE_HALF_SIZE,
      min[1] - CRATE_HALF_SIZE,
      min[2] - CRATE_HALF_SIZE,
    ];
    crate.boundMax = [
      max[0] + CRATE_HALF_SIZE,
      max[1] + CRATE_HALF_SIZE,
      max[2] + CRATE_HALF_SIZE,
    ];
  }

  addToScene(scene, crate);
  return crate;
}
