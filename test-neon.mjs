import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

async function run() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW()`;
    console.log("✅ SUCESSO: Conexão com Neon estabelecida! Data/Hora no servidor:", result[0].now);
    
    // Tenta ler a tabela de equipes para ver se as tabelas foram criadas
    const equipes = await sql`SELECT count(*) FROM equipes`;
    console.log("✅ TABELAS PRONTAS: Número de equipes cadastradas no momento:", equipes[0].count);
    
  } catch (err) {
    console.error("❌ FALHA AO CONECTAR NO NEON:", err.message);
  }
}
run();
