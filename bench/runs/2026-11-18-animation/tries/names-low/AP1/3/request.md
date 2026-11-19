I'm working on a small viewer app in /Users/Shared/kf/boxes/1ee0de/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/1ee0de/app/animation-api.d.ts. Read them first.

Our panels fade in when they open. Write `src/fade-in.ts`, exporting

```ts
export function fadeIn(manager: AnimationManager, panel: { alpha: number }, durationMs: number): AnimationGroup
```

using `@babylonjs/lite` (`AnimationManager` and `AnimationGroup` are its types).

The fade starts at once on `manager`; we update the manager ourselves every frame. Whatever `panel.alpha` was before, the fade takes it from 0 to 1 at a steady rate over `durationMs` milliseconds, and after that it stays at 1 until we set it ourselves. Several panels may fade at the same time on the same manager, each with its own duration.

Return the group that plays the fade: we read its `isPlaying` to know when the fade is over.

Please keep every change inside /Users/Shared/kf/boxes/1ee0de/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
