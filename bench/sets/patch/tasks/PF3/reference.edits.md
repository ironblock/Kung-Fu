EDIT: app/src/worklog.ts
```
<<<<<<< SEARCH
    return Math.max(0, at - job.dueDay);
=======
    return Math.max(0, (weekOf(at) - weekOf(job.dueDay)) / 7);
>>>>>>> REPLACE
```
