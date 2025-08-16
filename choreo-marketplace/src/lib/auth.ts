import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
	session: { strategy: "jwt" },
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(raw): Promise<(User & { id: string }) | null> {
				const parsed = credentialsSchema.safeParse(raw);
				if (!parsed.success) return null;
				const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
				if (!user || !user.passwordHash) return null;
				const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
				if (!valid) return null;
				return { id: user.id, email: user.email, name: user.name ?? undefined, image: user.image ?? undefined };
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }): Promise<JWT> {
			if (user) {
				(token as JWT & { id?: string }).id = (user as User & { id: string }).id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				const u = session.user as typeof session.user & { id?: string };
				const t = token as JWT & { id?: string };
				if (t.id) u.id = t.id;
			}
			return session;
		},
	},
};