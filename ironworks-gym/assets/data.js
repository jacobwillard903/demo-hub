/* Ironworks Strength Co. - canonical demo numbers.
   Single source of truth so every page agrees. Fictional, illustrative. */
window.IW = {
  gym: {
    name: "Ironworks Strength Co.",
    city: "Springfield, MO",
    owner: "Sarah Voss",
    ownerEmail: "sarah@ironworksstrength.com",
    coaches: ["Tyler Brandt", "Jess Malone", "Cole Denning"],
    platform: "PushPress"
  },
  kpis: {
    mrr: 28300,
    activeMembers: 240,
    churnNow: 3.2,
    churnBefore: 5.1,
    recoveredThisMonth: 1240,
    failedRecovered: 11,
    failedTotal: 13,
    avgLeadResponseSec: 38,
    atRiskMembers: 6,
    retainedPerMonth: 687,
    savesThisMonth: 6,
    leadsThisMonth: 23,
    introsBooked: 9,
    trialConvBefore: 21,
    trialConvNow: 44
  },
  revenueByMonth: [
    { m: "Feb", v: 26100 },
    { m: "Mar", v: 26800 },
    { m: "Apr", v: 27200 },
    { m: "May", v: 27600 },
    { m: "Jun", v: 28000 },
    { m: "Jul", v: 28300 }
  ],
  money: {
    revenueMTD: 19870, expensesMTD: 12310, netMTD: 7560, marginMTD: 38.0,
    cashOnHand: 23400, arOutstanding: 294, avgDailyTake: 1104,
    june: {
      revenue: { dues: 28000, personalTraining: 3840, dropIns: 520, retail: 940, total: 33300 },
      expenses: { payroll: 11400, rent: 5600, processing: 940, equipment: 720,
                  utilities: 610, insurance: 460, software: 640, marketing: 380, total: 20750 },
      net: 12550, margin: 37.7
    },
    cashByWeek: [
      { w: "Jun 30 - Jul 6", inflow: 9420, outflow: 7180 },
      { w: "Jul 7 - 13", inflow: 6110, outflow: 2940 },
      { w: "Jul 14 - 18", inflow: 4340, outflow: 2190 }
    ]
  },
  tiers: [
    { name: "Unlimited", price: 165, members: 76 },
    { name: "3x/Week", price: 129, members: 89 },
    { name: "Open Gym", price: 75, members: 46 },
    { name: "Student", price: 59, members: 23 },
    { name: "Drop-in pack", price: 20, members: 6 }
  ]
};

/* Drill-through records. Keyed lowercase; matched by name inside row text.
   Shape: sub, chip [label, class], money [amount, label], fields [[k,v]],
   timeline [[cls, title, sub, time]], actions [labels]. All optional. */
