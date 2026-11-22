EDIT: app/src/handover.ts
```
<<<<<<< SEARCH
checklist(side: Side): Checklist {
=======
blockers(): string[] {
        const side = this.openSide();
        if (side === undefined) return [];
        return outstanding(this.lists[side]).map((item) => item.code);
    }

    checklist(side: Side): Checklist {
>>>>>>> REPLACE
```
