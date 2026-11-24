# M3: what removing a mesh does to its children

**The behaviour.** `removeFromScene(scene, mesh)` also removes every descendant in `mesh.children` from the scene (each one detached from its parent and, if this was its last scene, disposed), so a child that should stay must be taken off `children` first.

**What the reader would answer, and why.** It calls `removeFromScene(scene, mesh)` as it would Babylon.js `scene.removeMesh(mesh)`, whose `recursive` flag defaults to `false`, so only the mesh itself leaves the scene; then it detaches the children with `setParent(child, null)` to keep their world place. The declaration `removeFromScene(scene, entity): void` gives no hint that it recurses. The children are already gone from the scene list by the time they are detached.

**The code that decides it.** `babylon-lite/packages/babylon-lite/src/scene/scene-remove.ts`, lines 71-75: the mesh branch calls `removeChildren` after removing the mesh. Lines 292-299: `removeChildren` calls `removeFromScene` on each entry of `node.children`. Line 374: each removed mesh gets `mesh.parent = null`, so a removed child also jumps to its local placement.

**The makers' unit test that pins it.** none (the cases of `tests/lite/unit/remove-from-scene.test.ts` remove meshes and containers with no children).

**comment: no.** The doc comment of `removeFromScene` (lines 15-29) says it undoes `addToScene` and disposes a mesh leaving its last scene, and says nothing of children.
