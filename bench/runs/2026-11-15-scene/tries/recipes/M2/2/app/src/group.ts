import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

// Creates a node at the origin with identity rotation and unit scale, and
// parents every part under it. setParent keeps each part's world position, and
// the group's identity transform means that position is also its local one, so
// nothing moves. Because the parts are children of the node, moving, turning or
// scaling it, adding it to a scene, or hiding it with setMeshVisible all apply
// to the parts too.
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
