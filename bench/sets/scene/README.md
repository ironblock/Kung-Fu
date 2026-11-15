# The scene set

Tasks about the mesh, light, shadow and scene code of the library. The library is the release and commit that `sets/camera/README.md` names. `bench/box.py` reads this directory. A run names it in its `run.json`.

## Where the tasks came from

Three writers wrote tasks on 2026-11-15. Each writer worked alone. An independent checker then read each writer's tasks, ran them, and kept or dropped each one.

Six of the tasks were written from a list. The list holds places where a small open-weights model went wrong while it built a scene with release 1.35.0 of the library. Each of the six was checked again on release 1.39.0. Those six are S1, S2, S3, S4, S6 and S7. The list itself is not in this repository.

The letter of a task names its writer: S, L and M.

## What was left out

- S5: dropped. The ask says outright that every mesh must be in the scene, so a reader can guess the answer.
- L1: dropped. The names show a version counter on every light and setters for intensity and colour, so a reader can guess the answer.
- L3: dropped. The comments give the near plane and say that the range is used, so what is left is close to a coin flip.
- L5: kept by its checker, but left out here. It turns on the same behaviour as S2.

## What each task turns on

Each line is taken from the task's `where.md`.

- S1: fog reaches the scene uniforms only through the writer that `setFog` registers. Setting `scene.fog` alone leaves fog off.
- S2: the shadow pass renders only a generator hung on a light's `shadowGenerator`. `addToScene` takes a generator and does nothing with it.
- S3: a directional shadow's depth range starts at the light's position, which is the origin by default. Only x and y are fitted to the casters.
- S4: a single-map directional shadow fits to each caster's own box. It ignores thin-instance matrices, and `enableThinInstanceWorldBounds` does not change that.
- S6: a front face is a triangle whose (v1-v0)x(v2-v0) points into the solid, as in the library's own box.
- S7 (a question): a PCF shadow map is drawn again only when a caster's or the light's version changes. Intensity, colour and a raw write to the thin-instance array do not count.
- L2: a clustered light container's capacity is fixed when it is registered. A light added later makes the next frame throw, until the container is registered again.
- L4 (a question): the PCF directional generator accepts `normalBias` and never reads it. `bias`, `darkness` and `mapSize` each change what is sent to the GPU.
- M1: `onBeforeRender` puts a callback at the front of the list, so the last one added runs first.
- M2: writing `node.parent` does not put the node in the parent's `children`. `addToScene` and `setMeshVisible` walk `children`.
- M3: `removeFromScene` on a mesh also removes everything in its `children`.
- M4: a clone of a parented mesh has no parent.
- M5: `removeThinInstance` moves the last instance into the gap. The instances after it do not shift down.

## The parts

- `tasks/<id>/`: each task as its writer left it, after its checker's mends. One line of each check was changed: the line that imports the writer's helpers now names that writer's file below. No assertion was changed. `S4/plain-bounds.ts` is a second plain answer. It uses the fix that worked on 1.35.0. `box.py check-tasks` does not run it.
- `checks/scene-helpers-s.ts`, `checks/scene-helpers-l.ts`, `checks/scene-helpers-m.ts`: each writer's own helpers, as the writer left them. Each gives the library's null engine a stand-in GPU device, so meshes, lights and shadow generators can be made. Nothing is drawn. A check imports its writer's file first, before the library.
- `checks/helpers.ts`, `checks/vitest.config.ts`, `checks/runner-package.json` and `checks/window-stub.ts`: from `sets/camera`, as they are there.
- `app/`: from `sets/camera`. It is the app each box starts from.

The grader copies every file in `checks/` whose name holds `helpers` and ends in `.ts`.

## The layout of a task

The layout is the camera set's. See `sets/camera/README.md`.

The proofs of the two questions, `S7/proof.test.ts` and `L4/proof.test.ts`, read the expected answer from the path their writers used. Neither path is in this layout. `box.py check-tasks` does not run a proof.

`python3 bench/box.py check-tasks bench/sets/scene` grades each reference answer, which must pass, and each plain answer, which must fail.
