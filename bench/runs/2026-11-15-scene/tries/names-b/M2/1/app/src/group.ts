import {
  createTransformNode,
  setParent,
  type Mesh,
  type TransformNode,
} from "@babylonjs/lite";

/**
 * Groups several meshes under one new TransformNode so they behave as one piece
 * of furniture. The group sits at the origin with identity rotation and unit
 * scale, so parenting the parts under it does not change their world transforms.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  // px, py, pz, qx, qy, qz, qw, sx, sy, sz
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
