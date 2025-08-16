import { PrismaClient, UserRole, SlotStatus, BookingStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const passwordHash = await bcrypt.hash("password123", 10);

	const team = await prisma.user.upsert({
		where: { email: "team@example.com" },
		update: {},
		create: { email: "team@example.com", name: "Sharks Dance Team", passwordHash, role: UserRole.TEAM },
	});

	const choreoUser = await prisma.user.upsert({
		where: { email: "choreo@example.com" },
		update: {},
		create: { email: "choreo@example.com", name: "Alex Rivera", passwordHash, role: UserRole.CHOREOGRAPHER },
	});

	const profile = await prisma.choreographerProfile.upsert({
		where: { userId: choreoUser.id },
		update: {},
		create: {
			userId: choreoUser.id,
			bio: "Touring choreographer specializing in hip-hop and pom.",
			location: "Austin, TX",
			reelUrl: "https://example.com/reel.mp4",
			specialties: ["hip-hop", "pom"],
			ratePerHour: 150,
		},
	});

	const slot1 = await prisma.availabilitySlot.create({
		data: {
			choreographerId: profile.id,
			start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
			status: SlotStatus.AVAILABLE,
		},
	});

	const booking = await prisma.booking.create({
		data: {
			choreographerUserId: choreoUser.id,
			teamUserId: team.id,
			availabilitySlotId: slot1.id,
			start: slot1.start,
			end: slot1.end,
			priceCents: 50000,
			currency: "usd",
			status: BookingStatus.CONFIRMED,
		},
	});

	await prisma.review.create({
		data: {
			bookingId: booking.id,
			choreographerProfileId: profile.id,
			authorUserId: team.id,
			rating: 5,
			comment: "Alex delivered an amazing routine and was great with the team!",
		},
	});

	await prisma.videoLesson.create({
		data: {
			choreographerProfileId: profile.id,
			title: "Intro to Pom Performance",
			description: "Foundations and a short routine for sidelines.",
			videoUrl: "https://example.com/video.mp4",
			priceCents: 2500,
		},
	});

	await prisma.payment.create({
		data: {
			bookingId: booking.id,
			amountCents: 50000,
			currency: "usd",
			provider: "stripe",
			providerRef: "pi_test_123",
			status: PaymentStatus.SUCCEEDED,
		},
	});

	console.log("Seeded users, profile, availability, booking, review, lesson, payment.");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
}).finally(async () => {
	await prisma.$disconnect();
});