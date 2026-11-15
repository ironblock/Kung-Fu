I'm working on a small viewer app in /home/dev/e4a368/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/e4a368/app/scene-api.d.ts, and some notes on how those parts behave, in /home/dev/e4a368/app/scene-notes.md. Read them first.

# Take a mesh away but keep what sits on it

In our room editor a user can delete a piece of furniture while keeping the things attached to it: delete the table, keep the lamp and the vase that were placed on it. Please write `src/remove-keep.ts` exporting:

```ts
import type { Mesh, SceneContext } from "@babylonjs/lite";

export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void;
```

The mesh leaves the scene. Every mesh directly attached to it (its children) stays in the scene, exactly where it was in the world, and is no longer attached to the removed mesh. Each kept mesh must appear in the scene's mesh list once, as before. The meshes in the scene were added through their parent, the way our loader does it.

Please keep every change inside /home/dev/e4a368/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
