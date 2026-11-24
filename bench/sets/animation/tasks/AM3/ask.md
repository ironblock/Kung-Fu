# Skip ahead on a manager

Please add `src/skip-ahead.ts`. It exports:

```ts
export function skipAhead(manager: AnimationManager, ms: number): void;
```

The types come from `@babylonjs/lite`.

Our game loop steps each animation manager itself, once a frame. Some managers were made with a fixed step, for repeatable runs; others were not. When the player skips part of a cutscene, I call `skipAhead`. It must move everything on the manager forward by exactly `ms` milliseconds in one call: the clips, the tasks and any weight fades alike, as if that much time had passed at once. `ms` is any positive amount, not only a whole number of fixed steps. After the call, the manager must behave on later frames exactly as it did before, fixed step included.