window.IW.records = {
  "marcus reeves": {
    sub: "Unlimited $165 / member 26 months",
    chip: ["Recovered", "st-green"],
    money: ["$165", "recovered Tue Jul 15, card updated in 2 hrs 45 min"],
    fields: [["Tier", "Unlimited $165/mo"], ["Usual", "5x/week, 6 AM crew"], ["Tenure", "26 months"], ["Lifetime dues", "$4,290"]],
    timeline: [
      ["hit", "Card declined", "Stripe flagged the $165 July charge.", "Tue 9:02 AM"],
      ["", "Recovery text sent", "Ironworks' voice, secure update link, 2 minutes after the decline.", "Tue 9:04 AM"],
      ["", "He replied", "\"ugh thought I fixed that after the fraud thing. on it\"", "Tue 11:39 AM"],
      ["ok", "Card updated, $165 recovered", "Confirmed he is still coming to the 5:30.", "Tue 11:47 AM"]
    ],
    actions: ["Text Marcus", "Open in PushPress"]
  },
  "big tom kowalski": {
    sub: "Unlimited $165 / member 31 months",
    chip: ["$165 open, escalated", "st-red"],
    money: ["$5,115", "lifetime dues. A decline here is a relationship, not an invoice."],
    fields: [["Tier", "Unlimited $165/mo"], ["Usual", "4x/week, evenings"], ["Tenure", "31 months"], ["Open balance", "$165"]],
    timeline: [
      ["hit", "Card declined twice", "First decline Jul 10, retry failed Jul 12.", "Thu Jul 10"],
      ["", "Two texts sent, opened, no update", "System stopped nudging after the second open.", "Jul 10 and 12"],
      ["ok", "Escalated to you", "He is at the 5:30 tonight. A 20-second conversation fixes it.", "Today"]
    ],
    actions: ["Mark as handled", "Text Big Tom"]
  },
  "danielle ortiz": {
    sub: "3x/Week $129 / member 14 months",
    chip: ["Saved", "st-green"],
    money: ["$129/mo", "kept on the books, $1,548 a year"],
    fields: [["Tier", "3x/Week $129/mo"], ["Usual", "4x/week"], ["Quiet stretch", "16 days, zero check-ins"], ["Lifetime dues", "$1,806"]],
    timeline: [
      ["hit", "Radar flagged the gap", "Usually 4x/week, nothing for 10 days.", "Mon Jul 7"],
      ["", "Friendly check-in sent", "\"Miss you at the 6 AM. Everything good?\"", "Tue Jul 8"],
      ["", "She replied", "\"been slammed, back Monday\"", "Tue Jul 8"],
      ["ok", "Monday reminder set", "A spot is held in her usual class.", "For Mon Jul 21"]
    ],
    actions: ["Adjust the reminder", "Open in PushPress"]
  },
  "rachel odum": {
    sub: "3x/Week $129 / member 22 months",
    chip: ["Card expired", "st-amber"],
    money: ["$129", "open. Second reminder goes out at 4 PM if untouched."],
    fields: [["Tier", "3x/Week $129/mo"], ["Usual", "3x/week"], ["Tenure", "22 months"], ["Lifetime dues", "$2,838"]],
    timeline: [
      ["hit", "Card expired", "The card on file lapsed at end of June.", "Fri 7:58 AM"],
      ["", "Update link sent", "Never before 8 AM, always in the gym's voice.", "Fri 8:00 AM"],
      ["", "Second reminder queued", "Goes out at 4 PM only if the link is untouched.", "Today 4:00 PM"]
    ],
    actions: ["Send reminder now", "Text Rachel"]
  },
  "jake whitfield": {
    sub: "3x/Week $129 / member 7 months",
    chip: ["At risk, waiting", "st-amber"],
    fields: [["Tier", "3x/Week $129/mo"], ["Usual", "3x/week"], ["Quiet stretch", "12 days"], ["Lifetime dues", "$903"]],
    timeline: [
      ["hit", "Radar flagged the gap", "Three straight missed weeks of his usual pattern.", "Mon Jul 14"],
      ["", "Friendly check-in sent", "No reply yet. Month 7 is inside the classic quit window.", "Tue Jul 15"],
      ["", "Second touch scheduled", "From Coach Tyler personally, not the system.", "Fri Jul 18"]
    ],
    actions: ["Have Tyler call", "Open in PushPress"]
  },
  "priya nair": {
    sub: "Open Gym $75 / member 19 months",
    chip: ["Recovered", "st-green"],
    money: ["$75", "recovered Fri Jul 11, next morning"],
    fields: [["Tier", "Open Gym $75/mo"], ["Usual", "3x/week"], ["Lifetime dues", "$1,425"]],
    timeline: [
      ["hit", "Card declined", "Bank flagged the charge.", "Thu Jul 10"],
      ["", "Recovery text sent", "She replied \"thanks for the heads up!\"", "Thu 8:00 AM"],
      ["ok", "New card on file", "$75 recovered.", "Fri Jul 11"]
    ]
  },
  "renee calloway": {
    sub: "Unlimited $165 / member 4 months",
    chip: ["Saved", "st-green"],
    fields: [["Tier", "Unlimited $165/mo"], ["Usual", "5x/week"], ["Risk window", "Month 4 new-member dip"]],
    timeline: [
      ["hit", "Pattern dip", "5x/week down to 2 check-ins in 14 days.", "Jul 8"],
      ["", "Check-in sent", "Offered a goal session instead of a guilt trip.", "Jul 9"],
      ["ok", "PR session booked with Jess", "Back to 4 check-ins this week.", "Jul 12"]
    ]
  },
  "kelsey dunn": {
    sub: "3x/Week $129 / member 10 months",
    chip: ["Watching", "st-gray"],
    fields: [["Usual", "3x/week"], ["Quiet stretch", "1 check-in in 10 days"]],
    timeline: [
      ["hit", "Pattern dip detected", "Nightly scan caught the slowdown.", "Thu Jul 17"],
      ["", "Soft touch queued", "Friendly text goes out tomorrow morning.", "Sat 9:00 AM"]
    ]
  },
  "tomas vega": {
    sub: "Student $59 / member 3 months",
    chip: ["Watching", "st-gray"],
    fields: [["Usual", "4x/week"], ["Quiet stretch", "1 check-in in 9 days"], ["Context", "Finals season"]],
    timeline: [
      ["hit", "Pattern dip detected", "Radar waits one extra week for students during finals.", "Wed Jul 16"],
      ["", "Check-in scheduled", "Goes out after finals week unless he is back first.", "Next Wed"]
    ]
  },
  "aaron pruitt": {
    sub: "Open Gym $75 / member 21 months",
    chip: ["On hold", "st-gray"],
    money: ["$75/mo", "paused, not cancelled. Resume date on file."],
    fields: [["Usual", "2x/week"], ["Reason", "Work travel"], ["Hold ends", "Aug 15"]],
    timeline: [
      ["hit", "18 days quiet", "Radar flagged, check-in sent.", "Jul 5"],
      ["", "He replied: travel until August", "System offered a 1-month hold instead of a cancel form.", "Jul 6"],
      ["ok", "Hold accepted", "Auto-resumes Aug 15 with a welcome-back text.", "Jul 6"]
    ],
    actions: ["Adjust the hold", "Text Aaron"]
  },
  "miguel santos": {
    sub: "Student $59 / member 9 months",
    chip: ["Recovered", "st-green"],
    money: ["$59", "recovered on the scheduled retry"],
    timeline: [
      ["hit", "Card declined, insufficient funds", "No text needed, retry scheduled for the 1st.", "Tue Jul 8"],
      ["ok", "Cleared on second attempt", "$59 recovered without bothering him.", "Aug 1 (scheduled)"]
    ]
  },
  "trey vaughn": {
    sub: "3x/Week $129 / joined this month",
    chip: ["New member", "st-ink"],
    fields: [["Source", "Lead Concierge, web form"], ["Welcome sequence", "Day 3 of 14"]],
    timeline: [
      ["", "Joined on 3x/Week", "Converted after a Tuesday No-Sweat Intro.", "Jul 15"],
      ["ok", "First check-in celebrated", "Day-3 welcome text sent, first PR logged.", "Jul 18"]
    ]
  },
  "sam ostrander": {
    sub: "Unlimited $165 / joined this month",
    chip: ["New member", "st-ink"],
    fields: [["Source", "Referred by Marcus Reeves"], ["Welcome sequence", "Day 6 of 14"]],
    timeline: [
      ["", "Joined Unlimited", "Referral credit applied to Marcus automatically.", "Jul 12"],
      ["ok", "Referred a friend already", "His buddy's intro is Monday 5:30.", "Jul 17"]
    ]
  },
  "erin fitzgerald": {
    sub: "Student $59 / joined this month",
    chip: ["New member", "st-ink"],
    fields: [["Source", "IG DM, asked if beginners need experience"], ["Welcome sequence", "Day 9 of 14"]],
    timeline: [
      ["", "Question answered in 52 seconds", "Every answer ends with an intro invitation.", "Jun 30"],
      ["ok", "Joined Student after her intro", "Third check-in this week.", "Jul 8"]
    ]
  },
  "kayla bruner": {
    sub: "Lead / Instagram DM",
    chip: ["Intro booked", "st-green"],
    fields: [["Channel", "IG DM, @kayla.lifts"], ["First reply", "41 seconds"], ["Intro", "Thu 5:30 PM with Jess"]],
    timeline: [
      ["hit", "\"hey do you guys do day passes?\"", "Came in while you coached the 6 PM.", "Wed 6:12 PM"],
      ["", "Answered in 41 seconds", "Prices plus a warm invite to a No-Sweat Intro.", "Wed 6:13 PM"],
      ["ok", "Intro booked, reminders queued", "Calendar entry, address text, morning-of reminder.", "Wed 6:15 PM"]
    ],
    actions: ["Move the intro", "Open the thread"]
  },
  "devon marsh": {
    sub: "Lead / web form",
    chip: ["Intro booked", "st-green"],
    fields: [["Interest", "Meet prep programming"], ["Intro", "Fri 6:30 AM with Tyler"]],
    timeline: [
      ["", "Web form inquiry", "Asked about meet prep coaching.", "Mon 8:14 PM"],
      ["ok", "Matched to Tyler, confirmed", "Tyler coaches the competitive lifters.", "Mon 8:16 PM"]
    ]
  },
  "alicia trent": {
    sub: "Lead / missed call",
    chip: ["Unconfirmed", "st-amber"],
    fields: [["Intro", "Sat 10:00 AM"], ["Last touch", "Reminder sent 9:00 AM, no reply"]],
    timeline: [
      ["", "Reminder sent", "No reply yet.", "Today 9:00 AM"],
      ["", "Morning-of text queued", "Goes out 7:30 AM Saturday.", "Sat 7:30 AM"]
    ],
    actions: ["Call Alicia", "Reschedule the intro"]
  },
  "carly jensen": {
    sub: "Former member / cancelled in May",
    chip: ["Rebooked", "st-green"],
    timeline: [
      ["", "Win-back text, day 30", "Work schedule changed; offered a 2-week comeback pass.", "Jul 10"],
      ["ok", "Intro booked for Saturday", "Zero ad spend, zero on-ramp.", "Jul 11"]
    ],
    actions: ["Confirm Saturday", "Open the thread"]
  }
};
