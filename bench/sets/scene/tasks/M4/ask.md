# Duplicate a book along its shelf

In our shelf editor each book mesh is attached to a shelf (the book's parent, which may be moved or turned). The "duplicate" button should make a copy next to the original. Please write `src/duplicate.ts` exporting:

```ts
import type { Mesh, SceneContext } from "@babylonjs/lite";

export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh;
```

It returns a new mesh, added to the scene, that looks like `book`, with the same size and turn. The copy sits `dx` units from the original along the shelf's own x axis, that is, at the book's place on the shelf plus `dx` in the shelf's x direction, wherever the shelf is and however it is turned. The copy stays on the same shelf: when the shelf is moved or turned afterwards, the copy moves with it. The original is not changed.
