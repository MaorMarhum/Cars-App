import Button from "@/components/ui/button-self";
import GitHubSignInButton from "@/components/ui/sign-in-button";
import { SessionProvider } from "next-auth/react";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 flex flex-col items-center space-y-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>

        <p className="text-gray-500 text-center">
          Sign in with GitHub to access the car list.
        </p>

        <SessionProvider>
          <GitHubSignInButton />
        </SessionProvider>

        <div className="w-full border-t border-gray-200 my-4"></div>

        <Button label="Go to List" to="/car" variant="primary" />
      </div>
    </main>
  );
}
