// Deterministic synthetic listings used until the PropTx IDX feed is approved.
// Every address, price and brokerage here is fictional.

import type { CityInfo, Listing, PropertyType, Room } from "./types";

interface CitySeed extends CityInfo {
  spread: [lng: number, lat: number]; // half-width of the area listings are scattered over
  priceFactor: number; // relative to the GTA baseline
  neighbourhoods: string[];
  postalPrefix: string[];
  weight: number; // share of generated listings
}

export const CITY_SEEDS: CitySeed[] = [
  {
    slug: "brampton", name: "Brampton", center: [-79.7624, 43.7315], spread: [0.09, 0.06], priceFactor: 0.95,
    neighbourhoods: ["Heart Lake", "Springdale", "Castlemore", "Credit Valley", "Fletcher's Meadow", "Bram East", "Northwest Brampton", "Downtown Brampton"],
    postalPrefix: ["L6P", "L6R", "L6S", "L6V", "L6X", "L6Y", "L6Z", "L7A"], weight: 22,
  },
  {
    slug: "mississauga", name: "Mississauga", center: [-79.6441, 43.589], spread: [0.1, 0.06], priceFactor: 1.05,
    neighbourhoods: ["Churchill Meadows", "Erin Mills", "Meadowvale", "Port Credit", "Square One", "Streetsville", "Lisgar", "Cooksville"],
    postalPrefix: ["L4Z", "L5A", "L5B", "L5L", "L5M", "L5N", "L5V", "L5W"], weight: 20,
  },
  {
    slug: "toronto", name: "Toronto", center: [-79.3832, 43.6832], spread: [0.13, 0.06], priceFactor: 1.2,
    neighbourhoods: ["The Annex", "Leslieville", "High Park", "Liberty Village", "Willowdale", "Scarborough Village", "Etobicoke Centre", "The Danforth"],
    postalPrefix: ["M4M", "M5R", "M6P", "M6K", "M2N", "M1J", "M9B", "M4K"], weight: 22,
  },
  {
    slug: "caledon", name: "Caledon", center: [-79.858, 43.8668], spread: [0.08, 0.05], priceFactor: 1.15,
    neighbourhoods: ["Bolton", "Caledon East", "Mayfield West", "Inglewood", "Palgrave"],
    postalPrefix: ["L7C", "L7E", "L7K"], weight: 6,
  },
  {
    slug: "vaughan", name: "Vaughan", center: [-79.4983, 43.8361], spread: [0.07, 0.04], priceFactor: 1.2,
    neighbourhoods: ["Woodbridge", "Maple", "Kleinburg", "Thornhill Woods", "Vellore Village"],
    postalPrefix: ["L4H", "L4J", "L4K", "L4L", "L6A"], weight: 9,
  },
  {
    slug: "milton", name: "Milton", center: [-79.8774, 43.5183], spread: [0.05, 0.035], priceFactor: 0.95,
    neighbourhoods: ["Beaty", "Clarke", "Dempsey", "Harrison", "Willmott", "Ford"],
    postalPrefix: ["L9T", "L9E"], weight: 7,
  },
  {
    slug: "oakville", name: "Oakville", center: [-79.6877, 43.4675], spread: [0.06, 0.035], priceFactor: 1.35,
    neighbourhoods: ["Glen Abbey", "River Oaks", "Old Oakville", "Bronte", "Joshua Creek", "West Oak Trails"],
    postalPrefix: ["L6H", "L6J", "L6K", "L6L", "L6M"], weight: 7,
  },
  {
    slug: "markham", name: "Markham", center: [-79.337, 43.8561], spread: [0.07, 0.04], priceFactor: 1.15,
    neighbourhoods: ["Unionville", "Cornell", "Markham Village", "Berczy", "Cathedraltown", "Milliken Mills"],
    postalPrefix: ["L3P", "L3R", "L3S", "L6B", "L6C", "L6E"], weight: 7,
  },
];

