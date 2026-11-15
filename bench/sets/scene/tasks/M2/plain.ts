import { createTransformNode } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

// Like Babylon.js `mesh.parent = node`: the group is at the origin, so the parts keep their place.
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        part.parent = group;
    }
    return group;
}
