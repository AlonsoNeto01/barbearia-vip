import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: { data: 'desc' },
    });

    // TABELA DE PREÇOS (O sistema usa isso para calcular)
    const tabelaDePrecos: Record<string, number> = {
      "Corte de Cabelo": 35,
      "Barba": 25,
      "Corte + Barba": 55,
      "Pezinho/Sobrancelha": 10,
      "Combo VIP": 70
    };

    // Aqui a mágica acontece: Para cada agendamento, ele descobre o preço
    const listaAtualizada = agendamentos.map(item => {
        let valor = 0;
        
        // 1. Tenta pegar o preço pelo nome exato
        // @ts-ignore
        if (tabelaDePrecos[item.servico]) {
            // @ts-ignore
            valor = tabelaDePrecos[item.servico];
        } 
        // 2. Se não achar (caso mudou o nome), tenta adivinhar pelo texto
        else if (item.servico) {
            const nome = item.servico.toLowerCase();
            if (nome.includes('combo')) valor = 70;
            else if (nome.includes('corte') && nome.includes('barba')) valor = 55;
            else if (nome.includes('corte')) valor = 35;
            else if (nome.includes('barba')) valor = 25;
            else if (nome.includes('pezinho') || nome.includes('sobrancelha')) valor = 10;
        }

        return {
            ...item,
            precoTotal: valor // Adiciona o campo preço calculado
        };
    });

    return NextResponse.json({ lista: listaAtualizada });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}