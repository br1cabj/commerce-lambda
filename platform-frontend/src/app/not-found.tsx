import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <h1 className="text-6xl font-extrabold text-gray-200 mb-4">404</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Page not found
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
