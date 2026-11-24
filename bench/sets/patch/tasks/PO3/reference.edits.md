EDIT: app/src/handover.ts
```
<<<<<<< SEARCH
        lines.push(`events: ${this.events.length}`);
=======
        lines.push(`events: ${this.events.length}`);
        for (const event of this.events.slice(0, 3)) lines.push(describeEvent(event));
>>>>>>> REPLACE
```
