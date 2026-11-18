# Jump to a frame

Our app has two kinds of clips. Some come from the glTF loader for our model, and the scene plays them as it renders frames. Others are property clips we build in code, on an animation manager that we update every frame.

For a timeline I need this in `src/jump-to-frame.ts`:

```ts
import type { AnimationGroup } from "@babylonjs/lite";

export function jumpToFrame(group: AnimationGroup, frame: number): void;
```

`group` is a clip that is playing, of either kind. The clip must jump to `frame`, counted in the clip's own frame rate, and keep playing from there at its own speed (some clips have a speed setting), so that the next frames carry on from that point.

Use `@babylonjs/lite`.
