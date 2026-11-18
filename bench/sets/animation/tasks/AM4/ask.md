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
