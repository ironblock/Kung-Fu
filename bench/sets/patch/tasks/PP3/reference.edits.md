EDIT: app/src/notices.ts
```
<<<<<<< SEARCH
    due(now: number, limit = 0): Notice[] {
=======
    due(now: number, limit = 0): Notice[] {
        if (isQuiet(this.quiet, minOf(now))) {
            return [];
        }
>>>>>>> REPLACE
```
