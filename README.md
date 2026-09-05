# 🥋 BJJ Academy Mobile 2.0

> **Plataforma Completa de Gestão de Tatame, Graduações e Multi-Acesso em Nuvem para Academias de Jiu-Jitsu (IBJJF/CBJJ).**

O **BJJ Academy Mobile** é uma aplicação moderna desenvolvida com foco total na rotina e tradição do Jiu-Jitsu Brasileiro. Oferece portais especializados com alternância em tempo real entre diferentes papéis (**Aluno**, **Responsável/Kids**, **Professor**, **Gestor da Unidade**, **Gestor Geral Multi-Academias** e **Totem de Presença no Tatame**), tudo sincronizado em nuvem via **Google Firebase Firestore** com suporte a múltiplos acessos simultâneos e funcionamento offline (PWA).

---

## 🚀 Principais Módulos e Recursos

### 🥋 1. Portal do Aluno
* **Check-in Inteligente**: Confirmação de presença em aulas com cálculo automático de frequências restantes para o próximo grau.
* **Carteirinha Digital do Atleta**: QR Code individual, categoria de peso CBJJ, foto e dados da academia.
* **Jornada de Faixa & Graduações**: Linha do tempo oficial com registro de diplomas, mestres que graduaram e graus conquistados.
* **Diário de Sparring & Rolas**: Registro de rolas diários, finalizações aplicadas, defesas, tempo de tatame e intensidade.
* **Financeiro Transparente**: Visualização de mensalidades, faturas pendentes e pagamento instantâneo via PIX (integração Asaas).

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
* **CRM Anti-Churn (Alertas de Retenção)**: Detecção automática de alunos ausentes (7, 14 ou 21+ dias) com disparo de mensagens de acolhimento via WhatsApp.
* **Módulo de Aniversariantes**: Notificação de aniversários do dia e do mês para celebração no tatame.
* **Financeiro & Conciliação Asaas**: Controle de faturas abertas, vencidas e liquidadas com geração de links de cobrança PIX.
* **Locução por Voz Automatizada**: Motor de fala (Web Speech API) para anúncios automáticos de início de aula e orientações de tatame.

### 👑 5. Gestor Geral BJJ (Super Admin / Franquias)
* **Gestão Multi-Unidades**: Cadastro e ativação de novas filiais, configuração de mensalidade média, faturamento consolidado e comissões do gestor.
* **Visão Estratégica da Rede**: Total de alunos da rede, métricas de crescimento e saúde financeira unificada.

