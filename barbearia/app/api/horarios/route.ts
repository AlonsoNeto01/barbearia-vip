import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataString = searchParams.get('data'); // Ex: 2026-02-13
  const barbeiro = searchParams.get('barbeiro'); // Ex: Pedro

  if (!dataString || !barbeiro) {
    return NextResponse.json({ error: 'Data e Barbeiro são obrigatórios' }, { status: 400 });
  }

  // Define o intervalo do dia (00:00 até 23:59)
  const inicioDia = new Date(`${dataString}T00:00:00`);
  const fimDia = new Date(`${dataString}T23:59:59`);

  try {
    // Busca agendamentos SÓ daquele dia e SÓ daquele barbeiro
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data: {
          gte: inicioDia,
          lte: fimDia,
        },
        barbeiro: barbeiro // Filtra pelo barbeiro escolhido
      },
    });

    // Extrai apenas as horas ocupadas (Ex: "09:40")
    const ocupados = agendamentos.map((ag) => {
      return ag.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    });

    return NextResponse.json({ ocupados });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 });
  }
}