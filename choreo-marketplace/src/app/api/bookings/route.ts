import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type SessionUser = { id: string; email?: string | null; name?: string | null; image?: string | null; role?: string };

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const user = session.user as SessionUser;

	const form = await request.formData();
	const availabilitySlotId = String(form.get("availabilitySlotId") ?? "");
	if (!availabilitySlotId) return NextResponse.json({ error: "Missing slot" }, { status: 400 });

	const slot = await prisma.availabilitySlot.findUnique({ include: { choreographer: { include: { user: true } } }, where: { id: availabilitySlotId } });
	if (!slot || slot.status !== "AVAILABLE") return NextResponse.json({ error: "Slot unavailable" }, { status: 400 });

	const booking = await prisma.booking.create({
		data: {
			availabilitySlotId: slot.id,
			start: slot.start,
			end: slot.end,
			teamUserId: user.id,
			choreographerUserId: slot.choreographer.userId,
			priceCents: slot.choreographer.ratePerHour ? Math.max(0, slot.choreographer.ratePerHour) * 100 : 0,
		},
	});

	await prisma.availabilitySlot.update({ where: { id: slot.id }, data: { status: "HOLD" } });

	return NextResponse.redirect(new URL(`/bookings/${booking.id}`, request.url));
}