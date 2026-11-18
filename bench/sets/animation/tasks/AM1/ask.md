# Hand over from one clip to another

Please add `src/hand-over.ts`. It exports:

```ts
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void;
```

The types come from `@babylonjs/lite`.

Both groups play on `manager`. They animate the same properties of the same object. Weighted blending is already switched on for that manager. `to` may have been created just now. Our own loop steps the manager each frame.

When I call `handOver`, the object should pass smoothly from `from` to `to`. On the next frame, however short, it still shows `from` alone. After `durationMs` it shows `to` alone, and it stays so. In between, the share of `to` grows linearly with time, and the two shares always add up to the whole. Both groups keep playing the whole time and stay on the manager. Later I may call `handOver` again the other way round.
