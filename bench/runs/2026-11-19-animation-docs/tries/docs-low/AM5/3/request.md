I'm working on a small viewer app in /home/dev/9e380e/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/9e380e/app/animation-api.d.ts, and the makers' own document about that code, in /home/dev/9e380e/app/animation-doc.md. Read them first.

# A manager that reports each update

Please add `src/watched-manager.ts`. It exports:

```ts
export function createWatchedManager(onStep: (stepMs: number) => void): AnimationManager;
```

The types come from `@babylonjs/lite`.

I need an animation manager that tells me about every update, so I can keep a frame log. Our own loop drives it: each frame it calls the library's update function on the manager with the frame's time. Each such update must call `onStep` once, with the step that update applied to the animations.

Apart from that, the manager is an ordinary one. Clips and tasks that other code adds to it later must play as usual. If other code switches on weighted blending for it later, or fades weights on it, the calls to `onStep` must go on as before. Each manager made this way reports only its own updates.

Please keep every change inside /home/dev/9e380e/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
