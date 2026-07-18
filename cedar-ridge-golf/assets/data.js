/* Cedar Ridge demo data. Fictional, illustrative numbers, consistent across pages. */
window.CRGC = {
  // Tee-sheet utilization by day and hour, percent of slots booked.
  // Story: weekend mornings are jammed, weekday middays leak money.
  heatHours: ["7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"],
  heat: {
    Mon: [72, 84, 81, 66, 52, 44, 38, 41, 55, 68, 74, 61, 40],
    Tue: [70, 82, 78, 61, 48, 40, 31, 36, 50, 66, 72, 58, 38],
    Wed: [78, 88, 86, 74, 62, 55, 49, 53, 64, 90, 93, 82, 51], // Men's League late day
    Thu: [71, 83, 80, 63, 50, 43, 37, 40, 54, 67, 73, 60, 39],
    Fri: [80, 91, 89, 78, 70, 64, 60, 63, 72, 84, 88, 76, 48],
    Sat: [97, 100, 99, 96, 93, 88, 84, 82, 86, 91, 89, 78, 52],
    Sun: [95, 99, 98, 94, 90, 85, 80, 79, 83, 88, 85, 72, 47]
  },
  heatBuckets: [
    { min: 85, color: "#2f6b40", label: "85 to 100% booked" },
    { min: 70, color: "#6f9a5e", label: "70 to 84%" },
    { min: 50, color: "#b5b060", label: "50 to 69%" },
    { min: 35, color: "#cf8f4e", label: "35 to 49%" },
    { min: 0,  color: "#b85c43", label: "Under 35%" }
  ],
  // Weekly green + cart revenue, last 7 days.
  revenueWeek: [
    { day: "Fri 10", amt: 9840 },
    { day: "Sat 11", amt: 14620 },
    { day: "Sun 12", amt: 13480 },
    { day: "Mon 13", amt: 6910 },
    { day: "Tue 14", amt: 6240 },
    { day: "Wed 15", amt: 8570 },
    { day: "Thu 16", amt: 7180 }
  ]
};
