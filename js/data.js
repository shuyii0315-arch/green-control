// The ontology the prototype runs on. All data simulated.
// Objects have a type, a name and properties; links connect them; actions write back.
export const ontology = {
  objects: {
    b1:        { type: "Building", name: "B1 · Shanghai HQ" },
    plant:     { type: "Plant", name: "Chiller plant", in: "b1" },
    chiller1:  { type: "Chiller", name: "Chiller 1", in: "plant", props: { kwPerTon: 0.62, load: 0.5 } },
    chiller2:  { type: "Chiller", name: "Chiller 2", in: "plant", props: { kwPerTon: 0.71, load: 0.5, overNormalC: 2.8, monthsSinceCleaning: 14 } },
    condenser: { type: "Part", name: "Chiller 2 · condenser", in: "chiller2", props: { status: "running hot" } },
    pump1:     { type: "Pump", name: "Pump 1", in: "plant" },
    pump2:     { type: "Pump", name: "Pump 2", in: "plant" },
    tower1:    { type: "Tower", name: "Cooling tower 1", in: "b1" },
    tower2:    { type: "Tower", name: "Cooling tower 2", in: "b1" },
    ups:       { type: "Backup power", name: "L12 · 82% in use", in: "b1" },
    battery:   { type: "Battery", name: "64% · ready", in: "b1" },
    ev:        { type: "Car charging", name: "B2 · 18 / 24 in use", in: "b1" },
    switchboard: { type: "Power", name: "Main switchboard", in: "b1" },
    pv:        { type: "Solar", name: "Roof · 0.9 t CO₂ saved", in: "b1" },
    wo:        { type: "Work order", name: "Clean the tubes · Sat 08:00" },
    team:      { type: "Team", name: "Maintenance B" },
  },
  links: [
    ["chiller2", "comparedWith", "chiller1"],
    ["chiller2", "sharesWater", "tower2"],
    ["wo", "on", "chiller2"],
    ["wo", "assignedTo", "team"],
  ],
};

export const ranges = {
  "Today":   { cost: "¥14,210", power: "2,940", energy: "18.4", carbon: "10.2" },
  "7 days":  { cost: "¥96,880", power: "2,940", energy: "124", carbon: "69.4" },
  "30 days": { cost: "¥402,300", power: "2,940", energy: "531", carbon: "297" },
};

// What the AI says, in order. The page reveals each piece with its evidence.
export const script = {
  ask: "Investigate Chiller 2",
  answer: "Chiller 2 uses 14% more power than Chiller 1. It runs hot, most likely because its tubes are dirty.",
  evidence: [
    { n: 1, chip: "More power", tab: "What", title: "More power", value: "+14%", unit: "vs Chiller 1", cap: "for the same cooling", bar: { normal: 0.62 / 0.8, now: 0.71 / 0.8 }, trace: "Comparing power per ton with Chiller 1", mark: "m1", markLabel: "compared with", markChip: "Chiller 1" },
    { n: 2, chip: "Running hot", tab: "Where", title: "Running hot", value: "+2.8", unit: "°C above normal", cap: "heat isn’t getting out", bar: { normal: 3 / 8, now: 5.8 / 8 }, trace: "Reading the condenser temperature sensor", mark: "m2", markLabel: "temperature sensor" },
    { n: 3, chip: "Overdue cleaning", tab: "Why", title: "Overdue cleaning", value: "14", unit: "months", cap: "last cleaned Aug 2025", bar: { normal: 12 / 18, now: 14 / 18 }, trace: "Checking the maintenance history", mark: "m3", markLabel: "tubes" },
  ],
  done: "Done. Chiller 1 now takes 20% more. Maintenance B is booked for Saturday.",
  replies: [
    [/(why|cause|dirty|tube)/i, "The condenser can’t shed heat well, so the compressor works harder. Dirty tubes are the most likely cause: it’s 14 months since the last cleaning, and the usual interval is 12."],
    [/(cost|money|save|saving|¥)/i, "Shifting 20% of the work saves about ¥250 a day. Cleaning on Saturday fixes the cause and saves about ¥312 a day after that."],
    [/(safe|risk|trip|fail)/i, "If Chiller 1 stops or the rooms warm up, I switch the work back to Chiller 2 on my own and tell you."],
    [/(both|clean.*now|today)/i, "Cleaning needs Chiller 2 off for about 4 hours, so it’s booked for Saturday morning when the building is quiet."],
  ],
  fallback: "In this prototype I can answer about Chiller 2’s power, temperature, cleaning, cost and risk.",
};
