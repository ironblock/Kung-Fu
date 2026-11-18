# AM2: where it turns

**Behaviour.** Setting a group's weight, by `setAnimationWeight` or by assignment, does not stop a weight fade under way on that group: on the next update the fade writes its own weight over it; only a new `fadeAnimationWeight` on the group replaces the old fade.

**What the reader would write, and why.** `setAnimationWeight(group, share)`. The ask wants the weight set, and that is the setter's name. The reader sees no function to cancel a fade, so it takes the setter as the last word, the way a plain property write is the last word in Babylon.js (where `animationGroup.weight = w` simply holds). It has no reason to think a fade keeps a copy of its own and rewrites the weight each frame before the mix.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/animation-weight.ts`, lines 4-9: the setter only assigns `group.weight`. `animation-weight-fade.ts`, lines 103-114 (`updateFades`): each update writes `fade.group.weight` from the fade's own `from`, `to` and elapsed time, whatever the weight is now; lines 50-56 run this before the mix (through the manager's pre-update hook, `animation-manager.ts` line 137). Lines 85-91 of `animation-weight-fade.ts` are the only place a fade is dropped early: a new fade on the same group.

**Makers' unit test.** None.

**comment: no.** `setAnimationWeight`: "Set the weighted contribution for an animation group. Feature-specific mixers remain explicit opt-ins." `fadeAnimationWeight`: "Animates `group`'s blend weight toward `options.to` over `options.durationMs`." Neither says that a direct write is overwritten or that a new fade replaces the old one.
