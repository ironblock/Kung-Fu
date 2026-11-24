# Say how many units short a job would be

I want to ask the store how far short a job is. Please add a method to the class PartsStore in `src/parts.ts`:

```ts
shortfall(partNo: string, units: number, jobId: string): number
```

A job can draw a part from the free stock and from what is set aside for that same job. Units set aside for other jobs are out of its reach. The method returns how many of the `units` asked for are beyond the job's reach, and 0 when it could have them all. For a part the store does not have, it returns `units`. `units` is always a whole number of 1 or more.

The class has `PartsStore.freeOf`, a part's free stock (units on the shelf, less all that is set aside for any job), and `PartsStore.heldFor`, what one job has set aside of one part. Both take a part number in any letter case. `shortfall` must take any case too, and change nothing in the store.
