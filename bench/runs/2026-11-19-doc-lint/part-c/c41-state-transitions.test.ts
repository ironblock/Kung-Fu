// c-41. Lines 603-607 (diagram): STOPPED (t=0) --play()--> PLAYING --pause()--> PAUSED --play()--> PLAYING
// --stop()--> STOPPED.
// The public calls are playAnimation, pauseAnimation and stopAnimation (the doc's own map, lines 631-633).
// Checked on a glTF group that starts stopped (the second clip of an asset): each call moves it to the state the
// diagram names, time is kept across pause/play, and stop returns time to 0.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, rest } from "./_fx";

test("play, pause, play, stop", () => {
    const node = nodeRecorder();
    const [, group] = createAnimationGroups(gltf([moveClip("a", 0, 1), moveClip("b", 0, 10)], [rest()], { targets: [node] }));
    const g = group!;
    const manager = createAnimationManager();
    addAnimationGroup(manager, g);
    expect([g.isPlaying, g.currentTime]).toEqual([false, 0]);
    playAnimation(g);
    expect(g.isPlaying).toBe(true);
    updateAnimationManager(manager, 250);
    pauseAnimation(g);
    expect(g.isPlaying).toBe(false);
    updateAnimationManager(manager, 250);
    expect(g.currentTime).toBe(0.25);
    playAnimation(g);
    updateAnimationManager(manager, 250);
    expect(g.currentTime).toBe(0.5);
    stopAnimation(g);
    expect([g.isPlaying, g.currentTime]).toEqual([false, 0]);
});
