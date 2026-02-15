import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db/client"
import * as schema from "./db/schema";

export const auth = betterAuth({
    baseURL: "http://localhost:8000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema,
    }),
    emailAndPassword: { enabled: true },
    trustedOrigins: ["http://localhost:5173"]
})