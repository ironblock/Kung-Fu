I'm working on a small viewer app in /home/dev/ffe6b0/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/ffe6b0/app/scene-api.d.ts. Read them first.

# Duplicate a book along its shelf

In our shelf editor each book mesh is attached to a shelf (the book's parent, which may be moved or turned). The "duplicate" button should make a copy next to the original. Please write `src/duplicate.ts` exporting:

```ts
import type { Mesh, SceneContext } from "@babylonjs/lite";

export function duplicateAlongShelf(scene: SceneContext, book: Mesh, dx: number): Mesh;
```

It returns a new mesh, added to the scene, that looks like `book`, with the same size and turn. The copy sits `dx` units from the original along the shelf's own x axis, that is, at the book's place on the shelf plus `dx` in the shelf's x direction, wherever the shelf is and however it is turned. The copy stays on the same shelf: when the shelf is moved or turned afterwards, the copy moves with it. The original is not changed.

Please keep every change inside /home/dev/ffe6b0/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
