# Merge of the three lists of animation notes

## Counts

- In: 156 notes. an-1 has 50, an-2 has 56, an-3 has 50.
- Out: 67 groups in `facts.json`. They hold all 156 notes; each note is in exactly one group.
- Dropped: 0 groups.
- Conflicts: 2. See `CONFLICTS.md`.

## Groups by votes

- 3 votes: 37 groups (111 notes).
- 2 votes: 15 groups (30 notes).
- 1 vote: 15 groups (15 notes).

## Bytes

`merged.md` is 13,124 bytes. The bound is 15,260 bytes, so no group was dropped.

It was made with:

```
python3 /home/build/amerge/tools/notes.py render --title 'Notes on how the animation code of Babylon Lite 1.39.0 behaves' --out merged/merged.md merged/facts.json
```

which printed `merged/merged.md: 67 items, 13124 bytes`.

## Dropped groups

None.

## How the probes were run

Each group's probe is the chosen member's probe, copied unchanged into `merged/probes/`. There
are 65 probe files for 67 groups: two of an-2's files each back two groups
(`frame-interpolation.test.ts` and `tasks-active-dispose.test.ts`). No two chosen files had the
same name, so none was renamed. Three shared files the probes import were copied too:
`gltf-fixture.ts` (an-2), `_gltf.ts` and `_lib.ts` (an-3). They are not probes.

`merged/probes/vitest.config.mjs` maps `@babylonjs/lite` to the checkout, as
`app/vitest.config.ts` does. It also sends the three ways the lists import
`app/checks/helpers.ts` to that file, and turns on vitest globals, which an-2's probes need.

The command, from `/home/build/amerge`:

```
cd app && npx vitest run --config ../merged/probes/vitest.config.mjs
```

Its summary:

```
 Test Files  65 passed (65)
      Tests  144 passed (144)
```

Vitest left a cache in `merged/probes/node_modules`; it was removed. Before choosing, all three
lists' probes were also run in place with a scratch config (146 files, 261 tests, all passed);
that config and its cache were removed. `app/src` is empty and `app/checks` holds only
`helpers.ts`. No file under `babylon-lite/` or `lists/` was changed.

## How a group's text was chosen

Rule 1: the member whose probe shows the most of what the group says. Each claim in the members'
texts was counted once for each member that states it, so a claim that three members make counts
more than one that only one member makes. A probe scored the claims it asserts.

On a tie:

1. The member whose text states more of those claims, counting only claims its probe shows.
2. Then the member with the lower place in its own list.

In the two conflict groups, a member whose text the library showed to be wrong was not chosen
(rule 3). Its place went to the best of the true members.

## How the groups were ordered

Rule 4: more votes first; then the lower mean of the members' places. Ties on both were broken by
the lowest single place, then by writer name. Four ties needed this: places 14 and 15 (mean
19.00), 24 and 25 (mean 33.33), 30 and 31 (mean 40.00), and 61 and 62 (mean 50.00). Only the last
pair needed the writer name.

## Notes that touch two groups

Some notes make two claims that other writers made in two notes. Each such note went into the
group of its main claim, the one its first sentence and its probe are about.

- an-2#2 (milliseconds and seconds, then advance-then-write) is in the advance-then-write group,
  not the units group.
- an-3#1 (a property group plays at once, but only the manager moves it) is in the "scenes do not
  drive a manager" group.
- an-3#3 (loop default, speedRatio and weight 1) is in the createPropertyAnimationGroup group.
- an-2#7 (end of a non-looping group, then replay) is in the end group; the replay group has
  an-1#17 and an-3#8.
- an-2#29 (loop wrap, then negative speed) is in the loop group; the negative-speed group has
  an-1#41 and an-3#43.
- an-2#17 (holding outside the keys, then step) is in the holding group; the step group has
  an-1#24 and an-3#26.
- an-1#21 (clip duration, then holding outside the keys) is in the clip-duration group.
- an-1#8 (functions and constants not exported) is in the functions group; the constants group
  has an-2#5 and an-3#48.
- an-3#7 (stopAnimation, then isPlaying = true) is in the pause and stop group. an-3#10 (a paused
  group writes nothing, even after a seek) stays alone.
- an-1#29 (assigning currentTime, then isPlaying = true) is in the runtime-fields group. an-2#9
  (isPlaying = true does not restart) stays alone.
- an-1#20 (resolving after step returns false, and rejecting on a throw) stays alone. Its two
  halves are in the two other runFrameInterpolation groups.
