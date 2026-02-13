const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🗑️  Tentando apagar a tabela Agendamento (Modo Simples)...");
    
    // Tirei o "CASCADE" que estava dando erro
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Agendamento";');
    
    console.log("✅ Tabela apagada com sucesso!");
  } catch (e) {
    console.error("❌ Erro:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();