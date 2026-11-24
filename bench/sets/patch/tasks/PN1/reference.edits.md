EDIT: app/src/parts.ts
```
<<<<<<< SEARCH
avgPence(partNo: string): number {
=======
shortfall(partNo: string, units: number, jobId: string): number {
        const reach = this.freeOf(partNo) + this.heldFor(partNo, jobId);
        return Math.max(0, units - reach);
    }

    avgPence(partNo: string): number {
>>>>>>> REPLACE
```
