import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups furniture parts under a single new TransformNode.
 *
 * The group sits at the origin with identity rotation and unit scale, so the
 * parts keep their existing world transforms. Each part is then parented to
 * the group, so moving/rotating/scaling the group carries the parts along.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(
        name,
        0, 0, 0,   // position
        0, 0, 0, 1, // rotation quaternion (identity)
        1, 1, 1,   // scaling
    );

    for (const part of parts) {
        setParent(part, group);
    }

    return group;
}
