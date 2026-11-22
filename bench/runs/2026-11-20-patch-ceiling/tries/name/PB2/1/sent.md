I'm working on a small app in /home/dev/1fa748/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Drop the slivers a closure leaves behind

When the lock is taken out of use for part of a window, `closeFor` in `src/tides.ts` keeps whatever is left of that window on either side. Sometimes what is left is too short for a boat to lock through, and it only clutters the day's list.

Please change it so that a piece left over from a window the closure cuts is kept only when it is at least 12 minutes long, which is the time one locking takes. A shorter piece is dropped, and its minutes are added to the number the function returns, since they are lost as well. A piece of exactly 12 minutes stays.

A window the closure does not touch is left as it is, however short it may be. Everything else about the function stays as it is now.

Please keep every change inside /home/dev/1fa748/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/tides.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
