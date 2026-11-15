import { createTransformNode, type Mesh, type TransformNode } from "@babylonjs/lite";

/**
 * Groups several meshes under one TransformNode so they act as a single unit.
 *
 * The node is created at the origin with identity rotation and unit scale, so
 * parenting the parts to it does not change their world transforms. Moving,
 * rotating or scaling the node moves all parts; adding the node to a scene or
 * hiding it through the library's subtree-visibility call applies to the parts
 * as well, because they are listed in the node's children.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // position (0,0,0), rotation quaternion (0,0,0,1), scaling (1,1,1)
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1);

    for (const part of parts) {
        part.parent = group;
        // Keep the children list in sync with the parent link, without
        // duplicating the entry if the library already added it.
        if (!group.children.includes(part)) {
            group.children.push(part);
        }
    }

    return group;
}
