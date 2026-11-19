import { setAnimationWeight, removeAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup, AnimationTask } from "@babylonjs/lite";

/**
 * Immediately sets an animation group's weight (share) to the given value,
 * cancelling any in-progress fade for that group.  Fades on other groups
 * are unaffected.  Subsequent fades on this group work normally.
 */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
	// Set the weight immediately so the very next mixer pass uses it.
	setAnimationWeight(group, share);

	// Remove any in-progress fade task that targets this group.
	// Fade tasks created by fadeAnimationWeight / crossFadeAnimationGroups
	// store a reference to the group they are fading; we match on that.
	const tasks = manager.animations;
	for (let i = tasks.length - 1; i >= 0; i--) {
		const task = tasks[i] as AnimationTask & { _group?: AnimationGroup };
		if (task._group === group) {
			removeAnimationTask(manager, task);
		}
	}
}
