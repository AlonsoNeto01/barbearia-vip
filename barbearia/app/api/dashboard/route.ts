import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ou onde está seu prisma client

export const dynamic = 'force-dynamic'; // Garante que não faça cache

export async function GET() {
  try {
    // Busca todos os agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { data: 'desc' }
    });

    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = new Date().getMonth();

    // Tabela de Preços (Se o preço não estiver salvo no banco, usamos isso)
    const precos: Record<string, number> = {
      "Corte de Cabelo": 35,
      "Barba": 25,
      "Corte + Barba": 55,
      "Pezinho/Sobrancelha": 10,
      "Combo VIP": 70
    };

    let faturamentoDia = 0;
    let faturamentoMes = 0;
    let agendamentosHoje = 0;

    agendamentos.forEach(item => {
      // Pega o preço (do banco ou da tabela fixa)
      // @ts-ignore
      const valor = item.preco || precos[item.servico] || 0;
      
      const dataItem = new Date(item.data).toISOString().split('T')[0];
      const mesItem = new Date(item.data).getMonth();

      // Soma Dia
      if (dataItem === hoje) {
        faturamentoDia += valor;
        agendamentosHoje++;
      }

      // Soma Mês
      if (mesItem === mesAtual) {
        faturamentoMes += valor;
      }
    });

    return NextResponse.json({
      faturamentoDia,
      faturamentoMes,
      agendamentosHoje,
      totalAgendamentos: agendamentos.length,
      ultimosAgendamentos: agendamentos.slice(0, 5) // Pega os 5 últimos
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}