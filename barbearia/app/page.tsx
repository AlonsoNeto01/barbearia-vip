"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // Data de hoje para travar o calendário
  const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [notificacao, setNotificacao] = useState<{ msg: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // === SEU NÚMERO DE WHATSAPP AQUI ===
  const TELEFONE_BARBEIRO = "5593991530375"; 

  const horariosDisponiveis = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Busca horários ocupados
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
        
        setTimeout(() => {
            closeModal();
            setHoraSelecionada("");

            // Formatação para o WhatsApp
            const dataObj = new Date(dataSelecionada + 'T00:00:00'); 
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            
            const mensagem = `Olá! Sou *${nome}*. \nAcabei de agendar um *${servico}* para o dia *${dataFormatada}* às *${horaSelecionada}*. \nAguardo confirmação! 💈`;
            
            const linkZap = `https://wa.me/${TELEFONE_BARBEIRO}?text=${encodeURIComponent(mensagem)}`;
            window.location.href = linkZap;
        }, 1500);

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
    <div className="min-h-screen relative font-sans text-zinc-100 selection:bg-amber-500 selection:text-black overflow-x-hidden flex flex-col">
      
      {/* === FUNDO COM IMAGEM LOCAL (fundo.jpg na pasta public) === */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/fundo.jpg" 
          alt="Background Barbearia" 
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
             // Se der erro, carrega imagem da internet
             e.currentTarget.src = "https://images.unsplash.com/photo-1503951914205-98c43ce6436a?q=80&w=2000&auto=format&fit=crop"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950"></div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
          
          {/* NOTIFICAÇÃO */}
          {notificacao && (
            <div className="fixed top-5 left-0 right-0 flex justify-center z-[100] px-4 animate-bounce-in">
                <div className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 max-w-sm w-full backdrop-blur-md ${notificacao.tipo === 'sucesso' ? 'bg-green-900/80 border-green-500 text-green-100' : 'bg-red-900/80 border-red-500 text-red-100'}`}>
                  <span className="text-2xl">{notificacao.tipo === 'sucesso' ? '🎉' : '⚠️'}</span>
                  <div>
                    <h4 className="font-bold">{notificacao.tipo === 'sucesso' ? 'Sucesso!' : 'Atenção'}</h4>
                    <p className="text-sm opacity-90">{notificacao.msg}</p>
                  </div>
                </div>
            </div>
          )}

          {/* CABEÇALHO COM LOGO */}
          <header className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4">
                {/* LOGO DA EMPRESA (buteko.jpg na pasta public) */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black/50 rounded-full border-2 border-amber-500 p-1 shadow-lg shadow-amber-500/20 overflow-hidden flex items-center justify-center">
                    <img src="/buteko.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col">
                    <h1 className="text-xl md:text-3xl font-bold text-amber-500 uppercase tracking-widest drop-shadow-md">
                        BARBEARIA BUTEKO
                    </h1>
                    <span className="text-xs text-zinc-400 tracking-wider uppercase hidden md:block">Estilo & Tradição</span>
                </div>
            </div>
            
            <button onClick={openModal} className="hidden md:block bg-zinc-900/80 border border-amber-500/50 text-amber-500 px-8 py-3 rounded-full font-bold hover:bg-amber-500 hover:text-black transition-all shadow-lg hover:shadow-amber-500/30">
               Agendar
            </button>
          </header>

          {/* HERO SECTION */}
          <main className="flex flex-col items-center justify-center py-16 px-4 text-center flex-grow">
            <span className="text-amber-500 font-medium tracking-widest mb-6 uppercase text-xs md:text-sm bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20 animate-pulse">
                Aberto de Terça a Sábado
            </span>
            <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
              VISUAL DE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600">RESPEITO</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-2xl leading-relaxed drop-shadow-md">
              Mais que um corte, uma experiência. Cerveja gelada, resenha boa e o melhor degradê da região.
            </p>
            <button onClick={openModal} className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-12 py-5 rounded-full font-bold text-lg md:text-xl hover:to-amber-400 hover:scale-105 transition-all shadow-2xl shadow-amber-500/30 border-2 border-amber-400/50">
              QUERO AGENDAR AGORA
            </button>
          </main>

          {/* SERVIÇOS */}
          <section className="py-24 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-900 w-full">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white uppercase tracking-wider">
                Nossos <span className="text-amber-500 border-b-4 border-amber-500 pb-2">Serviços</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* CARD 1 */}
                <div className="group bg-zinc-900/60 p-10 rounded-3xl border border-zinc-800 hover:border-amber-500/50 transition-all hover:bg-zinc-900 hover:-translate-y-2 duration-300 flex flex-col items-center text-center shadow-xl">
                  <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform border border-zinc-800 group-hover:border-amber-500/30">✂️</div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-amber-500 transition-colors">Corte Moderno</h3>
                  <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Degradê, Navalhado, Social ou Tesoura. Acabamento perfeito com os melhores produtos.</p>
                  <span className="text-3xl font-bold text-amber-500 mt-auto">R$ 35,00</span>
                </div>

                {/* CARD 2 - VIP */}
                <div className="group bg-zinc-900 p-10 rounded-3xl border-2 border-amber-500/30 hover:border-amber-500 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-6 z-10">
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-wider">Mais Pedido</div>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-4xl mb-6 text-black shadow-lg group-hover:rotate-12 transition-transform">👑</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Combo do Patrão</h3>
                  <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Cabelo + Barba (Barboterapia) + Sobrancelha. O tratamento completo.</p>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 mt-auto">R$ 55,00</span>
                </div>

                {/* CARD 3 */}
                <div className="group bg-zinc-900/60 p-10 rounded-3xl border border-zinc-800 hover:border-amber-500/50 transition-all hover:bg-zinc-900 hover:-translate-y-2 duration-300 flex flex-col items-center text-center shadow-xl">
                  <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform border border-zinc-800 group-hover:border-amber-500/30">🪒</div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-amber-500 transition-colors">Barba Lenhador</h3>
                  <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Toalha quente, esfoliação, lâmina afiada e hidratação com óleo premium.</p>
                  <span className="text-3xl font-bold text-amber-500 mt-auto">R$ 25,00</span>
                </div>

              </div>
            </div>
          </section>

          {/* RODAPÉ (DIREITOS RESERVADOS) */}
          <footer className="py-10 text-center border-t border-zinc-900 bg-black/80 w-full relative z-20">
            <div className="flex flex-col gap-2">
                <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Barbearia Buteko. Todos os direitos reservados.</p>
                <p className="text-zinc-700 text-xs">Desenvolvido com tecnologia de ponta.</p>
            </div>
          </footer>
      </div>

      {/* === MODAL DE AGENDAMENTO (Mantido Igual) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeModal}></div>
          
          <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Agendar Horário</h2>
                    <p className="text-xs text-zinc-400">Preencha os dados abaixo</p>
                </div>
                <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors text-2xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
                <form onSubmit={handleAgendar} className="space-y-5">
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Seu Nome</label>
                        <input name="nome" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all placeholder-zinc-700" placeholder="Ex: João Silva" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">WhatsApp</label>
                        <input name="telefone" type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-all placeholder-zinc-700" placeholder="(00) 00000-0000" required />
                    </div>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Data do Corte</label>
                    <input 
                        name="data" 
                        type="date" 
                        min={hoje}
                        value={dataSelecionada}
                        onChange={(e) => {
                            setDataSelecionada(e.target.value);
                            setHoraSelecionada("");
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none cursor-pointer scheme-dark" 
                        required 
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-2 block">Horários Disponíveis</label>
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
                                        py-2 text-sm font-bold rounded-lg border transition-all
                                        ${horaSelecionada === hora 
                                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-amber-500/50 hover:text-white'
                                        }
                                        ${indisponivel ? '!bg-zinc-900/50 !text-zinc-700 !border-transparent cursor-not-allowed line-through' : ''}
                                    `}
                                >
                                    {hora}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Serviço</label>
                    <div className="relative">
                        <select name="servico" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none appearance-none cursor-pointer">
                            <option value="Corte de Cabelo">Corte de Cabelo (R$ 35)</option>
                            <option value="Barba">Barba (R$ 25)</option>
                            <option value="Corte + Barba">Corte + Barba (R$ 55)</option>
                            <option value="Pezinho/Sobrancelha">Pezinho (R$ 10)</option>
                            <option value="Combo VIP">Combo VIP (R$ 70)</option>
                        </select>
                        <div className="absolute right-3 top-3.5 text-zinc-500 pointer-events-none">▼</div>
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !horaSelecionada} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded-xl hover:to-amber-400 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                    {isLoading ? "Processando..." : "CONFIRMAR AGENDAMENTO ➤"}
                </button>

                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}