# AM8: where it turns

**Behaviour.** A group keeps the place it got when it was first attached to a manager: taking it off and putting it back, or clearing the manager and adding groups again in another order, does not move it, so among clips that write the same property the one first attached later still wins.

**What the reader would write, and why.** `{ "xAtStart": 30, "xAfterReAddingA": 10, "indexOfAAfterReAddingA": 1, "xAfterClearThenBThenA": 10, "xAfterNewGroupForA": 10 }`. Adding to a manager reads as pushing onto its list, as `scene.beginAnimation` and `animationGroup.play()` add an animatable to the end of the scene's active list in Babylon.js, and removing reads as taking it out. So a group put back should land last and win. Nothing in the declarations hints at a stored place. Babylon Lite keeps A first: `x` stays 30 and A's index stays 0; only a new group gets a new place.

**Where it is decided.** `babylon-lite/packages/babylon-lite/src/animation/animation-group-task.ts`, lines 50-54: a group gets an order number only when first attached to this manager (`_animationOrderManager !== manager`); lines 76-94 insert the group into the manager's group list by that number and move its task before the next group's task in `manager.animations`. Without blending the manager runs the tasks in that list order (`animation-manager.ts` lines 142-149), so the later writer wins. `removeAnimationGroup` (lines 105-120) and `clearAnimationManager` (`animation-manager.ts` lines 124-128) never clear the order number.

**Makers' unit test.** None.

**comment: no.** `addAnimationGroup`: "Attaches `group` to `manager` so it is ticked each update, creating its backing animation task on first use." `getAnimationGroups`: "Returns the animation groups currently attached to `manager`, or an empty array if none." The order is not mentioned.
