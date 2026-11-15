import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a node at the origin (no rotation or scaling) and parents every part
 * under it. setParent keeps each part's world position, so grouping does not
 * move anything. Moving, rotating or scaling the node moves the parts, adding
 * the node to a scene adds them, and hiding the node hides them.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
  const group = createTransformNode(name, 0, 0, 0);
  for (const part of parts) {
    setParent(part, group);
  }
  return group;
}
