// c-102. Lines 714-716: "Structural rest poses are captured by value (including cloned vector/quaternion values), so
// repeated partial-weight blends cannot mutate their own baseline."
// Compat package. Checked: a structural group of weight 0.5 holding position (10, 10, 10) on a Vector3 that starts at
// (0, 0, 0). Each blend writes 0.5*10 + 0.5*rest = 5; after several frames it is still 5 (a baseline held by reference
// would drift toward 10).
import { anim, AnimationGroup, AnimationTypes, frame, makeScene, Vector3 } from "./_compat";

test("baseline is a copy", () => {
    const scene = makeScene();
    const target = { position: new Vector3(0, 0, 0) };
    const group = new AnimationGroup("g", scene);
    group.addTargetedAnimation(anim("position", [{ frame: 0, value: new Vector3(10, 10, 10) }, { frame: 10, value: new Vector3(10, 10, 10) }], 10, AnimationTypes.ANIMATIONTYPE_VECTOR3), target);
    group.weight = 0.5;
    group.start(true);
    for (let i = 0; i < 4; i++) {
        frame(scene, 100);
        expect(target.position.x).toBeCloseTo(5, 5);
    }
});
