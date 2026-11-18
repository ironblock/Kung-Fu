# A manager that reports each update

Please add `src/watched-manager.ts`. It exports:

```ts
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager;
```

The types come from `@babylonjs/lite`.

I need an animation manager that tells me about every update, so I can keep a frame log. Our own loop drives it: each frame it calls the library's update function on the manager with the frame's time. Each such update must call `onStep` once, with the step that update applied to the animations.

Apart from that, the manager is an ordinary one. Clips and tasks that other code adds to it later must play as usual. If other code switches on weighted blending for it later, the calls to `onStep` must go on as before. Each manager made this way reports only its own updates.
