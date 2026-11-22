I'm working on a small app in /home/dev/618fcb/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Let the store screen ask for only the latest movements

The store screen shows a part's history, and for a busy part the list is far too long. Please change `PartsStore.history` in `src/parts.ts` to take an optional second parameter, `limit`, a whole number of 1 or more.

With a limit, it returns no more than that many of the part's movements: the ones the store recorded last. They come in the same order, one against another, as the method returns them now, and each is still a copy. "Recorded last" goes by when the store logged the movement, not by its day number: a delivery note or a count sheet is sometimes booked a few days late.

Without a limit, or when the part has no more movements than the limit, it returns exactly what it returns now.

Please keep every change inside /home/dev/618fcb/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/parts.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
