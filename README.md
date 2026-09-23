# 🥋 BJJ Academy Mobile 2.0 (Full-Stack & Cloud Architecture)

> **Plataforma Completa de Gestão de Tatame, Graduações Oficiais (CBJJ/IBJJF), Motor Financeiro Automatizado, Notificações Push e Multi-Acesso em Nuvem.**

O **BJJ Academy Mobile** é uma aplicação completa com arquitetura híbrida (Frontend PWA/Mobile em React 19 + Backend Node.js/Express de Alta Performance), projetada para academias de Jiu-Jitsu Brasileiro, redes e franquias. Oferece portais especializados com alternância em tempo real entre diferentes papéis (**Aluno**, **Responsável/Kids**, **Professor**, **Gestor da Unidade**, **Gestor Geral Multi-Academias/CEO** e **Totem de Presença no Tatame**), integrando banco de dados em nuvem **Google Firebase Firestore**, **Firebase Cloud Storage**, motor assíncrono de pagamentos e conformidade com a **LGPD**.

---

## 🚀 Principais Módulos e Recursos

### 🥋 1. Portal do Aluno
* **Check-in Inteligente**: Confirmação de presença em aulas com cálculo automático de frequências restantes para o próximo grau.
* **Carteirinha Digital do Atleta**: QR Code individual, categoria de peso CBJJ, foto e dados da academia.
* **Jornada de Faixa & Graduações**: Linha do tempo oficial com registro de diplomas, mestres que graduaram e graus conquistados.
* **Diário de Sparring & Rolas**: Registro de rolas diários, finalizações aplicadas, defesas, tempo de tatame e intensidade.
* **Financeiro Transparente**: Visualização de mensalidades, faturas pendentes, cálculo de encargos moratórios e pagamento instantâneo via PIX (integração Asaas/Mercado Pago/Stripe).

### 👨‍👩‍👧 2. Portal dos Pais & Responsáveis (Kids)
* **Visão dos Dependentes**: Acompanhamento dos filhos no tatame, controle de presença e progresso nas faixas infantis (Cinza, Amarela, Laranja, Verde).
* **Gestão Financeira Familiar**: Quitação centralizada de mensalidades de todos os dependentes.
* **Comunicação com Professores**: Avisos institucionais e alertas em tempo real.

### 🥋 3. Portal do Professor / Instrutor
* **Chamada Rápida de Tatame**: Lista de presença em tempo real por aula/horário.
* **Módulo de Promoção de Graus & Faixas**: Aplicação de graus (1º ao 4º) e graduação de faixas em conformidade com as diretrizes da **IBJJF**, registrando histórico oficial e notas técnicas.
* **Guia Oficial de Graduação IBJJF Integrado**: Consulta rápida de tempos mínimos de permanência, idades mínimas e critérios técnicos.

### 🏢 4. Gestor de Unidade (Painel da Academia)
* **Métricas em Tempo Real**: Alunos ativos, faturamento mensal, taxa de presença e novos matriculados.
* **Gestão de Alunos na Nuvem**: Roster de alunos sincronizado em nuvem com busca dinâmica, filtro por faixas e matrícula ágil.
* **CRM Anti-Churn (Alertas de Retenção)**: Detecção automática de alunos ausentes (> 15 dias) com disparo de mensagens de acolhimento via WhatsApp e Push Notifications.
* **Módulo de Aniversariantes**: Notificação de aniversários do dia e do mês para celebração no tatame.
* **Financeiro & Conciliação Asaas**: Controle de faturas abertas, vencidas e liquidadas com geração de links de cobrança PIX.
* **Locução por Voz Automatizada**: Motor de fala (Web Speech API) para anúncios automáticos de início de aula e orientações de tatame.

### 👑 5. Gestor Geral BJJ (Super Admin / Franquias & CEO)
* **Gestão Multi-Unidades**: Cadastro e ativação de novas filiais, configuração de mensalidade média, faturamento consolidado e comissões do gestor.
* **Visão Estratégica da Rede**: Total de alunos da rede, métricas de crescimento e saúde financeira unificada.
* **Auditoria Contábil e Financeira**: Trilha imutável de eventos com logs de pagamentos, liquidações e alterações cadastrais.

### 📱 6. Totem Kiosk de Tatame (Tablet)
* **Terminal de Autoatendimento**: Interface em tela cheia para posicionamento na recepção ou entrada do tatame, permitindo check-in instantâneo via leitura de QR Code da carteirinha ou código do aluno.

---

## ⚙️ Arquitetura Técnica e Módulos Implementados

