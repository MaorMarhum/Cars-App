"use client";

import { Star, User as UserIcon } from "lucide-react";
import { getCars, addFavorite, removeFavorite } from "@/lib/actions";
import { Car, ExtendedCar } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button-self";
import { useSession } from "next-auth/react";

// ✅ Fix 1: Define a type for the userCars object
// This eliminates the 'any' error by strictly typing the expected shape.
type UserCarProp = {
  plate: string | number;
  manufacturer: string;
  model: string;
  year: string | number;
};

export default function CarsTable({
  initialCars,
  userCars = [],
  initialFavorites = [],
}: {
  initialCars: Car[];
  userCars?: UserCarProp[]; // ✅ Applied the type here
  initialFavorites?: string[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || "1");

  const [cars, setCars] = useState<Car[]>(initialCars);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(initialFavorites)
  );

  // Fetch cars when URL changes
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const fetched = await getCars(search, page);
        setCars(fetched);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [search, page]);

  // Merge user cars into the list (ensure unique plates)
  const combinedCars: ExtendedCar[] = [
    ...(page === 1
      ? userCars.map((uc) => ({
          mispar_rechev: uc.plate,
          tozeret_nm: uc.manufacturer,
          degem_nm: uc.model,
          shnat_yitzur: uc.year,
          isUserCar: true,
        }))
      : []),
    ...cars
      .filter(
        (govCar) => !userCars.some((uc) => uc.plate === govCar.mispar_rechev)
      )
      .map((govCar) => ({
        ...govCar,
        isUserCar: false,
      })),
  ];

  // Update URL with page number and search
  const updateUrl = (newSearch: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newPage > 1) params.set("page", newPage.toString());
    const query = params.toString();
    router.replace(query ? `/car/?${query}` : "/car");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => updateUrl(newValue, 1), 500);
    setTypingTimeout(timeout);
  };

  const nextPage = () => updateUrl(search, page + 1);
  const prevPage = () => updateUrl(search, Math.max(1, page - 1));

  async function toggleFavorite(e: React.MouseEvent, plate: string) {
    e.stopPropagation();

    if (!session?.user?.id) {
      alert("You must be signed in to favorite cars.");
      return;
    }

    const isFav = favorites.has(plate);
    try {
      if (isFav) {
        await removeFavorite(Number(session.user.id), plate);
        setFavorites((prev) => {
          const copy = new Set(prev);
          copy.delete(plate);
          return copy;
        });
      } else {
        await addFavorite(Number(session.user.id), plate);
        setFavorites((prev) => new Set(prev).add(plate));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  return (
    <div className="p-6">
      {/* Top section: search + add button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearchChange}
          placeholder="Search by Plate Number"
          className="w-full sm:max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition"
        />

        {/* Add Car button */}
        <Button
          label="Add Car"
          onClick={() => router.push("/car/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm active:scale-95 transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        )}

        {/* ✅ Fix 2: Ensure TableCaption is not imported above */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[150px] text-gray-700 font-semibold uppercase tracking-wide text-sm">
                Plate Number
              </TableHead>
              <TableHead className="text-gray-700 font-semibold uppercase tracking-wide text-sm">
                Manufacturer
              </TableHead>
              <TableHead className="text-gray-700 font-semibold uppercase tracking-wide text-sm">
                Model
              </TableHead>
              <TableHead className="text-gray-700 font-semibold uppercase tracking-wide text-sm">
                Year
              </TableHead>
              <TableHead className="text-gray-700 font-semibold uppercase tracking-wide text-sm text-center">
                Favorite
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {combinedCars.length > 0 ? (
              combinedCars.map((car) => (
                <TableRow
                  key={car.mispar_rechev}
                  onClick={() => router.push(`/car/${car.mispar_rechev}`)}
                  className={`hover:bg-blue-50 cursor-pointer transition active:scale-[0.99] ${
                    car.isUserCar ? "bg-blue-50/30" : ""
                  }`}
                >
                  <TableCell className="font-medium text-gray-800 flex items-center gap-2">
                    {car.mispar_rechev}
                    {car.isUserCar && (
                      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        <UserIcon size={12} /> You
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{car.tozeret_nm}</TableCell>
                  <TableCell>{car.degem_nm}</TableCell>
                  <TableCell>{car.shnat_yitzur}</TableCell>
                  <TableCell className="text-center">
                    <div
                      onClick={(e) =>
                        toggleFavorite(e, car.mispar_rechev.toString())
                      }
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-yellow-50 active:scale-95 transition-all duration-150 cursor-pointer"
                    >
                      <Star
                        size={26}
                        strokeWidth={2}
                        className={`transition-colors ${
                          favorites.has(car.mispar_rechev.toString())
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No cars found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          label="Previous"
          onClick={prevPage}
          disabled={page === 1 || loading}
          variant="secondary"
        />
        <span className="text-gray-600 font-medium">Page {page}</span>
        <Button
          label="Next"
          onClick={nextPage}
          disabled={loading || cars.length < 10}
        />
      </div>

      {/* Back home */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button label="Back Home" to="/" />
      </div>
    </div>
  );
}