EDIT: app/src/stoppages.ts
```
<<<<<<< SEARCH
    // A notice issued again under its old reference replaces the old one and counts as new.
    const old = register.notices.findIndex((each) => each.ref === notice.ref);
    if (old !== -1) {
        register.notices.splice(old, 1);
    }
=======
    // A notice issued again under its old reference takes the old one's place: a correction does not overrule
    // the notices issued after the one it corrects.
    const old = register.notices.findIndex((each) => each.ref === notice.ref);
    if (old !== -1) {
        register.notices[old] = notice;
        return;
    }
>>>>>>> REPLACE
```
