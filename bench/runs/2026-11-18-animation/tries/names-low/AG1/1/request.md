I'm working on a small viewer app in /Users/Shared/kf/boxes/05c9f3/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/05c9f3/app/animation-api.d.ts. Read them first.

# Skip to the end

Our model's clips come from the glTF loader as animation groups, and the scene plays them as it renders frames. Most of them loop.

For a "skip" button I need this in `src/skip-to-end.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function skipToEnd(group: AnimationGroup): void;
```

`group` is a clip that is playing. After the call, the model must show the clip's final pose, that is, the values of its last keyframes. It must hold that pose, not playing, while the scene goes on rendering frames. The clip's `currentTime` must read the end of the clip, so that our progress bar shows 100%.

Use `@babylonjs/lite`.

Please keep every change inside /Users/Shared/kf/boxes/05c9f3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