- an-3#46 (remove, other manager, re-add) is with an-1#32 and an-2#37 (order and re-add). an-1#33
  and an-2#36 (one manager per group) form their own group.
- an-3#33 (goToFrame past the end on glTF and property groups) stays alone. an-3#32 is with
  an-1#46 (goToFrame on a stopped glTF group).
- an-2#54 (addAnimationTask and active) stays alone; an-1#44 and an-2#35 form the task-active
  group.

## The groups, in order

| Place | Votes | Mean place | Text from | Members | Probe |
|---|---|---|---|---|---|
| 1 | 3 | 1.67 | an-1#1 | an-1#1, an-2#3, an-3#1 | manager-not-tied-to-scene.test.ts |
| 2 | 3 | 2.33 | an-1#3 | an-1#3, an-2#1, an-3#3 | create-group-state.test.ts |
| 3 | 3 | 3.33 | an-2#2 | an-1#4, an-2#2, an-3#4 | manager-no-write-until-update.test.ts |
| 4 | 3 | 5.67 | an-2#7 | an-1#5, an-2#7, an-3#5 | group-nonloop-end.test.ts |
| 5 | 3 | 9.00 | an-1#8 | an-1#8, an-2#4, an-3#15 | not-exported.test.ts |
| 6 | 3 | 9.33 | an-1#16 | an-1#16, an-2#6, an-3#6 | goto-frame-property.test.ts |
| 7 | 3 | 10.00 | an-2#8 | an-1#15, an-2#8, an-3#7 | group-pause-stop.test.ts |
| 8 | 3 | 11.33 | an-1#10 | an-1#10, an-2#10, an-3#14 | key-times.test.ts |
| 9 | 3 | 13.00 | an-2#14 | an-1#9, an-2#14, an-3#16 | write-paths.test.ts |
| 10 | 3 | 14.67 | an-2#29 | an-1#6, an-2#29, an-3#9 | group-loop-wrap.test.ts |
| 11 | 3 | 16.00 | an-1#11 | an-1#11, an-2#20, an-3#17 | weight-needs-blending.test.ts |
| 12 | 3 | 17.00 | an-3#18 | an-1#12, an-2#21, an-3#18 | blend-plain-sum.test.ts |
| 13 | 3 | 18.67 | an-1#13 | an-1#13, an-2#23, an-3#20 | fade-weight.test.ts |
| 14 | 3 | 19.00 | an-3#24 | an-1#22, an-2#11, an-3#24 | play-range.test.ts |
| 15 | 3 | 19.00 | an-2#24 | an-1#14, an-2#24, an-3#19 | fade-cross.test.ts |
| 16 | 3 | 19.33 | an-2#27 | an-1#19, an-2#27, an-3#12 | frame-interpolation.test.ts |
| 17 | 3 | 22.00 | an-2#26 | an-1#29, an-2#26, an-3#11 | group-direct-fields.test.ts |
| 18 | 3 | 25.00 | an-3#22 | an-1#23, an-2#30, an-3#22 | quaternion-slerp-rule.test.ts |
| 19 | 3 | 26.00 | an-1#18 | an-1#18, an-2#19, an-3#41 | easing-ease-in-per-segment.test.ts |
| 20 | 3 | 27.67 | an-1#30 | an-1#30, an-2#32, an-3#21 | fixed-delta.test.ts |
| 21 | 3 | 28.00 | an-2#50 | an-1#21, an-2#50, an-3#13 | clip-keys-framerate.test.ts |
| 22 | 3 | 30.00 | an-2#28 | an-1#34, an-2#28, an-3#28 | frame-interpolation.test.ts |
| 23 | 3 | 30.67 | an-1#31 | an-1#31, an-2#34, an-3#27 | task-order.test.ts |
| 24 | 3 | 33.33 | an-1#40 | an-1#40, an-2#18, an-3#42 | easing-unclamped.test.ts |
| 25 | 3 | 33.33 | an-1#25 | an-1#25, an-2#39, an-3#36 | blending-slot.test.ts |
| 26 | 3 | 35.00 | an-2#41 | an-1#35, an-2#41, an-3#29 | gltf-create.test.ts |
| 27 | 3 | 36.67 | an-3#31 | an-1#36, an-2#43, an-3#31 | gltf-paused-writes-nonloop-playing.test.ts |
| 28 | 3 | 37.00 | an-3#30 | an-1#37, an-2#44, an-3#30 | gltf-scene-driving.test.ts |
| 29 | 3 | 38.33 | an-2#37 | an-1#32, an-2#37, an-3#46 | groups-attach.test.ts |
| 30 | 3 | 40.00 | an-3#23 | an-1#49, an-2#48, an-3#23 | path-resolution.test.ts |
| 31 | 3 | 40.00 | an-2#33 | an-1#43, an-2#33, an-3#44 | manager-onupdate-raf.test.ts |
| 32 | 3 | 40.33 | an-2#38 | an-1#48, an-2#38, an-3#35 | blend-zero-paused.test.ts |
| 33 | 3 | 41.00 | an-1#39 | an-1#39, an-2#46, an-3#38 | mask-names.test.ts |
| 34 | 3 | 41.67 | an-1#38 | an-1#38, an-2#47, an-3#40 | mask-in-place-edit.test.ts |
| 35 | 3 | 43.00 | an-3#37 | an-1#47, an-2#45, an-3#37 | weighted-gltf-engine-no-nodes.test.ts |
| 36 | 3 | 43.33 | an-2#40 | an-1#45, an-2#40, an-3#45 | weight-validate.test.ts |
| 37 | 3 | 46.00 | an-1#42 | an-1#42, an-2#49, an-3#47 | property-group-fields.test.ts |
| 38 | 2 | 2.00 | an-1#2 | an-1#2, an-3#2 | units-seconds.test.ts |
| 39 | 2 | 12.50 | an-1#17 | an-1#17, an-3#8 | replay-after-end.test.ts |
| 40 | 2 | 16.00 | an-1#7 | an-1#7, an-2#25 | float32-values.test.ts |
| 41 | 2 | 19.50 | an-1#27 | an-1#27, an-2#12 | zero-duration-throws.test.ts |
| 42 | 2 | 21.00 | an-2#17 | an-2#17, an-3#25 | interp-ends-step.test.ts |
| 43 | 2 | 21.50 | an-1#28 | an-1#28, an-2#15 | path-unsupported.test.ts |
| 44 | 2 | 24.00 | an-2#22 | an-1#26, an-2#22 | blend-sum.test.ts |
| 45 | 2 | 25.00 | an-3#26 | an-1#24, an-3#26 | step-interpolation.test.ts |
| 46 | 2 | 26.50 | an-2#5 | an-2#5, an-3#48 | exports.test.ts |
| 47 | 2 | 34.50 | an-1#33 | an-1#33, an-2#36 | group-ownership.test.ts |
| 48 | 2 | 38.00 | an-2#42 | an-2#42, an-3#34 | gltf-manager-drive.test.ts |
| 49 | 2 | 39.00 | an-1#46 | an-1#46, an-3#32 | gltf-goto-frame.test.ts |
| 50 | 2 | 39.50 | an-2#35 | an-1#44, an-2#35 | tasks-active-dispose.test.ts |
| 51 | 2 | 42.00 | an-1#41 | an-1#41, an-3#43 | negative-speed.test.ts |
| 52 | 2 | 52.50 | an-2#56 | an-2#56, an-3#49 | additive.test.ts |
| 53 | 1 | 9.00 | an-2#9 | an-2#9 | group-isplaying-stopped.test.ts |
| 54 | 1 | 10.00 | an-3#10 | an-3#10 | pause-writes-nothing.test.ts |
| 55 | 1 | 13.00 | an-2#13 | an-2#13 | group-time-sum.test.ts |
| 56 | 1 | 16.00 | an-2#16 | an-2#16 | clip-object-value.test.ts |
| 57 | 1 | 20.00 | an-1#20 | an-1#20 | frame-interp-finish.test.ts |
| 58 | 1 | 31.00 | an-2#31 | an-2#31 | easing-shapes.test.ts |
| 59 | 1 | 33.00 | an-3#33 | an-3#33 | gotoframe-wrap-clamp.test.ts |
| 60 | 1 | 39.00 | an-3#39 | an-3#39 | mask-default-masks-all.test.ts |
| 61 | 1 | 50.00 | an-1#50 | an-1#50 | gltf-targeted.test.ts |
| 62 | 1 | 50.00 | an-3#50 | an-3#50 | blend-quaternion-normalized.test.ts |
| 63 | 1 | 51.00 | an-2#51 | an-2#51 | clip-value-size.test.ts |
| 64 | 1 | 52.00 | an-2#52 | an-2#52 | write-holder.test.ts |
| 65 | 1 | 53.00 | an-2#53 | an-2#53 | easing-bezier.test.ts |
| 66 | 1 | 54.00 | an-2#54 | an-2#54 | tasks-active-dispose.test.ts |
| 67 | 1 | 55.00 | an-2#55 | an-2#55 | tasks-category.test.ts |
