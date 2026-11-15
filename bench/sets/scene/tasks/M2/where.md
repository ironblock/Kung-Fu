# M2: what writing `parent` does to the parent's `children`

**The behaviour.** Assigning `node.parent = group` links only the world matrix; it does not put the node in `group.children`, and `children` is what `addToScene` and `setMeshVisible` walk, so neither reaches a part linked that way.

**What the reader would answer, and why.** It writes `part.parent = group`, as in Babylon.js, where the `parent` setter also adds the node to the parent's children (`_children`, read by `getChildren`, `setEnabled` inheritance and `dispose`). The declaration `parent: IWorldMatrixProvider | null` beside `children: SceneNode[]` reads like the same pair. The parts follow the node, but adding the node to a scene leaves them out and hiding the node leaves them shown.

**The code that decides it.** `babylon-lite/packages/babylon-lite/src/scene/scene-node.ts`, lines 225-230: the `parent` setter only forwards to the world-matrix state. `src/scene/world-matrix-state.ts`, lines 153-168: that state keeps its own child registry and never touches `children`. `src/scene/visibility.ts`, lines 33-42: the cascade walks `node.children`. `src/scene/scene-core.ts`, lines 547-554: `addToScene` recurses through `children`. `src/scene/set-parent.ts`, lines 53-67: `setParent` is the call that updates `children`.

**The makers' unit test that pins it.** none (`tests/lite/unit/visibility.test.ts`, "cascades visibility and bumps the epoch once", builds its tree through `children` and never writes `parent`).

**comment: no.** No comment on `parent` says it. The doc comment of `setParent` says it "keeps the scene-graph `children` arrays consistent", which tells the reader of the source that something else does not, but it does not say that the setter skips them.
