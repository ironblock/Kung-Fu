import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Creates a node named `name` at the origin with no rotation and unit scale,
 * and puts every part under it.
 *
 * The parts are attached with `setParent`, not by assigning `part.parent`.
 * Assigning `parent` does not add the part to the node's `children`, and
 * `addToScene` and `setMeshVisible` find descendants only through
 * `children`, so those parts would be skipped. `setParent` updates both.
 *
 * Because the node has the identity transform, attaching a part does not
 * change where it is in the world.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // Pass the identity transform explicitly instead of relying on the defaults:
    // position (0, 0, 0), rotation quaternion (0, 0, 0, 1), scaling (1, 1, 1).
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
