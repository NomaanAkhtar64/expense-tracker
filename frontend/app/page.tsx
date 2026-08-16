import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Expense Tracker</h1>
        <p className="text-gray-600">Track your spending. Log in or register to get started.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
