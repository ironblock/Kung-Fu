I'm working on a small viewer app in /Users/Shared/kf/boxes/11f2f4/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/11f2f4/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/11f2f4/app/animation-notes.md. Read them first.

A warning beacon flashes on a fixed rhythm. Write `src/beacon.ts`, exporting

```ts
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void
```

using `@babylonjs/lite` (`AnimationManager` is its type).

Flashing starts at once on `manager`, which we update ourselves every frame. Each period begins with a flash: `lamp.intensity` rises at a steady rate from 0 to 1 in 0.1 s, falls back to 0 over the next 0.1 s, and stays at 0 for the rest of the period. Then the next period begins, forever. `periodSeconds` is at least 0.5.

The returned function sets the flash strength: more than 0 and at most 1, and 1 at the start. Flashes then peak at that strength instead of 1. A new strength first shows at the next update and must not shift the rhythm. Several beacons may share one manager.

Please keep every change inside /Users/Shared/kf/boxes/11f2f4/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
