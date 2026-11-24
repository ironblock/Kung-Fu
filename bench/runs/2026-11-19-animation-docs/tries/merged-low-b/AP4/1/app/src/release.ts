import { AnimationManager, stopAnimation, getAnimationGroups } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
	const parts = path.split(".");
	const lastPart = parts[parts.length - 1];

	// Walk the dotted path to reach the object that owns the final segment.
	let owner: object = target;
	for (let i = 0; i < parts.length - 1; i++) {
		owner = (owner as Record<string, unknown>)[parts[i]] as object;
		if (owner == null) return;
	}

	const groups = getAnimationGroups(manager);

	for (const group of groups) {
		const targeted = group.targetedAnimations;
		if (!targeted) continue;

		for (const ta of targeted) {
			if (ta.target === owner && ta.path === lastPart) {
				stopAnimation(group);
				break;
			}
		}
	}
}
