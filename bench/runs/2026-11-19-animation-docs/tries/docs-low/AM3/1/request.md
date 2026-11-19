I'm working on a small viewer app in /home/dev/9e1a5c/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/9e1a5c/app/animation-api.d.ts, and the makers' own document about that code, in /home/dev/9e1a5c/app/animation-doc.md. Read them first.

# Skip ahead on a manager

Please add `src/skip-ahead.ts`. It exports:

```ts
export function skipAhead(manager: AnimationManager, ms: number): void;
```

The types come from `@babylonjs/lite`.

Our game loop steps each animation manager itself, once a frame. Some managers were made with a fixed step, for repeatable runs; others were not. When the player skips part of a cutscene, I call `skipAhead`. It must move everything on the manager forward by exactly `ms` milliseconds in one call: the clips, the tasks and any weight fades alike, as if that much time had passed at once. `ms` is any positive amount, not only a whole number of fixed steps. After the call, the manager must behave on later frames exactly as it did before, fixed step included.

Please keep every change inside /home/dev/9e1a5c/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
