import { createAnimationTask, addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function startBeacon(
  manager: AnimationManager,
  lamp: { intensity: number },
  periodSeconds: number
): (strength: number) => void {
  let strength = 1;
  let elapsed = 0;

  const task = createAnimationTask((_mgr, deltaMs) => {
    elapsed += deltaMs / 1000;
    const phase = elapsed % periodSeconds;

    let value: number;
    if (phase < 0.1) {
      value = (phase / 0.1) * strength;
    } else if (phase < 0.2) {
      value = (1 - (phase - 0.1) / 0.1) * strength;
    } else {
      value = 0;
    }

    lamp.intensity = value;
  });

  addAnimationTask(manager, task);

  return (newStrength: number) => {
    strength = Math.max(0, Math.min(1, newStrength));
  };
}
