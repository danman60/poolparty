import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
      <div className="text-8xl" role="img" aria-label="Lifeguard">
        🏊‍♂️
      </div>
      <h1 className="text-4xl font-bold">404 – Pool Not Found</h1>
      <p className="text-lg opacity-80 max-w-md">
        Looks like you've drifted into the deep end! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/wallet"
          className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          View Wallet
        </Link>
      </div>
      <div className="text-sm opacity-60 mt-8">
        Need help? Check the{" "}
        <Link href="/status" className="underline hover:opacity-100">
          system status
        </Link>
      </div>
    </div>
  );
}
