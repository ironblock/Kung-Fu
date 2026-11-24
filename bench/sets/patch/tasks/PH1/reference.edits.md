EDIT: app/src/manifest.ts
```
<<<<<<< SEARCH
headcountOn(legIndex: number): number {
=======
/** Who comes aboard and who goes ashore before a leg. */
    changesAt(legIndex: number): { on: Person[]; off: Person[] } {
        const now = this.aboardOn(legIndex);
        if (legIndex === 0) {
            return { on: now, off: [] };
        }
        const before = this.aboardOn(legIndex - 1);
        return {
            on: now.filter((p) => !before.some((q) => q.id === p.id)),
            off: before.filter((p) => !now.some((q) => q.id === p.id)),
        };
    }

    headcountOn(legIndex: number): number {
>>>>>>> REPLACE
```
