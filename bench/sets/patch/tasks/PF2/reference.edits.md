EDIT: app/src/worklog.ts
```
<<<<<<< SEARCH
        if (to === "signed" && job.history.some((m) => m.to === "done" && m.by === by)) {
=======
        if (to === "signed" && job.history.find((m) => m.to === "done")?.by === by) {
>>>>>>> REPLACE
```
