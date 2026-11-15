import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups parts under one new TransformNode so they move, turn, scale, add,
 * and hide together. The node sits at the origin with identity rotation and
 * scaling, so reparenting does not move any part.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name, 0, 0, 0);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
