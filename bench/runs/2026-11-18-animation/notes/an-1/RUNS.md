# Runs

## What I did

1. I read `WRITER.md`, `names/animation-bare.d.ts`, `app/checks/helpers.ts` and the app's vitest config.
2. I read every file of `babylon-lite/packages/babylon-lite/src/animation`. To follow the glTF path I also read `skeleton/skeleton-updater.ts` (the controller behind glTF groups), `onBeforeRender` and `addToScene` in `scene/scene-core.ts`, `engine/null-engine.ts`, and the animation block of `index.ts` (what the package root exports).
3. I read the names and parts of the bodies of the library's own tests `property-animation.test.ts`, `scene-animation-tick.test.ts` and `node-trs-animation.test.ts`. I did not run the library's tests.
4. I ran exploratory tests that printed values. They sat in a scratch folder in my directory, were copied into `app/checks` only while running, and are deleted now.
5. For each note I wrote one probe under `notes/probes/`. Each probe imports from `@babylonjs/lite` the way an app would. glTF probes build `GltfAnimationData` by hand with no skeletons and no morph targets, so no GPU is needed. Scene probes use `makeScene` and `tick` from `app/checks/helpers.ts`.
6. I type-checked the probes once with the app's `tsc` (copied into `app/src` for that run, then removed). There were no errors in the probes. The only errors were missing WebXR types in the library's `xr` files.
7. I ordered the notes by how likely a developer is to depend on the thing, and how far wrong they would go without the note. Playing, timing and writing come first, then weights and blending, seeking, easing, frame interpolation and tasks. glTF groups and masks come last, because they need glTF data built by hand.

## The command that ran the probes

```
notes/probes/run.sh
```

It copies `notes/probes/*.test.ts` into `app/checks/probes`, runs `npx vitest run checks/probes` in `app`, and removes the copies on exit. The probes import `../helpers.js`, which is `app/checks/helpers.ts` once copied.

Last run printed:

```
 RUN  v5.1.0 /home/build/an-1/app

 Test Files  50 passed (50)
      Tests  72 passed (72)
```

After the run, `app/src` is empty and `app/checks` holds only `helpers.ts`.

## What I did not look at

- Skeletons, bone textures, morph targets (`PATH_WEIGHTS`) and pointer channels (`PATH_POINTER`). They need a GPU device, and the null engine has none.
- What `enableAnimationBlending` computes for glTF poses: weighted bone mixing, rotation blending against rest or override, and what `setAnimationAdditive` does to a pose. I only saw that it throws without an engine and that it does not write scene node targets.
- Cubic-spline sampling in `evaluateSampler`, and glTF rotation slerp in detail.
- How quaternion tracks are mixed under `enablePropertyAnimationBlending` (sign alignment, normalizing), and `AnimationPropertyMixStrategy`.
- Bone overrides (`enableBoneControl`) together with animation, and the USD loader's property mixer hook.
- `startAnimationManager` in a real browser. I only drove it with a stubbed `requestAnimationFrame`.
- glTF files loaded through the real loader. I only built `GltfAnimationData` by hand.
- The exact curves of `bounceEase`, `elasticEase` and `bezierCurveEase` beyond the values the probes check.
