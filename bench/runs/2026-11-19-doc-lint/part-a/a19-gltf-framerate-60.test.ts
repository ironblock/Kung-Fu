// a-19, line 49: "readonly frameRate?: number; // defaults to 60 for glTF clips"
// A clip with no frameRate gives a group whose frameRate is 60, and goToFrame uses it.
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

test("a glTF clip with no frameRate plays at 60 frames per second", () => {
    const { data: d } = data([moveClip()]);
    const [g] = createAnimationGroups(d);
    expect(g!.frameRate).toBe(60);
    goToFrame(g!, 30);
    expect(g!.currentTime).toBeCloseTo(0.5, 6);
});
