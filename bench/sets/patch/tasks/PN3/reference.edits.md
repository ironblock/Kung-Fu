EDIT: app/src/parts.ts
```
<<<<<<< SEARCH
    history(partNo: string): Movement[] {
=======
    history(partNo: string, limit?: number): Movement[] {
>>>>>>> REPLACE
```

EDIT: app/src/parts.ts
```
<<<<<<< SEARCH
        return this.moves.filter((m) => m.partNo === key).map((m) => ({ ...m }));
=======
        return this.moves.filter((m) => m.partNo === key).slice(0, limit).map((m) => ({ ...m }));
>>>>>>> REPLACE
```
