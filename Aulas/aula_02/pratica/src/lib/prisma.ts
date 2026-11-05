import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

export function criarPrisma(url = env.DATABASE_URL) {
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export type Prisma = ReturnType<typeof criarPrisma>;
