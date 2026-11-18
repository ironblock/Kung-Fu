# Runs

## What I did

1. Read `WRITER.md`, `names/animation-bare.d.ts`, `app/checks/helpers.ts` and the app's vitest config.
2. Read every file of `babylon-lite/packages/babylon-lite/src/animation`. Read the parts of other library files that the animation code calls: `skeleton/skeleton-updater.ts` (the glTF clip controller), the animation exports of `index.ts`, and the animation-group wiring of `scene/scene-core.ts` (`addToScene`, `onBeforeRender`).
3. Read the test names of the library's own animation unit tests, and the set-up of `weighted-gltf-mixer-blend.test.ts` and `property-animation.test.ts`, to see how they build groups without a GPU. I did not run them.
4. Wrote a list of things a Babylon.js developer would get wrong or depend on. For each one I wrote a probe under `notes/probes/`. Each probe imports only from `@babylonjs/lite`, as the reader's app does, plus `app/checks/helpers.ts` for a scene. `notes/probes/gltf-fixture.ts` is a shared helper: a hand-made `GltfAnimationData` with two nodes, no skeleton and no morph target.
5. Ran the probes, fixed probes that held a wrong guess, and wrote notes only for what the probes showed. Wrong guesses I caught this way:
   - A clip whose keys are all at time 0 cannot be bound: `createPropertyAnimationGroup` throws. This became a note.
   - A number key and a one-element array key are the same size; mixing them does not throw.
   - `bezierCurveEase(1)` with default points is `NaN`. This became a note.
   - An Include mask on a single weighted property group is ignored, not applied. I dropped that note: the behaviour depends on other groups.
6. Ordered the notes: first what every use of a property animation depends on (when values are written, units, scene versus manager, what can be imported), then play/pause/stop/seek, keys and paths, interpolation and easing, weights and fades, then the manager's task API, glTF groups, masks, and rare cases.
7. Built `facts.json` with `notes/build-facts.py`. It checks each note is at most 240 bytes, names a real file of `src/animation`, has an existing probe, and has no "usually" or "should". Result: 56 notes, 10539 bytes of note text. Every probe file is used by at least one note.

Early on, I copied the code of `bezierCurveEase` into a scratch file outside this directory to find which inputs give `NaN`. That copy is not a probe. The note rests on `notes/probes/easing-bezier.test.ts`, which runs the library.

## The command that ran the probes

From `app/`:

```
npx vitest run --config ../notes/vitest.probes.config.mjs
```

`notes/vitest.probes.config.mjs` uses the same aliases as `app/vitest.config.ts`, with `root` set to `notes/` and `globals: true`. `globals` is needed because `vitest` cannot be imported from files under `notes/`, as no `node_modules` is above them.

What it printed on the last run of all probes:

```
 RUN  v5.1.0 /home/build/an-2/notes
 Test Files  46 passed (46)
      Tests  139 passed (139)
   Start at  17:00:39
   Duration  12.89s (import 84%, transform 14%, tests 1%, worker 1%)
```

## What I did not look at

- `evaluateSampler`'s CUBICSPLINE path and the glTF-side quaternion slerp. I read them but did not probe them, because `@babylonjs/lite` does not export `evaluateSampler`.
- Skeleton bone matrices, morph-target weights and pointer channels. These need a GPU device or a loader. The only engine I used was a stub with `_device.queue.writeTexture`.
- The math of weighted and additive glTF blending: rotation blending against the rest pose, additive reference poses, and bone-control overrides.
- The USD loader's property-mixer hook (`_installPropertyMixerHandler`), and how property and glTF groups mix together when that hook is installed.
- Masks on property groups when blending is on.
- `goToFrame` with an engine passed, and `startAnimationManager` in a real browser. I tested the loop only with a stubbed `requestAnimationFrame`.
- The shapes of `elasticEase` and `bounceEase` beyond their end points and defaults.
- The GPU-related interfaces of `types.ts` (`SkeletonData`, `VatData`, `MorphTargetData`, `SkinBufferData`).
