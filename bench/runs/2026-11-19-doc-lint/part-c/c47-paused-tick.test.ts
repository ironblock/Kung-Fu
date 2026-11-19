// c-47. Line 618: "**PAUSED**: `group.isPlaying = false`. `tickAnimation()` still evaluates (ensures pose is current)
// but doesn't advance time."
// The state machine speaks of glTF groups (it uploads bone matrices and morph weights), so the probe uses one, through
// the manager: after pauseAnimation, isPlaying is false; an update keeps the time, writes the pose again (overwriting an
// outside change) and uploads the bones again.
// Not part of this check: a paused manual property group does not evaluate on update (see the notes' probe
// pause-writes-nothing).
import { addAnimationGroup, createAnimationGroups, createAnimationManager, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("paused: evaluates, does not advance", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()], { targets: [node], skeletons: [skeleton(0)] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 250);
    pauseAnimation(g!);
    expect(g!.isPlaying).toBe(false);
    node.p = [99, 0, 0];
    const uploads = rec.calls.length;
    updateAnimationManager(manager, 250);
    expect(g!.currentTime).toBe(0.25);
    expect(node.p[0]).toBeCloseTo(2.5, 5);
    expect(rec.calls.length).toBe(uploads + 1);
});
