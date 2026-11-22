I'm working on a small app in /home/dev/0b0a99/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Take the admin fee before the refund rate

When a customer cancels, `refundDue` in `src/tariff.ts` takes what they have paid, works out the part of it that their notice earns back, and then takes the admin fee off that part. I want the fee taken first.

Please change `refundDue` so that the admin fee comes off what was paid, and the part earned back is then worked out on what is left. So a customer who has paid 40000 pence, whose fee is 2500 and who earns half back, gets half of 37500, which is 18750. Today they get 17500. The fee itself is worked out as it is now, and a part of a penny is dropped as it is now.

The rest stays as it is. A refund too small to send is still not sent, and that is judged on the amount that would go back.

Please keep every change inside /home/dev/0b0a99/app.
