import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

// Roda uma vez antes de todos os testes: cria um banco prisma/test.db novo com as migrations.
export default function globalSetup() {
  const raiz = join(__dirname, "..");
  for (const arquivo of ["test.db", "test.db-journal"]) rmSync(join(raiz, "prisma", arquivo), { force: true });

  execSync("npx prisma migrate deploy", {
    cwd: raiz,
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "ignore",
  });
}
