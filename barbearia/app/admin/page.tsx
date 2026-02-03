"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  // === ESTADOS DE SEGURANÇA ===
  const [estaLogado, setEstaLogado] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [erroSenha, setErroSenha] = useState(false);

  // === ESTADOS DO PAINEL ===
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // === CONFIGURAÇÃO DA SENHA ===
  const SENHA_SECRETA = "@Barbeiro2026"; // <--- TROQUE SUA SENHA AQUI

  // 1. Verifica se já fez login antes (ao carregar a página)
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
        localStorage.setItem("barbearia_admin_token", "logado"); // Salva no navegador
        carregarDados();
    } else {
        setErroSenha(true);
        setSenhaInput("");
    }
  };

  // 3. Função de Logout (Sair)
  const handleLogout = () => {
    setEstaLogado(false);
    localStorage.removeItem("barbearia_admin_token");
    setSenhaInput("");
  };

  // === FUNÇÕES DO DASHBOARD (IGUAIS ANTES) ===
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

  const total = agendamentos.reduce((acc: number, item: any) => acc + Number(item.precoTotal), 0);

  // === RENDERIZAÇÃO CONDICIONAL ===
  
  // SE NÃO ESTIVER LOGADO -> MOSTRA TELA DE SENHA
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

  // SE ESTIVER LOGADO -> MOSTRA O PAINEL
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* CABEÇALHO COM BOTÃO DE SAIR */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
                    Painel do Barbeiro 👮‍♂️
                </h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Faturamento</p>
                    <p className="text-2xl text-green-400 font-mono font-bold">R$ {total.toFixed(2)}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-zinc-700"
                >
                    Sair 🚪
                </button>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20 text-zinc-500 animate-pulse">Carregando dados...</div>
        ) : (
            <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                <div className="grid grid-cols-1 divide-y divide-zinc-800">
                    {agendamentos.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 hover:bg-zinc-800/30 transition-colors gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-white">{item.nomeCliente}</p>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">{item.telefone}</span>
                                </div>
                                <p className="text-yellow-500/80 text-sm mt-1">
                                    {item.servico} • {new Date(item.data).toLocaleDateString('pt-BR')} às <span className="text-white font-bold">{new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-green-400 font-mono font-bold text-lg">R$ {item.precoTotal.toFixed(2)}</span>
                                <button 
                                    onClick={() => deletarItem(item.id)} 
                                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-lg transition-all"
                                    title="Cancelar Agendamento"
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
                        <p className="text-zinc-500">Nenhum agendamento por enquanto.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}