Our panels fade in when they open. Write `src/fade-in.ts`, exporting

```ts
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup
```

using `@babylonjs/lite` (`AnimationManager` and `AnimationGroup` are its types).

The fade starts at once on `manager`; we update the manager ourselves every frame. Whatever `panel.alpha` was before, the fade takes it from 0 to 1 at a steady rate over `durationMs` milliseconds, and after that it stays at 1. Several panels may fade at the same time on the same manager, each with its own duration.

Return the group that plays the fade: we read its `isPlaying` to know when the fade is over.
