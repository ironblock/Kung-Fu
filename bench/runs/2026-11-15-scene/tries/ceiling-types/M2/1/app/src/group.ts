import { createTransformNode } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Put `parts` under a new node named `name`, so a multi-mesh model can be
 * moved, turned, scaled, added to a scene and hidden as one unit.
 *
 * The node starts with the identity transform (origin, no rotation, unit
 * scale), so a part's world transform equals its local one before and after
 * grouping: no part moves.
 *
 * Both hierarchy links are set on purpose, because the library uses them
 * separately:
 *  - `part.parent` drives the world matrix: the parent setter subscribes the
 *    part to the node's transform changes.
 *  - `node.children` is what `addToScene` and `setMeshVisible` traverse.
 *
 * `setParent` is not used: it would re-derive each part's TRS from its
 * (float32) world matrix, which can nudge values even though the identity
 * parent already preserves the world transform exactly.
 *
 * Expects parts that have no parent yet.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const node = createTransformNode(name);
    for (const part of parts) {
        if (part.parent != null) {
            throw new Error(`groupParts: part "${part.name}" already has a parent`);
        }
        part.parent = node;
        node.children.push(part);
    }
    return node;
}
