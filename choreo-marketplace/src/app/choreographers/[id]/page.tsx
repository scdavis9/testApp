import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function ChoreographerProfilePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const profile = await prisma.choreographerProfile.findUnique({
		where: { id },
		include: {
			user: true,
			reviewsReceived: { include: { author: true } },
			availabilitySlots: { where: { status: "AVAILABLE" }, orderBy: { start: "asc" } },
			videoLessons: true,
		},
	});
	if (!profile) return notFound();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">{profile.user.name ?? profile.user.email}</h1>
				<p className="text-sm text-gray-600">{profile.location ?? "Location TBD"}</p>
				{profile.reelUrl && (
					<p className="mt-2"><a href={profile.reelUrl} className="text-blue-600 underline" target="_blank">Watch reel</a></p>
				)}
				<p className="mt-2">{profile.bio}</p>
				<p className="mt-2 text-sm">Specialties: {Array.isArray(profile.specialties) ? (profile.specialties as string[]).join(", ") : "—"}</p>
			</div>

			<section>
				<h2 className="text-lg font-medium">Availability</h2>
				<ul className="mt-2 space-y-2">
					{profile.availabilitySlots.map((slot) => (
						<li key={slot.id} className="flex items-center justify-between border rounded-md p-3">
							<span>{format(slot.start, "PPpp")} → {format(slot.end, "PPpp")}</span>
							<form action={`/api/bookings`} method="post" className="m-0">
								<input type="hidden" name="availabilitySlotId" value={slot.id} />
								<button className="text-sm px-3 py-1 rounded bg-black text-white">Request</button>
							</form>
						</li>
					))}
				</ul>
			</section>

			<section>
				<h2 className="text-lg font-medium">Video Lessons</h2>
				<ul className="mt-2 space-y-2">
					{profile.videoLessons.map((v) => (
						<li key={v.id} className="border rounded-md p-3 flex items-center justify-between">
							<div>
								<p className="font-medium">{v.title}</p>
								<p className="text-sm text-gray-600">${(v.priceCents / 100).toFixed(2)}</p>
							</div>
							<a href={v.videoUrl} className="text-sm px-3 py-1 rounded bg-gray-100">Preview</a>
						</li>
					))}
				</ul>
			</section>

			<section>
				<h2 className="text-lg font-medium">Reviews</h2>
				<ul className="mt-2 space-y-2">
					{profile.reviewsReceived.map((r) => (
						<li key={r.id} className="border rounded-md p-3">
							<p className="text-sm">Rating: {r.rating} / 5</p>
							<p className="text-xs text-gray-600">by {r.author.name ?? r.author.email}</p>
							{r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}