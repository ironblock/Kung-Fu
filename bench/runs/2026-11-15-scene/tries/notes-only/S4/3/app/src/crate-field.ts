import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createBox, setThinInstances } from "@babylonjs/lite";

/**
 * Draws one 1-unit cube centred on each given point as a single mesh with
 * one thin instance per crate (in the given order, unrotated).
 *
 * The mesh's worldMatrix stays identity, so its local bounds are also its
 * world bounds. Thin-instance matrices are not included in the bounds that
 * the directional shadow fit reads, so the bounds are widened here to cover
 * every crate. Otherwise crates far from the prototype fall off the shadow map.
 */
export function createCrateField(
  engine: EngineContext,
  scene: SceneContext,
  centres: [number, number, number][],
): Mesh {
  const mesh = createBox(engine, { size: 1 });

  const count = centres.length;
  const matrices = new Float32Array(16 * count);
  for (let i = 0; i < count; i++) {
    const o = 16 * i;
    // Column-major identity with translation in elements 12..14.
    matrices[o + 0] = 1;
    matrices[o + 5] = 1;
    matrices[o + 10] = 1;
    matrices[o + 15] = 1;
    matrices[o + 12] = centres[i][0];
    matrices[o + 13] = centres[i][1];
    matrices[o + 14] = centres[i][2];
  }
  setThinInstances(mesh, matrices, count);

  // Start from the prototype's own bounds (the cube at the origin) and grow
  // them to cover every crate's unit cube. Bounds are local, and the mesh is
  // untransformed, so local equals world here.
  const min = [mesh.boundMin[0], mesh.boundMin[1], mesh.boundMin[2]];
  const max = [mesh.boundMax[0], mesh.boundMax[1], mesh.boundMax[2]];
  for (const c of centres) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], c[k] - 0.5);
      max[k] = Math.max(max[k], c[k] + 0.5);
    }
  }
  for (let k = 0; k < 3; k++) {
    mesh.boundMin[k] = min[k];
    mesh.boundMax[k] = max[k];
  }

  addToScene(scene, mesh);
  return mesh;
}
