import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a TransformNode at the origin (identity rotation and scale) and
 * parents every part under it. setParent keeps each part's world transform,
 * and the group's transform is identity, so no part moves.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  // position xyz, rotation quaternion xyzw (identity), scaling xyz (identity)
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
