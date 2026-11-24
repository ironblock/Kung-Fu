EDIT: app/src/worklog.ts
```
<<<<<<< SEARCH
boatSummary(boatId: string): BoatSummary {
=======
partsBySku(): Map<string, number> {
        const out = new Map<string, number>();
        for (const job of this.jobs.values()) {
            if (job.state === "dropped") {
                continue;
            }
            for (const line of job.parts) {
                out.set(line.sku, (out.get(line.sku) ?? 0) + line.qty);
            }
        }
        return out;
    }

    boatSummary(boatId: string): BoatSummary {
>>>>>>> REPLACE
```
