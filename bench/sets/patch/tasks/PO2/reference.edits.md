EDIT: app/src/handover.ts
```
<<<<<<< SEARCH
    return Math.min(steps * LATE_STEP_PENCE, LATE_CAP_PENCE);
=======
    const counted = steps + Math.max(0, steps - 4);
    return Math.min(counted * LATE_STEP_PENCE, LATE_CAP_PENCE);
>>>>>>> REPLACE
```
