/* Marlowe Hair Co. demo — shared fictional dataset.
   Demo data, illustrative numbers. All names and phone numbers invented. */
window.MARLOWE = {
  revenueWeeks: [
    { label: "May 25", amount: 8640 },
    { label: "Jun 1",  amount: 9210 },
    { label: "Jun 8",  amount: 9840 },
    { label: "Jun 15", amount: 9370 },
    { label: "Jun 22", amount: 10120 },
    { label: "Jun 29", amount: 9580 },
    { label: "Jul 6",  amount: 9930 },
    { label: "Jul 13", amount: 9470 }
  ],
  mix: {
    service: { amount: 34070, pct: 87.5 },
    retail:  { amount: 4870,  pct: 12.5 }
  },
  recovered: { month: 2340, slots: 14, offered: 16, refillRate: 87 },

  services: [
    { name: "Women's Cut",        price: 65,  mins: 45 },
    { name: "Men's Cut",          price: 35,  mins: 30 },
    { name: "Root Touch-Up",      price: 95,  mins: 75 },
    { name: "Partial Highlight",  price: 145, mins: 105 },
    { name: "Full Highlight",     price: 175, mins: 135 },
    { name: "Balayage",           price: 185, mins: 150 },
    { name: "Gloss/Toner",        price: 40,  mins: 30 },
    { name: "Blowout",            price: 45,  mins: 40 },
    { name: "Color Correction Consult", price: 0, mins: 20 },
    { name: "Keratin",            price: 275, mins: 165 }
  ],
  stylistNames: ["Danielle", "Brooke", "Marissa", "Elise", "Nikki"],

  /* Client records for the drill-through drawer. */
  clients: {
    "Maya K.": {
      phone: "(555) 019-4432", service: "Root Touch-Up, Danielle", cadence: "Every 6 wks",
      value: "$1,140", status: "In the chair today, 1:30 PM",
      note: "Client since 2023, 11 visits. Danielle only. Sensitive scalp, patch tested Feb 2026. Buys Olaplex No. 3 most visits.",
      timeline: [
        { t: "Jul 14", x: "Cadence hit 6 weeks 2 days. Rebook nudge sent by text." },
        { t: "Jul 14", x: "Replied YES within 20 minutes. Booked Friday, written to Square." },
        { t: "Jul 15", x: "3-day confirmation request sent. Confirmed same hour." },
        { t: "Today",  x: "Checked in 1:24 PM. Root touch-up processing 2:00 to 2:40." }
      ],
      dollars: "Today's ticket: $135 (root touch-up + gloss). Kept on her 6 week cadence, she is a $1,140 a year client."
    },
    "Amber T.": {
      phone: "(555) 014-2287", service: "Balayage, Danielle", cadence: "Every 8 wks",
      value: "$1,480", status: "Rescued slot, today 2:00 PM",
      note: "Waitlisted for a weekday afternoon balayage with Danielle. Card on file.",
      timeline: [
        { t: "11:04 AM", x: "Jessica R. canceled the 2:00 PM balayage. Waitlist match found: right service, right stylist." },
        { t: "11:05 AM", x: "Offer text sent, first come first served." },
        { t: "11:16 AM", x: "Replied YES. Slot claimed, booked into Square, confirmation sent." }
      ],
      dollars: "Chair saved today: $185. Total elapsed from cancellation to refill: 12 minutes."
    },
    "Jessica R.": {
      phone: "(555) 021-8874", service: "Balayage, Danielle", cadence: "Every 6 wks",
      value: "$1,310", status: "Canceled today, rebooking",
      note: "Canceled this morning's 2:00 PM balayage. Kept her 4:30 PM gloss and blowout with Brooke.",
      timeline: [
        { t: "11:04 AM", x: "Canceled her 2:00 PM balayage by text. Slot released to Cancellation Rescue." },
        { t: "11:05 AM", x: "Polite reply sent with three rebook options for next week." },
        { t: "Today",    x: "Rebook nudge scheduled: she is 5 weeks 6 days into a 6 week color window." }
      ],
      dollars: "Her canceled $185 slot was refilled in 12 minutes. Nothing lost."
    },
    "Tara B.": {
      phone: "(555) 032-6619", service: "Partial Highlight, Marissa", cadence: "Every 6 wks",
      value: "$920", status: "8 weeks overdue, 2nd nudge queued",
      note: "Waitlisted for a partial highlight with Danielle as an alternate. Usually books Thursdays.",
      timeline: [
        { t: "Jun 27", x: "Cadence hit 6 weeks. First rebook nudge sent. No reply." },
        { t: "Jul 11", x: "Marked drifting at 8 weeks. Second, softer nudge drafted." },
        { t: "Today",  x: "Second nudge queued for 10:00 AM tomorrow, Saturday openings attached." }
      ],
      dollars: "A $920 a year client, one quiet drift from churning. The nudge lands before the awkwardness does."
    },
    "Kayla M.": {
      phone: "(555) 044-1180", service: "Women's Cut + Gloss, Brooke", cadence: "Every 7 wks",
      value: "$710", status: "In today 2:15 PM, gloss nudge sent",
      note: "Asked to move her balayage earlier if anything opened. Flexible on weekday afternoons.",
      timeline: [
        { t: "Jul 16", x: "Gloss cadence hit 6 weeks 4 days. Nudge sent with two openings." },
        { t: "Today",  x: "In at 2:15 PM for her cut with Brooke. Gloss add-on offered at check-in." }
      ],
      dollars: "Cut today: $65. If the gloss lands, the ticket goes to $105."
    },
    "Lauren P.": {
      phone: "(555) 027-3341", service: "Partial Highlight, Marissa", cadence: "Every 7 wks",
      value: "$1,050", status: "In today, 3:00 PM",
      note: "Came back from a 7 week 1 day drift after the second nudge. Awaiting confirm on today.",
      timeline: [
        { t: "Jul 8",  x: "First rebook nudge at 6 weeks. No reply." },
        { t: "Jul 15", x: "Second nudge with Friday openings. Booked 3:00 PM with Marissa." },
        { t: "Today",  x: "Confirmation reply still pending. Auto re-ping went out at noon." }
      ],
      dollars: "Today's partial highlight: $145. Recovered from a drift that used to end in silence."
    },
    "Erin D.": {
      phone: "(555) 038-9925", service: "Full Highlight, Danielle", cadence: "Every 9 wks",
      value: "$860", status: "In today, 10:00 AM",
      note: "Standing morning client. Full highlight with processing handled around Tom H.'s cut.",
      timeline: [
        { t: "Jul 15", x: "3-day confirmation sent. Confirmed in 4 minutes." },
        { t: "Today",  x: "Application 10:00, processing 11:00 to 11:35, rinse and tone after." }
      ],
      dollars: "Today's ticket: $175. Her processing window hosted a $35 men's cut, so the chair earned twice."
    },
    "Nicole S.": {
      phone: "(555) 016-7702", service: "Women's Cut, Danielle", cadence: "Every 8 wks",
      value: "$390", status: "Done today, rebooked at checkout",
      note: "First appointment of the day. Rebooked her next cut at the register.",
      timeline: [
        { t: "Today 9:00 AM",  x: "Women's cut with Danielle. Done by 9:40." },
        { t: "Today 9:42 AM",  x: "Prebooked her next visit at checkout, 8 weeks out. Confirmed by text." }
      ],
      dollars: "Ticket: $65. Prebooked at checkout, so her next visit never depends on her remembering."
    }
  },

  /* Stylist records for leaderboard drill-through. */
  stylists: {
    "Danielle": { role: "Commission", rev: "$9,840", tickets: 58, avg: "$170", retail: "14.2%", rebook: "74%",
      note: "Color specialist, longest waitlist in the salon. Her transformation reel is driving the Olaplex run." },
    "Brooke":   { role: "Commission", rev: "$8,610", tickets: 66, avg: "$130", retail: "12.8%", rebook: "69%",
      note: "Highest ticket count. Strong cut-and-gloss mix, best at checkout prebooks after Danielle." },
    "Marissa":  { role: "Commission", rev: "$7,930", tickets: 61, avg: "$130", retail: "11.4%", rebook: "63%",
      note: "Highlight specialist. Two of this quarter's recovered drifters rebooked with her." },
    "Elise":    { role: "Booth renter", rev: "$6,720", tickets: 49, avg: "$137", retail: "12.1%", rebook: "58%",
      note: "Booth rent $250 a week, on time. Keratin bookings anchor her Thursdays." },
    "Nikki":    { role: "Booth renter", rev: "$5,840", tickets: 44, avg: "$133", retail: "10.6%", rebook: "55%",
      note: "Booth rent $250 a week. Late once this month; the reminder chased it politely and it was paid same day." }
  },

  /* Canned Q&A bank for the Ask page. Keyword matched, no network calls. */
  ask: [
    { k: ["recover", "rescued", "rescue", "cancel"],
      a: "The waitlist put $2,340 back on the books this month. 16 slots canceled, 14 refilled, an 87% refill rate, average 12 minutes from cancellation to a claimed chair. This morning: Jessica R. canceled her 2:00 PM balayage at 11:04, Amber T. claimed it by 11:16. $185 saved before lunch." },
    { k: ["overdue", "color window", "drift", "who's due", "who is due"],
      a: "Four clients are past their color window right now. Tara B. is 8 weeks out on her partial highlight, second nudge queued. Lauren P. hit 7 weeks 1 day and is in today at 3:00 after the second nudge landed. Kayla M. (6w 4d) and Jessica R. (5w 6d) were both nudged today." },
    { k: ["tomorrow", "saturday", "confirm"],
      a: "Saturday is packed: 21 appointments, 18 already confirmed. The 2 still quiet get an automatic re-ping at 5 PM today. The 1 high-risk client, two prior no-shows, has a $50 deposit request out with her card on file. Two chairs are still open and the waitlist already has offers for those hours." },
    { k: ["best stylist", "retail mix", "sells the most", "leaderboard", "top stylist"],
      a: "Danielle leads on retail mix: 14.2% of her $9,840 in service revenue, on a $170 average ticket with a 74% rebook rate. Brooke is next at 12.8%, then Marissa at 11.4%. If you want the shelf moving, Danielle's chair is where it happens." },
    { k: ["after hours", "last night", "overnight", "10 pm", "while we were closed", "night"],
      a: "Six of this week's 34 conversations came in after close. The best one: 10:41 PM, a new client DMed about a box dye gone wrong. The assistant quoted color correction from $250, applied the consult-first policy, offered two openings, and booked Tuesday 5:30 with Danielle. Three minutes, while the salon slept." },
    { k: ["revenue", "sales this month", "how did we do", "top line"],
      a: "$38,940 in the last 30 days, up 6.2%. Service $34,070, retail $4,870. Add $2,000 in booth rent and total income is $40,940, with $16,181 net at a 39.5% margin." },
    { k: ["no-show", "no show", "noshow"],
      a: "The no-show rate is 4%, down from 17% before auto-confirms. Three-day confirmation requests, a re-ping for the quiet ones, and a deposit request for repeat offenders. Today: zero no-shows on 31 appointments." },
    { k: ["low", "stock", "shelf", "reorder", "inventory", "olaplex"],
      a: "Five items are at or below reorder. Olaplex No. 3 is the urgent one: 3 left and selling 40% faster since Danielle's reel, with Saturday coming. Heat protectant is at 2, texture spray sold out midweek, and the backbar is low on 20 vol developer, 7N, and lightener. A $312 draft order is sitting one tap from approved." },
    { k: ["tips", "tip"],
      a: "$6,240 in card tips this month, auto-split per stylist and paid out. None of it touches the revenue line, so the books stay honest and nobody argues over a spreadsheet." },
    { k: ["review", "rating", "competitor", "luxe", "blowout bar"],
      a: "Marlowe is at 4.9 stars on Google with 212 reviews, adding 18 a month. Down the street, Luxe & Co Salon sits at 4.5 with 148 and The Blowout Bar at 4.3 with 96. The gap keeps widening because a review request goes out after every happy visit, automatically." },
    { k: ["online", "shopify", "shipped", "web order"],
      a: "Online retail did $640 of this month's $4,870, about 13%, from the take-home shelf on the website. Eight orders this week; Olaplex No. 3 is the runner with six bottles shipped. The site shares the shelf's live counts, so it never sells a bottle the salon does not have." },
    { k: ["profit", "net", "quickbooks", "books", "expenses"],
      a: "Net profit is $16,181 for the last 30 days, a 39.5% margin on $40,940 total income. Expenses ran $24,759, payroll is 53% of that. QuickBooks synced 4 minutes ago; the bookkeeper categorized 41 transactions today and matched every Square payout to the bank." }
  ],
  askFallback: "In the live system I'd pull that straight from your book and your books. In this demo, try one of the suggested questions below."
};
