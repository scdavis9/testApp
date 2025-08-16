import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	const form = await request.formData();
	const bookingId = String(form.get("bookingId") ?? "");
	if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });

	const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
	if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

	await prisma.payment.create({
		data: {
			bookingId,
			amountCents: booking.priceCents,
			currency: booking.currency,
			provider: "stripe",
			providerRef: "test_pi",
			status: "SUCCEEDED",
		},
	});

	await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });

	return NextResponse.redirect(new URL(`/bookings/${bookingId}`, request.url));
}