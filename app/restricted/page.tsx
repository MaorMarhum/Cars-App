import Button from "@/components/ui/button-self";

export default function RestrictedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Access Restricted 🚫
        </h1>
        <p className="text-gray-600 mb-6">
          You must sign in with GitHub to view this page.
        </p>

        <Button label="Back to Home" to="/" />
      </div>
    </main>
  );
}
