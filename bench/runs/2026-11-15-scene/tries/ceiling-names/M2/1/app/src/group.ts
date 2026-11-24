import type { Mesh, TransformNode } from "@babylonjs/lite";
import { createTransformNode, setParent } from "@babylonjs/lite";

/**
 * Creates a node named `name` at the origin with no rotation and unit scale,
 * and puts every part under it. Parts keep their current placement, because
 * the group's world matrix is the identity.
 *
 * After this, moving, rotating or scaling the group moves its parts.
 * `addToScene(scene, group)` adds the parts. `setSubtreeVisible(group, false)`
 * (exported as `setMeshVisible`) hides them.
 *
 * The parts are expected to have no parent yet.
 */
export function groupParts(name: string, parts: Mesh[]): TransformNode {
    // Pass the identity transform explicitly instead of relying on defaults:
    // position (0,0,0), quaternion (0,0,0,1), scaling (1,1,1).
    const group = createTransformNode(name, 0, 0, 0, 0, 0, 0, 1, 1, 1);

    for (const part of parts) {
        // Use setParent, not `part.parent = group`. It has a Mesh-specific
        // overload, so it is the library's supported way to parent a mesh.
        setParent(part, group);

        // Adding to a scene and hiding a subtree go through `children`.
        // Make sure the part is listed there, without adding it twice.
        if (!group.children.includes(part)) {
            group.children.push(part);
        }
    }

    return group;
}