const STREETS = [
  "Maple Ridge Dr", "Sandalwood Pkwy", "Queen St", "Main St", "Elmcrest Ave", "Willow Bend Cres", "Kingsview Blvd",
  "Cedar Grove Rd", "Birchfield Ct", "Lakeshore Rd", "Ridgeway Dr", "Hillside Ave", "Oakmeadow Blvd", "Pinecrest Way",
  "Riverstone Dr", "Orchard Hill Rd", "Silverthorn Ave", "Heritage Rd", "Brookdale Cres", "Meadowlark Dr",
  "Stonegate Blvd", "Highland Park Ave", "Fairview St", "Sunnyside Ave", "Glenwood Cres", "Thistle Way",
];

const BROKERAGES = [
  "Northgate Realty Inc., Brokerage", "Lakeview Home Group Ltd., Brokerage", "Parkside Realty Corp., Brokerage",
  "Summit Key Realty Inc., Brokerage", "Bluewater Properties Ltd., Brokerage", "Cornerstone Homes Realty, Brokerage",
];

const FEATURES: Record<PropertyType, string[]> = {
  detached: ["Finished basement", "Separate side entrance", "Double car garage", "Fenced backyard", "Hardwood floors", "Quartz countertops", "Pot lights", "Interlocked driveway", "Walk-out deck", "Central air"],
  "semi-detached": ["Finished basement", "Single car garage", "Fenced backyard", "Updated kitchen", "Laminate floors", "Central air", "Close to transit", "Stainless steel appliances"],
  townhouse: ["Low maintenance fee", "Private terrace", "Attached garage", "Open-concept main floor", "Visitor parking", "Close to schools", "Ensuite laundry"],
  condo: ["24-hour concierge", "Gym and pool", "Balcony with views", "Ensuite laundry", "Underground parking", "Locker included", "Party room", "Floor-to-ceiling windows"],
};

const BASE_PRICE: Record<PropertyType, number> = {
  detached: 1_350_000,
  "semi-detached": 990_000,
  townhouse: 880_000,
  condo: 610_000,
};