### 1. ⚡ Backend Robusto & Schedulers (`server.ts` + `/server/services/`)
* **Cron Financeiro das 02h00 (`scheduledTasksService.ts`)**:
  - Varredura diária de títulos em aberto.
  - Aplicação automática de **2% de multa moratória** e **1% ao mês de juros simples proporcionais** aos dias de atraso.
  - Atualização automática de status para `overdue` sem onerar a aplicação cliente.
* **Radar de Retenção e Evasão**:
  - Identificação de atletas com ausência superior a 15 dias para ações de engajamento do tatame.
* **Worker de Fila Financeira (`financialWorker.ts`)**:
  - Processamento assíncrono em segundo plano com controle estrito de **idempotência**.

### 2. 💳 Webhooks & Baixa Automática Multi-Gateway (`paymentGatewayWebhookService.ts`)
* **Endpoints Ingestion**:
  - `POST /api/webhooks/asaas`: Ingestão oficial de cobranças Asaas com validação de assinatura `asaas-access-token`.
  - `POST /api/webhooks/gateway/:provider`: Normalizador universal para Asaas, Mercado Pago e Stripe.
* **Liquidação Sem Intervenção Humana**:
  - Atualização do status da fatura para `paid` e baixa em tempo real assim que o pagamento PIX ou cartão é compensado.
  - Registro de auditoria contábil imutável via `financialAuditService`.

### 3. 🛡️ Segurança RBAC, Escalação de Privilégios & Regras Cloud
* **`firestore.rules`**:
  - Acesso granular baseado em tokens de autenticação (`request.auth.token.role`).
  - Proteção contra escalação: somente perfis autenticados com permissão `admin`, `ceo`, `SUPER_ADMIN` ou `ADMIN_ACADEMIA` podem alterar status de faturas para `paid` ou chancelar diplomas de faixa.
* **`storage.rules`**:
  - Isolamento estrito de arquivos:
    - `/avatars/{userId}/*`: Apenas o próprio atleta ou administradores podem subir ou alterar fotos (limite de 5MB, MIME `image/*`).
    - `/certificates/{studentId}/*`: Emissão restrita a Mestres e Administradores; leitura aberta ao atleta diplomado.
    - `/receipts/{tenantId}/{invoiceId}/*`: Comprovantes PIX anexados com limite de 10MB (PDF e imagens).

### 4. 📲 Notificações Push FCM (`fcmNotificationService.ts` & `fcmService.ts`)
* **Firebase Cloud Messaging**:
  - Disparo de push com lembretes amigáveis de fatura ("Mensalidade Vencendo").
  - Mensagens de incentivo ao retorno ao tatame para alunos inativos (> 15 dias).
  - Alerta imediato de nova graduação e disponibilização de certificado com QR Code.
  - Registro e histórico de disparos no backend (`/api/notifications/fcm/history`).

### 5. 🔒 Conformidade LGPD (`lgpdComplianceService.ts`)
* **Artigos 16 e 18 da Lei Geral de Proteção de Dados**:
  - Endpoint de direito ao esquecimento: `POST /api/compliance/lgpd/delete-account`.
  - Eliminação de dados pessoais sensíveis (fotos, telefones, e-mails).
  - Preservação de registros fiscais e contábeis através de **anonimização criptográfica irreversível (HMAC SHA-256)** gerando pseudônimos como `"Atleta Anonimizado #XXXX"`.

### 6. 🧪 Painel de Diagnóstico e Testes E2E (`SystemDiagnosticsModal.tsx` & `systemTestRunner.ts`)
* **Bateria Automatizada Integrada**:
  - Modal interativo disponível no monitor de nuvem para validar em tempo real:
    1. Persistência Offline IndexedDB Nativa.
    2. RBAC e proteção contra escalação de privilégios.
    3. Cron de juros e multas das 02h00.
    4. Firebase Cloud Storage & Regras de Acesso.
    5. Webhook Multi-Gateway com Baixa Automática.
    6. Sistema de Notificações Push FCM.
    7. Exclusão e Anonimização LGPD.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/)
