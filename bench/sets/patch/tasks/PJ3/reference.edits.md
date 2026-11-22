EDIT: app/src/keys.ts
```
<<<<<<< SEARCH
    if (!line) return 0;
    const accepted = Math.min(count, line.issued - line.back);
=======
    if (!line) return 0;
    // A return entered twice: the newest entry in the log is this same return.
    const last = loan.log[0];
    if (last && last.action === "back" && last.kind === kind && last.day === day && last.minute === minute) return 0;
    const accepted = Math.min(count, line.issued - line.back);
>>>>>>> REPLACE
```
