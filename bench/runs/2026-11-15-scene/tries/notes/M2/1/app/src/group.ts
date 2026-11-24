import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Groups furniture parts under one new TransformNode.
 *
 * The node sits at the origin with identity rotation and scaling, so the
 * parts keep their world transforms when they are parented to it. Each part
 * is attached with setParent, which adds it to the node's children array;
 * addToScene, setMeshVisible and world-matrix updates all walk that array.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // px, py, pz = 0; qx, qy, qz = 0, qw = 1 (identity); sx, sy, sz = 1
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
