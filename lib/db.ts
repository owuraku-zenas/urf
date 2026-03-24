import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const db = (globalThis as any).prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = db
} 