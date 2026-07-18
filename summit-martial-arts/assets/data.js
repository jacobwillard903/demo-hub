/* Summit demo shared data. Demo data, illustrative numbers. All names fictional. */
window.SUMMIT = {
  academy: "Summit Martial Arts Academy",
  owner: "ray@summitmartialarts.com",
  kpis: {
    activeStudents: 180,
    mrr: 24900,
    churnNow: 3.1,
    churnBaseline: 5.4,
    trialClose: 46,
    leadResponse: "2m 40s",
    introConversion: 64,
    introBaseline: 38
  },
  funnel: [
    { label: "New leads", n: 42 },
    { label: "Contacted under 5 min", n: 31 },
    { label: "Trials booked", n: 24 },
    { label: "Showed for trial", n: 19 },
    { label: "Joined", n: 11 }
  ],
  // live AI text feed on the trials page (rendered by app.js so timestamps feel fresh)
  aiFeed: [
    {
      who: "Marcus T.", tag: "New lead, 6:12 PM web form", minsAgo: 3,
      msgs: [
        { from: "ai", text: "Hey Marcus! Coach Ray has a spot in Beginner Fundamentals tonight at 6:30. Want me to save it for you? First class is on us." },
        { from: "reply", text: "Whoa that was fast. Yes, tonight works" },
        { from: "ai", text: "Done, you are on the mat at 6:30. Wear comfortable clothes, we handle the rest. Address: 9140 W 135th St, Overland Park." }
      ]
    },
    {
      who: "Dana W. (mom of Ellie, 6)", tag: "Little Dragons inquiry", minsAgo: 22,
      msgs: [
        { from: "ai", text: "Hi Dana! Ellie is the perfect age for Little Dragons (ages 4 to 6). Our intro is 2 weeks plus a uniform for $49. Saturday 9 AM or Tuesday 5 PM work best for a first visit?" },
        { from: "reply", text: "Saturday please!" }
      ]
    },
    {
      who: "Kevin O.", tag: "Adult BJJ inquiry, missed call", minsAgo: 51,
      msgs: [
        { from: "ai", text: "Hey Kevin, sorry we missed your call. We run gi and no-gi BJJ six days a week plus Saturday open mat. Want to try a class this week? I can text you the schedule." }
      ]
    },
    {
      who: "Priya S.", tag: "Day 9 of intro, visit nudge", minsAgo: 84,
      msgs: [
        { from: "ai", text: "Hi Priya! You have 5 days left on your intro and you are 4 classes in. Aiming for 2 more this week keeps you on pace. Thursday 6:30 or Saturday 10?" }
      ]
    }
  ],
  // drawer timelines per page (name gets substituted in)
  timelines: {
    "app-dashboard": [
      { t: "Today 7:05 AM", txt: "Nightly sync pulled attendance and rank data from Kicksite for {name}.", hot: false },
      { t: "Yesterday", txt: "Record reviewed by the radar run. No action needed beyond what is queued.", hot: false },
      { t: "This week", txt: "Included in the weekly owner digest emailed to Coach Ray on Monday.", hot: true }
    ],
    "app-trials": [
      { t: "Day 1", txt: "{name} bought the 2 Weeks + Uniform intro. Welcome text sent within 3 minutes.", hot: true },
      { t: "Day 3", txt: "First-class recap sent to the family, next best classes suggested.", hot: false },
      { t: "This week", txt: "Visit pace checked nightly against the 6-class target.", hot: false },
      { t: "Queued", txt: "Next touch queued automatically. Coach Ray can override with one tap.", hot: true }
    ],
    "app-belttest": [
      { t: "Nightly", txt: "Attendance, time at rank, and curriculum for {name} checked against the testing rubric.", hot: false },
      { t: "Monday 9:00 AM", txt: "Parent invite email sent with date, time, and the $45 fee link.", hot: true },
      { t: "Wednesday", txt: "Certificate generated with name and new rank, in the Friday print batch.", hot: false },
      { t: "Saturday 10:30 AM", txt: "On the grading roster with a judging sheet, grouped by belt.", hot: true }
    ],
    "app-retention": [
      { t: "Nightly", txt: "Attendance pattern for {name} compared against their own usual pace.", hot: false },
      { t: "Flagged", txt: "Attendance drifted off pattern, so a warm personal check-in went out by text.", hot: true },
      { t: "Ongoing", txt: "Replies land here and in Coach Ray's daily digest. Pauses are offered before cancels.", hot: false }
    ],
    "app-money": [
      { t: "Every few minutes", txt: "Synced from QuickBooks Online. This line always ties to the books.", hot: false },
      { t: "Daily", txt: "Transactions behind this line categorized and matched to bank deposits.", hot: true },
      { t: "Aug 1", txt: "Rolled into the plain-language monthly P&L email for Coach Ray.", hot: false }
    ]
  },
  // canned Ask bank. k = keywords for matching, a = answer HTML
  ask: [
    {
      q: "Who is eligible to test Saturday?",
      k: ["eligible", "test", "testing", "saturday", "grading", "belt"],
      a: "<b>12 students are eligible for Saturday, July 25.</b> The radar checks attendance, time at rank, and curriculum nightly. Standouts: Liam K. (yellow to orange, 34 classes, curriculum 8 of 8), Diego R. (orange to green, 41 classes), and Nathan F. (blue to purple, 6.8 months at rank). All 12 parent invites are out, 10 of 12 fees are paid, and the roster, judging sheets, and certificates are already built."
    },
    {
      q: "Which intros are about to expire?",
      k: ["intro", "expire", "expiring", "offer", "trial", "risk"],
      a: "<b>3 intros need attention.</b> Jordan P. is on day 11 of 14 with 3 of 6 visits, decision text queued tonight. Grace L. is on day 13 with 5 of 6 visits, join offer with a rate lock already sent. Ben H. is on day 12 with only 2 visits, so he gets a personal coach-call offer at 7:00 PM. Nobody expires silently anymore."
    },
    {
      q: "How many members did we save this month?",
      k: ["save", "saves", "saved", "churn", "cancel", "kept", "retention"],
      a: "<b>7 members kept this month:</b> 4 took a pause instead of cancelling and 3 came back from win-backs. That is <b>$1,004 a month in tuition protected</b>, and 67% of paused members return to the mat. Monthly churn now reads 3.1%, down from 5.4% before the radar."
    },
    {
      q: "What happened with the failed autopays?",
      k: ["autopay", "autopays", "failed", "payment", "card", "recover", "recovered", "past due"],
      a: "<b>6 autopays failed on the July 1 run, $922 at risk.</b> Auto-retry plus a friendly card-update text recovered 5 of them, $769, by July 4. One is still open: the Hansen family at $153, with a warm second reminder queued for Friday. Nothing sat unnoticed at the front desk."
    },
    {
      q: "What is MRR by program?",
      k: ["mrr", "revenue", "tuition", "program", "monthly", "recurring"],
      a: "<b>MRR is $24,900 across 180 students:</b> Kids Karate $10,000 (72 students), Teen/Adult Karate $5,100 (34), Little Dragons $4,900 (38), Adult BJJ $4,450 (28), plus $450 in multi-program add-ons. On top of that, July has $540 in testing fees, $441 in intro offers, and $1,180 in pro shop retail."
    },
    {
      q: "What did the assistant do last night?",
      k: ["last night", "tonight", "overnight", "assistant do", "did the", "yesterday"],
      a: "Overnight it <b>answered Kevin O.'s missed call about Adult BJJ</b>, queued Ben H.'s coach-call offer for 7:00 PM, ran the nightly eligibility check (Isabella V. crossed the line for Saturday), paced 6 students approaching test eligibility, and categorized 9 new transactions in QuickBooks. Coach Ray slept through all of it."
    },
    {
      q: "Who is at risk of quitting?",
      k: ["quit", "quitting", "at risk", "quiet", "missing", "drift"],
      a: "<b>4 students are off their usual pattern.</b> Sofia R. (11 days quiet, turned out to be a sprained ankle, billing paused and her spot held), Tyler B. (finals week, coming Thursday), Hannah W. (8 days, open mat invite sent), and Cole N. (work travel, took a 30 day hold instead of cancelling). Half of new members quit inside 6 months at most schools. These four were caught at day 10, not day 40."
    },
    {
      q: "How fast are we answering leads?",
      k: ["lead", "leads", "response", "answer", "speed", "fast"],
      a: "Average first response is <b>2 minutes 40 seconds</b>. Last 30 days: 42 leads, 31 contacted in under 5 minutes, 24 trials booked, 19 showed, 11 joined. The industry average response is about 47 hours, and 5 minute responders connect at roughly 100x the rate."
    },
    {
      q: "How is the month going financially?",
      k: ["profit", "net", "month", "financial", "books", "expenses", "cash"],
      a: "July to date: <b>$27,061 in, $14,259 out, $12,802 net</b> at a 47% margin. Cash on hand is $38,400, about 2.7 months of expenses. Only $243 is past due across the whole academy, and the books are synced with QuickBooks every few minutes."
    },
    {
      q: "Are parents actually reading the progress notes?",
      k: ["parent", "parents", "pulse", "note", "notes", "progress", "email"],
      a: "Yes. The July 1 Parent Pulse run sent <b>124 personal progress notes</b>, one per family, written from each student's real attendance and rank data. 109 were opened and 31 parents replied with a thank you. Visible progress between belt tests is a big reason churn fell to 3.1%."
    }
  ]
};
