"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  // === ESTADOS ===
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SENHA_SECRETA = "@Barbeiro2026"; 

  // === 📱 CONFIGURE OS NÚMEROS DOS BARBEIROS AQUI ===
  const TELEFONES_BARBEIROS: Record<string, string> = {
    "Pedro": "5593991530375",   // Número do Pedro (Formato: 55 + DDD + Numero)
    "Elcivan": "5593999999999"  // <--- TROQUE PELO ZAP DO ELCIVAN
  };

  // 1. Verifica login
  useEffect(() => {
    const loginSalvo = localStorage.getItem("barbearia_admin_token");
    if (loginSalvo === "logado") {
        setEstaLogado(true);
        carregarDados();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === SENHA_SECRETA) {
        setEstaLogado(true);
        localStorage.setItem("barbearia_admin_token", "logado");
        carregarDados();
    } else {
        setErroSenha(true);
    }
  };

  const handleLogout = () => {
    setEstaLogado(false);
    localStorage.removeItem("barbearia_admin_token");
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
        const resDash = await fetch("/api/dashboard");
        const dadosDash = await resDash.json();
        setStats(dadosDash);

        const resLista = await fetch("/api/admin/listar");
        const dadosLista = await resLista.json();
        setAgendamentos(dadosLista.lista || []);

    } catch (error) {
        console.error("Erro ao carregar", error);
    } finally {
        setLoading(false);
    }
  };

  const deletarItem = async (id: string) => {
    if (!confirm("Deletar este agendamento?")) return;
    await fetch("/api/deletar", { method: "POST", body: JSON.stringify({ id }) });
    carregarDados();
  };

  // === FUNÇÕES DE WHATSAPP 💬 ===
  
  const avisarBarbeiro = (item: any) => {
    const telefoneBarbeiro = TELEFONES_BARBEIROS[item.barbeiro];
    
    if (!telefoneBarbeiro || telefoneBarbeiro.includes("0000")) {
        alert(`O telefone do ${item.barbeiro} não está configurado no código!`);
        return;
    }

    const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
    const msg = `Fala guerreiro *${item.barbeiro}*! 💈\nPassando pra avisar que tens um agendamento:\n\n👤 *Cliente:* ${item.nomeCliente}\n✂️ *Serviço:* ${item.servico}\n📅 *Data:* ${dataFormatada}\n⏰ *Hora:* ${item.hora}`;
    
    window.open(`https://wa.me/${telefoneBarbeiro}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const cobrarCliente = (item: any) => {
    // Remove caracteres não numéricos do telefone do cliente
    const telCliente = item.telefone.replace(/\D/g, "");
    const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');
    
    const msg = `Olá *${item.nomeCliente}*, tudo bem? ⚔️\nAqui é da Guerreiro Barbearia. Confirmando seu horário com o *${item.barbeiro}*:\n\n📅 ${dataFormatada} às *${item.hora}*\n✂️ ${item.servico}\n\nPodemos confirmar?`;

    window.open(`https://wa.me/55${telCliente}?text=${encodeURIComponent(msg)}`, '_blank');
  };


  // === TELA DE LOGIN ===
  if (!estaLogado) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm text-center shadow-2xl shadow-red-900/20">
                <img src="/guerreiro.jpg" className="w-24 h-24 mx-auto rounded-full border-4 border-red-900 mb-4 object-cover"/>
                <h1 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Área Restrita</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} placeholder="Senha..." className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-red-600 outline-none" />
                    {erroSenha && <p className="text-red-500 text-xs font-bold">Senha incorreta!</p>}
                    <button type="submit" className="w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors">ENTRAR</button>
                </form>
            </div>
        </div>
    );
  }

  // === PAINEL ===
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-red-600">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-6 gap-4">
            <div className="flex items-center gap-3">
                <img src="/guerreiro.jpg" className="w-12 h-12 rounded-full border-2 border-red-600 object-cover"/>
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic">Painel do <span className="text-red-600">Comandante</span></h1>
                    <p className="text-zinc-500 text-xs">Visão geral do campo de batalha</p>
                </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500 text-sm font-bold uppercase tracking-wider">Sair 🚪</button>
        </div>

        {/* CARDS KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-red-900/50 transition-all">
                <h3 className="text-zinc-500 text-xs uppercase font-bold mb-1">Faturamento Hoje</h3>
                <p className="text-4xl font-bold text-white">R$ {stats?.faturamentoDia?.toFixed(2) || '0.00'}</p>
                <div className="absolute top-4 right-4 text-red-900/20 text-4xl font-black">DIA</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-red-900/50 transition-all">
                <h3 className="text-zinc-500 text-xs uppercase font-bold mb-1">Faturamento Mês</h3>
                <p className="text-4xl font-bold text-red-600">R$ {stats?.faturamentoMes?.toFixed(2) || '0.00'}</p>
                <div className="absolute top-4 right-4 text-red-900/20 text-4xl font-black">MÊS</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-red-900/50 transition-all">
                <h3 className="text-zinc-500 text-xs uppercase font-bold mb-1">Total Missões</h3>
                <p className="text-4xl font-bold text-white">{stats?.totalAgendamentos || 0}</p>
                <div className="absolute top-4 right-4 text-red-900/20 text-4xl font-black">ALL</div>
            </div>
        </div>

        {/* LISTA */}
        <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-xl shadow-black/50">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <h2 className="font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    Próximas Missões
                </h2>
                <button onClick={carregarDados} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors">🔄 Atualizar</button>
            </div>
            
            <div className="divide-y divide-zinc-800">
                {agendamentos.map((item: any) => {
                    // Lógica para destacar quem é o barbeiro
                    const isPedro = item.barbeiro === "Pedro";
                    
                    return (
                    <div key={item.id} className="p-5 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        
                        {/* INFORMAÇÕES */}
                        <div className="flex items-start gap-4">
                            {/* Avatar do Barbeiro */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${isPedro ? 'border-zinc-500 bg-zinc-800' : 'border-yellow-700 bg-yellow-900/20'}`} title={item.barbeiro}>
                                {isPedro ? '🧔🏻‍♂️' : '👨🏾'}
                            </div>

                            <div>
                                <p className="font-bold text-lg text-white">{item.nomeCliente}</p>
                                <p className="text-sm text-zinc-400 flex items-center gap-2">
                                    <span className="text-red-500 font-bold">{item.hora}</span>
                                    <span>•</span>
                                    <span>{new Date(item.data).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs uppercase text-zinc-300">{item.servico}</span>
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">Barbeiro: <strong className={isPedro ? 'text-zinc-300' : 'text-yellow-600'}>{item.barbeiro}</strong></p>
                            </div>
                        </div>

                        {/* AÇÕES */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            
                            {/* Botão Avisar Barbeiro */}
                            <button 
                                onClick={() => avisarBarbeiro(item)}
                                className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                title={`Avisar ${item.barbeiro}`}
                            >
                                🔔 <span className="hidden md:inline">Avisar Barbeiro</span>
                            </button>

                            {/* Botão Confirmar Cliente */}
                            <button 
                                onClick={() => cobrarCliente(item)}
                                className="flex-1 md:flex-none bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900 px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                title="Confirmar com Cliente"
                            >
                                ✅ <span className="hidden md:inline">Confirmar</span>
                            </button>

                            {/* Botão Deletar */}
                            <button 
                                onClick={() => deletarItem(item.id)} 
                                className="bg-red-900/20 hover:bg-red-900/40 text-red-500 p-2 rounded border border-red-900/30 transition-all"
                            >
                                🗑️
                            </button>
                        </div>

                    </div>
                )})}

                {agendamentos.length === 0 && (
                    <div className="p-10 text-center text-zinc-500">
                        Nenhuma missão agendada, comandante.
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}