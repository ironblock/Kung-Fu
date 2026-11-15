# M5: which instance takes the place of a removed thin instance

**The behaviour.** `removeThinInstance(mesh, index)` swap-removes: it copies the last instance's matrix into slot `index` and drops the count by one, so the instances after `index` do not shift down and the last one changes its index.

**What the reader would answer, and why.** It calls `removeThinInstance(forest, index)` and then `treeIds.splice(index, 1)`, taking a removal "by index" to keep the order of the rest, as `Array.prototype.splice` does. Babylon.js has no thin-instance removal to go by (only `thinInstanceAdd`, `thinInstanceSetMatrixAt`, `thinInstanceCount`), and the declaration `removeThinInstance(mesh: Mesh, index: number): void` does not say how the gap is filled. After the removal `treeIds` names the wrong tree for the slot that received the last instance and for every slot after it.

**The code that decides it.** `babylon-lite/packages/babylon-lite/src/mesh/thin-instance.ts`, lines 241-251: `matrices.copyWithin(index * 16, last * 16, last * 16 + 16)` and `count--`.

**The makers' unit test that pins it.** none (no case in `tests/lite/unit` calls `removeThinInstance`).

**comment: yes.** Line 240: "Remove instance by index. Swap-removes: last instance fills the gap."
