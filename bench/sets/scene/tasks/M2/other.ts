import { createTransformNode } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

// Another right answer: set the link and keep the children list in step by hand.
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);
    for (const part of parts) {
        part.parent = group;
        group.children.push(part);
    }
    return group;
}
