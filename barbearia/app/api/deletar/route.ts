import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ erro: "ID necessário" }, { status: 400 });

    await prisma.agendamento.delete({ where: { id: id } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ erro: "Erro ao deletar" }, { status: 500 });
  }
}