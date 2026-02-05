"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  // === ESTADOS DE SEGURANÇA ===
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [erroSenha, setErroSenha] = useState(false);

  // === ESTADOS DO PAINEL ===
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === CONFIGURAÇÃO DA SENHA ===
  const SENHA_SECRETA = "@Barbeiro2026"; 

  // 1. Verifica login salvo
  useEffect(() => {
    const loginSalvo = localStorage.getItem("barbearia_admin_token");
    if (loginSalvo === "logado") {
        setEstaLogado(true);
        carregarDados();
    }
  }, []);

  // 2. Função de Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === SENHA_SECRETA) {
        setEstaLogado(true);
        setErroSenha(false);
        localStorage.setItem("barbearia_admin_token", "logado");
        carregarDados();
    } else {
        setErroSenha(true);
        setSenhaInput("");
    }
  };

  // 3. Função de Logout
  const handleLogout = () => {
    setEstaLogado(false);
    localStorage.removeItem("barbearia_admin_token");
    setSenhaInput("");
  };

  // === CARREGAR DADOS ===
  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listar");
      const data = await res.json();
      setAgendamentos(data.lista || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // === DELETAR ===
  const deletarItem = async (id: string) => {
    if (!confirm("Deletar este agendamento?")) return;
    try {
        await fetch("/api/deletar", {
            method: "POST", 
            body: JSON.stringify({ id })
        });
        carregarDados();
    } catch (error) {
        alert("Erro ao deletar");
    }
  };

  // === CÁLCULOS DO DASHBOARD (A MÁGICA ACONTECE AQUI) 🧙‍♂️ ===
  const hojeData = new Date();
  
  // 1. Total Geral
  const totalGeral = agendamentos.reduce((acc, item) => acc + Number(item.precoTotal || 0), 0);

  // 2. Faturamento Hoje
  const faturamentoHoje = agendamentos.reduce((acc, item) => {
     const dataItem = new Date(item.data);
     // Compara se o dia, mês e ano são iguais a hoje
     if (dataItem.toDateString() === hojeData.toDateString()) {
         return acc + Number(item.precoTotal || 0);
     }
     return acc;
  }, 0);

  // 3. Faturamento Mês Atual
  const faturamentoMes = agendamentos.reduce((acc, item) => {
     const dataItem = new Date(item.data);
     // Compara se o mês e o ano são iguais
     if (dataItem.getMonth() === hojeData.getMonth() && dataItem.getFullYear() === hojeData.getFullYear()) {
         return acc + Number(item.precoTotal || 0);
     }
     return acc;
  }, 0);

  const qtdHoje = agendamentos.filter(item => new Date(item.data).toDateString() === hojeData.toDateString()).length;


  // === RENDERIZAÇÃO ===
  if (!estaLogado) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-sm text-center">
                <span className="text-5xl mb-4 block">🔒</span>
                <h1 className="text-2xl font-bold text-white mb-2">Área Restrita</h1>
                <p className="text-zinc-400 mb-6 text-sm">Digite a senha do administrador.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="password" 
                        value={senhaInput}
                        onChange={(e) => setSenhaInput(e.target.value)}
                        placeholder="Senha..." 
                        className={`w-full bg-black border rounded-lg p-3 text-white focus:outline-none transition-all
                            ${erroSenha ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-700 focus:border-yellow-500'}
                        `}
                    />
                    
                    {erroSenha && <p className="text-red-500 text-xs font-bold">Senha incorreta!</p>}

                    <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
                    Painel do Barbeiro 💈
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Bem-vindo, patrão.</p>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => carregarDados()} className="text-zinc-400 hover:text-white text-sm underline">
                    Atualizar Lista
                </button>
                <button 
                    onClick={handleLogout}
                    className="bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-zinc-700"
                >
                    Sair 🚪
                </button>
            </div>
        </div>

        {/* === CARDS DE FATURAMENTO (NOVO) === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* HOJE */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">📅</div>
                <h3 className="text-zinc-400 text-xs uppercase font-bold mb-1">Hoje</h3>
                <p className="text-3xl font-bold text-white">R$ {faturamentoHoje.toFixed(2)}</p>
                <span className="text-xs text-green-500 mt-2 block">{qtdHoje} clientes hoje</span>
            </div>

            {/* MÊS */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">💰</div>
                <h3 className="text-zinc-400 text-xs uppercase font-bold mb-1">Este Mês</h3>
                <p className="text-3xl font-bold text-yellow-500">R$ {faturamentoMes.toFixed(2)}</p>
                <span className="text-xs text-zinc-500 mt-2 block">Acumulado</span>
            </div>

            {/* TOTAL */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">📈</div>
                <h3 className="text-zinc-400 text-xs uppercase font-bold mb-1">Total Geral</h3>
                <p className="text-3xl font-bold text-white">R$ {totalGeral.toFixed(2)}</p>
                <span className="text-xs text-zinc-500 mt-2 block">{agendamentos.length} agendamentos</span>
            </div>
        </div>

        {/* LISTA DE AGENDAMENTOS */}
        {loading ? (
            <div className="flex justify-center py-20 text-zinc-500 animate-pulse">
                Calculando faturamento e carregando lista...
            </div>
        ) : (
            <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                <div className="p-4 bg-zinc-950 border-b border-zinc-800">
                    <h2 className="font-bold text-white">Agenda Completa</h2>
                </div>
                
                <div className="divide-y divide-zinc-800">
                    {agendamentos.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 hover:bg-zinc-800/30 transition-colors gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-white">{item.nomeCliente}</p>
                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 uppercase tracking-wide">
                                        {item.telefone}
                                    </span>
                                </div>
                                <p className="text-yellow-500/80 text-sm mt-1 flex items-center gap-2">
                                    <span>✂️ {item.servico}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span>📅 {new Date(item.data).toLocaleDateString('pt-BR')}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-white font-bold">⏰ {item.hora || new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-green-400 font-mono font-bold text-lg">
                                    R$ {Number(item.precoTotal).toFixed(2)}
                                </span>
                                <button 
                                    onClick={() => deletarItem(item.id)} 
                                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-lg transition-all"
                                    title="Deletar Agendamento"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {agendamentos.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-4xl mb-4">🌵</p>
                        <p className="text-zinc-500">Nenhum agendamento encontrado.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}