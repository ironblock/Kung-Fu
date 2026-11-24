EDIT: app/src/notices.ts
```
<<<<<<< SEARCH
        const name = template.slice(at + 1, close).trim();
        if (Object.hasOwn(fields, name)) {
            text += fields[name];
        } else {
=======
        const inner = template.slice(at + 1, close);
        const bar = inner.indexOf("|");
        const name = (bar < 0 ? inner : inner.slice(0, bar)).trim();
        if (Object.hasOwn(fields, name)) {
            text += fields[name];
        } else if (bar >= 0) {
            text += inner.slice(bar + 1);
        } else {
>>>>>>> REPLACE
```
