import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

// Creates a node named `name` at the origin (identity transform) and parents
// every part under it. setParent keeps each part's world transform, and it adds
// the part to group.children, so addToScene, setMeshVisible and the move/turn/scale
// of the group all reach the parts. (A plain `part.parent = group` would not
// update group.children, so the group would not carry its parts.)
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
