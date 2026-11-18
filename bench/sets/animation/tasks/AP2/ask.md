Our buttons give a little pulse when pressed. Write `src/pulse.ts`, exporting

```ts
export function createPulse(manager: AnimationManager, button: { scale: number }): () => void
```

using `@babylonjs/lite` (`AnimationManager` is its type). We call the returned function on each press.

A pulse takes the button's `scale` from 1 up to 1.5 at a steady rate over 0.2 s, then back down to 1 over the next 0.2 s, and the button then rests at 1. Nothing moves before the first press. Every press plays one pulse from its beginning, on `manager`, which we update ourselves every frame. A press that comes after an earlier pulse has finished must pulse just like the first one did. Each button gets its own `createPulse`, and many buttons share one manager.
