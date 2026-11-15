import { createTransformNode, setParent } from "@babylonjs/lite";
import type { Mesh, TransformNode } from "@babylonjs/lite";

/**
 * Groups several meshes under one new TransformNode.
 *
 * The node is created at the origin with no rotation or scaling. Each part is
 * parented with setParent, which adds it to node.children and keeps its world
 * transform, so grouping does not move any part. Because the node is an identity
 * transform, the parts' local transforms are unchanged as well.
 *
 * Parts are expected to have no parent yet. Moving, rotating or scaling the node
 * moves the parts with it; addToScene and setMeshVisible on the node also reach
 * every part, since both walk node.children.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    const node = createTransformNode(name);
    for (const part of parts) {
        setParent(part, node);
    }
    return node;
}
