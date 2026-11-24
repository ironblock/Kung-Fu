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
