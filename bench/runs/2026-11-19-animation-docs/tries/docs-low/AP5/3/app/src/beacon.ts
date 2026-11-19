import { createAnimationTask, addAnimationTask, type AnimationManager } from "@babylonjs/lite";

export function startBeacon(
  manager: AnimationManager,
  lamp: { intensity: number },
  periodSeconds: number
): (strength: number) => void {
  let strength = 1;
  let elapsed = 0;

  const task = createAnimationTask((_manager, deltaMs) => {
    elapsed += deltaMs / 1000;
    if (elapsed >= periodSeconds) {
      elapsed -= periodSeconds;
    }

    const riseEnd = 0.1;
    const fallEnd = 0.2;

    if (elapsed < riseEnd) {
      lamp.intensity = (elapsed / riseEnd) * strength;
    } else if (elapsed < fallEnd) {
      lamp.intensity = ((fallEnd - elapsed) / (fallEnd - riseEnd)) * strength;
    } else {
      lamp.intensity = 0;
    }
  });

  addAnimationTask(manager, task);

  return (newStrength: number) => {
    strength = newStrength;
  };
}