* **Build & Bundler**: [Vite](https://vitejs.dev/)
* **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animações e Efeitos**: [Motion (Framer Motion)](https://motion.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Ícones**: [Lucide React](https://lucide.dev/)
* **Banco de Dados & Nuvem**: [Google Firebase Firestore](https://firebase.google.com/docs/firestore), [Firebase Storage](https://firebase.google.com/docs/storage), [Firebase Messaging](https://firebase.google.com/docs/cloud-messaging)
* **PWA & Mobile Ready**: Estrutura preparada para Progressive Web App e empacotamento nativo via Capacitor 8 (iOS e Android).

---

## 📂 Estrutura de Diretórios Atualizada

```text
├── public/                             # Assets estáticos, manifest PWA e ícones
├── server/                             # Camada de Serviços Backend Node.js / Express
│   ├── services/
│   │   ├── asaasSubaccountService.ts       # Subcontas Asaas & Split de pagamento
│   │   ├── asaasValidator.ts               # Validação de segurança e autenticidade de Webhooks
│   │   ├── fcmNotificationService.ts       # Disparo de Push Notifications FCM
│   │   ├── financialAuditService.ts        # Trilha de auditoria contábil imutável
│   │   ├── financialWorker.ts              # Worker assíncrono para fila de processamento
│   │   ├── idempotencyService.ts           # Chaves de idempotência anti-duplicidade
│   │   ├── lgpdComplianceService.ts        # Anonimização e direito ao esquecimento LGPD
│   │   ├── paymentGatewayWebhookService.ts # Normalizador multi-gateway (Asaas, MP, Stripe)
│   │   ├── queueService.ts                 # Fila em memória / Redis para eventos financeiros
│   │   ├── sansaoFinancialQueryService.ts  # Consultas inteligentes e relatórios
│   │   ├── scheduledTasksService.ts        # Cron diário (02h00) para juros/multas e evasão
│   │   ├── stateMachine.ts                 # Máquina de estados finitos para faturas
│   │   ├── tenantValidationService.ts      # Isolamento multi-tenant
│   │   └── whatsappService.ts              # Disparo de mensagens automáticas via WhatsApp
│   └── server.ts                       # Entrypoint Express + Vite Middleware na porta 3000
├── src/
│   ├── components/
│   │   ├── common/                     # Modais e componentes transversais
│   │   │   ├── BirthdayAlertModal.tsx       # Alerta de aniversariantes
│   │   │   ├── CBJJGraduationModal.tsx      # Emissão oficial de diplomas com QR Code
│   │   │   ├── CloudDatabaseStatusModal.tsx # Monitor de conexão e sincronia Firebase
│   │   │   ├── DataIntegrityModal.tsx       # Diagnóstico de integridade Firestore ↔ Local
│   │   │   ├── DeviceFrame.tsx              # Simulador de dispositivo e alternador de papéis
│   │   │   ├── IBJJFBeltGuideModal.tsx      # Guia de regras de graduação IBJJF
│   │   │   ├── SparringJournalModal.tsx     # Diário técnico de sparrings e rolas
│   │   │   ├── StudentManagementModal.tsx   # Gestão de alunos sincronizados na nuvem
│   │   │   └── SystemDiagnosticsModal.tsx   # Painel interativo de testes do sistema E2E
│   │   └── views/                      # Telas dedicadas de cada papel
│   │       ├── AcademyRegistrationView.tsx  # Cadastro de novas academias/filiais
│   │       ├── FinancialView.tsx            # Conciliação financeira e cobranças
│   │       ├── InstructorView.tsx           # Portal do professor e graduações
│   │       ├── ManagerView.tsx              # Dashboard administrativo e CRM
│   │       ├── ParentView.tsx               # Acompanhamento de dependentes (Kids)
│   │       ├── StudentView.tsx              # Portal do atleta de Jiu-Jitsu
│   │       └── TotemKioskView.tsx           # Terminal de autoatendimento no tatame
│   ├── firebase/
│   │   ├── config.ts                   # Inicialização do Firestore, Auth e Storage
│   │   ├── fcmService.ts               # Registro de tokens FCM no cliente
│   │   ├── firestoreService.ts         # Sincronização em tempo real multi-coleções
│   │   └── storageService.ts           # Upload seguro de avatares, certificados e recibos
│   ├── utils/
│   │   ├── dataIntegrityChecker.ts     # Verificação de paridade de dados local/nuvem
│   │   ├── safeStorage.ts              # Persistência IndexedDB e LocalStorage com fallback
│   │   ├── systemTestRunner.ts         # Bateria automatizada de diagnósticos E2E
│   │   └── voiceNotification.ts        # Síntese de voz em português para avisos
│   ├── types.ts                        # Definições de tipos TypeScript compartilhados
│   ├── App.tsx                         # Orquestração de estados, views e modais
│   └── main.tsx                        # Bootstrap da aplicação React
├── firestore.rules                     # Regras de segurança RBAC do Firestore
├── storage.rules                       # Regras de isolamento e cotas do Firebase Storage
├── package.json                        # Scripts e dependências
└── vite.config.ts                      # Configuração do Vite
```

---

## ⚡ Instalação e Execução Local

### Pré-requisitos
* **Node.js**: Versão 18.0 ou superior instalada.
* **NPM**: Versão 9.0 ou superior.

### Passos:

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento (Frontend + Backend unificados):**
   ```bash
   npm run dev
   ```
   O servidor inicializa o backend Express e o middleware do Vite na porta **3000** (`http://localhost:3000`).

3. **Executar verificação estática de tipos (Lint):**
   ```bash
   npm run lint
   ```

4. **Gerar build de produção otimizado:**
   ```bash
   npm run build
   ```
   Compila os assets estáticos para `dist/` e empacota o backend autônomo em `dist/server.cjs`.

5. **Iniciar a aplicação em produção:**
   ```bash
   npm start
   ```

### 3. 🛡️ Baixa Manual no Balcão, Prevenção de Duplicidade PIX e Resumo do Dia
* **Flag `MODO_SAAS_ATIVO = false`**:
  - Em modo Aplicativo Próprio da Academia (`false`), as cobranças online ignoram a divisão (split) de taxas de R$ 1,50 e direcionam o valor integral diretamente para a conta Asaas da própria academia. A arquitetura de Split permanece intacta e isolada em standby para quando a flag for ativada (`true`).
* **Baixa Manual no Balcão (`DINHEIRO` / `CARTÃO BALCÃO`)**:
  - Recebimento presencial na recepção da academia para mensalidades padrão (R$ 100,00) ou promocionais (R$ 80,00).
  - **Cancelamento Imediato do PIX Asaas**: No exato momento em que o atendente confirma a baixa manual, o backend executa `POST /api/tenants/:tenantId/invoices/:invoiceId/manual-settle`, que emite ordem de cancelamento/expiração à API do Asaas para o PIX aberto. Isso impede que o aluno pague em duplicidade via WhatsApp.
* **Resumo do Dia (Fechamento de Caixa Auditável)**:
  - Persistência na coleção `daily_cash_summaries` com segregação de **Total Bruto**, **Total Digital (PIX Online)** e **Total Físico (Dinheiro + Cartão Balcão)**, registrando o ID e nome do responsável pelo fechamento.
* **Controle de Acesso RBAC**:
  - Bloqueio estrito para o perfil `ALUNO` em baixas manuais, concessão de descontos e fechamentos de caixa. Apenas `DONO`, `PROFESSOR`, `ADMIN_ACADEMIA` e `SUPER_ADMIN` têm permissão.
* **Totem de Autoatendimento com Síntese de Voz Inteligente**:
  - Saudações vocais e sonoras diferenciadas no check-in do tatame: liberação motivacional para alunos em dia e aviso sonoro discreto direcionando à recepção para alunos com mensalidade pendente.

---

## ☁️ Banco de Dados e Serviços em Nuvem

| Serviço / Coleção | Finalidade Arquitetural |
| :--- | :--- |
| `students` | Cadastros completos de atletas (faixa, graus, categoria, frequências, histórico). |
| `academies` | Filiais cadastradas, gestores responsáveis, dados bancários e mensalidades base. |
| `classes` | Grade horária de aulas, professores responsáveis e controle de presenças. |
| `invoices` | Faturas com recálculo automático de multas/juros e liquidação instantânea via webhook. |
| `daily_cash_summaries` | Histórico auditável de fechamentos de caixa diários (Total Bruto, Digital e Balcão). |
| `sparringSessions` | Registros do diário de treino e rolas de cada praticante. |
| `birthdays` | Base de aniversariantes para ações de retenção e engajamento comunitário. |
| **Firebase Storage** | Bucket com isolamento para `/avatars`, `/certificates` oficiais e `/receipts`. |
| **Firebase Cloud Messaging** | Mensageria push para avisos de mensalidade, graduação e retorno ao tatame. |

---

## 📱 Compilação Mobile Android (Capacitor 8 & Google Play Store)

O projeto está totalmente configurado com **Capacitor 8**, plugins nativos (Status Bar escura, Splash Screen sem tela branca, resposta do botão Voltar do Android, Feedback Háptico e ajuste de teclado virtual) e o diretório nativo `android/` devidamente sincronizado.

### 1. Sincronizar alterações da Web com o Android:
```bash
npm run cap:build
```

### 2. Gerar o arquivo `.aab` de produção (Release Bundle):
```bash
cd android
./gradlew bundleRelease
```
*(No Windows, execute `.\gradlew.bat bundleRelease`)*

O pacote assinado pronto para upload no Google Play Console será gerado em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 📄 Licença

Este projeto é desenvolvido para gestão de academias de artes marciais. Todos os direitos reservados.

**OSS!** 🥋🤙