// mulberry32 — small seeded PRNG so the sample set is identical on every run
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ID_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generate(count: number, referenceDate: Date): Listing[] {
  const rand = rng(20261018);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const totalWeight = CITY_SEEDS.reduce((sum, c) => sum + c.weight, 0);

  const pickCity = () => {
    let r = rand() * totalWeight;
    for (const city of CITY_SEEDS) {
      r -= city.weight;
      if (r <= 0) return city;
    }
    return CITY_SEEDS[0];
  };

  const pickType = (city: CitySeed): PropertyType => {
    const r = rand();
    // Toronto and Mississauga skew towards condos; the suburbs towards houses
    const condoShare = city.slug === "toronto" ? 0.45 : city.slug === "mississauga" ? 0.3 : 0.12;
    if (r < condoShare) return "condo";
    if (r < condoShare + 0.15) return "townhouse";
    if (r < condoShare + 0.3) return "semi-detached";
    return "detached";
  };

  const listings: Listing[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const city = pickCity();
    const type = pickType(city);
    const neighbourhood = pick(city.neighbourhoods);

    // Gaussian-ish scatter around the city centre
    const jitter = () => (rand() + rand() + rand() - 1.5) / 1.5;
    const lng = +(city.center[0] + jitter() * city.spread[0]).toFixed(6);
    const lat = +(city.center[1] + jitter() * city.spread[1]).toFixed(6);

    const bedrooms = type === "condo" ? between(1, 3) : type === "detached" ? between(3, 5) : between(2, 4);
    const bedroomsPlus = type === "condo" ? (rand() < 0.35 ? 1 : 0) : rand() < 0.4 ? between(1, 2) : 0;
    const bathrooms = Math.max(1, Math.min(bedrooms + 1, bedrooms - 1 + between(0, 2)));
    const parking = type === "condo" ? between(0, 1) : type === "detached" ? between(2, 6) : between(1, 3);

    const sizeBase = type === "condo" ? 500 + bedrooms * 200 : 900 + bedrooms * 450;
    const sqftLow = Math.floor((sizeBase + between(-150, 400)) / 100) * 100;
    const sqftRange = `${sqftLow}-${sqftLow + (type === "condo" ? 99 : 499)}`;

    const sizeFactor = 0.75 + bedrooms * 0.08 + bathrooms * 0.04;
    const noise = 0.85 + rand() * 0.35;
    const listPrice = Math.round((BASE_PRICE[type] * city.priceFactor * sizeFactor * noise) / 1000) * 1000 - (rand() < 0.5 ? 1000 : 0) + (rand() < 0.5 ? 900 : 0);

    const daysAgo = Math.floor(Math.pow(rand(), 1.6) * 90);
    const listDate = new Date(referenceDate.getTime() - daysAgo * 86_400_000).toISOString().slice(0, 10);

    let id = "";
    do {
      id = Array.from({ length: 12 }, () => ID_ALPHABET[Math.floor(rand() * ID_ALPHABET.length)]).join("");
    } while (seenIds.has(id));
    seenIds.add(id);

    const featurePool = [...FEATURES[type]].sort(() => rand() - 0.5);
    const features = featurePool.slice(0, between(4, 6));
    const streetName = pick(STREETS);
    const yearBuilt = type === "condo" ? between(1995, 2025) : between(1965, 2024);

    listings.push({
      id,
      mlsNumber: `${pick(["W", "E", "C", "N"])}${between(10_000_000, 12_999_999)}`,
      status: "active",
      listPrice,
      listDate,
      daysOnMarket: daysAgo,
      propertyType: type,
      address: {
        unit: type === "condo" ? String(between(2, 38) * 100 + between(1, 20)) : undefined,
        streetNumber: String(type === "condo" ? between(1, 400) : between(2, 299)),
        streetName,
        neighbourhood,
        city: city.name,
        citySlug: city.slug,
        province: "ON",
        postalCode: `${pick(city.postalPrefix)} ${between(1, 9)}${pick(["A", "B", "C", "E", "G", "H", "J", "K"])}${between(1, 9)}`,
      },
      lat,
      lng,
      bedrooms,
      bedroomsPlus,
      bathrooms,
      parking,
      sqftRange,
      lotSize: type === "condo" ? undefined : `${between(25, 60)} x ${between(90, 140)} ft`,
      yearBuilt,
      taxes: Math.round(listPrice * (0.006 + rand() * 0.003)),
      taxYear: referenceDate.getFullYear() - 1,
      maintenanceFee: type === "condo" ? between(450, 950) : type === "townhouse" && rand() < 0.6 ? between(200, 450) : undefined,
      description: describe(type, bedrooms, neighbourhood, city.name, features),
      features,
      rooms: rooms(type, bedrooms, rand),
      photoCount: between(8, 20),
      listingBrokerage: pick(BROKERAGES),
    });
  }

  return listings;
}

function describe(type: PropertyType, beds: number, neighbourhood: string, city: string, features: string[]) {
  const kind = { detached: "detached home", "semi-detached": "semi-detached home", townhouse: "townhome", condo: "condo suite" }[type];
  return [
    `Welcome to this bright ${beds}-bedroom ${kind} in the heart of ${neighbourhood}, ${city}.`,
    `Highlights include ${features.slice(0, 3).map((f) => f.toLowerCase()).join(", ")} and more.`,
    "Steps to schools, parks, shopping and transit, with quick access to major highways.",
    "This is sample data for site development — not a real listing.",
  ].join(" ");
}

function rooms(type: PropertyType, beds: number, rand: () => number): Room[] {
  const dim = () => `${(2.6 + rand() * 2.4).toFixed(2)} x ${(2.8 + rand() * 2.6).toFixed(2)} m`;
  const upper = type === "condo" ? "Main" : "Second";
  const list: Room[] = [
    { name: "Living", level: "Main", dimensions: dim() },
    { name: "Kitchen", level: "Main", dimensions: dim() },
    { name: "Dining", level: "Main", dimensions: dim() },
    { name: "Primary Bedroom", level: upper, dimensions: dim() },
  ];
  for (let b = 2; b <= beds; b++) list.push({ name: `Bedroom ${b}`, level: upper, dimensions: dim() });
  if (type !== "condo") list.push({ name: "Recreation", level: "Basement", dimensions: dim() });
  return list;
}

// Fixed reference date keeps "days on market" stable across builds of the sample set.
export const SAMPLE_REFERENCE_DATE = new Date("2026-10-15T12:00:00Z");
export const SAMPLE_LISTINGS: Listing[] = generate(600, SAMPLE_REFERENCE_DATE);
