EDIT: app/src/manifest.ts
```
<<<<<<< SEARCH
        out.push(`Amendments: ${notes.length}`);
=======
        out.push(`Amendments: ${notes.length}`);
        out.push(`Latest: ${notes[0].text} (${notes[0].by})`);
>>>>>>> REPLACE
```
