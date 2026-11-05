// Cria UMA vez um banco "modelo" com as migrations aplicadas; cada teste copia esse arquivo.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export const BANCO_MODELO = "prisma/teste-modelo.db";

export default function setup() {
  rmSync(BANCO_MODELO, { force: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: `file:./${BANCO_MODELO}` },
    stdio: "ignore",
  });
}
