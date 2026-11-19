I'm working on a small viewer app in /Users/Shared/kf/boxes/540fad/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/540fad/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/540fad/app/animation-notes.md. Read them first.

# Restore a saved mask

Users can choose which parts of our model a clip moves, for example only the upper body. We save that choice with their settings as JSON, in the shape of the library's `AnimationGroupMask`, and read it back as a plain object.

I need this in `src/restore-mask.ts`:

```ts
import type { AnimationGroup, AnimationGroupMask } from "@babylonjs/lite";

export function restoreMask(group: AnimationGroup, saved: AnimationGroupMask): void;
```

`group` is one of our model's glTF clips, played by the scene as it renders frames. After the call, as the scene renders, the clip must move exactly the nodes that the saved mask lets through, and the other nodes must stay in their rest pose. This holds for include masks, exclude masks and disabled masks, and when a later call restores another mask on the same clip or on another clip.

Use `@babylonjs/lite`.

Please keep every change inside /Users/Shared/kf/boxes/540fad/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
