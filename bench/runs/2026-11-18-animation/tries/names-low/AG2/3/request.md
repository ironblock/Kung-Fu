I'm working on a small viewer app in /Users/Shared/kf/boxes/68227c/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/68227c/app/animation-api.d.ts. Read them first.

# Posing mode

Our model's clips come from the glTF loader as animation groups, and the scene plays them as it renders frames.

I want a posing mode: the user freezes the clip, then moves the model's nodes by hand. I need this in `src/pose-mode.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void;
```

`group` is a clip that is playing. The call freezes it at its current moment. From then on, any position, rotation or scaling that our code sets on the model's nodes must stay exactly as set, while the scene goes on rendering frames.

The function returns `resume`. Calling it makes the clip play on from the moment where it was frozen, at its own speed (some clips have a speed setting), and drive the nodes again.

Use `@babylonjs/lite`.

Please keep every change inside /Users/Shared/kf/boxes/68227c/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
