import type { Mesh, SceneContext } from "@babylonjs/lite";
import { removeFromScene, setParent } from "@babylonjs/lite";

type Vec3 = [number, number, number];
type Quat = [number, number, number, number]; // x, y, z, w

function len(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Splits a world matrix (Babylon layout: row-major 16 values, translation in
 * elements 12..14, the transformed X/Y/Z axes in rows 0..2) into translation,
 * scaling and rotation quaternion. Shear, if any, is dropped.
 */
function decompose(m: ArrayLike<number>): { position: Vec3; scaling: Vec3; rotation: Quat } {
  const position: Vec3 = [m[12], m[13], m[14]];
  const ax: Vec3 = [m[0], m[1], m[2]];
  const ay: Vec3 = [m[4], m[5], m[6]];
  const az: Vec3 = [m[8], m[9], m[10]];

  const lx = len(ax);
  const ly = len(ay);
  const lz = len(az);

  // Unit axis images of the rotation part.
  let ux: Vec3 = [ax[0] / lx, ax[1] / lx, ax[2] / lx];
  const uy: Vec3 = [ay[0] / ly, ay[1] / ly, ay[2] / ly];
  const uz: Vec3 = [az[0] / lz, az[1] / lz, az[2] / lz];

  let sx = lx;
  // Negative determinant means the world transform mirrors; put the sign on X.
  if (dot(ux, cross(uy, uz)) < 0) {
    sx = -lx;
    ux = [-ux[0], -ux[1], -ux[2]];
  }
  const scaling: Vec3 = [sx, ly, lz];

  // Rotation matrix (column-vector convention): column j is axis j.
  const r = [
    [ux[0], uy[0], uz[0]],
    [ux[1], uy[1], uz[1]],
    [ux[2], uy[2], uz[2]],
  ];
  const trace = r[0][0] + r[1][1] + r[2][2];
  let x: number, y: number, z: number, w: number;
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    w = 0.25 * s;
    x = (r[2][1] - r[1][2]) / s;
    y = (r[0][2] - r[2][0]) / s;
    z = (r[1][0] - r[0][1]) / s;
  } else if (r[0][0] > r[1][1] && r[0][0] > r[2][2]) {
    const s = Math.sqrt(1 + r[0][0] - r[1][1] - r[2][2]) * 2;
    w = (r[2][1] - r[1][2]) / s;
    x = 0.25 * s;
    y = (r[0][1] + r[1][0]) / s;
    z = (r[0][2] + r[2][0]) / s;
  } else if (r[1][1] > r[2][2]) {
    const s = Math.sqrt(1 + r[1][1] - r[0][0] - r[2][2]) * 2;
    w = (r[0][2] - r[2][0]) / s;
    x = (r[0][1] + r[1][0]) / s;
    y = 0.25 * s;
    z = (r[1][2] + r[2][1]) / s;
  } else {
    const s = Math.sqrt(1 + r[2][2] - r[0][0] - r[1][1]) * 2;
    w = (r[1][0] - r[0][1]) / s;
    x = (r[0][2] + r[2][0]) / s;
    y = (r[1][2] + r[2][1]) / s;
    z = 0.25 * s;
  }
  const n = Math.hypot(x, y, z, w);
  return { position, scaling, rotation: [x / n, y / n, z / n, w / n] };
}

/**
 * Removes `mesh` from the scene, keeping its direct children in the scene at
 * their current world placement. The children are detached from `mesh` first,
 * so removing `mesh` does not remove them.
 */
export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void {
  const children = [...(mesh.children as Mesh[])];

  // Capture each child's world matrix while `mesh` is still its parent.
  const worlds = children.map((child) => {
    const m = child.worldMatrix as unknown as ArrayLike<number>;
    return Array.from({ length: 16 }, (_, i) => m[i]);
  });

  children.forEach((child, i) => {
    // Detach first: updates both child.parent and mesh.children.
    setParent(child, null);

    // Write the captured world transform back as the local transform, which is
    // now the world transform because the parent is null.
    const d = decompose(worlds[i]);
    child.position.x = d.position[0];
    child.position.y = d.position[1];
    child.position.z = d.position[2];
    child.scaling.x = d.scaling[0];
    child.scaling.y = d.scaling[1];
    child.scaling.z = d.scaling[2];
    child.rotationQuaternion.x = d.rotation[0];
    child.rotationQuaternion.y = d.rotation[1];
    child.rotationQuaternion.z = d.rotation[2];
    child.rotationQuaternion.w = d.rotation[3];
  });

  // mesh.children is now empty, so this removes only `mesh` itself.
  removeFromScene(scene, mesh);
}
