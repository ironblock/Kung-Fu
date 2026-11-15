import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Groups several meshes under one new transform node so they behave as a unit.
 *
 * The node is created at the origin with an identity rotation and unit scaling,
 * so re-parenting the parts under it leaves every part where it was.
 *
 * Each part is attached with `setParent`, which both sets `part.parent` and
 * adds the part to `group.children`. Both links are needed:
 * - `parent` makes the part's world matrix follow the node (move/turn/scale);
 * - `children` is what `addToScene`, `setMeshVisible` (setSubtreeVisible) and
 *   `removeFromScene` walk, so the parts are added, hidden and removed with it.
 * Setting only `part.parent` would leave `children` empty, and pushing only to
 * `children` would leave `parent` null until the node is added to a scene.
 *
 * The parts are expected to have no parent yet.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // Explicit identity transform: position (0,0,0), quaternion (0,0,0,1), scaling (1,1,1).
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        // The group has an identity world matrix, so keeping the world
        // position (what setParent does) also keeps the local position.
        setParent(part, group);
    }
    return group;
}
