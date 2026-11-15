import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups furniture parts under one new transform node.
 *
 * The node sits at the origin with identity rotation and unit scale, so parenting
 * the parts to it does not change their world transforms. `setParent` keeps each
 * part's world transform and records it in the node's `children`, so moving,
 * rotating or scaling the node carries the parts, and hiding the node with
 * `setMeshVisible` hides them too.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
