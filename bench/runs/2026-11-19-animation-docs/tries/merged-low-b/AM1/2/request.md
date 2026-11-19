I'm working on a small viewer app in /Users/Shared/kf/boxes/2b1b15/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/2b1b15/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/2b1b15/app/animation-notes.md. Read them first.

# Hand over from one clip to another

Please add `src/hand-over.ts`. It exports:

```ts
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void;
```

The types come from `@babylonjs/lite`.

Both groups play on `manager` and animate the same properties of one object. Weighted blending is already switched on for that manager. `to` may have been created just now. Our loop steps the manager each frame. Its other groups, on other properties, go on as before.

`handOver` should pass the object smoothly from `from` to `to`. On the next frame, however short, it shows `from` alone. After `durationMs` it shows `to` alone, and stays so. In between, the share of `to` grows linearly with time, and the shares always add up to the whole. Both groups keep playing throughout and stay on the manager. I may call `handOver` again the other way round, even before the last one ends.

Please keep every change inside /Users/Shared/kf/boxes/2b1b15/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
