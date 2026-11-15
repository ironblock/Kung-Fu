import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups furniture parts under one new TransformNode.
 *
 * The group is created at the origin with identity rotation and scale, so
 * parenting the parts to it leaves their world transforms unchanged. Parts
 * are attached with setParent (not by assigning `part.parent`), because
 * addToScene walks the `children` arrays to find a node's descendants.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
