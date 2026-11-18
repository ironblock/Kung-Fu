import { playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";

export function freezeForPosing(group: AnimationGroup): () => void {
    // A paused glTF clip is still evaluated every frame and rewrites its pose.
    // Only a stopped clip leaves the nodes alone. Stopping rewinds currentTime,
    // so keep the moment and give it back on resume.
    const frozenAt = group.currentTime;
    stopAnimation(group);
    return () => {
        group.currentTime = frozenAt;
        playAnimation(group);
    };
}
