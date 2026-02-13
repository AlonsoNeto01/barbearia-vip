"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // === LÓGICA DO MODAL E AGENDAMENTO (IGUAL AO ANTERIOR) ===
  const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<"Pedro" | "Elcivan" | "">("");
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [notificacao, setNotificacao] = useState<{ msg: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const TELEFONE_LOJA = "5593991530375"; 

  const gerarHorarios = () => {
    const horarios = [];
    let hora = 9;
    let minuto = 0;
    const fimHora = 19;
    while (hora < fimHora || (hora === fimHora && minuto === 0)) {
        const hFormatado = hora.toString().padStart(2, '0');
        const mFormatado = minuto.toString().padStart(2, '0');
        horarios.push(`${hFormatado}:${mFormatado}`);
        minuto += 40;
        if (minuto >= 60) { hora++; minuto -= 60; }
    }
    return horarios;
  };
  const horariosDisponiveis = gerarHorarios();
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isModalOpen && dataSelecionada && barbeiroSelecionado) {
        fetchHorariosOcupados();
    }
  }, [dataSelecionada, barbeiroSelecionado, isModalOpen]);

  const fetchHorariosOcupados = async () => {
    if (!barbeiroSelecionado) return;
    try {
        const res = await fetch(`/api/horarios?data=${dataSelecionada}&barbeiro=${barbeiroSelecionado}`);
        const json = await res.json();
        if (json.ocupados) setHorariosOcupados(json.ocupados);
    } catch (error) { console.error("Erro ao buscar horários", error); }
  };

  const mostrarNotificacao = (msg: string, tipo: 'sucesso' | 'erro') => {
    setNotificacao({ msg, tipo });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const handleAgendar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barbeiroSelecionado) { mostrarNotificacao("👨‍⚖️ Escolha um barbeiro!", "erro"); return; }
    if (!horaSelecionada) { mostrarNotificacao("⏰ Selecione um horário!", "erro"); return; }
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const servico = formData.get("servico") as string;
    const dados = {
      nome, telefone: formData.get("telefone"), data: dataSelecionada, hora: horaSelecionada, servico, barbeiro: barbeiroSelecionado
    };
    try {
      const resposta = await fetch("/api/agendar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados),
      });
      const resultado = await resposta.json();
      if (resposta.ok) {
        mostrarNotificacao("✅ Agendado com Sucesso!", "sucesso");
        setTimeout(() => {
            closeModal(); setHoraSelecionada("");
            const dataObj = new Date(dataSelecionada + 'T00:00:00'); 
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            const mensagem = `Olá! Sou *${nome}*. \nAgendei um *${servico}* com o *${barbeiroSelecionado}*.\n📅 Dia: ${dataFormatada}\n⏰ Hora: ${horaSelecionada}`;
            window.location.href = `https://wa.me/${TELEFONE_LOJA}?text=${encodeURIComponent(mensagem)}`;
        }, 1500);
      } else {
        mostrarNotificacao(`⚠️ ${resultado.erro}`, "erro");
        fetchHorariosOcupados();
      }
    } catch (erro) { mostrarNotificacao("❌ Erro de conexão.", "erro"); } finally { setIsLoading(false); }
  };

  // === NOVO VISUAL COMEÇA AQUI ===
  return (
    <div className="min-h-screen font-sans text-zinc-100 selection:bg-red-600 selection:text-white bg-black">
      
      {/* NOTIFICAÇÃO */}
      {notificacao && (
        <div className="fixed top-5 left-0 right-0 flex justify-center z-[100] px-4 animate-bounce-in">
            <div className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 max-w-sm w-full backdrop-blur-md ${notificacao.tipo === 'sucesso' ? 'bg-green-900/90 border-green-500' : 'bg-red-900/90 border-red-500'}`}>
              <span className="text-2xl">{notificacao.tipo === 'sucesso' ? '⚔️' : '⚠️'}</span>
              <p className="font-bold">{notificacao.msg}</p>
            </div>
        </div>
      )}

      {/* === 1. CABEÇALHO PREENCHIDO (HERO SECTION) === */}
      <header className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        {/* Imagem de Fundo e Overlay */}
        <div className="absolute inset-0 z-0">
            <img src="/fundo.jpg" alt="Background Barbearia" className="w-full h-full object-cover opacity-40 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl animate-fade-in-up">
            {/* Logo */}
            <img 
              src="/guerreiro.jpg" 
              alt="Logo Guerreiro" 
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-red-900/50 shadow-2xl shadow-red-900/30" 
            />
            
            {/* Título Principal */}
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic leading-none tracking-tighter drop-shadow-lg">
                GUERREIRO
                <span className="block text-red-600 text-3xl md:text-5xl font-bold tracking-widest not-italic mt-2">BARBEARIA</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-lg md:text-2xl text-zinc-300 max-w-2xl font-medium drop-shadow-md">
              Corte bom não muda só o cabelo. Muda a Atitude!.
            </p>

            {/* Botão de Ação */}
            <button onClick={openModal} className="mt-8 bg-red-700 text-white px-10 py-4 rounded-sm font-bold text-xl hover:bg-red-600 hover:scale-105 transition-all shadow-xl shadow-red-900/40 uppercase tracking-wider skew-x-[-10deg] border-2 border-red-700 hover:border-red-500">
              AGENDAR AGORA ⚔️
            </button>
        </div>
        
        {/* Ícone de Scroll */}
        <div className="absolute bottom-10 animate-bounce z-10">
            <span className="text-zinc-500 text-3xl">↓</span>
        </div>
      </header>

      {/* === 2. SEÇÃO DE SERVIÇOS (CARDS) === */}
      <section className="py-24 px-6 bg-zinc-950 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
            {/* Título da Seção */}
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-16 italic tracking-tighter">
                NOSSAS <span className="text-red-600">ESPECIALIDADES</span>
            </h2>

            {/* Grade de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Card 1: Combo Master */}
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-zinc-800 hover:border-red-600 transition-all group text-left relative overflow-hidden shadow-lg hover:shadow-red-900/20">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl group-hover:scale-110 transition-transform transform rotate-12">✂️</div>
                    <div className="text-5xl mb-6 text-red-600 group-hover:scale-110 transition-transform origin-left">✂️</div>
                    <h3 className="text-2xl font-bold text-white uppercase mb-3 group-hover:text-red-500 transition-colors">Combo Master</h3>
                    <p className="text-zinc-400 leading-relaxed">O pacote completo do guerreiro: Cabelo, barba, sobrancelha e limpeza de pele. Saia pronto para a batalha.</p>
                </div>

                {/* Card 2: Corte Degradê */}
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-zinc-800 hover:border-red-600 transition-all group text-left relative overflow-hidden shadow-lg hover:shadow-red-900/20">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl group-hover:scale-110 transition-transform transform rotate-12">💈</div>
                    <div className="text-5xl mb-6 text-red-600 group-hover:scale-110 transition-transform origin-left">💈</div>
                    <h3 className="text-2xl font-bold text-white uppercase mb-3 group-hover:text-red-500 transition-colors">Corte Degradê</h3>
                    <p className="text-zinc-400 leading-relaxed">O corte mais pedido. Precisão no disfarce e estilo moderno para quem quer marcar presença.</p>
                </div>

                {/* Card 3: Barba Lenhador */}
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-2xl border border-zinc-800 hover:border-red-600 transition-all group text-left relative overflow-hidden shadow-lg hover:shadow-red-900/20">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl group-hover:scale-110 transition-transform transform rotate-12">🧔🏻‍♂️</div>
                    <div className="text-5xl mb-6 text-red-600 group-hover:scale-110 transition-transform origin-left">🧔🏻‍♂️</div>
                    <h3 className="text-2xl font-bold text-white uppercase mb-3 group-hover:text-red-500 transition-colors">Barba Lenhador</h3>
                    <p className="text-zinc-400 leading-relaxed">Modelagem completa, alinhamento e hidratação para uma barba de respeito. Tratamento VIP.</p>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center border-t border-zinc-900 bg-black relative z-20">
         <p className="text-zinc-600 text-sm">© 2026 Guerreiro Barbearia. Todos os direitos reservados.</p>
      </footer>

      {/* === MODAL (MANTIDO IGUAL) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-zinc-900 w-full max-w-md rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="bg-zinc-950 p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white uppercase italic">Agendamento</h2>
                <button onClick={closeModal} className="text-zinc-500 hover:text-red-500 text-3xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAgendar} className="space-y-6">
                {/* 1. BARBEIRO */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block tracking-wider">Escolha seu Guerreiro</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => { setBarbeiroSelecionado("Pedro"); setHoraSelecionada(""); }} className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${barbeiroSelecionado === "Pedro" ? 'border-red-600 bg-red-900/20 text-white shadow-md shadow-red-900/20' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}>
                            <span className="text-3xl mb-1">🧔🏻‍♂️</span><span className="font-bold uppercase text-sm">Pedro</span>
                        </button>
                        <button type="button" onClick={() => { setBarbeiroSelecionado("Elcivan"); setHoraSelecionada(""); }} className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${barbeiroSelecionado === "Elcivan" ? 'border-red-600 bg-red-900/20 text-white shadow-md shadow-red-900/20' : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}>
                            <span className="text-3xl mb-1">👨🏾</span><span className="font-bold uppercase text-sm">Elcivan</span>
                        </button>
                    </div>
                </div>
                {/* 2. DADOS */}
                <div className="space-y-3">
                    <input name="nome" type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-600 outline-none placeholder-zinc-600 transition-colors" placeholder="Seu Nome" required />
                    <input name="telefone" type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-600 outline-none placeholder-zinc-600 transition-colors" placeholder="WhatsApp (Ex: 93999999999)" required />
                </div>
                {/* 3. DATA */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block tracking-wider">Data da Batalha</label>
                    <input name="data" type="date" min={hoje} value={dataSelecionada} onChange={(e) => { setDataSelecionada(e.target.value); setHoraSelecionada(""); }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-600 outline-none scheme-dark transition-colors cursor-pointer" required />
                </div>
                {/* 4. HORÁRIOS */}
                <div className={`transition-all duration-300 ${!barbeiroSelecionado ? 'opacity-40 pointer-events-none grayscale filter' : ''}`}>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block tracking-wider">Horários ({barbeiroSelecionado || 'Selecione o barbeiro'})</label>
                    <div className="grid grid-cols-4 gap-2">
                        {horariosDisponiveis.map((hora) => {
                            const isOcupado = horariosOcupados.includes(hora);
                            const agora = new Date();
                            const isHoje = dataSelecionada === hoje;
                            const [h, m] = hora.split(':').map(Number);
                            const dataHoraBotao = new Date(); dataHoraBotao.setHours(h, m, 0, 0);
                            const isPassado = isHoje && dataHoraBotao < agora;
                            const indisponivel = isOcupado || isPassado;
                            return (
                                <button key={hora} type="button" disabled={indisponivel} onClick={() => setHoraSelecionada(hora)} className={`py-2 text-sm font-bold rounded border-2 transition-all ${horaSelecionada === hora ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-900/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-red-500/50 hover:text-white hover:bg-zinc-800'} ${indisponivel ? '!bg-zinc-950 !text-zinc-700 !border-zinc-900 cursor-not-allowed line-through opacity-70' : ''}`}>{hora}</button>
                            )
                        })}
                    </div>
                </div>
                {/* 5. SERVIÇOS */}
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block tracking-wider">Missão (Serviço)</label>
                    <div className="relative">
                        <select name="servico" className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-600 outline-none appearance-none transition-colors cursor-pointer">
                            <optgroup label="Combos Campeões" className="bg-zinc-900 text-red-400 font-bold"><option value="Combo Master" className="bg-zinc-950 text-white font-normal">Combo Master (Completo)</option><option value="Combo Premium" className="bg-zinc-950 text-white font-normal">Combo Premium (Degradê + Barba)</option><option value="Combo Express" className="bg-zinc-950 text-white font-normal">Combo Express (Rápido)</option></optgroup>
                            <optgroup label="Cortes & Barba" className="bg-zinc-900 text-red-400 font-bold"><option value="Corte Navalhado" className="bg-zinc-950 text-white font-normal">Navalhado Preciso</option><option value="Corte Degradê" className="bg-zinc-950 text-white font-normal">Degradê Estilizado</option><option value="Corte Social" className="bg-zinc-950 text-white font-normal">Social Profissional</option><option value="Barba Lenhador" className="bg-zinc-950 text-white font-normal">Barba Lenhador</option><option value="Sobrancelha/Pezinho" className="bg-zinc-950 text-white font-normal">Sobrancelha / Pezinho</option></optgroup>
                            <optgroup label="Química/Outros" className="bg-zinc-950 text-red-400 font-bold"><option value="Platinado" className="bg-zinc-950 text-white font-normal">Platinado Intenso</option><option value="Luzes" className="bg-zinc-950 text-white font-normal">Luzes Brancas</option><option value="Limpeza de Pele" className="bg-zinc-950 text-white font-normal">Limpeza Facial</option></optgroup>
                        </select>
                        <div className="absolute right-3 top-3.5 text-zinc-500 pointer-events-none">▼</div>
                    </div>
                </div>
                <button type="submit" disabled={isLoading || !horaSelecionada || !barbeiroSelecionado} className="w-full bg-red-700 text-white font-bold py-4 rounded hover:bg-red-600 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest skew-x-[-5deg] border-2 border-red-700 hover:border-red-500">{isLoading ? "Processando..." : "CONFIRMAR MISSÃO ⚔️"}</button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}