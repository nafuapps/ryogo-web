import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { locations } from "./schema";
import { db } from "./index";
import { sql } from "drizzle-orm";

// Read CSV file
const csvPath = path.join(__dirname, "locations.csv");
const csvData = fs.readFileSync(csvPath, "utf-8");

// Define the type for a location row in CSV
type LocationRow = {
  City: string;
  State: string;
  Latitude: string;
  Longitude: string;
};

// Parse CSV
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
}) as LocationRow[];

// Seed function
export async function seedLocations() {
  for (const row of records) {
    // Geometry as POINT(longitude latitude) in SRID 4326
    const geometry = sql.raw(
      `ST_SetSRID(ST_MakePoint(${row.Longitude}, ${row.Latitude}), 4326)`
    );
    await db.insert(locations).values({
      city: row.City,
      state: row.State,
      latLong: `${row.Latitude},${row.Longitude}`,
      location: geometry,
      isActive: true,
    });
  }
  console.log(`Seeded ${records.length} locations`);
}

// Run if called directly
if (require.main === module) {
  seedLocations().then(() => process.exit(0));
}
