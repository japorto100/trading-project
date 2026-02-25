import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import PasskeyProvider from "next-auth/providers/passkey";
import { isAuthEnabled, isPasskeyProviderEnabled } from "@/lib/auth/runtime-flags";
import { verifyPassword } from "@/lib/server/auth-password";
import { consumePasskeySessionBootstrap } from "@/lib/server/passkey-session-bootstrap";
import { getPrismaClient } from "@/lib/server/prisma";

type AppRole = "viewer" | "analyst" | "trader" | "admin";

const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASSWORD = "change-me";
const DEFAULT_ADMIN_ROLE: AppRole = "trader";

function normalizeAppRole(value: unknown): AppRole {
	if (typeof value !== "string") return "viewer";
	const role = value.trim().toLowerCase();
	if (role === "analyst" || role === "trader" || role === "admin") {
		return role;
	}
	return "viewer";
}

const prisma = getPrismaClient();

const providers: NextAuthConfig["providers"] = [
	...(isPasskeyProviderEnabled() ? [PasskeyProvider({})] : []),
	CredentialsProvider({
		name: "Credentials",
		credentials: {
			username: { label: "Username", type: "text" },
			password: { label: "Password", type: "password" },
		},
		async authorize(credentials) {
			if (!isAuthEnabled()) {
				return null;
			}

			const username = typeof credentials?.username === "string" ? credentials.username.trim() : "";
			const password = typeof credentials?.password === "string" ? credentials.password : "";

			if (!username || !password) return null;

			const prisma = getPrismaClient();
			if (prisma) {
				const normalized = username.toLowerCase();
				const dbUser =
					(await prisma.user.findUnique({
						where: { email: normalized },
						select: { id: true, name: true, email: true, role: true, passwordHash: true },
					})) ??
					(await prisma.user.findFirst({
						where: { name: username },
						select: { id: true, name: true, email: true, role: true, passwordHash: true },
					}));

				if (dbUser?.passwordHash && verifyPassword(password, dbUser.passwordHash)) {
					return {
						id: dbUser.id,
						name: dbUser.name ?? dbUser.email ?? username,
						email: dbUser.email ?? `${dbUser.id}@local`,
						role: normalizeAppRole(dbUser.role),
					};
				}
			}

			const expectedUser = process.env.NEXTAUTH_ADMIN_USER ?? DEFAULT_ADMIN_USER;
			const expectedPassword = process.env.NEXTAUTH_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
			if (username !== expectedUser || password !== expectedPassword) return null;

			return {
				id: "local-admin",
				name: username,
				email: `${username}@local`,
				role: normalizeAppRole(process.env.NEXTAUTH_ADMIN_ROLE ?? DEFAULT_ADMIN_ROLE),
			};
		},
	}),
	CredentialsProvider({
		id: "passkey-scaffold",
		name: "Passkey Scaffold",
		credentials: {
			userId: { label: "User ID", type: "text" },
			proof: { label: "Proof", type: "text" },
		},
		async authorize(credentials) {
			if (!isAuthEnabled()) {
				return null;
			}
			if ((process.env.AUTH_PASSKEY_SCAFFOLD_ENABLED ?? "false").trim().toLowerCase() !== "true") {
				return null;
			}

			const userId = typeof credentials?.userId === "string" ? credentials.userId.trim() : "";
			const proof = typeof credentials?.proof === "string" ? credentials.proof.trim() : "";
			if (!userId || !proof) return null;

			const bootstrap = consumePasskeySessionBootstrap({ userId, proof });
			if (!bootstrap) return null;

			return {
				id: bootstrap.userId,
				name: bootstrap.email?.split("@")[0] ?? "passkey-user",
				email: bootstrap.email ?? `${bootstrap.userId}@passkey.local`,
				role: bootstrap.role,
			};
		},
	}),
];

export const authOptions: NextAuthConfig = {
	...(prisma ? { adapter: PrismaAdapter(prisma) } : {}),
	session: { strategy: "jwt" },
	providers,
	experimental: { enableWebAuthn: true },
	secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user && typeof user.id === "string" && user.id) {
				token.sub = user.id;
			}
			if (user && "role" in user) {
				token.role = normalizeAppRole(user.role);
			}
			if (!token.role) {
				token.role = "viewer";
			}
			if (typeof token.jti !== "string" || !token.jti) {
				token.jti = crypto.randomUUID();
			}
			// Go Gateway validates iss/aud when AUTH_JWT_ISSUER/AUTH_JWT_AUDIENCE are set; must match.
			const issuer = process.env.AUTH_JWT_ISSUER?.trim() || process.env.NEXTAUTH_URL?.trim();
			if (issuer) token.iss = issuer;
			const audience = process.env.AUTH_JWT_AUDIENCE?.trim();
			if (audience) token.aud = audience;
			return token;
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					id: typeof token.sub === "string" ? token.sub : undefined,
					role: normalizeAppRole(token.role),
				},
			};
		},
	},
	pages: {
		signIn: "/auth/sign-in",
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
