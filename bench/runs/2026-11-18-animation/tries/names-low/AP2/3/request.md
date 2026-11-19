I'm working on a small viewer app in /Users/Shared/kf/boxes/eac908/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/eac908/app/animation-api.d.ts. Read them first.

Our buttons give a little pulse when pressed. Write `src/pulse.ts`, exporting

```ts
export function createPulse(manager: AnimationManager, button: { scale: number }): () => void
```

using `@babylonjs/lite` (`AnimationManager` is its type). We call the returned function on each press.

A pulse takes the button's `scale` from 1 up to 1.5 at a steady rate over 0.2 s, then back down to 1 over the next 0.2 s, and the button then rests at 1. Nothing moves before the first press. Every press, even one during a pulse, starts one pulse from its beginning at once, on `manager`, which we update ourselves every frame. A press that comes after an earlier pulse has finished must pulse just like the first one did. Each button gets its own `createPulse`, and many buttons share one manager.

Please keep every change inside /Users/Shared/kf/boxes/eac908/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
