# AM7: where it turns

**Behaviour.** The skeletal mixer leaves out a clip at weight exactly 1 (and not additive) unless some other clip on the same rig is below 1: when every clip is at 1, each clip plays as if no blending were on and writes the whole skeleton, so the clip added last wins, and a masked clip writes the rest pose over the bones its mask leaves out.

**What the reader would write, and why.** `{ "bothFullUpperY": 4, "bothFullBAddedFirstUpperY": 4, "layeredLowerY": 3, "layeredLowerYWithBAtHalf": 3 }`. With blending switched on, the reader expects every weighted clip to take part in the mix: in Babylon.js two clips at weight 1 are normalised to half each, whatever the order they were started in, and a mask simply takes a bone out of a clip, so the lower body follows A. Nothing in the declarations marks weight 1 as "not mixed". Babylon Lite gives 6, 2, 4 and 3: the order decides, and the masked upper clip resets the lower bone to rest unless its weight is below 1.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/weighted-gltf-mixer.ts`, lines 131-138: a clip goes into the mix only if `group.weight !== 1` or it is additive; lines 140-156: with no such clip the handler returns without handling, so the manager plays each clip's own task in order (`animation-manager.ts` lines 142-149), and each clip's controller writes every bone (`skeleton-updater.ts`, rest pose for masked-out bones). Lines 160-182: once any clip on the rig is below 1, all its clips, those at 1 included, are accumulated, and masked-out channels are skipped (lines 237-244, 359-361).

**Makers' unit test.** None.

**comment: no.** `AnimationGroup.weight`: "Weighted contribution used by AnimationManager mixing (default 1)." `AnimationGroup.mask` says masked-out targets "stay at their bind/rest pose", which reads as a statement about one clip on its own; no comment says that weight 1 takes a clip out of the mix.
