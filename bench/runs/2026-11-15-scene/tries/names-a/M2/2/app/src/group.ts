import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a transform node at the origin (identity rotation, unit scale) and
 * parents every part under it. The group starts at identity, so parenting
 * does not change any part's world transform.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
