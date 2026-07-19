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
  // NWS hourly forecast for Saturday (the storm scenario). armed = inside the
  // autopilot window; horn = the hour the horn blows.
  wxHourly: [
    { t: "7a",  ic: "sun",   rain: 5,  wind: 4 },
    { t: "8a",  ic: "sun",   rain: 5,  wind: 6 },
    { t: "9a",  ic: "cloud", rain: 10, wind: 7 },
    { t: "10a", ic: "cloud", rain: 15, wind: 8 },
    { t: "11a", ic: "cloud", rain: 25, wind: 9 },
    { t: "12p", ic: "cloud", rain: 45, wind: 11, armed: true },
    { t: "1p",  ic: "storm", rain: 85, wind: 18, armed: true, horn: true },
    { t: "2p",  ic: "storm", rain: 70, wind: 16, armed: true },
    { t: "3p",  ic: "rain",  rain: 40, wind: 12, armed: true },
    { t: "4p",  ic: "cloud", rain: 20, wind: 9 },
    { t: "5p",  ic: "sun",   rain: 10, wind: 7 },
    { t: "6p",  ic: "sun",   rain: 5,  wind: 6 },
    { t: "7p",  ic: "sun",   rain: 5,  wind: 5 }
  ],
  // NWS 7-day outlook for the dashboard strip.
  wxWeek: [
    { d: "Thu", ic: "sun",   hi: 88, lo: 70, rain: 5 },
    { d: "Fri", ic: "sun",   hi: 90, lo: 72, rain: 10 },
    { d: "Sat", ic: "storm", hi: 84, lo: 71, rain: 85, armed: true },
    { d: "Sun", ic: "cloud", hi: 82, lo: 68, rain: 20 },
    { d: "Mon", ic: "sun",   hi: 86, lo: 69, rain: 5 },
    { d: "Tue", ic: "sun",   hi: 89, lo: 71, rain: 10 },
    { d: "Wed", ic: "cloud", hi: 87, lo: 72, rain: 30 }
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
