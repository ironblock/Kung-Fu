import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a TransformNode named `name` at the origin with identity rotation and
 * unit scale, and parents every mesh in `parts` under it.
 *
 * The group is at identity, so re-parenting does not change any part's world
 * transform. Moving, rotating or scaling the group then moves the parts with it.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // position (x, y, z), rotation quaternion (x, y, z, w), scaling (x, y, z)
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
