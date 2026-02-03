import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, telefone, data, hora, servico } = body;

    const DURACAO_CORTE = 50; 
    const ABERTURA = 9; 
    const FECHAMENTO = 19; 

    const dataInicio = new Date(`${data}T${hora}:00`);
    const dataFim = new Date(dataInicio.getTime() + DURACAO_CORTE * 60000);

    const horaAgendada = dataInicio.getHours();
    
    if (horaAgendada < ABERTURA || dataFim.getHours() > FECHAMENTO || (dataFim.getHours() === FECHAMENTO && dataFim.getMinutes() > 0)) {
        return NextResponse.json({ sucesso: false, erro: `Estamos fechados! 🌙\nAtendemos das ${ABERTURA}h às ${FECHAMENTO}h.` }, { status: 400 });
    }

    const agendamentosDoDia = await prisma.agendamento.findMany({
        where: {
            data: {
                gte: new Date(`${data}T00:00:00`),
                lte: new Date(`${data}T23:59:59`),
            }
        }
    });

    const temConflito = agendamentosDoDia.some((agendamentoExistente) => {
        const inicioExistente = new Date(agendamentoExistente.data).getTime();
        const fimExistente = inicioExistente + (DURACAO_CORTE * 60000);
        const meuInicio = dataInicio.getTime();
        const meuFim = dataFim.getTime();
        return (inicioExistente < meuFim && fimExistente > meuInicio);
    });

    if (temConflito) {
        return NextResponse.json({ sucesso: false, erro: "Já existe um corte agendado nesse intervalo! 😢" }, { status: 409 });
    }

    let preco = 0;
    if (servico === "Corte de Cabelo") preco = 45.00;
    else if (servico === "Barba") preco = 35.00;
    else if (servico === "Combo VIP") preco = 70.00;

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        nomeCliente: nome,
        telefone: telefone,
        data: dataInicio,
        servico: servico,
        precoTotal: preco,
      },
    });

    return NextResponse.json({ sucesso: true, agendamento: novoAgendamento });
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return NextResponse.json({ sucesso: false, erro: "Erro interno." }, { status: 500 });
  }
}