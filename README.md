# Orbit Financeiro

Painel web para gestão de saldo de contratos de TI, acompanhamento de consumo e estorno de lançamentos. A interface usa Next.js App Router, React, TypeScript e Tailwind CSS.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## API

O dashboard consome a API Fastify em `https://api-test-roan-beta.vercel.app`. Não há dados simulados no frontend. A URL e os caminhos ficam centralizados em `src/config/api.ts`.

O serviço usa estes endpoints por padrão:

- `GET /contracts/dashboard` — dashboard completo, contratos, saldos e transações
- `POST /contracts` — cria contrato
- `POST /transactions` — cria lançamento
- `DELETE /transactions/:id` — estorna lançamento pelo ID

O carregamento usa exclusivamente o GET do dashboard e o histórico é lido das transações embutidas nos contratos.

## Estrutura

```text
src/
├── app/          # rota, layout e estilos globais
├── components/   # dashboard, tabelas, cards e modais reutilizáveis
├── hooks/        # estado e ações do dashboard
├── lib/          # formatação e regras de negócio da interface
├── services/     # cliente HTTP da API Fastify
└── types/        # modelos financeiros compartilhados
```

## Validar build

```bash
npm run build
```
