import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASSWORD = "change-me";

export function isAuthEnabled(): boolean {
	return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
}

export const authOptions: NextAuthOptions = {
	session: { strategy: "jwt" },
	providers: [
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

				const username = credentials?.username?.trim();
				const password = credentials?.password;
				const expectedUser = process.env.NEXTAUTH_ADMIN_USER ?? DEFAULT_ADMIN_USER;
				const expectedPassword = process.env.NEXTAUTH_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

				if (!username || !password) return null;
				if (username !== expectedUser || password !== expectedPassword) return null;

				return {
					id: "local-admin",
					name: username,
					email: `${username}@local`,
				};
			},
		}),
	],
	pages: {
		signIn: "/",
	},
};
