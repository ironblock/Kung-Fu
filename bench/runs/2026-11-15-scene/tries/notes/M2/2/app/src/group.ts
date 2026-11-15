import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Creates a transform node named `name` at the origin (identity rotation,
 * unit scaling) and parents every part under it. The node is identity, so
 * parenting does not change any part's world transform.
 *
 * setParent is used (rather than assigning part.parent) so that each part is
 * also listed in the group's children array; addToScene, setMeshVisible and
 * the transform hierarchy all walk that array.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  // createTransformNode(name, px, py, pz, qx, qy, qz, qw, sx, sy, sz)
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
