# Take a mesh away but keep what sits on it

In our room editor a user can delete a piece of furniture while keeping the things attached to it: delete the table, keep the lamp and the vase that were placed on it. Please write `src/remove-keep.ts` exporting:

```ts
import type { Mesh, SceneContext } from "@babylonjs/lite";

export function removeKeepingAttached(scene: SceneContext, mesh: Mesh): void;
```

The mesh leaves the scene. Every mesh directly attached to it (its children) stays in the scene, exactly where it was in the world, and is no longer attached to the removed mesh. Each kept mesh must appear in the scene's mesh list once, as before. The meshes in the scene were added through their parent, the way our loader does it.
