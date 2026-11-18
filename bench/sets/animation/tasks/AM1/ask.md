# Hand over from one clip to another

Please add `src/hand-over.ts`. It exports:

```ts
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void;
```

The types come from `@babylonjs/lite`.

Both groups play on `manager` and animate the same properties of one object. Weighted blending is already switched on for that manager. `to` may have been created just now. Our loop steps the manager each frame. Its other groups, on other properties, go on as before.

`handOver` should pass the object smoothly from `from` to `to`. On the next frame, however short, it shows `from` alone. After `durationMs` it shows `to` alone, and stays so. In between, the share of `to` grows linearly with time, and the shares always add up to the whole. Both groups keep playing throughout and stay on the manager. I may call `handOver` again the other way round, even before the last one ends.
