// A small stand-in for the browser's `window`, set up before the answer is imported.
// An app like this runs in a browser, where there is a `window`. The grader runs in node, where there is none.
// It holds only what the answers have been seen to touch. Its animation frame never fires.
const g = globalThis as Record<string, unknown>;
if (typeof g.window === "undefined") {
    g.window = {
        addEventListener(): void {},
        removeEventListener(): void {},
        requestAnimationFrame(): number {
            return 0;
        },
        devicePixelRatio: 1,
    };
}
