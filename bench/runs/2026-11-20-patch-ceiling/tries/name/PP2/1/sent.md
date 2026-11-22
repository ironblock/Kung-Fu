I'm working on a small app in /home/dev/e46f7d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Let a template give a fallback for a field

In `src/notices.ts`, `fill` leaves a field it has no value for in the text as it was written, and lists it as missing. I want a template to say what to print instead.

A field may now be written with a bar, as in `{boat|your boat}`. The name is the part before the first bar, trimmed as a name is today. The fallback is everything after that bar, up to the closing brace. I want it kept exactly as written: it is not trimmed, it may be empty, and any bars or opening braces in it are text.

When `fields` has a value for the name, that value is used, as today, and an empty string is a value. When it has none, the fallback goes into the text, and the name is not listed in `missing`.

A field with no bar behaves as today. So do doubled braces outside a field, and a brace that is never closed.

Please keep every change inside /home/dev/e46f7d/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/notices.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
