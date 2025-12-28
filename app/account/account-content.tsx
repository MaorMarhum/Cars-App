"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // Better navigation
import Image from "next/image"; // Optimized images
import { getUserFavorites, getCarByPlate, removeFavorite } from "@/lib/actions";
import { Car } from "@/lib/types";
import Button from "@/components/ui/button-self";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

export default function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const plates = await getUserFavorites(Number(session.user.id));
      
      const cars = await Promise.all(
        plates.map(async (plate) => {
          const car = await getCarByPlate(plate);
          return car;
        })
      );
      setFavoriteCars(cars.filter(Boolean) as Car[]);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]); // Only recreate if user ID changes

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchFavorites();
    }
  }, [status, session?.user?.id, fetchFavorites]); // fetchFavorites is now safe to include

  // ✅ Remove favorite handler
  async function handleRemoveFavorite(e: React.MouseEvent, plate: string) {
    e.stopPropagation(); // prevent row click navigation
    if (!session?.user?.id) return;

    try {
      await removeFavorite(Number(session.user.id), plate);
      // instantly update UI without waiting for another DB fetch
      setFavoriteCars((prev) =>
        prev.filter((car) => car.mispar_rechev.toString() !== plate)
      );
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite. Try again.");
    }
  }

  // 🧠 Handle auth states
  if (status === "loading")
    return <p className="text-gray-500 text-center mt-10">Loading Account...</p>;

  if (status === "unauthenticated")
    return (
      <p className="text-gray-500 text-center mt-10">
        Please sign in to view your account.
      </p>
    );

  const user = session?.user;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all duration-150"
        >
          Sign out
        </button>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-20 h-20">
          <Image
            src={user?.image || "/default-avatar.png"}
            alt={user?.name || "User"}
            fill // Fills the parent container
            className="rounded-full border border-gray-300 shadow-sm object-cover"
            sizes="80px"
            priority
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>

      {/* Favorites Table */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        ⭐ Favorite Cars
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading favorites...</p>
      ) : favoriteCars.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Plate</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-center">Remove</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {favoriteCars.map((car) => (
                <TableRow
                  key={car._id || car.mispar_rechev}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/car/${car.mispar_rechev}`)} // ✅ Improved Navigation
                >
                  <TableCell>{car.mispar_rechev}</TableCell>
                  <TableCell>{car.tozeret_nm}</TableCell>
                  <TableCell>{car.degem_nm}</TableCell>
                  <TableCell>{car.shnat_yitzur}</TableCell>
                  <TableCell className="text-center">
                    <div
                      onClick={(e) =>
                        handleRemoveFavorite(e, car.mispar_rechev.toString())
                      }
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-yellow-50 active:scale-95 transition-all duration-150 cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Star
                        size={26}
                        strokeWidth={2}
                        className="text-yellow-400 fill-yellow-400 hover:text-gray-400 hover:fill-gray-300 transition-colors"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-600">You have no favorite cars yet.</p>
      )}

      <div className="flex justify-center items-center gap-4 mt-6">
        <Button label="Back to List" to="/car" />
      </div>
    </div>
  );
}