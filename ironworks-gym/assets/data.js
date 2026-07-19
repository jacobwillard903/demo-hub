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
  },

  /* ---- round 5: live-data showcase records ---- */
  "ironworks strength co.": {
    sub: "Google Business Profile / your listing",
    chip: ["4.9 stars, 186 reviews", "st-green"],
    money: ["+14", "new reviews this month, up from 2 to 3 before the review engine"],
    fields: [["Rating", "4.9 of 5"], ["Reviews", "186"], ["This month", "+14"], ["Review asks sent", "22"], ["Ask timing", "30-day PR moment"]],
    timeline: [
      ["ok", "Review ask: Trey Vaughn", "Sent the day after his first PR. 5 stars, mentioned Coach Tyler by name.", "Jul 16"],
      ["", "Replied to 3 new reviews", "In Sarah's voice, each one names the coach the member praised.", "Jul 15"],
      ["ok", "Hours and photos verified current", "Holiday hours for Labor Day already staged.", "Jul 14"]
    ],
    actions: ["Open the profile", "See this month's asks"]
  },
  "flex factory fitness": {
    sub: "Competitor / 2.1 miles away",
    chip: ["4.3 stars, 61 reviews", "st-gray"],
    fields: [["Rating", "4.3 of 5"], ["Reviews", "61"], ["This month", "+1"], ["Last owner reply", "7 months ago"]],
    timeline: [
      ["hit", "Two 1-star reviews in June", "Both mention billing surprises. Their owner never replied.", "Jun 22"],
      ["", "Watched weekly", "Rating, count, and velocity tracked so you see a move before it matters.", "Every Mon"]
    ],
    note: "Their members who search 'gym near me' see 4.3 next to your 4.9. That gap is doing your marketing for free.",
    actions: ["Open their profile", "See the gap trend"]
  },
  "midwest barbell club": {
    sub: "Competitor / 3.4 miles away",
    chip: ["4.6 stars, 112 reviews", "st-gray"],
    fields: [["Rating", "4.6 of 5"], ["Reviews", "112"], ["This month", "+4"], ["Velocity vs yours", "4 vs your 14"]],
    timeline: [
      ["", "Steady but slower", "Adding about 4 reviews a month to your 14. The count gap widens every week.", "Every Mon"],
      ["hit", "New coach announcement", "Their profile photos updated Jul 8. Worth a glance.", "Jul 8"]
    ],
    actions: ["Open their profile", "See the gap trend"]
  },
  "payout $1,982": {
    sub: "Stripe payout / landed Tue Jul 15",
    chip: ["Reconciled to the penny", "st-green"],
    money: ["$1,982", "net of $58 in fees, matched to 14 charges"],
    fields: [["Gross", "$2,040"], ["Fees", "$58"], ["Charges", "14"], ["Bank deposit", "Tue Jul 15"], ["Includes", "Marcus Reeves' recovered $165"]],
    timeline: [
      ["", "Payout created", "14 charges bundled, including one recovered decline.", "Sun Jul 13"],
      ["ok", "Deposit matched", "The AI bookkeeper tied it to the Tuesday bank deposit and filed the fees.", "Tue Jul 15"]
    ],
    actions: ["Open in the books", "See the 14 charges"]
  },
  "payout $2,214": {
    sub: "Stripe payout / landed Tue Jul 8",
    chip: ["Reconciled to the penny", "st-green"],
    money: ["$2,214", "net of $64 in fees, matched to 17 charges"],
    fields: [["Gross", "$2,278"], ["Fees", "$64"], ["Charges", "17"], ["Bank deposit", "Tue Jul 8"]],
    timeline: [
      ["ok", "Deposit matched", "PT sessions and mid-cycle joins. Fees split out automatically.", "Tue Jul 8"]
    ],
    actions: ["Open in the books", "See the 17 charges"]
  },
  "payout $8,940": {
    sub: "Stripe payout / landed Wed Jul 2",
    chip: ["Reconciled to the penny", "st-green"],
    money: ["$8,940", "net of $259 in fees, matched to 61 charges. Dues land on the 1st."],
    fields: [["Gross", "$9,199"], ["Fees", "$259"], ["Charges", "61"], ["Bank deposit", "Wed Jul 2"]],
    timeline: [
      ["", "The big one", "Monthly dues batch. 61 charges in a single payout.", "Jul 1"],
      ["ok", "Deposit matched", "Reconciled the morning it landed. Zero spreadsheet time.", "Wed Jul 2"]
    ],
    actions: ["Open in the books", "See the 61 charges"]
  },
  "payout $1,046": {
    sub: "Stripe payout / expected Mon Jul 21",
    chip: ["In transit", "st-amber"],
    money: ["$1,046", "net of $31 in fees, 9 charges, on the way to the bank"],
    fields: [["Gross", "$1,077"], ["Fees", "$31"], ["Charges", "9"], ["Expected", "Mon Jul 21"]],
    timeline: [
      ["", "Payout created", "This week's PT and day passes.", "Fri Jul 18"],
      ["", "Will auto-match on arrival", "The bookkeeper is already holding the charge list.", "Mon Jul 21"]
    ],
    actions: ["Open in the books"]
  },
  "chris boland": {
    sub: "Lead / missed call, before open",
    chip: ["Texted back in 31s", "st-green"],
    fields: [["Channel", "Missed call, (555) 618-4402"], ["Called", "Fri 7:41 AM"], ["Text-back", "31 seconds"], ["Status", "Replied, choosing an intro time"]],
    timeline: [
      ["hit", "Missed call before open", "You were coaching the 7 AM.", "Fri 7:41 AM"],
      ["", "Auto text-back in 31 seconds", "\"Sorry we missed you! This is Ironworks. Want to grab a free No-Sweat Intro?\"", "Fri 7:41 AM"],
      ["ok", "He replied", "\"was calling about memberships\", intro times sent.", "Fri 8:02 AM"]
    ],
    actions: ["Call Chris", "Open the thread"]
  },
  "(555) 214-8837": {
    sub: "After-hours caller / Thu 9:41 PM",
    chip: ["Texted back in 6s", "st-green"],
    fields: [["Called", "Thu 9:41 PM"], ["Text-back", "6 seconds"], ["Status", "Intro link sent this morning"]],
    timeline: [
      ["hit", "Missed call, 9:41 PM", "Gym closed at 8. Before this system, that call was gone.", "Thu 9:41 PM"],
      ["", "Auto text-back in 6 seconds", "Friendly text with hours, prices, and an intro link.", "Thu 9:41 PM"],
      ["ok", "Replied this morning", "\"do you have 6am classes?\" Answered, intro link sent.", "Fri 7:05 AM"]
    ],
    actions: ["Open the thread", "Book the intro"]
  },
  "(555) 630-2214": {
    sub: "After-hours caller / Sun 7:12 AM",
    chip: ["Intro booked", "st-green"],
    fields: [["Called", "Sun 7:12 AM"], ["Text-back", "5 seconds"], ["Intro", "Tue 6:30 PM"]],
    timeline: [
      ["hit", "Missed call, Sunday 7:12 AM", "Nobody staffs a Sunday sunrise. The system does.", "Sun 7:12 AM"],
      ["ok", "Texted in 5 seconds, intro booked", "Booked herself into Tuesday 6:30 from the link.", "Sun 7:31 AM"]
    ],
    actions: ["Open the thread"]
  },
  "instagram dms": {
    sub: "Lead channel / organic, via Instagram",
    chip: ["9 of 23 leads", "st-green"],
    money: ["$0", "cost per lead. Your best channel is free."],
    fields: [["Leads in July", "9"], ["Cost per lead", "$0"], ["Intros booked", "4"], ["Joined", "3"], ["Avg first reply", "44 seconds"]],
    timeline: [
      ["ok", "Kayla Bruner", "Day-pass question to booked intro in 3 minutes.", "Wed"],
      ["ok", "Erin Fitzgerald", "Beginner question, now a Student member.", "Jun 30"]
    ],
    actions: ["Open the inbox", "See all 9 threads"]
  },
  "meta lead ads": {
    sub: "Lead channel / paid, via Meta Lead Ads",
    chip: ["6 of 23 leads", "st-amber"],
    money: ["$63", "cost per lead on $380 of July spend. 2 joined: $190 to acquire a $129/mo member."],
    fields: [["Leads in July", "6"], ["Spend", "$380"], ["Cost per lead", "$63"], ["Joined", "2"], ["Cost per join", "$190"]],
    timeline: [
      ["", "Form leads land here in seconds", "Every ad form submission gets the same 38-second treatment as a DM.", "Ongoing"],
      ["ok", "Devon Marsh", "Meet-prep ad, now booked with Tyler.", "Mon"]
    ],
    note: "A $190 acquisition cost against $129 a month in dues pays back in week 7. The ads work because the follow-up is instant.",
    actions: ["Open ads manager", "See the 6 leads"]
  },
  "google search & maps": {
    sub: "Lead channel / organic, via Google Business Profile",
    chip: ["5 of 23 leads", "st-green"],
    money: ["$0", "cost per lead. Your 4.9 rating does the selling."],
    fields: [["Leads in July", "5"], ["Cost per lead", "$0"], ["Source", "Profile calls + website clicks"], ["Joined", "1"]],
    timeline: [
      ["", "Found you next to a 4.3", "Searchers see your rating beside Flex Factory's before they ever call.", "Ongoing"]
    ],
    actions: ["Open the profile"]
  },
  "missed calls": {
    sub: "Lead channel / phone, via Twilio",
    chip: ["3 of 23 leads", "st-green"],
    money: ["$0", "cost per lead. These used to be lost entirely."],
    fields: [["Leads in July", "3"], ["Cost per lead", "$0"], ["Avg text-back", "14 seconds"], ["Lost after-hours calls", "0"]],
    timeline: [
      ["ok", "Every miss gets a text", "The log on this page shows each one, timestamped.", "Ongoing"]
    ],
    actions: ["See the text-back log"]
  },
  "barbell strength": {
    sub: "Class / 6:00 AM, coached by you",
    chip: ["12 of 14 booked", "st-green"],
    fields: [["Time", "6:00 AM, 60 min"], ["Coach", "Sarah Voss"], ["Booked", "12 of 14"], ["Regulars", "Marcus Reeves, Danielle Ortiz"]],
    timeline: [
      ["ok", "Roster synced from PushPress", "Reminders went out last night. Two spots left.", "Thu 8:00 PM"]
    ],
    actions: ["Open the roster"]
  },
  "vendor call: rogue rack order": {
    sub: "Calendar hold / 9:30 AM, 20 min",
    chip: ["Prepped", "st-gray"],
    fields: [["With", "Rogue sales rep"], ["About", "Third squat rack + plate order"], ["Budget line", "Equipment, $720/mo run rate"]],
    timeline: [
      ["", "Quote received", "Filed against June's equipment line so you know what fits.", "Jul 14"],
      ["", "One-pager drafted", "Last order, current spend, and the delivery window question, in your notes.", "Jul 17"]
    ],
    actions: ["Open the notes"]
  },
  "evening strength": {
    sub: "Class / 5:30 PM, coached by Tyler",
    chip: ["Full, 14 of 14", "st-amber"],
    fields: [["Time", "5:30 PM"], ["Coach", "Tyler Brandt"], ["Booked", "14 of 14, 3 waitlisted"], ["Note", "Big Tom will be there"]],
    timeline: [
      ["hit", "Reminder for you", "Big Tom Kowalski is booked in. His $165 decline needs a 20-second conversation.", "Today"],
      ["", "Waitlist auto-managed", "Any cancel texts the first waitlisted member instantly.", "Ongoing"]
    ],
    actions: ["Open the roster", "Mark Big Tom handled"]
  }
};
