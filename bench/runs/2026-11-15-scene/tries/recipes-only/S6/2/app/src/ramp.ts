import type { EngineContext, Mesh, SceneContext } from "@babylonjs/lite";
import { addToScene, createStandardMaterial } from "@babylonjs/lite";

export interface RampGeometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

type Vec3 = [number, number, number];

/**
 * Wedge-shaped ramp, five flat faces, each with its own vertices:
 *   bottom  y = 0, x in [-w/2, w/2], z in [0, L]          normal (0, -1, 0)
 *   top     from (z=0, y=0) up to (z=L, y=H)               normal (0, L, -H) / |.|
 *   back    z = L, y in [0, H]                             normal (0, 0, 1)
 *   left    x = -w/2 triangle (0,0,0) (0,0,L) (0,H,L)      normal (-1, 0, 0)
 *   right   x = +w/2, same triangle                        normal (1, 0, 0)
 *
 * Triangles are wound so that (b - a) x (c - a) points along the face's outward
 * normal, i.e. the outside of every face is the front side.
 */
export function buildRampGeometry(width: number, length: number, height: number): RampGeometry {
  const hw = width / 2;
  const L = length;
  const H = height;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Each face gets its own vertices; `tris` indexes into `corners`.
  const addFace = (corners: Vec3[], normal: Vec3, tris: Vec3[]) => {
    const base = positions.length / 3;
    for (const p of corners) {
      positions.push(p[0], p[1], p[2]);
      normals.push(normal[0], normal[1], normal[2]);
    }
    for (const [a, b, c] of tris) {
      indices.push(base + a, base + b, base + c);
    }
  };

  const slopeLen = Math.hypot(L, H);

  // Bottom
  addFace(
    [
      [-hw, 0, 0],
      [hw, 0, 0],
      [hw, 0, L],
      [-hw, 0, L],
    ],
    [0, -1, 0],
    [
      [0, 1, 2],
      [0, 2, 3],
    ],
  );

  // Sloped top
  addFace(
    [
      [-hw, 0, 0], // front-left
      [hw, 0, 0], // front-right
      [hw, H, L], // back-right
      [-hw, H, L], // back-left
    ],
    [0, L / slopeLen, -H / slopeLen],
    [
      [0, 2, 1],
      [0, 3, 2],
    ],
  );

  // Vertical back face
  addFace(
    [
      [-hw, 0, L],
      [hw, 0, L],
      [hw, H, L],
      [-hw, H, L],
    ],
    [0, 0, 1],
    [
      [0, 1, 2],
      [0, 2, 3],
    ],
  );

  // Right triangular side (x = +w/2)
  addFace(
    [
      [hw, 0, 0],
      [hw, 0, L],
      [hw, H, L],
    ],
    [1, 0, 0],
    [[0, 2, 1]],
  );

  // Left triangular side (x = -w/2)
  addFace(
    [
      [-hw, 0, 0],
      [-hw, 0, L],
      [-hw, H, L],
    ],
    [-1, 0, 0],
    [[0, 1, 2]],
  );

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
  };
}

export function createRamp(
  engine: EngineContext,
  scene: SceneContext,
  width: number,
  length: number,
  height: number,
): Mesh {
  const geometry = buildRampGeometry(width, length, height);

  // UNVERIFIED: the factory name and its argument shape for building a mesh
  // from raw vertex data are not in scene-recipes.md and the library is not
  // on this machine. Replace `createMeshFromVertexData` with the real call.
  const mesh = createMeshFromVertexData(engine, {
    positions: geometry.positions,
    normals: geometry.normals,
    indices: geometry.indices,
  });

  // Without a material the mesh is added but never drawn (recipe 1).
  mesh.material = createStandardMaterial();
  addToScene(scene, mesh);
  return mesh;
}
