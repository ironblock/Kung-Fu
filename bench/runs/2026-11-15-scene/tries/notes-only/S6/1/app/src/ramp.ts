import { addToScene, createMesh } from "@babylonjs/lite";
import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { buildRampGeometry } from "./rampGeometry";

/**
 * Creates a solid wedge-shaped loading ramp and adds it to the scene.
 *
 * Base: y = 0, x in [-width/2, width/2], z in [0, length].
 * The top slopes from the front edge (z = 0, y = 0) up to height at z = length,
 * where a vertical back face closes it. Two triangular sides close it left and right.
 *
 * NOTE: `createMesh` (vertex-data entry point) is a guess at the Babylon Lite API.
 * It could not be checked because the library is not installed in this checkout.
 */
export function createRamp(engine: EngineContext, scene: SceneContext, width: number, length: number, height: number): Mesh {
  const geometry = buildRampGeometry(width, length, height);
  const mesh = createMesh(engine, {
    positions: geometry.positions,
    normals: geometry.normals,
    indices: geometry.indices,
  });
  addToScene(scene, mesh);
  return mesh;
}
