import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

// Writing `part.parent` only links the world matrix; the node's `children` list, which the
// scene add and the visibility cascade walk, is kept by setParent.
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name);
    for (const part of parts) {
        setParent(part, group);
    }
    return group;
}
