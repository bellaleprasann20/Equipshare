const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);

// Change to "png" if your photos are PNG files, then run npm run seed again
const IMAGE_EXT = "jpg";

const SITES = {
  A: { name: "Site A - Whitefield", lat: 12.9698, lng: 77.75 },
  B: { name: "Site B - Electronic City", lat: 12.8452, lng: 77.6602 },
  C: { name: "Site C - Yelahanka", lat: 13.1007, lng: 77.5963 },
  D: { name: "Site D - Hebbal", lat: 13.0355, lng: 77.597 },
  E: { name: "Site E - Marathahalli", lat: 12.9569, lng: 77.7011 },
  F: { name: "Site F - JP Nagar", lat: 12.9077, lng: 77.5851 },
  G: { name: "Site G - Devanahalli", lat: 13.2437, lng: 77.7128 },
  H: { name: "Site H - Hosur Road", lat: 12.8988, lng: 77.632 },
};

// code, label, type, site, rent/day, sale price, operating cost/day,
// age (years), operating hrs (30d), idle hrs (30d), jobs, breakdowns,
// days since service, service interval, availability
const rows = [
  ["EX-01", "20T Hydraulic Excavator", "excavator", "A", 14500, 3600000, 9500, 3, 190, 90, 18, 1, 35, 90, "available"],
  ["EX-02", "14T Compact Excavator", "excavator", "B", 11000, 2700000, 7200, 5, 120, 160, 14, 3, 110, 90, "available"],
  ["EX-03", "30T Crawler Excavator", "excavator", "C", 21000, 5400000, 13500, 2, 230, 50, 22, 0, 20, 120, "in_use"],
  ["EX-04", "Wheeled Excavator", "excavator", "D", 13500, 3200000, 8800, 7, 85, 210, 12, 4, 75, 60, "available"],

  ["CR-01", "14T Pick and Carry Crane", "crane", "E", 9500, 2300000, 6800, 4, 150, 110, 20, 2, 50, 90, "available"],
  ["CR-02", "25T Mobile Hydraulic Crane", "crane", "F", 17500, 4900000, 11500, 6, 110, 170, 15, 2, 95, 90, "available"],
  ["CR-03", "50T All Terrain Crane", "crane", "G", 38000, 11500000, 24000, 3, 175, 80, 10, 0, 30, 120, "in_use"],
  ["CR-04", "8T Tower Crane", "crane", "H", 24000, 7800000, 15500, 8, 200, 60, 6, 1, 60, 60, "available"],

  ["BD-01", "D6 Class Crawler Dozer", "bulldozer", "A", 16000, 4600000, 10500, 4, 165, 100, 16, 1, 40, 90, "available"],
  ["BD-02", "Mid-size Bulldozer", "bulldozer", "C", 13000, 3300000, 8700, 6, 100, 180, 13, 3, 85, 90, "available"],
  ["BD-03", "Compact Dozer", "bulldozer", "E", 9000, 2100000, 6000, 2, 140, 120, 11, 0, 25, 120, "available"],
  ["BD-04", "Wheel Dozer", "bulldozer", "G", 15000, 3900000, 9900, 9, 70, 230, 9, 4, 130, 90, "available"],

  ["LD-01", "Backhoe Loader", "loader", "B", 6500, 1750000, 4300, 3, 180, 70, 24, 1, 30, 90, "available"],
  ["LD-02", "Wheel Loader 3cbm", "loader", "D", 9500, 2600000, 6300, 5, 130, 140, 17, 2, 70, 90, "available"],
  ["LD-03", "Skid Steer Loader", "loader", "F", 5000, 1150000, 3300, 1, 210, 40, 19, 0, 15, 120, "available"],
  ["LD-04", "Wheel Loader 4cbm", "loader", "H", 11500, 3100000, 7600, 4, 160, 100, 15, 1, 55, 90, "in_use"],

  ["CM-01", "Transit Mixer 6cbm", "concrete_mixer", "A", 5500, 2400000, 3700, 4, 145, 115, 21, 1, 45, 90, "available"],
  ["CM-02", "Self-Loading Mixer 2.5cbm", "concrete_mixer", "C", 7500, 3100000, 4600, 3, 170, 90, 18, 0, 38, 90, "available"],
  ["CM-03", "Batching Plant 30cbm/h", "concrete_mixer", "E", 12000, 4200000, 8000, 6, 110, 150, 8, 2, 100, 120, "available"],
  ["CM-04", "Drum Mixer 500L", "concrete_mixer", "F", 900, 145000, 800, 2, 200, 60, 30, 0, 20, 60, "available"],

  ["DT-01", "10-Wheel Tipper 16cbm", "dump_truck", "B", 6000, 3300000, 4000, 5, 190, 80, 26, 3, 65, 90, "available"],
  ["DT-02", "6-Wheel Tipper 10cbm", "dump_truck", "D", 4500, 2400000, 3000, 3, 175, 95, 22, 1, 33, 90, "available"],
  ["DT-03", "Articulated Dump Truck 25T", "dump_truck", "G", 14000, 9800000, 9300, 2, 205, 55, 14, 0, 22, 120, "in_use"],
  ["DT-04", "Mini Tipper 4cbm", "dump_truck", "H", 3000, 1150000, 2000, 7, 95, 190, 17, 3, 88, 60, "available"],
];

export const catalogEquipment = rows.map((row, i) => {
  const [code, label, type, siteKey, rent, sale, cost, age, op, idle, jobs, brk, svc, interval, availability] = row;
  const site = SITES[siteKey];
  const offset = ((i % 5) - 2) * 0.0025;

  return {
    name: `${code} ${label}`,
    type,
    location: site.name,
    coordinates: { lat: +(site.lat + offset).toFixed(5), lng: +(site.lng - offset).toFixed(5) },
    imageUrl: `/images/equipment/${code.toLowerCase()}.${IMAGE_EXT}`,
    availability,
    rentPerDay: rent,
    salePrice: sale,
    operatingCostPerDay: cost,
    purchaseDate: daysAgo(Math.round(age * 365)),
    operatingHoursLast30Days: op,
    idleHoursLast30Days: idle,
    totalJobsAssigned: jobs,
    breakdownCount: brk,
    lastServiceDate: daysAgo(svc),
    maintenanceIntervalDays: interval,
  };
});