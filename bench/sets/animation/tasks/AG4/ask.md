# Play again

Our app has one-shot clips that do not loop. Some are property clips we build in code, on an animation manager that we update every frame. Others are glTF clips of our model that we set not to loop; the scene plays those as it renders frames.

When a one-shot has run to its end, a "play again" button appears. I need this in `src/play-again.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void;
```

`group` is a one-shot clip, of either kind, that has run to its end. After the call it must play again from its first frame, at its own speed (some clips have a speed setting), and run to its end once more. The button may be pressed again after that.

Use `@babylonjs/lite`.
