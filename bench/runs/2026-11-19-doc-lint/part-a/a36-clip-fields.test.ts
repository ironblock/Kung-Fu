// a-36, lines 125-130: "export interface PropertyAnimationClip {" with fields name, tracks, duration, frameRate
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("a property clip has name, tracks, duration and frameRate", () => {
    const clip = createPropertyAnimationClip("walk", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 3, value: 1 }] }], { frameRate: 24 });
    expect(clip.name).toBe("walk");
    expect(clip.tracks.length).toBe(1);
    expect(clip.duration).toBe(3);
    expect(clip.frameRate).toBe(24);
    expect(Object.keys(clip).sort()).toEqual(["duration", "frameRate", "name", "tracks"]);
});
