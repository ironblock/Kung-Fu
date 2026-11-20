// Shared by the checks of this set. Each module's own helpers are in helpers-<module>.ts beside this file.

/** A deep copy that shares nothing with its source, so a check can tell whether an argument was changed. */
export function copyOf<T>(value: T): T {
    return structuredClone(value);
}
