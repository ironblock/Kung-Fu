Our motion designer exports tracks from a long timeline. Each key is a frame number and a value, at the timeline's frame rate, and a track's first key is often well after frame 0. Write `src/timeline-loop.ts`, exporting

```ts
export function loopKeyedTrack(manager: AnimationManager, target: object, path: string, keys: readonly { frame: number; value: number }[], frameRate: number): AnimationGroup
```

using `@babylonjs/lite` (`AnimationManager` and `AnimationGroup` are its types).

It plays the track at once on `manager` (we update the manager ourselves every frame), on the property of `target` at `path`, a dotted path such as `"position.x"`. Values change linearly between keys. The motion starts at the first key, and on reaching the last key it goes straight back to the first key and carries on, forever. Keys come sorted by frame, at least two of them. Return the group.
