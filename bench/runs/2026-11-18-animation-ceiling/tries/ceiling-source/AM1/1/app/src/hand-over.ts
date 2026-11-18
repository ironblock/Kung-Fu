import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

interface Handover {
    readonly from: AnimationGroup;
    readonly to: AnimationGroup;
    readonly durationMs: number;
    elapsedMs: number;
    /** False until the first manager step after the call; that step shows `from` alone. */
    started: boolean;
}

interface ManagerState {
    active: Handover[];
    prior: AnimationManager["_preUpdate"];
    running: boolean;
}

const states = new WeakMap<AnimationManager, ManagerState>();

function preUpdate(manager: AnimationManager, deltaMs: number): void {
    const state = states.get(manager);
    if (!state || state.running) {
        return;
    }
    state.running = true;
    try {
        // Run any hook that was installed before ours (e.g. the library's weight fades).
        state.prior?.(manager, deltaMs);
        const step = Math.max(0, deltaMs);
        for (let i = state.active.length - 1; i >= 0; i--) {
            const h = state.active[i]!;
            if (!h.started) {
                // First frame after the call: weights were set at call time, show `from` alone.
                h.started = true;
                continue;
            }
            h.elapsedMs = Math.min(h.durationMs, h.elapsedMs + step);
            if (h.elapsedMs >= h.durationMs) {
                h.to.weight = 1;
                h.from.weight = 0;
                state.active.splice(i, 1);
            } else {
                const t = h.elapsedMs / h.durationMs;
                h.to.weight = t;
                h.from.weight = 1 - t;
            }
        }
    } finally {
        state.running = false;
    }
}

function getState(manager: AnimationManager): ManagerState {
    let state = states.get(manager);
    if (!state) {
        state = { active: [], prior: undefined, running: false };
        states.set(manager, state);
    }
    if (manager._preUpdate !== preUpdate) {
        // Preserve any pre-existing hook so both run each tick.
        state.prior = manager._preUpdate;
        manager._preUpdate = preUpdate;
    }
    return state;
}

/**
 * Passes the object from `from` to `to` over `durationMs`. The next manager step shows `from`
 * alone; afterwards the share of `to` grows linearly with elapsed time and the two weights always
 * sum to 1; once `durationMs` has elapsed `to` is shown alone. Both groups keep playing and stay
 * on the manager. Calling again (also the other way round) replaces any hand-over in progress.
 */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    if (from === to) {
        throw new Error("handOver requires two different animation groups");
    }
    if (!(durationMs > 0) || !Number.isFinite(durationMs)) {
        throw new Error(`handOver duration must be a finite positive number, got ${durationMs}`);
    }

    const state = getState(manager);

    // Cancel earlier hand-overs that involve either group. Any other group taking part in them
    // is dropped to weight 0, since the new hand-over shows `from` alone.
    for (let i = state.active.length - 1; i >= 0; i--) {
        const h = state.active[i]!;
        if (h.from === from || h.from === to || h.to === from || h.to === to) {
            for (const g of [h.from, h.to]) {
                if (g !== from && g !== to) {
                    g.weight = 0;
                }
            }
            state.active.splice(i, 1);
        }
    }

    // `to` must be running to be seen (a fresh glTF group may still be stopped).
    if (!to.isPlaying || to._stopped) {
        to.isPlaying = true;
        to._stopped = false;
    }

    from.weight = 1;
    to.weight = 0;
    state.active.push({ from, to, durationMs, elapsedMs: 0, started: false });
}
