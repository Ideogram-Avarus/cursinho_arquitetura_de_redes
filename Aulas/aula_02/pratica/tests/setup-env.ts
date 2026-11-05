// Roda antes de cada arquivo de teste (setupFiles): define o ambiente de teste.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.JWT_SECRET = "segredo-dos-testes";
process.env.ADMIN_PASSWORD = "senha-do-professor";
process.env.LOG_LEVEL = "silent";
