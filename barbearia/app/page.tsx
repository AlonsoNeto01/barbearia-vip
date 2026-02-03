"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [notificacao, setNotificacao] = useState<{ msg: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // === SEU NÚMERO DE WHATSAPP AQUI ===
  // Coloque o número do barbeiro (com 55 e DDD). Ex: 5511999999999
  const TELEFONE_BARBEIRO = "5511999999999"; 

  const horariosDisponiveis = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isModalOpen) {
        fetchHorariosOcupados(dataSelecionada);
    }
  }, [dataSelecionada, isModalOpen]);

  const fetchHorariosOcupados = async (data: string) => {
    try {
        const res = await fetch(`/api/horarios?data=${data}`);
        const json = await res.json();
        if (json.ocupados) {
            const formatados = json.ocupados.map((h: string) => h.slice(0, 5));
            setHorariosOcupados(formatados);
        }
    } catch (error) {
        console.error("Erro ao buscar horários", error);
    }
  };

  const mostrarNotificacao = (msg: string, tipo: 'sucesso' | 'erro') => {
    setNotificacao({ msg, tipo });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const handleAgendar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!horaSelecionada) {
        mostrarNotificacao("⏰ Por favor, selecione um horário!", "erro");
        return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const servico = formData.get("servico") as string;
    
    const dados = {
      nome: nome,
      telefone: formData.get("telefone"),
      data: dataSelecionada,
      hora: horaSelecionada,
      servico: servico,
    };

    try {
      const resposta = await fetch("/api/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const resultado = await resposta.json();
      
      if (resposta.ok) {
        mostrarNotificacao("✅ Agendamento Confirmado! Abrindo WhatsApp...", "sucesso");
        closeModal();
        setHoraSelecionada("");

        // === INTEGRAÇÃO WHATSAPP ===
        // Formata a data para ficar bonita (dia/mês)
        const dataFormatada = new Date(dataSelecionada).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        
        // Cria a mensagem
        const mensagem = `Olá! Sou *${nome}*. \nAcabei de agendar um *${servico}* para o dia *${dataFormatada}* às *${horaSelecionada}*. \nAguardo confirmação! 💈`;
        
        // Cria o link e abre em nova aba
        // Sem o cifrão ($), com o 55 (Brasil) e o número completo
const linkZap = `https://wa.me/5593991530375?text=${encodeURIComponent(`Olá! Sou *${nome}*. \nAcabei de agendar um *${servico}* para o dia *${dataFormatada}* às *${horaSelecionada}*. \nAguardo confirmação! 💈`)}`;
        window.location.href = linkZap;

      } else {
        mostrarNotificacao(`⚠️ ${resultado.erro}`, "erro");
        fetchHorariosOcupados(dataSelecionada);
      }
    } catch (erro) {
        mostrarNotificacao("❌ Erro de conexão.", "erro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* NOTIFICAÇÃO */}
      {notificacao && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm px-4">
            <div className={`p-6 rounded-2xl shadow-2xl border-2 flex flex-col items-center gap-3 max-w-sm w-full text-center animate-bounce-in ${notificacao.tipo === 'sucesso' ? 'bg-zinc-900 border-green-500 text-green-400' : 'bg-zinc-900 border-red-500 text-red-400'}`}>
              <span className="text-4xl">{notificacao.tipo === 'sucesso' ? '🎉' : '✋'}</span>
              <div>
                <h4 className="text-xl font-bold text-white">{notificacao.tipo === 'sucesso' ? 'Tudo Certo!' : 'Atenção'}</h4>
                <p className="text-zinc-300 mt-1">{notificacao.msg}</p>
              </div>
              <button onClick={() => setNotificacao(null)} className="mt-2 text-sm underline opacity-70 hover:opacity-100">Fechar</button>
            </div>
        </div>
      )}

      {/* CABEÇALHO */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-800">
        <div className="flex items-center gap-2">
            <span className="text-3xl">✂️</span> 
            <h1 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest">Barbearia VIP</h1>
        </div>
        <button onClick={openModal} className="hidden md:block border border-yellow-500 text-yellow-500 px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 hover:text-black transition-all">
           Agendar
        </button>
      </header>

      {/* HERO */}
      <main className="flex flex-col items-center justify-center py-20 px-4 text-center border-b border-zinc-800 bg-zinc-900/30">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Estilo é <span className="text-yellow-500">Eterno</span>
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl">
          Cuidamos do seu visual com a tradição da barbearia clássica e o estilo moderno que você merece.
        </p>
        <button onClick={openModal} className="bg-yellow-500 text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all shadow-lg shadow-yellow-500/20">
          Agendar Agora
        </button>
      </main>

      {/* === ÁREA DOS CARDS DE SERVIÇOS === */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            <span className="border-b-4 border-yellow-500 pb-2">Nossos Serviços</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* CARD 1 - CORTE */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 hover:border-yellow-500 transition-all group flex flex-col">
              <div className="text-5xl mb-4">💇‍♂️</div>
              <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-yellow-500">Corte de Cabelo</h3>
              <p className="text-zinc-400 mb-6 flex-grow">Degradê, social ou tesoura. Acabamento impecável.</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-800">
                <span className="text-2xl font-bold text-white">R$ 45,00</span>
                <button onClick={openModal} className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">Agendar</button>
              </div>
            </div>

            {/* CARD 2 - BARBA */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 hover:border-yellow-500 transition-all group flex flex-col">
              <div className="text-5xl mb-4">🪒</div>
              <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-yellow-500">Barba Modelada</h3>
              <p className="text-zinc-400 mb-6 flex-grow">Toalha quente, alinhamento e hidratação.</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-800">
                <span className="text-2xl font-bold text-white">R$ 35,00</span>
                <button onClick={openModal} className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">Agendar</button>
              </div>
            </div>

             {/* CARD 3 - VIP */}
             <div className="bg-zinc-900 p-8 rounded-2xl border-2 border-yellow-600/50 hover:border-yellow-500 transition-all group relative overflow-hidden flex flex-col shadow-lg shadow-yellow-900/20">
               <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <div className="text-5xl mb-4">👑</div>
              <h3 className="text-2xl font-bold mb-2 text-yellow-500">Combo VIP</h3>
              <p className="text-zinc-400 mb-6 flex-grow">Cabelo + Barba + Sobrancelha. O pacote completo.</p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-800">
                <span className="text-2xl font-bold text-white">R$ 70,00</span>
                <button onClick={openModal} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors">Agendar VIP</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MODAL / CALENDÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl w-full max-w-lg border border-zinc-700 shadow-2xl relative my-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 rounded-full w-8 h-8 flex items-center justify-center">✕</button>

            <h2 className="text-2xl font-bold mb-1 text-white">Agendar Horário</h2>
            <p className="text-zinc-400 mb-6 text-sm">Preencha os dados abaixo.</p>

            <form onSubmit={handleAgendar} className="space-y-5">
              <div className="space-y-3">
                <input name="nome" type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" placeholder="Seu Nome" required />
                <input name="telefone" type="tel" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" placeholder="Seu WhatsApp" required />
              </div>
              
              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800">
                  <label className="block text-sm font-bold text-zinc-400 mb-2">📅 Selecione a Data</label>
                  <input 
                      name="data" 
                      type="date" 
                      min={hoje}
                      value={dataSelecionada}
                      onChange={(e) => {
                          setDataSelecionada(e.target.value);
                          setHoraSelecionada("");
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none cursor-pointer mb-4" 
                      required 
                  />

                  <label className="block text-sm font-bold text-zinc-400 mb-2">⏰ Horários Disponíveis</label>
                  <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((hora) => {
                          const isOcupado = horariosOcupados.includes(hora);
                          const agora = new Date();
                          const isHoje = dataSelecionada === hoje;
                          const horaDoBotao = parseInt(hora.split(':')[0]);
                          const isPassado = isHoje && horaDoBotao <= agora.getHours();
                          const indisponivel = isOcupado || isPassado;

                          return (
                              <button
                                  key={hora}
                                  type="button"
                                  disabled={indisponivel}
                                  onClick={() => setHoraSelecionada(hora)}
                                  className={`
                                      py-2 text-sm font-bold rounded-md border transition-all
                                      ${horaSelecionada === hora 
                                          ? 'bg-yellow-500 text-black border-yellow-500 shadow-md transform scale-105' 
                                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-yellow-500'
                                      }
                                      ${indisponivel ? '!bg-zinc-900 !text-zinc-600 !border-transparent line-through opacity-50 cursor-not-allowed' : ''}
                                  `}
                              >
                                  {hora}
                              </button>
                          )
                      })}
                  </div>
                  <input type="hidden" name="hora" value={horaSelecionada} />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">✂️ Serviço</label>
                <select name="servico" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none cursor-pointer">
                    <option value="Corte de Cabelo">Corte de Cabelo (R$ 45)</option>
                    <option value="Barba">Barba (R$ 35)</option>
                    <option value="Combo VIP">Combo VIP (R$ 70)</option>
                </select>
              </div>

              <button type="submit" disabled={isLoading || !horaSelecionada} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                {isLoading ? "Enviando..." : "Confirmar Agendamento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}