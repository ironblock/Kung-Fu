I'm working on a small app in /home/dev/0113be/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A free replacement pack must not make a part cheaper

When a supplier replaces faulty packs free of charge, we book the delivery with a pack price of 0. At the moment that drags the part's average price down, and the next jobs are charged too little for it.

Please change `PartsStore.receive` in `src/parts.ts` so that a delivery with a pack price of 0 leaves the part's average price exactly as it was, whether or not there is any of the part on the shelf.

Everything else about such a delivery stays as it is now: the units go on the shelf, the day of the last delivery is set, the movement is logged with a unit price of 0, and the units added are returned. A delivery that is refused now is still refused. A delivery with any price above 0 is averaged in as it is now, over all the units on the shelf.

Please keep every change inside /home/dev/0113be/app.
