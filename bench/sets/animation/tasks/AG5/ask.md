# Restore a saved mask

Users can choose which parts of our model a clip moves, for example only the upper body. We save that choice with their settings as JSON, in the shape of the library's `AnimationGroupMask`, and read it back as a plain object.

I need this in `src/restore-mask.ts`:

```ts
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void;
```

`group` is one of our model's glTF clips, played by the scene as it renders frames. After the call, as the scene renders, the clip must move exactly the nodes that the saved mask lets through, and the other nodes must stay in their rest pose. This holds for include masks, exclude masks and disabled masks, and when a later call restores another mask on the same clip.

Use `@babylonjs/lite`.
