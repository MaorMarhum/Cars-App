import GoBackButton from "@/components/ui/go-back-button";
import { getCarByPlate, getTavByPlate } from "@/lib/actions";
import { Accessibility } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [car, tav] = await Promise.all([getCarByPlate(id), getTavByPlate(id)]);

  if (!car) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl sm:text-4xl font-extrabold text-center mb-8 text-gray-900 tracking-tight">
        Car Details
        <span className="block mt-2 text-blue-600 text-2xl sm:text-3xl font-semibold">
          {car.mispar_rechev}
        </span>
      </h1>

      {/* ♿ Tav Neche Status */}
      <div className="flex justify-center items-center mb-8">
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-lg border shadow-sm ${
            tav ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}
        >
          <Accessibility
            size={40}
            strokeWidth={2.2}
            className={`${
              tav ? "text-green-600" : "text-red-600"
            } transition-colors`}
          />
          <span
            className={`text-lg font-semibold ${
              tav ? "text-green-700" : "text-red-700"
            }`}
          >
            {tav ? "Tav Neche: Active" : "No Tav Neche"}
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-3 sm:space-y-4 transition hover:shadow-lg">
        {Object.entries(car).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0"
          >
            {/* Left side (Label) */}
            <span className="font-semibold text-gray-800 capitalize w-1/2 sm:w-1/3">
              {key.replaceAll("_", " ")}
            </span>

            {/* Right side (Value) */}
            <span className="text-gray-600 text-right w-1/2 sm:w-2/3 break-words">
              {String(value) || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <GoBackButton />
      </div>
    </div>
  );
}
