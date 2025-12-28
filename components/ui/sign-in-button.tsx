"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github } from "lucide-react"; // optional icon
import { useState } from "react";

export default function GitHubSignInButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("github"); // 👈 triggers the GitHub provider flow
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-700">
          Signed in as <span className="font-semibold">{session.user?.name}</span>
        </p>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
    >
      <Github size={20} />
      {loading ? "Connecting..." : "Sign in with GitHub"}
    </button>
  );
}