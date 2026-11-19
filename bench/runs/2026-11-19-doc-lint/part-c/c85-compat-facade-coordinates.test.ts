// c-85. Lines 668-671: "The returned composite `Animatable` coordinates seek, pause, restart, stop, speed, looping, and
// completion while Babylon Lite owns frame advancement, segment selection, easing, interpolation, and property writes
// for every delegated track."
// Compat package. Checked on a delegated float track (frames 0..10 at 10 fps, eased by g*g): each Animatable call acts
// on the Lite group, and the values written are Lite's (time from the Lite group, eased sample).
import { frame, makeScene, ramp, square } from "./_compat";

test("facade drives the Lite group", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const a = ramp();
    a.setEasingFunction(square);
    const animatable = scene.beginDirectAnimation(target, [a], 0, 10, true);
    const lite = animatable._lite!;
    frame(scene, 500);
    expect(lite.currentTime).toBeCloseTo(0.5, 6);
    expect(target.v).toBeCloseTo(2.5, 5);
    animatable.goToFrame(2);
    expect(lite.currentTime).toBeCloseTo(0.2, 6);
    expect(target.v).toBeCloseTo(0.4, 5);
    animatable.pause();
    frame(scene, 300);
    expect(lite.currentTime).toBeCloseTo(0.2, 6);
    animatable.restart();
    frame(scene, 300);
    expect(lite.currentTime).toBeCloseTo(0.5, 6);
    animatable.speedRatio = 2;
    expect(lite.speedRatio).toBe(2);
    frame(scene, 100);
    expect(lite.currentTime).toBeCloseTo(0.7, 6);
    frame(scene, 200);
    expect(lite.currentTime).toBeCloseTo(0.1, 6);
    let ended = 0;
    animatable.onAnimationEnd = () => void ended++;
    animatable.stop();
    expect(ended).toBe(1);
    expect(lite.isPlaying).toBe(false);
    frame(scene, 300);
    expect(lite.currentTime).toBe(0);

    const once = { v: -1 };
    let done = 0;
    const finite = scene.beginDirectAnimation(once, [ramp()], 0, 10, false, 1, () => void done++);
    frame(scene, 600);
    expect(done).toBe(0);
    frame(scene, 600);
    expect(done).toBe(1);
    expect(once.v).toBe(10);
    expect(finite._lite!._stopped).toBe(true);
});
