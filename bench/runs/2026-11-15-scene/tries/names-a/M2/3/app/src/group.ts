import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a transform node at the origin (identity rotation, unit scale) and
 * parents every part under it. Parts keep their current transforms, so the
 * grouping itself does not move them.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // position (0,0,0), rotation quaternion (0,0,0,1), scaling (1,1,1)
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
