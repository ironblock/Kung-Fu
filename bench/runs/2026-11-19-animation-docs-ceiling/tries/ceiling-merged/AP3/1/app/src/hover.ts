import {
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    type AnimationManager,
} from "@babylonjs/lite";

const BOB_HEIGHT = 0.5;

export function startHover(
    manager: AnimationManager,
    node: { position: { y: number } },
): (strength: number) => void {
    const rest = node.position.y;
    let strength = 1;
    let raw = 0;

    // The animation drives `h` (0..0.5 bob); the setter maps it to the node,
    // scaled by the current strength, so strength changes never restart the bob.
    const driver = {
        get h(): number {
            return raw;
        },
        set h(value: number) {
            raw = value;
            node.position.y = rest + strength * value;
        },
    };

    const clip = createPropertyAnimationClip("hover", [
        {
            path: "h",
            keys: [
                { time: 0, value: 0 },
                { time: 0.5, value: BOB_HEIGHT },
                { time: 1, value: 0 },
            ],
        },
    ]);

    // Plays at once and loops by default.
    createPropertyAnimationGroup(manager, driver, clip);

    return (s: number) => {
        strength = Number.isFinite(s) ? Math.min(1, Math.max(0, s)) : 0;
    };
}
