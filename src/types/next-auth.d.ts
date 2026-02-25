import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: DefaultSession["user"] & {
			id?: string;
			role?: "viewer" | "analyst" | "trader" | "admin";
		};
	}

	interface User {
		role?: "viewer" | "analyst" | "trader" | "admin";
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		role?: "viewer" | "analyst" | "trader" | "admin";
	}
}
