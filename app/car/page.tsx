import CarsTable from "@/components/ui/cars-table";
import { getCars, getUserCars, getUserFavorites } from "@/lib/actions";
import { Car } from "@/lib/types";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import UserPanel from "@/components/ui/user-panel";

export default async function Cars() {
  const session = await auth(); // get the current logged-in user
  const initialCars: Car[] = await getCars();
  const userCars = await getUserCars();

  let initialFavorites: string[] = [];
  if (session?.user?.id) {
    initialFavorites = await getUserFavorites(Number(session.user.id));
  }

  return (
    <div className="p-6">
      <SessionProvider
        session={session}
      >
        <Suspense
          fallback={
            <p className="text-center text-gray-500 mt-10">Loading cars...</p>
          }
        >
          <UserPanel />
          <CarsTable
            initialCars={initialCars}
            initialFavorites={initialFavorites}
            userCars={userCars}
          />
        </Suspense>
      </SessionProvider>
    </div>
  );
}
