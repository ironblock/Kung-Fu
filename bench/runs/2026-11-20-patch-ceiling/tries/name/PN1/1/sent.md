I'm working on a small app in /home/dev/2cd48e/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Say how many units short a job would be

I want to ask the store how far short a job is. Please add a method to the class PartsStore in `src/parts.ts`:

```ts
shortfall(partNo: string, units: number, jobId: string): number
```

A job can draw a part from the free stock and from what is set aside for that same job. Units set aside for other jobs are out of its reach. The method returns how many of the `units` asked for are beyond the job's reach, and 0 when it could have them all. For a part the store does not have, it returns `units`. `units` is always a whole number of 1 or more.

The class has `PartsStore.freeOf`, a part's free stock (units on the shelf, less all that is set aside for any job), and `PartsStore.heldFor`, what one job has set aside of one part. Both take a part number in any letter case. `shortfall` must take any case too, and change nothing in the store.

Please keep every change inside /home/dev/2cd48e/app.

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
