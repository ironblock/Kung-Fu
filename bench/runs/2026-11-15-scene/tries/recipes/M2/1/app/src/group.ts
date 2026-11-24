import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups several meshes under one transform node so they move, turn, scale,
 * are added to a scene and are hidden together.
 *
 * The node sits at the origin with identity rotation (qw = 1) and unit scale.
 * Parts are parented with setParent, which keeps each part's world position,
 * so grouping does not move them. Parts are expected to have no parent yet.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  // px, py, pz, qx, qy, qz, qw, sx, sy, sz
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
