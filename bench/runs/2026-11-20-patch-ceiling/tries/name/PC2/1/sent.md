I'm working on a small app in /home/dev/0ddafd/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Take the admin fee before the refund rate

When a customer cancels, `refundDue` in `src/tariff.ts` takes what they have paid, works out the part of it that their notice earns back, and then takes the admin fee off that part. I want the fee taken first.

Please change `refundDue` so that the admin fee comes off what was paid, and the part earned back is then worked out on what is left. So a customer who has paid 40000 pence, whose fee is 2500 and who earns half back, gets half of 37500, which is 18750. Today they get 17500. The fee itself is worked out as it is now, and a part of a penny is dropped as it is now.

The rest stays as it is. A refund too small to send is still not sent, and that is judged on the amount that would go back.

Please keep every change inside /home/dev/0ddafd/app.

You cannot open files or run anything from where you are. All you have of the file is its path: app/src/tariff.ts.

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
