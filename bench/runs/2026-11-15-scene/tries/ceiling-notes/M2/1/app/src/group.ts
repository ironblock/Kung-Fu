import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Creates a node called `name` at the origin, with no rotation and unit
 * scale, and puts every part under it without moving any part.
 *
 * Each part is attached with `setParent` rather than by writing
 * `part.parent = group`. A plain parent write leaves `group.children`
 * unchanged, so `addToScene`, `setMeshVisible` and `cloneTransformNode` on
 * the group would skip that part. Pushing onto `group.children` alone does
 * not parent the part either, so moving the group before it is added to a
 * scene would leave the part behind. `setParent` both records the part in
 * `group.children` and parents it, keeping its world transform. The group's
 * world matrix is the identity (and its scale is not zero), so the part
 * stays exactly where it was.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // Position (0, 0, 0), identity quaternion (0, 0, 0, 1), scale (1, 1, 1).
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
