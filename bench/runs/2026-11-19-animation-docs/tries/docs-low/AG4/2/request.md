I'm working on a small viewer app in /home/dev/cbebf7/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/cbebf7/app/animation-api.d.ts, and the makers' own document about that code, in /home/dev/cbebf7/app/animation-doc.md. Read them first.

# Play again

Our app has one-shot clips that do not loop. Some are property clips we build in code, on an animation manager that we update every frame. Others are glTF clips of our model that we set not to loop; the scene plays those as it renders frames.

When a one-shot has run to its end, a "play again" button appears. I need this in `src/play-again.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function playAgain(group: AnimationGroup): void;
```

`group` is a one-shot clip, of either kind, that has run to its end. After the call it must play again from its first frame, at its own speed (some clips have a speed setting), and run to its end once more. The button may be pressed again after that.

Use `@babylonjs/lite`.

Please keep every change inside /home/dev/cbebf7/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
