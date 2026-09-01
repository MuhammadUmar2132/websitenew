import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8 text-sm">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/30"
      >
        Return to Home
      </Link>
    </div>
  );
}
