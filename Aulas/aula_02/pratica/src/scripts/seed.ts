// Recria os dados de demonstração. Uso: npm run db:seed
import { criarPrisma } from "@/lib/prisma";
import { resetarDados } from "@/lib/seed";

async function main() {
  const prisma = criarPrisma();
  await resetarDados(prisma);
  await prisma.$disconnect();
  console.log("🌱 Dados de demonstração recriados.");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
