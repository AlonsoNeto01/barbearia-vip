import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const lista = await prisma.agendamento.findMany({
      orderBy: { data: 'desc' }
    });
    return NextResponse.json({ lista });
  } catch (error) {
    return NextResponse.json({ lista: [], erro: "Falha ao buscar dados" }, { status: 500 });
  }
}