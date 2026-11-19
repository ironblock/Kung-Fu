I'm working on a small viewer app in /Users/Shared/kf/boxes/015a6f/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/015a6f/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/015a6f/app/animation-notes.md. Read them first.

# Mix the character's clips and the HUD's clips

Please add `src/mix-all.ts`. It exports:

```ts
export function createMixer(
    engine: EngineContext,
    character: readonly AnimationGroup[],
    hud: object,
    hudClips: readonly PropertyAnimationClip[],
): { hudGroups: AnimationGroup[]; step(deltaMs: number): void };
```

The types come from `@babylonjs/lite`.

`character` holds the clips of one skinned glTF character. They are all playing and not yet on any manager. `hud` is a plain object: play each of `hudClips` on it, looping, and return those groups as `hudGroups`, in the same order. `step(deltaMs)` moves every clip on by `deltaMs`; our loop calls it once a frame.

Later I set weights with the library's own setter. Whenever some of these clips have a weight below 1, on the character, on the HUD, or on both at once, what is shown must be the library's own weighted mix, on the character's bones and on the HUD alike.

Please keep every change inside /Users/Shared/kf/boxes/015a6f/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
