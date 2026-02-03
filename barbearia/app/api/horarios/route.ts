import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) return NextResponse.json({ erro: "Data obrigatória" }, { status: 400 });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      data: {
        gte: new Date(`${data}T00:00:00`),
        lte: new Date(`${data}T23:59:59`),
      },
    },
    select: { data: true },
  });

  const horariosOcupados = agendamentos.map((item) => {
    const date = new Date(item.data);
    return date.toISOString().split('T')[1].slice(0, 5); 
  });

  return NextResponse.json({ ocupados: horariosOcupados });
}