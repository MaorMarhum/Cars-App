import Button from "@/components/ui/button-self";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-3">404 — Not Found</h1>
      <p className="text-gray-600 mb-6">
        The car you’re looking for doesn’t exist or was removed.
      </p>
      <Button label="Back to List" to="/car"/>
    </div>
  );
}