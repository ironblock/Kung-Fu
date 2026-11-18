I'm working on a small viewer app in /Users/Shared/kf/boxes/f3e5f3/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/f3e5f3/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/f3e5f3/app/animation-notes.md. Read them first.

# Jump to a frame

Our app has two kinds of clips. Some come from the glTF loader for our model, and the scene plays them as it renders frames. Others are property clips we build in code, on an animation manager that we update every frame.

For a timeline I need this in `src/jump-to-frame.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function jumpToFrame(group: AnimationGroup, frame: number): void;
```

`group` is a clip that is playing, of either kind. The clip must jump to `frame`, counted in the clip's own frame rate, and keep playing from there at its own speed (some clips have a speed setting), so that the next frames carry on from that point. Some clips loop and some play once; each must keep doing so after the jump.

Use `@babylonjs/lite`.

Please keep every change inside /Users/Shared/kf/boxes/f3e5f3/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
