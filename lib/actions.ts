"use server";

import { api } from "@/lib/axios";
import { neon } from "@neondatabase/serverless";
import { Car } from "@/lib/types";
import { auth } from "./auth";

const sql = neon(process.env.DATABASE_URL!);

export async function getCars(search = "", page = 1) {
  const limit = 10;
  const offset = (page - 1) * limit;
  const res = await api.get("/datastore_search", {
    params: {
      resource_id: "053cea08-09bc-40ec-8f7a-156f0677aff3",
      q: search,
      limit,
      offset,
    },
  });

  return res.data.result.records as Car[];
}

export async function getCarByPlate(plate: string) {
  // First check if it's a user-added car from the local database
  try {
    const userCar = await sql`
      SELECT plate, manufacturer, model, year
      FROM user_cars
      WHERE plate = ${plate}
      LIMIT 1;
    `;

    if (userCar.length > 0) {
      const car = userCar[0];
      // Convert user car format to match the Car type structure
      return {
        mispar_rechev: car.plate,
        tozeret_nm: car.manufacturer,
        degem_nm: car.model,
        shnat_yitzur: car.year,
        isUserCar: true,
      } as any;
    }
  } catch (err) {
    console.error("Error checking user cars:", err);
    // Continue to external API if local check fails
  }

  // Fall back to external API if not found in user_cars
  const res = await api.get("/datastore_search", {
    params: {
      resource_id: "053cea08-09bc-40ec-8f7a-156f0677aff3",
      q: plate,
      limit: 1,
    },
  });

  const records = res.data.result.records as Car[];
  return records.length > 0 ? records[0] : null;
}

export async function getTavByPlate(plate: string) {
  const res = await api.get("/datastore_search", {
    params: {
      resource_id: "c8b9f9c8-4612-4068-934f-d4acd2e3c06e",
      q: plate,
      limit: 1,
    },
  });

  const records = res.data.result.records as Car[];
  return records.length > 0 ? true : false;
}

export async function addFavorite(userId: number, mispar_rechev: string) {
  try {
    await sql`
      INSERT INTO favorites (user_id, mispar_rechev)
      VALUES (${userId}, ${mispar_rechev})
      ON CONFLICT (user_id, mispar_rechev) DO NOTHING;
    `;
    return { success: true };
  } catch (error) {
    console.error("Error adding favorite:", error);
    return { success: false, error: "Database error" };
  }
}

export async function removeFavorite(userId: number, mispar_rechev: string) {
  try {
    await sql`
      DELETE FROM favorites
      WHERE user_id = ${userId} AND mispar_rechev = ${mispar_rechev};
    `;
    return { success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getUserFavorites(userId: number) {
  const favorites = await sql`
    SELECT mispar_rechev FROM favorites WHERE user_id = ${userId};
  `;
  return favorites.map((row) => row.mispar_rechev);
}

export async function addCar({
  plate,
  manufacturer,
  model,
  year,
}: {
  plate: string;
  manufacturer: string;
  model: string;
  year: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await sql`
      INSERT INTO user_cars (user_id, plate, manufacturer, model, year)
      VALUES (${userId}, ${plate}, ${manufacturer}, ${model}, ${year})
    `;
  } catch (err) {
    console.error("Error adding car:", err);
    throw new Error("Failed to add car");
  }
}

export async function getUserCars() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const rows = await sql`
      SELECT plate, manufacturer, model, year
      FROM user_cars
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    return rows.map((r) => ({
      plate: r.plate,
      manufacturer: r.manufacturer,
      model: r.model,
      year: r.year,
    }));
  } catch (err) {
    console.error("Error fetching user cars:", err);
    throw new Error("Failed to fetch user cars");
  }
}
