// ============================================================================
// Prisma Client — singleton com adapter Neon para serverless
// ============================================================================
// Por quê um singleton?
// Em dev, o Next.js faz hot-reload e re-executa módulos. Sem cache em
// `globalThis`, cada reload criaria uma nova instância de PrismaClient,
// esgotando conexões no Neon. Em produção (Vercel), cada invocação cold-start
// cria sua própria instância, mas o pooler do Neon (-pooler no host) cuida
// de não estourar o limite.
// ============================================================================

import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// O driver serverless do Neon precisa de uma implementação de WebSocket.
// Em Node.js usamos a lib `ws`; em edge runtimes (Cloudflare, Vercel Edge)
// o runtime já fornece WebSocket nativo.
neonConfig.webSocketConstructor = ws;

function criarPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
}

// Cache em globalThis para sobreviver ao hot-reload do Next.js em dev.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalParaPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
