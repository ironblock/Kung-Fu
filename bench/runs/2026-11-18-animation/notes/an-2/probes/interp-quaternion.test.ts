import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

const s = Math.SQRT1_2;

test("a path named rotationQuaternion, or ending in .rotationQuaternion, is slerped as a quaternion without quaternion: true", () => {
    const keys = [
        { time: 0, value: [0, 0, 0, 1] },
        { time: 1, value: [0, 1, 0, 0] },
    ];
    const clip = createPropertyAnimationClip("c", [
        { path: "rotationQuaternion", keys },
        { path: "node.rotationQuaternion", keys },
        { path: "q", keys },
        { path: "r", keys, quaternion: true },
    ]);
    expect(clip.tracks.map((t) => t.quaternion)).toEqual([true, true, false, true]);
    const v = () => ({ x: 0, y: 0, z: 0, w: 0 });
    const target = { rotationQuaternion: v(), node: { rotationQuaternion: v() }, q: v(), r: v() };
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 30); // 0.5 s at 60 fps
    expect(target.rotationQuaternion.y).toBeCloseTo(s, 6);
    expect(target.rotationQuaternion.w).toBeCloseTo(s, 6);
    expect(target.node.rotationQuaternion.y).toBeCloseTo(s, 6);
    expect(target.r.y).toBeCloseTo(s, 6);
    // a plain size-4 track lerps each component
    expect(target.q.y).toBeCloseTo(0.5, 6);
    expect(target.q.w).toBeCloseTo(0.5, 6);
});

test("quaternion keys take the short way: a key with negative dot product is flipped", () => {
    const clip = createPropertyAnimationClip("c", [
        {
            path: "rotationQuaternion",
            keys: [
                { time: 0, value: [0, 0, 0, 1] },
                { time: 1, value: [0, -s, 0, -s] },
            ],
        },
    ]);
    const target = { rotationQuaternion: { x: 0, y: 0, z: 0, w: 0 } };
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 30);
    // same result as slerp from identity to (0, s, 0, s): a 45 degree turn
    expect(target.rotationQuaternion.y).toBeCloseTo(Math.sin(Math.PI / 8), 5);
    expect(target.rotationQuaternion.w).toBeCloseTo(Math.cos(Math.PI / 8), 5);
});
