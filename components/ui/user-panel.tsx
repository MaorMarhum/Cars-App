"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image"; 

export default function UserPanel() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "unauthenticated") return null;

  if (status === "authenticated" && session.user?.image) {
    return (
      <div className="flex items-center justify-start gap-4 mb-2">
        <Link href="/account">
          {/* ✅ Replaced img with Image */}
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={48} // Matches w-12 (12 * 4px = 48px)
            height={48} // Matches h-12
            className="rounded-full border border-gray-300 shadow-sm cursor-pointer hover:opacity-80 transition object-cover"
          />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all duration-150"
        >
          Sign out
        </button>
      </div>
    );
  }

  return null;
}