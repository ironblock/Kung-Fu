// b-67. Lines 441-458: "Manual property animation, matching Babylon.js `beginDirectAnimation(target, [animation], from, to, loop)`:" and the code under it.
// The example is run as written, with `box` a plain object and a fake requestAnimationFrame.
// Babylon.js beginDirectAnimation(box, [xSlide], 0, 20, true) at 10 fps gives x = 2 at frame 0,
// 0 at frame 5, -2 at frame 10, 0 at frame 15, and wraps to 2 at frame 20.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, startAnimationManager, stopAnimationManager } from "@babylonjs/lite";
import { fakeRaf } from "./_fx";

test("the example plays x 2 -> -2 -> 2 over 2 s and loops", () => {
    const raf = fakeRaf();
    try {
        const box = { position: { x: 0 } };
        const manager = createAnimationManager();
        const clip = createPropertyAnimationClip("xSlide", [
            {
                path: "position.x",
                frameRate: 10,
                keys: [
                    { frame: 0, value: 2 },
                    { frame: 10, value: -2 },
                    { frame: 20, value: 2 },
                ],
            },
        ]);
        const group = createPropertyAnimationGroup(manager, box, clip, { fromFrame: 0, toFrame: 20, loop: true });
        startAnimationManager(manager);
        const seen: number[] = [];
        for (const now of [1000, 1500, 2000, 2500, 3000, 3500]) {
            raf.frame(now);
            seen.push(box.position.x);
        }
        expect(seen).toEqual([2, 0, -2, 0, 2, 0]);
        expect(group.isPlaying).toBe(true);
        stopAnimationManager(manager);
    } finally {
        raf.restore();
    }
});
