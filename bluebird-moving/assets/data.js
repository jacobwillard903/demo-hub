/* ============================================================
   Bluebird Moving Co. demo data. All fictional, illustrative.
   Canonical numbers (every page reconciles to these):
   - Rates: crew of 2 $129/hr, crew of 3 $169/hr, +1 hr travel,
     3-hr minimum. $150 deposit holds the date.
   - Week of Jul 13-19: 47 of 47 calls answered, 9 after-hours
     jobs booked, 9 deposits collected = $1,350, close rate 45%
     (9 of 20 quotes, was 28%), Sat truck utilization 100% (4 of 4),
     avg speed-to-quote 4 min.
   - July 1-18 money: revenue $43,750 (local moves $38,450,
     packing/materials $4,120, bulky-item fees $1,180); expenses
     $27,790 (crew payroll $16,900, fuel $2,840, truck leases +
     maintenance $5,300, valuation claims $600, insurance $2,150);
     net $15,960 at 36.5%. Cash $28,400. AR $1,750 (Kessler).
   ============================================================ */
(function () {
  "use strict";

  var records = {

    nguyen: {
      title: "The Nguyens, 2BR apartment",
      sub: "Quote Q-2214, quoted in 2 minutes",
      who: [["Customer", "Thanh and Mai Nguyen"], ["Phone", "(555) 204-8817"], ["From", "2BR apt, 3rd floor walk-up, Grandview"], ["To", "2BR apt, elevator, Dublin"], ["Quote", "$850 to $1,100"], ["Crew", "2 movers, $129/hr + 1 hr travel"], ["Status", ["info", "In-home estimate Sat 8:00 AM"]]],
      cube: [["Bedrooms", "2, queen + full"], ["Big items", "Sofa, dresser x2, desk"], ["Stairs", "3rd floor walk-up (stair fee quoted)"], ["Long carry", "None flagged"], ["Distance", "11.4 mi"], ["Est. hours", "4 to 6 + 1 hr travel"]],
      tl: [["Tue 6:12 PM", "Call answered in 2 seconds. Caller asked \"how much for a 2-bedroom?\""], ["Tue 6:13 PM", "Cube sheet built on the call: rooms, big items, stairs, distance."], ["Tue 6:14 PM", "Range $850 to $1,100 quoted and texted. In-home estimate booked Sat 8:00 AM."], ["Tue 6:15 PM", "SmartMoving lead created, estimate on Tony's calendar."]],
      act: ["Text the Nguyens", "Open in SmartMoving"]
    },

    delgado: {
      title: "The Delgados, 4BR house",
      sub: "Booked, $2,340, 2-day move Sat-Sun",
      who: [["Customer", "Rob and Elena Delgado"], ["Phone", "(555) 731-4402"], ["From", "4BR house, Westerville"], ["To", "4BR house, Powell"], ["Price", "$2,340 binding, 2-day"], ["Crew", "3 movers + Tony rides along"], ["Deposit", "$150 paid Wed"], ["Status", ["good", "Deposit paid, Sat 8:00 AM"]]],
      cube: [["Bedrooms", "4 + finished basement"], ["Big items", "Sectional, treadmill, gun safe (bulky-item fee)"], ["Stairs", "2 flights both ends"], ["Shuttle", "20 ft shuttle truck, tight street"], ["Est. hours", "8 + 6 across 2 days"]],
      tl: [["Mon 9:20 AM", "Virtual survey link sent, walkthrough done on her phone."], ["Mon 11:05 AM", "Binding quote $2,340 sent as order for service."], ["Wed 2:31 PM", "Deposit link paid, $150. Date locked, both trucks held."], ["Fri 6:30 PM", "Crew confirmations texted for Saturday."]],
      act: ["Text the Delgados", "Open order for service"]
    },

    kessler: {
      title: "Kessler Insurance, small office",
      sub: "Quote Q-2198, $1,750, COI required",
      who: [["Contact", "Dana Kessler, office manager"], ["Phone", "(555) 610-3327"], ["Scope", "12 desks, files, server rack"], ["When", "Fri Jul 24, after close"], ["Quote", "$1,750, crew of 3"], ["COI", "Building requires COI, $1M general"], ["Status", ["warn", "COI due, quote signed"]]],
      cube: [["Desks", "12 + chairs"], ["Server rack", "Wheeled, elevator OK"], ["Files", "14 lateral drawers, locked"], ["Building", "Loading dock, COI on file required"], ["Est. hours", "5 + 1 hr travel"]],
      tl: [["Jul 10", "Inbound email quoted same day, $1,750."], ["Jul 14", "24h follow-up sent, Dana signed the order for service."], ["Thu 9:02 AM", "Building manager's COI requirements pulled from the lease email."], ["Thu 9:04 AM", "COI request drafted to the agent, cc Tony. Due before Jul 23."]],
      act: ["Nudge the insurance agent", "Open COI request"]
    },

    okafor: {
      title: "M. Okafor, 1BR + piano",
      sub: "Quote Q-2205, $890 + $175 bulky-item fee",
      who: [["Customer", "Michael Okafor"], ["Phone", "(555) 488-9012"], ["From", "1BR apt, Short North"], ["To", "1BR condo, Bexley"], ["Quote", "$890 + $175 piano (bulky-item fee)"], ["Crew", "3 movers for the upright piano"], ["Status", ["info", "Booked Sat 2:30 PM, 16 ft liftgate"]]],
      cube: [["Bedrooms", "1"], ["Piano", "Upright, ground floor to ground floor"], ["Big items", "Piano, queen bed, bookcases x3"], ["Truck", "16 ft with liftgate reserved"], ["Est. hours", "3 (minimum) + 1 hr travel"]],
      tl: [["Wed 7:55 AM", "Called before the shop line opened. Answered, piano flagged."], ["Wed 7:58 AM", "Quote texted: $890 + $175 bulky-item fee, liftgate truck reserved."], ["Wed 8:40 AM", "Deposit paid from the text link. Booked Sat 2:30 PM."]],
      act: ["Text Michael", "Open in SmartMoving"]
    },

    harper: {
      title: "T. Harper, 3BR house",
      sub: "Quote Q-2216, $1,480, deposit unpaid 26h",
      who: [["Customer", "Tara Harper"], ["Phone", "(555) 902-6641"], ["From", "3BR, Hilliard"], ["To", "3BR, Grove City"], ["Quote", "$1,480, crew of 3"], ["Deposit", "$150 link sent Thu 11:20 AM, unpaid"], ["Status", ["warn", "Verbal yes, date not held"]]],
      cube: [["Bedrooms", "3"], ["Big items", "King bed, washer/dryer, patio set"], ["Stairs", "1 flight origin"], ["Est. hours", "6 + 1 hr travel"]],
      tl: [["Thu 11:04 AM", "Both lines busy. Missed-call text-back went out in 40 seconds."], ["Thu 11:12 AM", "Quoted $1,480 over text, she said \"book it\"."], ["Thu 11:20 AM", "Deposit link sent. A verbal yes without a deposit holds nothing."], ["Fri 12:00 PM", "Auto-nudge #1 sent. Next nudge 9:00 AM, then Tony gets a call script."]],
      act: ["Resend deposit link", "Call Tara"]
    },

    whitfield: {
      title: "J. Whitfield, 3BR townhouse",
      sub: "Backfill win: cancelled slot refilled in 26 min",
      who: [["Customer", "James Whitfield"], ["Phone", "(555) 377-2280"], ["Move", "3BR townhouse, Gahanna to New Albany"], ["Price", "$1,610, crew of 2"], ["Deposit", "$150 paid Thu 4:40 PM"], ["Status", ["good", "Booked Sat 8:30 AM, Truck 2"]]],
      cube: [["Bedrooms", "3, townhouse"], ["Stairs", "Interior stairs both ends"], ["Est. hours", "6 + 1 hr travel"]],
      tl: [["Thu 4:12 PM", "S. Vance cancelled Saturday 10 AM. Truck 2 suddenly empty."], ["Thu 4:14 PM", "Waitlist texted, 3 households, first come first served."], ["Thu 4:38 PM", "Whitfield claimed the slot from the text."], ["Thu 4:40 PM", "Deposit paid. Truck backfilled in 26 minutes, $1,610 saved."]],
      act: ["Text James", "Open in SmartMoving"]
    },

    ellison: {
      title: "D. Ellison, 2BR condo",
      sub: "Booked Sun 9:40 PM while Tony was at dinner",
      who: [["Customer", "Denise Ellison"], ["Phone", "(555) 559-7734"], ["Move", "2BR condo, Clintonville to Worthington"], ["Quote", "$1,040, crew of 2"], ["Deposit", "$150 paid 9:47 PM"], ["Status", ["good", "Booked Sat Jul 25, month-end"]]],
      tl: [["Sun 9:40 PM", "Called after hours. Answered in 2 seconds, Tony never saw it ring."], ["Sun 9:43 PM", "Quoted $1,040 from the cube sheet questions."], ["Sun 9:47 PM", "Deposit paid, booked into the month-end Saturday."]],
      act: ["Text Denise", "Open in SmartMoving"]
    },

    tyler: {
      title: "Tyler, crew confirmation",
      sub: "Saturday, Truck 2 + Okafor piano",
      who: [["Crew", "Tyler R."], ["Saturday", "Whitfield 8:30 AM, then Okafor 2:30 PM"], ["Confirmed", "Not yet"], ["Reminder", "Auto-reminder sent 7:12 PM"], ["Backup", "If no reply by 9 PM, Tony gets a one-tap call"]],
      tl: [["Fri 6:30 PM", "Saturday assignments texted to all 5 crew."], ["Fri 6:34 PM", "Marcus, Deon, Luis, Big Mike confirmed."], ["Fri 7:12 PM", "Tyler quiet. Auto-reminder sent."], ["Fri 9:00 PM", "If still quiet: Tony gets the heads-up plus Luis's cousin as standby."]],
      act: ["Text Tyler now", "Line up standby"]
    }
  };

  window.BB = { records: records };
})();
