import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Creates a node at the origin and parents each part under it.
 * setParent keeps each part's world position, so grouping does not move anything.
 * Because the group is at the origin with no rotation or scaling, moving or
 * scaling it afterwards moves and scales all parts together.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name, 0, 0, 0);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
