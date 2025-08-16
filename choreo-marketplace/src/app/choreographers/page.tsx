import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ChoreographersPage() {
	const profiles = await prisma.choreographerProfile.findMany({
		include: { user: true, reviewsReceived: true },
		orderBy: { createdAt: "desc" },
	});
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Choreographers</h1>
			<ul className="grid md:grid-cols-2 gap-6">
				{profiles.map((p) => {
					const avg = p.reviewsReceived.length
						? (p.reviewsReceived.reduce((s, r) => s + r.rating, 0) / p.reviewsReceived.length).toFixed(1)
						: "-";
					return (
						<li key={p.id} className="border rounded-md p-4 flex gap-4">
							<div className="flex-1">
								<h2 className="text-lg font-medium">{p.user.name ?? p.user.email}</h2>
								<p className="text-sm text-gray-600">{p.location ?? "Location TBD"}</p>
								<p className="mt-2 text-sm">Specialties: {Array.isArray(p.specialties) ? (p.specialties as string[]).join(", ") : "—"}</p>
								<p className="mt-1 text-sm">Rating: {avg}</p>
								<div className="mt-3">
									<Link href={`/choreographers/${p.id}`} className="text-blue-600 underline">View profile</Link>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}