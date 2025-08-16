import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const booking = await prisma.booking.findUnique({
		where: { id },
		include: {
			team: true,
			choreographer: true,
			availabilitySlot: true,
			paymentRecords: true,
		},
	});
	if (!booking) return notFound();

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Booking</h1>
			<p className="text-sm">Team: {booking.team.name ?? booking.team.email}</p>
			<p className="text-sm">Choreographer: {booking.choreographer.name ?? booking.choreographer.email}</p>
			<p className="text-sm">Status: {booking.status}</p>
			<p className="text-sm">Price: ${(booking.priceCents / 100).toFixed(2)} {booking.currency.toUpperCase()}</p>
			<div>
				<form action="/api/checkout" method="post">
					<input type="hidden" name="bookingId" value={booking.id} />
					<button className="px-4 py-2 bg-black text-white rounded">Pay with Stripe</button>
				</form>
			</div>
			<div className="mt-6">
				<h2 className="font-medium">Payments</h2>
				<ul className="text-sm mt-2 space-y-1">
					{booking.paymentRecords.map((p) => (
						<li key={p.id}>${(p.amountCents / 100).toFixed(2)} - {p.status} ({p.provider})</li>
					))}
				</ul>
			</div>
		</div>
	);
}