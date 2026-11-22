EDIT: app/src/parts.ts
```
<<<<<<< SEARCH
        // the average of what is on the shelf and what has come in, to the nearest penny
        line.avgPence = Math.round((line.onHand * line.avgPence + packs * packPence) / (line.onHand + units));
=======
        if (packPence > 0) {
            // the average of what is on the shelf and what has come in, to the nearest penny
            line.avgPence = Math.round((line.onHand * line.avgPence + packs * packPence) / (line.onHand + units));
        }
>>>>>>> REPLACE
```
