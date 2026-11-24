import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Puts the given parts under one new node so they can be handled as a unit.
 *
 * The node sits at the origin with no rotation and unit scale, so each part's
 * world transform stays the same. The parts are attached with `setParent`, not
 * by assigning `part.parent`, because only `setParent` adds them to
 * `group.children`. Without that, `addToScene`, `setMeshVisible` and
 * `removeFromScene` called on the group would not reach the parts.
 *
 * Add only the group to the scene, not the parts as well: adding a part on its
 * own too would put it in the scene twice and draw it twice.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(
        name,
        0, 0, 0, // position
        0, 0, 0, 1, // rotation (identity quaternion)
        1, 1, 1, // scaling
    );
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