### 📱 6. Totem Kiosk de Tatame (Tablet)
* **Terminal de Autoatendimento**: Interface em tela cheia para posicionamento na recepção ou entrada do tatame, permitindo check-in instantâneo via leitura de QR Code da carteirinha ou código do aluno.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Build & Bundler**: [Vite](https://vitejs.dev/)
* **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animações e Efeitos**: [Motion (Framer Motion)](https://motion.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Ícones**: [Lucide React](https://lucide.dev/)
* **Banco de Dados & Nuvem**: [Google Firebase Firestore](https://firebase.google.com/docs/firestore) (Sincronização em tempo real multi-dispositivo)
* **PWA & Mobile Ready**: Estrutura preparada para Progressive Web App e empacotamento nativo via Capacitor (iOS e Android).

---

## 📂 Estrutura de Diretórios

```text
├── public/                     # Assets estáticos, manifest PWA e ícones
├── src/
│   ├── components/
│   │   ├── common/             # Modais e componentes transversais
│   │   │   ├── BirthdayAlertModal.tsx       # Alerta e felicitações de aniversariantes
│   │   │   ├── CloudDatabaseStatusModal.tsx # Monitor de conexão e sincronia Firebase
│   │   │   ├── DeviceFrame.tsx              # Simulador de dispositivo e alternador de papéis
│   │   │   ├── IBJJFBeltGuideModal.tsx      # Guia de regras de graduação IBJJF
│   │   │   ├── NativeStatusBar.tsx          # Barra de status nativa iOS/Android
│   │   │   ├── SparringJournalModal.tsx     # Diário técnico de sparrings e rolas
│   │   │   └── StudentManagementModal.tsx   # Gestão de alunos sincronizados na nuvem
│   │   └── views/              # Telas dedicadas de cada papel
│   │       ├── AcademyRegistrationView.tsx  # Cadastro de novas academias/filiais
│   │       ├── FinancialView.tsx            # Conciliação financeira e cobranças Asaas
│   │       ├── InstructorView.tsx           # Portal do professor e graduações
│   │       ├── ManagerView.tsx              # Dashboard administrativo e CRM
│   │       ├── ParentView.tsx               # Acompanhamento de dependentes (Kids)
│   │       ├── StudentView.tsx              # Portal do atleta de Jiu-Jitsu
│   │       └── TotemKioskView.tsx           # Terminal de autoatendimento no tatame
│   ├── data/
│   │   └── mockData.ts         # Dados de exemplo e modelos iniciais
│   ├── firebase/
│   │   ├── firebaseConfig.ts   # Inicialização do app Firebase
│   │   └── firestoreService.ts # Serviços de sincronização e persistência em tempo real
│   ├── hooks/
│   │   └── usePWAInstall.ts    # Detecção de status de rede e instalação PWA
│   ├── utils/
│   │   ├── safeStorage.ts      # Persistência local segura com fallback
│   │   └── voiceNotification.ts # Síntese de voz em português para avisos do tatame
│   ├── types.ts                # Definições de tipos TypeScript compartilhados
│   ├── App.tsx                 # Ponto de entrada do aplicativo e orquestração de estados
│   ├── index.css               # Estilos globais Tailwind CSS v4
│   └── main.tsx                # Bootstrap da aplicação React
├── firestore.rules             # Regras de segurança de acesso ao Firestore
├── firebase-blueprint.json     # Esquema arquitetural das coleções Firestore
├── metadata.json               # Configurações de plataforma e permissões
├── package.json                # Dependências e scripts do projeto
└── vite.config.ts              # Configuração do Vite e plugins
```

---

## ⚡ Instalação e Execução Local

### Pré-requisitos
* **Node.js**: Versão 18.0 ou superior instalada.
* **NPM**: Versão 9.0 ou superior.

### Passos:

1. **Clonar o repositório ou abrir o projeto:**
   ```bash
   cd bjj-academy-mobile
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O servidor será iniciado na porta **3000** (`http://localhost:3000`).

4. **Executar verificação de tipos (Lint):**
   ```bash
   npm run lint
   ```

5. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## ☁️ Banco de Dados em Nuvem (Firebase Firestore)

A aplicação conta com sincronização bidirecional em tempo real. As principais coleções estruturadas no Firestore são:

| Coleção | Descrição |
| :--- | :--- |
| `students` | Cadastros completos de atletas (faixa, graus, categoria, frequências, histórico de graduação). |
| `academies` | Filiais cadastradas, gestores responsáveis, mensalidade base e métricas. |
| `classes` | Grade horária de aulas, professores responsáveis, limite de alunos e lista de presenças. |
| `invoices` | Faturas e mensalidades com status de liquidação via PIX ou boleto. |
| `sparringSessions` | Registros do diário de treino e rolas de cada praticante. |
| `birthdays` | Base de aniversariantes para ações de engajamento comunitário. |

> **Nota de Resiliência:** Caso a conexão caia temporariamente, a camada de persistência local mantém todas as operações salvas no dispositivo, sincronizando automaticamente com a nuvem assim que a internet for restabelecida.

---

## 🥋 Sistema de Graduação IBJJF Integrado

O sistema adota o sistema oficial de graduação da **International Brazilian Jiu-Jitsu Federation (IBJJF)**:

* **Adultos e Masters**: Faixas Branca, Azul (mín. 2 anos), Roxa (mín. 1,5 ano), Marrom (mín. 1 ano) e Preta (31+ anos para faixas coral/vermelha).
* **Infantil (4 a 15 anos)**: Faixas Branca, Cinza, Amarela, Laranja e Verde, com sistema de faixas lisas, brancas e pretas intermediárias.
* **Graus de Tatame**: Cada faixa possui 4 graus técnicos antes da promoção para a próxima cor.

---

## 📄 Licença

Este projeto é desenvolvido para gestão de academias de artes marciais. Todos os direitos reservados.

**OSS!** 🥋🤙
