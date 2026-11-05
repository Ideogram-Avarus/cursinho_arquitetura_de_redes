# ---------- Etapa 1: instala dependências e compila (servidor + front) ----------
FROM node:22-slim AS build
WORKDIR /app

# openssl: o Prisma usa para escolher o binário certo do motor de migrations.
# python3/make/g++: para compilar o better-sqlite3 caso não exista binário pronto.
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- Etapa 2: imagem final, só com o necessário ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# openssl: necessário para o "prisma migrate deploy" que roda ao iniciar.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json /app/prisma.config.ts ./

EXPOSE 3000
# Cria o banco (vazio) e sobe o servidor. Sem volume: o que guarda os dados é o EXPORTAR do painel.
CMD ["npm", "run", "start:prod"]
