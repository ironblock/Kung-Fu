I'm working on a small app in /home/dev/de991b/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Count the standing findings by severity

I need a tally for the footer of the survey sheet. Please add this function to `src/survey.ts`:

```ts
export function openBySeverity(findings: Finding[]): Record<Severity, number>
```

It counts the findings that are not waived, each under its own severity. The result has the four severities as its keys, and no other key, with 0 for a severity that no such finding has. It must leave the array, and the findings in it, as they were.

Please keep every change inside /home/dev/de991b/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/survey.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
