# AM1: where it turns

**Behaviour.** `crossFadeAnimationGroups` fades the incoming group from the weight it has now, not from 0, and a group starts at weight 1, so a fresh incoming group is at full weight for the whole cross-fade.

**What the reader would write, and why.** `crossFadeAnimationGroups(manager, from, to, { durationMs })` and nothing more. The name says cross-fade, and in every engine a cross-fade takes the outgoing clip from 1 to 0 and the incoming clip from 0 to 1. The options have `toWeight` but no start weight, which reads as "the start is taken care of". Babylon.js has no function of this name to correct the guess. So the reader expects `to` to start silent. In Babylon Lite it stays at 1: on the next frame both clips are at full weight and the later one wins, and during the fade the mix is `from` at its share plus `to` at full weight.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/animation-weight-fade.ts`, lines 97-101: `crossFadeAnimationGroups` calls `fadeAnimationWeight` with no `from`. Line 79 then takes `from` from `group.weight`, and line 84 writes it back. The start weight 1 comes from the group factories (`property-animation.ts` line 213, `animation-group.ts` line 217).

**Makers' unit test.** None pins it. `tests/lite/unit/property-animation.test.ts`, "cross-fades manual property animation weights over a deterministic duration", sets the incoming weight to 0 by hand before the cross-fade, so it never sees the default.

**comment: no.** The doc comment says "Cross-fades from `fromGroup` to `toGroup`, fading the first to weight 0 and the second to `options.toWeight` (default 1). Requires blending to be enabled on `manager`." It names where the weights end, not where they start.
