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

// Configura WebSocket para o driver Serverless do Neon
neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_2icau9JewmEv@ep-silent-moon-acqk7xpn-pooler.sa-east-1.aws.neon.tech/Logiq?sslmode=require";

function criarPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString });
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
