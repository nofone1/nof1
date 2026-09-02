# App Store Connect privacy answers

Use this as the source of truth when completing the App Privacy questionnaire.
Reconfirm it against the production Clerk, Convex, RevenueCat, and Apple
configuration before attesting in App Store Connect.

Nof1 does **not** track users across apps or websites and does not use data for
third-party advertising, developer advertising, or marketing.

Declare these data types as collected, linked to the user, not used for
tracking, and used for **App Functionality**:

| App Store category | Nof1 use |
| --- | --- |
| Name | Account display and support |
| Email Address | Authentication, verification, recovery, and support |
| User ID | Account, sync, access control, and subscription entitlement |
| Health | User-entered mood, energy, sleep, stress, soreness, intervention, and experiment records |
| Fitness | User-entered exercise or routine records when the user chooses to enter them |
| Other User Content | Hypotheses, notes, names, schedules, and other free-form entries |
| Purchase History | Subscription product, status, and entitlement supplied by Apple/RevenueCat |

Do not declare Payment Information: Apple handles the payment method and Nof1
does not receive card or bank details. Diagnostic logs stay on device unless the
user deliberately chooses **Export Diagnostic Logs** and shares them with
support; re-evaluate the Diagnostic Data answer if automatic crash reporting or
remote logging is added later.

The matching native privacy manifest is defined in `app.json`, and the public
policy is in `site/privacy/index.md`.
