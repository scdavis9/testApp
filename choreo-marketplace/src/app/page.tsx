import Link from "next/link";

export default function Home() {
	return (
		<div className="mx-auto max-w-3xl text-center py-16">
			<h1 className="text-3xl font-semibold">Find and Book Choreographers</h1>
			<p className="mt-3 text-gray-600">Browse specialties, watch reels, check availability, and book with transparent pricing.</p>
			<div className="mt-6">
				<Link href="/choreographers" className="px-5 py-2 rounded bg-black text-white">Browse choreographers</Link>
			</div>
		</div>
	);
}
