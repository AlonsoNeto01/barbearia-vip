import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, telefone, data, hora, servico, barbeiro } = body;

  if (!data || !hora || !barbeiro) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
  }

  // Cria a data completa (Data + Hora)
  const dataHora = new Date(`${data}T${hora}:00`);

  try {
    // Verifica se JÁ EXISTE agendamento para ESSE barbeiro nessa hora
    const conflito = await prisma.agendamento.findFirst({
        where: {
            data: dataHora,
            barbeiro: barbeiro
        }
    });

    if (conflito) {
        return NextResponse.json({ erro: `O barbeiro ${barbeiro} já está ocupado às ${hora}.` }, { status: 409 });
    }

    // Salva no banco
    await prisma.agendamento.create({
      data: {
        nome,
        telefone,
        data: dataHora,
        servico,
        barbeiro
      },
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ erro: "Erro ao salvar agendamento" }, { status: 500 });
  }
}