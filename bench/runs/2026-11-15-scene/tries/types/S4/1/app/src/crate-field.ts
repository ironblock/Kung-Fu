import {
  addToScene,
  createBox,
  enableThinInstanceWorldBounds,
  setThinInstances,
} from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";

/**
 * Draws one 1-unit crate centred on each point in `centres`, as a single
 * thin-instanced mesh. Instance i is the unrotated, unscaled crate at centres[i].
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const mesh = createBox(engine, { size: 1 });
  mesh.name = "crateField";

  // Object-local bounds of one crate. Instance placement is applied on top of
  // these by the renderer and the shadow fit, so they must stay unit-cube sized.
  mesh.boundMin = [-0.5, -0.5, -0.5];
  mesh.boundMax = [0.5, 0.5, 0.5];

  // One column-major 4x4 per crate: identity rotation/scale, translation in
  // column 3 (indices 12, 13, 14).
  const matrices = new Float32Array(centres.length * 16);
  for (let i = 0; i < centres.length; i++) {
    const o = i * 16;
    const [x, y, z] = centres[i];
    matrices[o + 0] = 1;
    matrices[o + 5] = 1;
    matrices[o + 10] = 1;
    matrices[o + 15] = 1;
    matrices[o + 12] = x;
    matrices[o + 13] = y;
    matrices[o + 14] = z;
  }
  setThinInstances(mesh, matrices, centres.length);

  // Make the mesh's bounds cover every placed instance, not just the prototype
  // at the origin. The sun's shadow fit uses these bounds, so without this the
  // shadow map may not cover crates spread far from the origin.
  enableThinInstanceWorldBounds(mesh);

  addToScene(scene, mesh);
  return mesh;
}
