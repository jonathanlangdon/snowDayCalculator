# AdSense setup for Snow Day Michigan

The page is ready for two responsive horizontal ad units. Until real AdSense
IDs are added, no ad request is made in production. Local previews show labeled
placeholders so you can verify the layout.

## 1. Prepare the site

Before requesting review:

- Publish the site at `https://snowdaymichigan.com` and make sure the calculator,
  privacy page, navigation, and mobile layout work.
- Keep the privacy policy accurate. Google requires it to disclose advertising
  cookies once AdSense code is present.
- Add useful original content if the site is still only a single short tool.
  AdSense reviews the entire site and may reject sites with too little publisher
  content.
- Do not click live ads on your own site, including while testing.

## 2. Create and connect the AdSense account

1. Go to <https://adsense.google.com/start/> and sign in.
2. Enter `https://snowdaymichigan.com` as your site.
3. Select your real payment country carefully; Google does not let you change it
   later.
4. Accept the terms and complete the payment-address details.
5. In AdSense, open **Sites**, add the domain if needed, and choose a connection
   method.
6. Copy the publisher ID. It has the form `ca-pub-1234567890123456`.
7. Put that ID in `adsense-config.js`. For initial site verification, also copy
   Google's exact verification meta tag into the `<head>` of `index.html`:

   ```html
   <meta name="google-adsense-account" content="ca-pub-1234567890123456" />
   ```

8. Deploy, click **Verify**, and then **Request review**. Reviews usually take a
   few days but can take two to four weeks.

## 3. Create the two banner units

After the account and site are approved:

1. In AdSense, go to **Ads** > **By ad unit** > **Display ads**.
2. Create a responsive unit named `Home top banner`.
3. Create a second responsive unit named `Home bottom banner`.
4. Copy each numeric `data-ad-slot` value from the generated code.
5. Update `adsense-config.js`:

   ```js
   export const adsenseConfig = Object.freeze({
     publisherId: 'ca-pub-1234567890123456',
     adSlots: Object.freeze({
       top: '1111111111',
       bottom: '2222222222'
     })
   });
   ```

6. Deploy and test on phone and desktop. Blank ad space can be normal while new
   units begin serving; never click an ad to test it.

## 4. Add ads.txt

When AdSense shows your authorized-seller line, create `/ads.txt` at the site
root using the exact line supplied in your account. It normally resembles:

```text
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

Do not publish the example ID.

## 5. Configure privacy messages

In **Privacy & messaging**, configure Google's consent message. A Google-certified
consent management platform is required for personalized ads served in the EEA,
UK, and Switzerland. Review the privacy page whenever your data practices change.

## About the requested video pop-up

Do not put a normal AdSense display unit in `calculationModal`. AdSense prohibits
ads in pop-ups, and ordinary vignette ads are controlled by Google and must be
immediately skippable.

A video-for-result experience requires Google Ad Manager rewarded inventory, not
the two AdSense display units. Rewarded ads must have a clear prompt before every
ad, require an affirmative opt-in, allow the user to decline or dismiss without
blocking normal site use, and grant the result only from Google's
`rewardedSlotGranted` event. Ad demand may be video or display, and an ad is not
guaranteed to fill. The five-second progress dialog in this project is therefore
calculation UI only; its reserved rewarded-ad section stays hidden.
