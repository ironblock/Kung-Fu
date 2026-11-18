A warning beacon flashes on a fixed rhythm. Write `src/beacon.ts`, exporting

```ts
export function startBeacon(manager: AnimationManager, lamp: { intensity: number }, periodSeconds: number): (strength: number) => void
```

using `@babylonjs/lite` (`AnimationManager` is its type).

Flashing starts at once on `manager`, which we update ourselves every frame. Each period begins with a flash: `lamp.intensity` rises at a steady rate from 0 to 1 in 0.1 s, falls back to 0 over the next 0.1 s, and stays at 0 for the rest of the period. Then the next period begins, forever. `periodSeconds` is at least 0.5.

The returned function sets the flash strength: more than 0 and at most 1, and 1 at the start. Flashes then peak at that strength instead of 1. A new strength takes effect from the next update and must not shift the rhythm. Several beacons may share one manager.
