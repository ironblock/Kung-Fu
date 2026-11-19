// A hand-cranked requestAnimationFrame for Node. Not a probe itself.
export function withRaf(body: (frame: (now: number) => void) => void): void {
    const queue: ((now: number) => void)[] = [];
    const g = globalThis as Record<string, unknown>;
    g.requestAnimationFrame = (cb: (now: number) => void): number => {
        queue.push(cb);
        return queue.length;
    };
    g.cancelAnimationFrame = (): void => {};
    try {
        body((now) => queue.shift()!(now));
    } finally {
        delete g.requestAnimationFrame;
        delete g.cancelAnimationFrame;
    }
}
