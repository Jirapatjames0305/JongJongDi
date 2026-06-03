import { prisma } from "@jongjongdi/database";

// Returns the effective per-night price for a room on a given date
async function effectiveRoomPrice(roomId: string, basePrice: number, date: Date): Promise<number> {
  const season = await prisma.seasonPrice.findFirst({
    where: { roomId, startDate: { lte: date }, endDate: { gte: date } },
    orderBy: { createdAt: "desc" },
  });
  if (!season) return basePrice;
  if (season.absolutePrice != null) return season.absolutePrice;
  return Math.round(basePrice * season.multiplier);
}

// Sum nightly rates from checkIn (inclusive) to checkOut (exclusive)
export async function calcRoomTotal(roomId: string, basePrice: number, checkIn: Date, checkOut: Date): Promise<number> {
  let total = 0;
  const cur = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()));
  const end = new Date(Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()));
  while (cur < end) {
    total += await effectiveRoomPrice(roomId, basePrice, cur);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return total;
}

// Single-day per-person price for a tour on a given departure date
export async function effectiveTourPrice(tourId: string, basePrice: number, departureDate: Date): Promise<number> {
  const season = await prisma.seasonPrice.findFirst({
    where: { tourId, startDate: { lte: departureDate }, endDate: { gte: departureDate } },
    orderBy: { createdAt: "desc" },
  });
  if (!season) return basePrice;
  if (season.absolutePrice != null) return season.absolutePrice;
  return Math.round(basePrice * season.multiplier);
}
