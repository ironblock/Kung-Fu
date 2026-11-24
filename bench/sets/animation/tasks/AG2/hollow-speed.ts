import type { AnimationGroup } from "@babylonjs/lite";

// Time stands still, so currentTime looks frozen; the clip still writes its pose every frame.
export function freezeForPosing(group: AnimationGroup): () => void {
    const speed = group.speedRatio;
    group.speedRatio = 0;
    return () => {
        group.speedRatio = speed;
    };
}
