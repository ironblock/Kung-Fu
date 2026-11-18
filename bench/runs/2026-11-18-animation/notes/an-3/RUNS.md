# How the notes were made

## What I did

1. Read `WRITER.md`, `names/animation-bare.d.ts`, `app/checks/helpers.ts` and the app's config.
2. Read every file of `src/animation`. To follow what they call, I also read
   `skeleton/skeleton-updater.ts` (the controller behind glTF groups), the animation part of
   `addToScene` in `scene/scene-core.ts`, `engine/null-engine.ts`, the node fields in
   `scene/scene-node.ts` and `scene/transform-node.ts`, and the animation exports of `index.ts`.
   I read the names of the library's animation unit tests and a few of their bodies.
3. Wrote short exploring tests that printed what the library did. I deleted them once each
   behaviour had a real probe.
4. Wrote one probe per note under `notes/probes/`. Each probe runs the library through
   `@babylonjs/lite`, the name the app uses, and asserts what its note says. Two shared files
   are not probes: `_lib.ts` (a ramp clip and group) and `_gltf.ts` (hand-built
   `GltfAnimationData`: two named nodes with live targets, no skin, no morph).
5. Checked each note against its probe, and widened a probe where a note said more than the
   probe showed. Notes I could not back were cut or narrowed. Two weak notes (on
   `clearAnimationManager` and on task basics) were dropped, with their probes.
6. Ordered the notes: property groups driven by a manager first (most code will use them, and
   most surprises there lead a Babylon.js habit astray), then keys and values, weights and
   fades, glTF groups, masks, easing, and the rarer cases last.

`notes/vitest.config.mts` points vitest at the probes and maps `@babylonjs/lite` to the
checkout, as `app/vitest.config.ts` does. It maps `#helpers` to `app/checks/helpers.ts`.

## The command and what it printed

```
cd app && npx vitest run --config ../notes/vitest.config.mts
```

```
 RUN  v5.1.0 /home/build/an-3/notes
 Test Files  50 passed (50)
      Tests  50 passed (50)
   Start at  17:08:34
   Duration  13.55s (import 85%, transform 14%, tests 1%, worker 1%)
```

Vitest writes a cache under `notes/node_modules`; I removed it after the last run.

No file under `babylon-lite/` was changed. `app/src` is empty and `app/checks` holds only
`helpers.ts`. Once, a shell command wrote a name list to a scratch path outside this directory.
I deleted it at once, and it held only names from `names/animation-bare.d.ts`.

## What I did not look at

- Cubic-spline sampling (`INTERP_CUBICSPLINE`) and quaternion slerp edge cases in `evaluateSampler`.
- Morph weights (`PATH_WEIGHTS`), pointer channels (`PATH_POINTER`), skins, bone matrices and
  any GPU upload. No probe used a skeleton or a real engine device.
- What additive groups (`setAnimationAdditive`) do to a pose, and blended glTF poses at all,
  beyond the facts that node targets are not written and an engine is needed.
- Bone-control overrides, VAT, the USD loader's property-mixer hook, and custom
  `AnimationPropertyMixStrategy` values.
- `setAnimationTaskCategoryHandler` used directly.
- Masks on property groups under blending, past the plain case.
- A real browser `requestAnimationFrame`; probes stubbed it.
- Clamping of easing parameters (for example a negative power or bounciness at most 1).
- glTF clips with a start time other than 0, and real glTF files through the loader.
- Scene disposal and what it does to animation groups.
