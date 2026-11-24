import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Group several meshes under one new transform node so they move, turn,
 * scale, get added to a scene and get hidden as a single unit.
 *
 * The node is created at the origin with no rotation and unit scale, and
 * `setParent` keeps each part's world transform unchanged, so grouping
 * does not move any part.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
