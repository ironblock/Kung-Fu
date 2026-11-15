import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Creates a node named `name` at the origin with identity rotation and
 * scale, and parents every part under it. The parts have no parent yet, and
 * the group is at identity, so no part's world position changes.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // createTransformNode(name, px, py, pz, qx, qy, qz, qw, sx, sy, sz)
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
