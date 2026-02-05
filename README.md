# 💈 Barbearia VIP - Sistema de Agendamento

Sistema completo de agendamento online para barbearias. O cliente agenda o horário, o sistema bloqueia datas ocupadas e envia uma confirmação automática via WhatsApp.

🔗 **Acesse o Projeto Online:** [https://barbearia-psi-drab.vercel.app](https://barbearia-psi-drab.vercel.app)

## 🚀 Tecnologias

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL (Nile/Vercel)
- **ORM:** Prisma
- **Deploy:** Vercel

## ✨ Funcionalidades

- ✅ **Agendamento Real:** Clientes escolhem data/hora e serviço.
- 🚫 **Bloqueio Inteligente:** Impede agendamentos duplicados ou em horários passados.
- 💬 **WhatsApp:** Redireciona para o WhatsApp com a mensagem de confirmação pronta.
- 🔒 **Painel Admin:** Área restrita (`/admin`) para ver o faturamento e agenda.

## 🛠️ Como Rodar Localmente

1. Clone o projeto:
   ```bash
   git clone [https://github.com/SEU-USUARIO/barbearia-vip.git](https://github.com/SEU-USUARIO/barbearia-vip.git)
2. Instale as dependências:
   ```bash
   npm install
3. Configure o .env com a URL do seu Banco de Dados.
4. Rode o projeto:
   ```bash
   npm run dev
---

### Passo 2: Os Comandos (Terminal)
Agora abra o terminal do VS Code e cole esses comandos (um por um ou tudo de uma vez) para mandar essa atualização para o GitHub:

```powershell
git add .
git commit -m "Adicionando documentação README"
git push
