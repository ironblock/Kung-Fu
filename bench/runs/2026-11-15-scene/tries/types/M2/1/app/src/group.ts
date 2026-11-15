import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Create a transform node at the origin (identity rotation and scaling) and
 * parent every part under it.
 *
 * `setParent` keeps each part's world transform, and the group is the identity,
 * so no part moves. After grouping, moving, rotating or scaling the returned
 * node moves all of its parts, adding it to a scene adds them, and hiding it
 * with `setMeshVisible` hides them too.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
