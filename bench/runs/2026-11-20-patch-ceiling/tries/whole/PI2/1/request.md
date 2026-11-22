I'm working on a small app in /home/dev/fd28c5/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# No visits over lunch

The pump-out point now shuts for lunch every day, from 12:30 up to but not including 13:10. The file keeps times as minutes from midnight, so that is from 750 up to but not including 790.

Please change `nextStart` in `src/pumpout.ts` so that it never gives a start whose visit would overlap the lunch closure. A visit may end exactly at 12:30, and a visit may start exactly at 13:10. A visit that would run into lunch is not cut short or split in two: the answer is the next start at which the whole visit fits, which may be after lunch, or the usual answer when there is none left that day.

Visits that are already in the log are left alone, and they block a start just as they do now, even one that sits inside the lunch closure. Everything else about the function stays as it is.

Please keep every change inside /home/dev/fd28c5/app.
