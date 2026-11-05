import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "../config.js";
import { PrismaClient } from "../generated/prisma/client.js";

export function criarPrisma(url = env.DATABASE_URL) {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

export type Prisma = ReturnType<typeof criarPrisma>;
