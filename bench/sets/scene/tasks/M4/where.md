# M4: what a clone keeps of its source's place in the hierarchy

**The behaviour.** `cloneTransformNode(mesh)` copies the mesh's local position, rotation and scaling but returns a copy with no parent, so a copy of a parented mesh lands at its local values in world space.

**What the reader would answer, and why.** It clones, adds `dx` to the copy's local `position.x` and adds the copy to the scene, as with Babylon.js `mesh.clone(name)`, whose `newParent` argument defaults to keeping the source's parent. The declaration `cloneTransformNode(src: SceneNode): SceneNode` says nothing about the parent. The copy ends up near the world origin instead of on the shelf, and does not follow the shelf.

**The code that decides it.** `babylon-lite/packages/babylon-lite/src/scene/transform-node.ts`, lines 88-104: the mesh clone is built by `initMeshTransform({ ...mesh, ... })`. `src/scene/scene-node.ts`, lines 219-231: `initSceneNodeTransform` spreads that object and then defines its own `parent` accessor on a fresh world-matrix state, whose parent starts as `null`, so the spread-in parent is dropped. Lines 72 and 129 of `transform-node.ts` (`childClone.parent = ...`) show that only clones made for children get a parent, their new one.

**The makers' unit test that pins it.** none (`tests/lite/unit/light-parenting.test.ts` and `tests/lite/unit/mesh-clone-gpu-dispose.test.ts` clone roots or check buffer ownership, never a parented mesh's parent).

**comment: no.** The doc comment of `cloneTransformNode` says "Deep-clone a SceneNode tree. Meshes share ref-counted GPU buffers; ...", nothing about the parent.
