export enum RoleEnum {
  CEO = 'CEO',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_ACADEMIA = 'ADMIN_ACADEMIA',
  PROFESSOR = 'PROFESSOR',
  ALUNO = 'ALUNO'
}

export type UserRole = 
  | 'ceo'                   // 👑 CEO & Fundador BJJ ACADEMY (Messias Batista da Silva Jr - Acesso Irrestrito / Poder Total)
  | 'CEO'                   // Role oficial RBAC (Maiúsculo)
  | 'SUPER_ADMIN'           // Super Administrador do Sistema
  | 'general_manager'       // 👑 Gestor Geral BJJ ACADEMY (Alias compatível)
  | 'ADMIN_ACADEMIA'        // Gestor / Responsável da Unidade Franqueada
  | 'manager'               // 🏢 Responsável da Academia (Gestor da Unidade Cadastrada)
  | 'PROFESSOR'             // Professor do Tatame
  | 'teacher'               // 🥋 Professor Cadastrado (Aulas, Alunos, Graduação, Lembretes)
  | 'ALUNO'                 // Aluno do Tatame
  | 'student'               // 🥋 Aluno
  | 'parent'                // 👨‍👧 Portal Responsável Legal (Kids/Menor)
  | 'academy_registration'  // 🏛️ Cadastrar / Gerenciar Rede de Academias
  | 'expense_management'    // 💸 Gestão de Despesas & Custos Operacionais
  | 'saas_superadmin';      // 🛡️ Painel Super Admin (Gestão de Assinaturas SaaS - Criador/Dono do Software)

/**
 * Helper de Autorização RBAC:
 * Verifica se a role é do CEO (Acesso Total / Sem Restrições)
 */
export function isCeoRole(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return role === 'ceo' || role === 'CEO' || role === RoleEnum.CEO;
}

/**
 * Helper de Autorização RBAC:
 * Verifica se a role possui privilégio Master (CEO ou SUPER_ADMIN)
 */
export function isSuperAdminOrCeoRole(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return (
    isCeoRole(role) ||
    role === 'general_manager' ||
    role === 'SUPER_ADMIN' ||
    role === 'saas_superadmin' ||
    role === RoleEnum.SUPER_ADMIN
  );
}

/**
 * Helper de Autorização RBAC Exclusivo do Super Admin / Criador da Plataforma SaaS:
 * Rota Altamente Protegida. Donos das academias não têm permissão nem visibilidade.
 */
export function canAccessSuperAdmin(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return (
    role === 'saas_superadmin' ||
    role === 'SUPER_ADMIN' ||
    role === RoleEnum.SUPER_ADMIN ||
    role === 'general_manager' ||
    isCeoRole(role)
  );
}

/**
 * Helper de Autorização RBAC:
 * Verifica se o usuário é Dono/Gestor da Academia ou Professor (ou Super Admin/CEO)
 * Permite emitir baixa manual, aplicar desconto promocional de R$ 80 e visualizar fechamentos de caixa.
 * Usuários com perfil exclusivo de ALUNO / student / parent são estritamente bloqueados.
 */
export function canManageFinancesOrDiscounts(role?: UserRole | string | null): boolean {
  if (!role) return false;
  if (isSuperAdminOrCeoRole(role)) return true;
  return (
    role === 'ADMIN_ACADEMIA' ||
    role === 'manager' ||
    role === 'PROFESSOR' ||
    role === 'teacher' ||
    role === RoleEnum.ADMIN_ACADEMIA ||
    role === RoleEnum.PROFESSOR
  );
}

/**
 * Helper de Autorização RBAC para Gestão de Despesas e Saída de Caixa:
 * Acesso e visibilidade estritamente restritos aos perfis:
 * - Responsável pela Academia (Gerente / Dono: 'manager', 'ADMIN_ACADEMIA')
 * - CEO do Projeto (Admin Geral: 'ceo', 'general_manager', 'SUPER_ADMIN')
 * 
 * ALUNOS ('student', 'ALUNO'), PAIS ('parent') e PROFESSORES COMUNS ('teacher', 'PROFESSOR')
 * são TERMINANTEMENTE BLOQUEADOS (403 Forbidden).
 */
export function canAccessExpenseManagement(role?: UserRole | string | null): boolean {
  if (!role) return false;
  if (isSuperAdminOrCeoRole(role)) return true;
  return (
    role === 'ADMIN_ACADEMIA' ||
    role === 'manager' ||
    role === RoleEnum.ADMIN_ACADEMIA
  );
}

/**
 * 🚩 CONFIGURAÇÃO DE CONTROLE SAAS (STANDBY ARCHITECTURE FLAG)
 * - MODO_SAAS_ATIVO = false: Modo Aplicativo Próprio. Cobranças online (PIX) ignoram o objeto 'split'
 *   e enviam o valor integral diretamente para a conta da própria academia.
 * - MODO_SAAS_ATIVO = true: Ativa o split nativo de R$ 1,50 para a carteira master da plataforma BJJ Academy.
 */
export const MODO_SAAS_ATIVO: boolean = false;

// Preços e Regras de Mensalidade
export const DEFAULT_MONTHLY_FEE_BRL = 100.00;
export const PROMOTIONAL_MONTHLY_FEE_BRL = 80.00;

export type BeltColor = 
  // Branca (Kids e Adulto)
  | 'white'
  // Infantil (Kids 4-15 anos) - Grupo Cinza
  | 'grey_white'
  | 'grey'
  | 'grey_black'
  // Infantil (Kids 7-15 anos) - Grupo Amarelo
  | 'yellow_white'
  | 'yellow'
  | 'yellow_black'
  // Infantil (Kids 10-15 anos) - Grupo Laranja
  | 'orange_white'
  | 'orange'
  | 'orange_black'
  // Infantil (Kids 13-15 anos) - Grupo Verde
  | 'green_white'
  | 'green'
  | 'green_black'
  // Adulto / Juvenil (16+ anos)
  | 'blue'
  | 'purple'
  | 'brown'
  | 'black'
  // Graus Superiores / Mestres (CBJJ / IBJJF)
  | 'red_black'
  | 'red_white'
  | 'red';

export interface PromotionRecord {
  id: string;
  belt: BeltColor;
  stripes: number;
  date: string;
  instructor: string;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  belt: BeltColor;
  stripes: number; // 0 to 4
  degreesNeededForNext: number;
  currentAttendanceCount: number;
  classesForNextDegree: number;
  joinDate: string;
  rankingPosition: number;
  rankingPoints: number;
  category: string;
  weightKg: number;
  promotions: PromotionRecord[];
  streakWeeks: number;
  status?: 'ATIVO' | 'INATIVO'; // Validação rigorosa de teto SaaS por academia
  tenantId?: string; // Multi-tenant academy identifier

  // Identificação Civil & Dados Pessoais
  birthDate?: string;
  age?: number;
  cpf?: string;
  studentCpf?: string;
  rg?: string;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  academyId?: string;
  academyName?: string;
  planName?: string;
  billingDueDay?: number;
  monthlyFee?: number;

  // Endereço Residencial
  cep?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  // Ficha Médica & Anamnese Tatame
  bloodType?: string;
  healthInsurance?: string;
  healthInsuranceNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  continuousMedication?: string;
  hasMedicalCertificate?: boolean;
  medicalCertificateExpiry?: string;

  // Lesões Ativas & Restrições de Rola (Alerta Discreto para Professores)
  activeInjuries?: string;
  injurySeverity?: 'mild' | 'moderate' | 'strict';
  sparringRestrictions?: string;

  // Pais & Responsáveis Legais (Obrigatório para menores ou dependentes)
  isMinor?: boolean;
  parentName?: string;
  parentRelationship?: string;
  parentCpf?: string;
  parentRg?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentProfession?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Termos, LGPD & Blindagem Jurídica
  termsAccepted?: boolean;
  lgpdConsent?: boolean;
  imageRightsConsent?: boolean;
  medicalWaiverAccepted?: boolean;
  digitalSignatureProtocol?: string;
  signatureDate?: string;
}

export interface DependentStudent extends StudentProfile {
  age: number;
  schoolGrade: string;
  parentRelationship: string;
  emergencyContact: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  instructorAvatar: string;
  time: string;
  duration: string;
  type: 'Gi' | 'No-Gi' | 'Kids' | 'Competição' | 'Fundamentos' | 'Muay Thai';
  tatame: string;
  capacity: number;
  enrolledCount: number;
  checkedIn: boolean;
  tatameAreaM2?: number; // Área útil do tatame em metros quadrados (ex: 80 m²)
  maxSafeSparringPairs?: number; // Limite de duplas seguras simultâneas no rola
  registeredStudents: {
    id: string;
    name: string;
    belt: BeltColor;
    avatar: string;
    status: 'present' | 'absent' | 'pending';
    note?: string;
    hasInjuryWarning?: boolean; // Ponto de atenção discreto para o professor
    injuryNote?: string; // Ex: "Ombro direito em reabilitação — evitar chaves"
    injurySeverity?: 'mild' | 'moderate' | 'strict';
  }[];
}

export interface AccountingStatement {
  id: string;
  month: string; // Ex: "Setembro / 2026"
  competenceDate: string; // "2026-09"
  academyId: string;
  academyName: string;
  cnpj: string;
  legalEntityName: string;
  taxRegime: string; // Ex: "Simples Nacional - Anexo III"
  grossRevenue: number;
  invoicesCount: number;
  gatewayFeeRate: number; // Ex: 2.2% + R$ 1.99
  gatewayFeeTotal: number;
  platformSplitTotal: number;
  netRevenue: number;
  estimatedTaxAmount: number;
  generatedAt: string;
  status: 'closed' | 'draft';
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  title: string;
  amount: number; // Valor nominal ou valor base original
  originalAmount?: number; // Preservação do valor original sem juros/multas
  discountAmount?: number; // Desconto pontualidade ou bolsa
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'canceled';
  paidDate?: string;
  confirmedDate?: string;
  refundDate?: string;
  refundAmount?: number;
  pixCode?: string;
  paymentMethod?: 'pix' | 'credit_card' | 'boleto' | 'DINHEIRO' | 'CARTÃO (BALCÃO)' | 'dinheiro' | 'cartao_balcao' | 'cartao';
  invoiceNumber: string;
  // Multi-Tenant & Academy Isolation
  academyId: string;
  academyName: string;
  tenantId?: string; // Alias explícito do tenant
  planName?: string;
  // Categorias de Contas a Receber
  financialCategory?: 'mensalidade' | 'matricula' | 'exame_faixa' | 'evento' | 'produto' | 'outras';
  // Juros e Multas (Decreto Legal CDC Art. 52 & Código Civil)
  lateFeePercent?: number; // default 2%
  dailyInterestPercent?: number; // default 0.0333% (1% monthly)
  daysOverdue?: number;
  calculatedFine?: number;
  calculatedInterest?: number;
  totalUpdatedAmount?: number;
  // Baixa Manual no Balcão & Prevenção de Duplicidade
  isManualReceived?: boolean;
  manualPaymentMethod?: 'DINHEIRO' | 'CARTÃO (BALCÃO)';
  manualReceivedByUserId?: string;
  manualReceivedByUserName?: string;
  settledBy?: string;
  settlementChannel?: string;
  asaasPixCancelled?: boolean;
  isPromotional?: boolean;
  canceledAsaasPixId?: string;
  // Promoções & Descontos (ex: R$ 80 aplicado por Professor/Dono)
  discountAppliedBy?: string;
  discountAppliedByUserId?: string;
  discountAppliedByUserName?: string;
  discountReason?: string;
  discountAppliedAt?: string;
  // Integração Asaas & Conciliação
  asaasPaymentId?: string;
  asaasInvoiceUrl?: string;
  asaasStatus?: string;
  asaasBillingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  lastWebhookEvent?: string;
  lastWebhookProcessedAt?: string;
}

// Resumo do Dia / Fechamento de Caixa Diário
export interface DailyCashSummary {
  id: string;
  date: string; // Formato YYYY-MM-DD
  formattedDate?: string; // Ex: 23/09/2026
  academyId: string;
  academyName: string;
  totalGross?: number; // Total Bruto
  totalDigital?: number; // Pix Online / Asaas
  totalPhysical?: number; // Dinheiro + Cartão Balcão
  totalCash?: number; // Dinheiro em espécie
  totalCardCounter?: number; // Cartão de débito/crédito na maquininha do balcão
  invoicesCount?: number;
  closedAt?: string;
  closedByUserId?: string;
  closedByUserName?: string;
  notes?: string;
  // Compatibilidade com visualizadores e relatórios legados
  totalBruto?: number;
  totalFisico?: number;
  totalDinheiro?: number;
  totalCartaoBalcao?: number;
  totalPixOnline?: number;
  transactionsCount?: number;
  status?: 'FECHADO' | 'ABERTO' | 'CONCILIADO' | string;
  lastUpdatedAt?: string;
}

// -------------------------------------------------------------
// MOTOR FINANCEIRO - AUDITORIA, ASASS, QUEUE & CONTABILIDADE
// -------------------------------------------------------------

export type AsaasEventType = 
  | 'PAYMENT_CREATED'
  | 'PAYMENT_AWAITING_RISK_ANALYSIS'
  | 'PAYMENT_APPROVED_BY_RISK_ANALYSIS'
  | 'PAYMENT_REAUTHORIZED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED'
  | 'PAYMENT_ANTICIPATED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_RESTORED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_PARTIALLY_REFUNDED'
  | 'PAYMENT_REFUND_IN_PROGRESS'
  | 'PAYMENT_CHARGEBACK_REQUESTED'
  | 'PAYMENT_CHARGEBACK_DISPUTE'
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
  | 'PAYMENT_DUNNING_RECEIVED'
  | 'PAYMENT_DUNNING_REQUESTED'
  | 'PAYMENT_BANK_SLIP_VIEWED'
  | 'PAYMENT_CHECKOUT_VIEWED';

export interface AsaasPaymentPayload {
  object: string;
  id: string;
  dateCreated?: string;
  customer?: string;
  paymentLink?: string | null;
  value: number;
  netValue?: number;
  originalValue?: number | null;
  interestValue?: number | null;
  description?: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  confirmedDate?: string | null;
  pixTransaction?: string | null;
  pixQrCodeId?: string | null;
  status: string;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  installmentNumber?: number | null;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  subscription?: string;
  externalReference?: string; // Mapeia para o ID interno da Invoice ou Aluno
  deleted?: boolean;
  anticipated?: boolean;
  creditDate?: string;
  estimatedCreditDate?: string;
}

export interface AsaasWebhookPayload {
  event: AsaasEventType | string;
  id?: string; // ID do evento Asaas (ex: evt_001...)
  payment?: AsaasPaymentPayload;
  dateCreated?: string;
}

export interface FinancialAuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: 
    | 'WEBHOOK_RECEIVED'
    | 'WEBHOOK_QUEUED'
    | 'WEBHOOK_PROCESSED'
    | 'WEBHOOK_DUPLICATE_IGNORED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'CHARGE_OVERDUE'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_CANCELED'
    | 'MANUAL_PAYMENT_APPLIED'
    | 'INTEREST_CALCULATED'
    | 'EXPENSE_CREATED'
    | 'EXPENSE_PAID'
    | 'PLAN_CHANGED'
    | 'SPLIT_PROCESSED'
    | 'SANSAO_QUERY_EXECUTED'
    | 'STUDENT_ENROLLMENT_INACTIVE_BYPASS'
    | 'STUDENT_ENROLLMENT_BLOCKED_LIMIT_REACHED'
    | 'STUDENT_ENROLLMENT_APPROVED'
    | 'TENANT_PLAN_UPGRADED'
    | 'REMINDER_3_DAYS_SENT'
    | 'DIRECT_PAYMENT_PROCESSED';
  entity: 'invoice' | 'webhook' | 'expense' | 'student' | 'split' | 'financial_metric' | 'tenant_subscription' | 'payment' | 'direct_payment';
  entityId: string;
  timestamp: string;
  origin: 'asaas_webhook' | 'financial_worker' | 'manager_ui' | 'system_cron' | 'sansao_ai' | 'database_tier_rule' | 'saas_billing' | 'gateway_webhook' | 'financial_worker_dlq' | 'counter_manual_settlement';
  result: 'success' | 'failed' | 'ignored_duplicate' | 'blocked';
  details?: Record<string, any>;
}

export type PayableExpenseCategory =
  // 4 Categorias Oficiais do Módulo de Gestão de Despesas
  | 'aluguel_fixos'       // 🏢 Aluguel e custos fixos
  | 'folha_pagamento'     // 🥋 Folha de pagamento (salários de professores e outros funcionários)
  | 'servicos_extras'     // ⚡ Serviços extras (água, luz, internet, limpeza, manutenção)
  | 'despesas_avulsas'    // 📝 Despesas avulsas (gastos pontuais com descrição e valor)
  // Aliases compatíveis legados:
  | 'aluguel'
  | 'energia'
  | 'agua'
  | 'internet'
  | 'fornecedores'
  | 'professores'
  | 'funcionarios'
  | 'materiais'
  | 'outras_despesas';

export interface ExpenseCategoryMeta {
  id: PayableExpenseCategory;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
}

export const OFFICIAL_EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  {
    id: 'aluguel_fixos',
    label: 'Aluguel e custos fixos',
    shortLabel: 'Aluguel & Fixos',
    description: 'Locação predial, IPTU, taxa condominial e contratos mensais fixos',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-600/50',
    iconName: 'Building2',
  },
  {
    id: 'folha_pagamento',
    label: 'Folha de pagamento (salários de professores e outros funcionários)',
    shortLabel: 'Folha de Pagamento',
    description: 'Salários dos professores de Jiu-Jitsu, monitores, recepção e limpeza',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-600/50',
    iconName: 'Users',
  },
  {
    id: 'servicos_extras',
    label: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    shortLabel: 'Serviços Extras',
    description: 'Contas de consumo (energia Enel, água Cagece, fibra óptica, produtos de higiene tatame, manutenção geral)',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-600/50',
    iconName: 'Zap',
  },
  {
    id: 'despesas_avulsas',
    label: 'Despesas avulsas (com campo para descrição e valor)',
    shortLabel: 'Despesas Avulsas',
    description: 'Compras pontuais, reposição de materiais de tatame, faixas, troféus, taxas ou imprevistos',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/60',
    badgeBorder: 'border-rose-600/50',
    iconName: 'Receipt',
  },
];

export function getExpenseCategoryMeta(category: PayableExpenseCategory | string): ExpenseCategoryMeta {
  // Normalize legacy categories to official groups
  let targetId: PayableExpenseCategory = 'despesas_avulsas';
  if (category === 'aluguel_fixos' || category === 'aluguel') targetId = 'aluguel_fixos';
  else if (category === 'folha_pagamento' || category === 'professores' || category === 'funcionarios') targetId = 'folha_pagamento';
  else if (category === 'servicos_extras' || category === 'energia' || category === 'agua' || category === 'internet') targetId = 'servicos_extras';
  else if (category === 'despesas_avulsas' || category === 'fornecedores' || category === 'materiais' || category === 'outras_despesas') targetId = 'despesas_avulsas';

  return OFFICIAL_EXPENSE_CATEGORIES.find(c => c.id === targetId) || OFFICIAL_EXPENSE_CATEGORIES[3];
}

export interface PayableExpense {
  id: string;
  tenantId: string;
  category: PayableExpenseCategory;
  categoryLabel?: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string; // YYYY-MM-DD
  recipientName?: string;
  paymentMethod?: 'pix' | 'ted' | 'boleto' | 'cash' | 'credit_card' | 'transfer';
  pixKey?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CashFlowSummary {
  tenantId: string;
  period: string; // ex: '09/2026'
  initialBalance: number;
  totalInflowsRealized: number; // Total recebido
  totalInflowsForecast: number; // Total previsto a receber
  totalOutflowsRealized: number; // Total despesas pagas
  totalOutflowsForecast: number; // Total despesas a pagar
  finalRealizedBalance: number; // Saldo real em caixa (Recebido - Pago)
  finalProjectedBalance: number; // Saldo projetado (Recebido + Previsto - Pago - A Pagar)
  overdueReceivables: number; // Mensalidades em atraso
  overduePayables: number; // Contas a pagar em atraso
  lastCalculatedAt: string;
}

export interface FinancialQueueStatus {
  queueName: string;
  redisConnected: boolean;
  queuedCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  deadLetterCount: number;
  activeWorkers: number;
  lastJobProcessedAt?: string;
}

export interface SansaoFinancialQueryResult {
  query: string;
  answer: string;
  metrics: Record<string, any>;
  timestamp: string;
  readOnlyGuaranteed: true;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'Geral' | 'Seminário' | 'Graduação' | 'Horários' | 'Kids' | 'Competição' | 'Mural do Tatame';
  content: string;
  author: string;
  read: boolean;
  priority: 'normal' | 'urgent';
  image?: string;
  academyId?: string;
  tournamentId?: string;
  tournamentData?: {
    location?: string;
    registrationDeadline?: string;
    federation?: string;
    categories?: string[];
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isMe: boolean;
  read: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'class' | 'payment' | 'promotion' | 'announcement' | 'message';
  read: boolean;
}

export interface RankingMember {
  position: number;
  id: string;
  name: string;
  avatar: string;
  belt: BeltColor;
  classesAttended: number;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}

// 1. Technique Library Types
export type TechniqueCategory = 
  | 'Guarda & Defesa'
  | 'Passagem de Guarda'
  | 'Raspagens'
  | 'Finalizações'
  | 'Quedas & Projeções'
  | 'Defesa Pessoal';

export interface TechniqueItem {
  id: string;
  title: string;
  japaneseName?: string;
  category: TechniqueCategory;
  minimumBelt: BeltColor;
  videoThumb: string;
  videoUrl?: string;
  videoDuration?: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  steps: string[];
  keyDetails: string[];
  masterTip: string;
  learned: boolean;
  notes?: string;
}

// 2. Scoreboard & Round Timer Types
export interface FighterScore {
  name: string;
  belt: BeltColor;
  points: number;
  advantages: number;
  penalties: number;
}

export interface ScoreboardState {
  roundDurationSeconds: number;
  restDurationSeconds: number;
  totalRounds: number;
  currentRound: number;
  remainingSeconds: number;
  isRest: boolean;
  isRunning: boolean;
  fighter1: FighterScore;
  fighter2: FighterScore;
}

// 3. Belt Graduation & CBJJ Eligibility Types
export interface GraduationEligibility {
  studentId: string;
  studentName: string;
  avatar: string;
  currentBelt: BeltColor;
  currentStripes: number;
  timeInCurrentBeltMonths: number;
  minimumTimeMonthsNeeded: number;
  attendancesCount: number;
  minimumAttendancesNeeded: number;
  isEligible: boolean;
  recommendedNextBelt: BeltColor;
  recommendedNextStripes: number;
  convokedForExam: boolean;
  certificateIssued: boolean;
}

// 4. Pro-Shop & Equipment Types
export interface ShopProduct {
  id: string;
  name: string;
  category: 'Kimonos' | 'No-Gi / Rashguard' | 'Faixas' | 'Acessórios & Patches' | 'Nutrição';
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  description: string;
  officialAcademy: boolean;
}

export type ProShopOrderStatus = 
  | 'aguardando_separacao' 
  | 'separado_estoque' 
  | 'entregue' 
  | 'sem_estoque' 
  | 'reservado' 
  | 'pago';

export interface ProShopOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  size?: string;
  color?: string;
  paymentMethod: 'pix' | 'mensalidade';
  // Identificação do Comprador e Beneficiário
  buyerRole: string;
  studentId: string;
  studentName: string;
  responsibleName?: string;
  studentBelt?: string;
  studentRegistration?: string;
  studentPhone?: string;
  academyId?: string;
  academyName?: string;
  createdAt: string;
  status: ProShopOrderStatus;
  pickupLocation: string;
  // Gestão Operacional de Estoque e Separação na Recepção
  stockChecked?: boolean;
  separatedAt?: string;
  separatedBy?: string;
  deliveredAt?: string;
  stockNote?: string;
}

// 5. Digital Contract & Medical Waiver Types
export interface ContractWaiver {
  id: string;
  studentId: string;
  studentName: string;
  status: 'signed' | 'pending';
  signedDate?: string;
  signatureImage?: string; // base64
  termsAccepted: boolean;
  medicalFitnessStatus: 'valid' | 'expired' | 'missing';
  medicalFitnessExpiry?: string;
  responsibleName?: string;
}

// 6. Tournaments & Team Medals Types
export interface TournamentItem {
  id: string;
  name: string;
  federation: 'CBJJ' | 'IBJJF' | 'FPJJ' | 'Local Open' | 'AJP Tour';
  date: string;
  location: string;
  city?: string;
  state?: string;
  registrationDeadline: string;
  registrationOpen: boolean;
  registrationFee?: number;
  enrolledAcademyCount: number;
  categories: string[];
  description?: string;
  bannerImage?: string;
  broadcastCount?: number;
  lastBroadcastAt?: string;
}

export interface AcademyTournamentBroadcast {
  id: string;
  tournamentId: string;
  tournamentName: string;
  federation: string;
  academyId: string;
  academyName: string;
  sentAt: string;
  status: 'delivered' | 'read';
  messageTitle: string;
  messageBody: string;
  registrationDeadline: string;
  location: string;
  broadcastBy: string;
  categories: string[];
}

export interface TournamentBroadcastLog {
  id: string;
  tournamentId: string;
  tournamentName: string;
  timestamp: string;
  totalAcademies: number;
  targetAcademyNames: string[];
  status: 'success' | 'partial' | 'failed';
  logSummary: string;
}

export interface TeamMedal {
  id: string;
  athleteName: string;
  athleteAvatar: string;
  belt: BeltColor;
  tournamentName: string;
  year: string;
  medal: 'gold' | 'silver' | 'bronze';
  category: string;
}

// 7. Registered Academy & Mercado Livre-Style Voice Notification Types
export type AcademyVoiceStyle = 'mercado_livre' | 'tatame_master' | 'energetic' | 'gentle' | 'commercial';
export type NotificationFormat = 'name_and_title' | 'name_only' | 'full_message';
export type ChimeType = 'mercado_livre' | 'tatame_bell' | 'chime_bright' | 'gong';

// -------------------------------------------------------------
// MODELAGEM SAAS MULTI-TENANT & TRAVA DE PLANOS NO BANCO
// -------------------------------------------------------------
export type SaasPlanTier = 'BRONZE' | 'PRATA' | 'OURO' | 'BASICO' | 'AVANCADO';

export const SAAS_PLAN_LIMITS: Record<SaasPlanTier, number> = {
  BRONZE: 40,
  PRATA: 150,
  OURO: 999999,
  BASICO: 40,
  AVANCADO: 150
};

export interface SaasPlanInfo {
  tier: SaasPlanTier;
  label: string;
  limit: number;
  monthlyBRL: number;
  description: string;
  badgeColor: string;
  features: string[];
}

export const SAAS_PLAN_DETAILS: Record<SaasPlanTier, SaasPlanInfo> = {
  BRONZE: {
    tier: 'BRONZE',
    label: 'Plano Bronze',
    limit: 40,
    monthlyBRL: 69.90,
    description: 'Limite estrito de até 40 alunos ativos. Cobranças manuais no Asaas.',
    badgeColor: 'from-amber-700 to-amber-900 border-amber-600/80 text-amber-200',
    features: ['Até 40 alunos ativos', 'Cobranças manuais no Asaas', 'Subconta Asaas dedicada', 'Grade de Turmas & Check-in']
  },
  BASICO: {
    tier: 'BASICO',
    label: 'Plano Básico',
    limit: 40,
    monthlyBRL: 99.90,
    description: 'Limite estrito de até 40 alunos ativos. Cobranças manuais e automáticas no Asaas.',
    badgeColor: 'from-amber-700 to-amber-900 border-amber-600/80 text-amber-200',
    features: ['Até 40 alunos ativos', 'Cobranças no Asaas', 'Subconta Asaas dedicada', 'Grade de Turmas & Check-in']
  },
  PRATA: {
    tier: 'PRATA',
    label: 'Plano Prata',
    limit: 150,
    monthlyBRL: 129.90,
    description: 'Limite estrito de até 150 alunos ativos. Automação de recorrência + Chamada por Foto Gemini AI.',
    badgeColor: 'from-slate-400 to-slate-600 border-slate-300/80 text-slate-100',
    features: ['Até 150 alunos ativos', 'Automação de recorrência Asaas', 'Chamada por Foto Gemini AI', 'Radar de Retenção & Churn']
  },
  AVANCADO: {
    tier: 'AVANCADO',
    label: 'Plano Avançado',
    limit: 150,
    monthlyBRL: 149.90,
    description: 'Limite estrito de até 150 alunos ativos. Automação de recorrência + Chamada por Foto Gemini AI.',
    badgeColor: 'from-slate-400 to-slate-600 border-slate-300/80 text-slate-100',
    features: ['Até 150 alunos ativos', 'Automação de recorrência Asaas', 'Chamada por Foto Gemini AI', 'Radar de Retenção & Churn']
  },
  OURO: {
    tier: 'OURO',
    label: 'Plano Ouro (Enterprise)',
    limit: 999999,
    monthlyBRL: 249.90,
    description: 'Alunos ilimitados. Automação completa + Split de pagamentos para professores + AI Coach.',
    badgeColor: 'from-yellow-400 via-amber-500 to-amber-600 border-yellow-300 text-slate-950 font-bold',
    features: ['Alunos Ilimitados (Sem Teto)', 'Split de pagamentos para professores & Master', 'AI Coach & Sansão IA', 'Automação completa']
  }
};

// -------------------------------------------------------------
// GESTÃO DE ASSINATURAS SAAS • PAINEL SUPER ADMIN (DONO DO SOFTWARE)
// -------------------------------------------------------------
export type SaasPaymentStatus = 'EM_DIA' | 'PENDENTE' | 'ATRASADO';
export type SaasPlanType = 'BASICO' | 'AVANCADO' | 'OURO';
export type SaasPaymentMethod = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'TRANSFERENCIA' | 'DINHEIRO';

export interface SaasPaymentRecord {
  id: string;
  subscriptionId: string;
  academyId: string;
  amountPaidBRL: number;
  paymentDate: string; // ISO date / string
  paymentMethod: SaasPaymentMethod;
  referenceMonth: string; // '2026-10'
  transactionCode?: string;
  receiptUrl?: string;
  notes?: string;
  registeredBy: string; // Ex: 'Messias (Super Admin)'
  createdAt: string;
}

export interface SaasSubscription {
  id: string;
  academyId: string;
  academyName: string;
  branchName?: string;
  responsibleName: string; // Nome do Responsável (Mestre / Dono da Academia)
  responsibleEmail: string;
  responsiblePhone: string;
  responsibleCpfCnpj?: string;
  
  // Plano Contratado (ex: Básico, Avançado, Ouro)
  planTier: SaasPlanType;
  planName: string;
  monthlyFeeBRL: number; // Valor da Mensalidade cobrada pelo software SaaS
  maxActiveStudents: number;
  
  // Vencimento e Prazos
  billingDueDay: number; // Dia de vencimento (ex: 5, 10, 15, 20)
  dueDate: string; // Data de vencimento no formato 'YYYY-MM-DD' ou 'DD/MM/YYYY'
  lastPaymentDate?: string;
  
  // Status de Pagamento (Em dia, Pendente, Atrasado)
  paymentStatus: SaasPaymentStatus;
  
  // Regra de Negócio: Bloqueio de Acesso
  isAccessSuspended: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  reactivatedAt?: string;
  
  // Histórico de Pagamentos
  paymentHistory?: SaasPaymentRecord[];
  
  // Metadados
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademyAccessLockoutStatus {
  isBlocked: boolean;
  academyId: string;
  academyName: string;
  responsibleName: string;
  paymentStatus: SaasPaymentStatus;
  isAccessSuspended: boolean;
  reason: string;
  monthlyFeeBRL: number;
  dueDate: string;
  daysOverdue?: number;
}

export interface AcademyPricingPlan {
  id: string;
  name: string; // e.g. 'Mensal Ilimitado', 'Trimestral VIP', 'Anual Master', 'Kids Tatame'
  periodMonths: number; // 1, 3, 6, 12
  price: number; // e.g. 260.00
  monthlyEquivalent: number; // e.g. 220.00
  description: string;
  isPopular?: boolean;
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}

export type FinancialAccessProfile = 'general_manager' | 'unit_manager';

export interface AcademyOperatingDay {
  dayOfWeek: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  dayLabel: string; // 'segunda-feira', etc.
  isOpen: boolean;
  slots: string[]; // e.g. ['07:00–08:00', '12:00–13:00', '16:00–21:30']
}

export interface AcademyStaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'PROFESSOR' | 'ADMIN_ACADEMIA';
  belt?: BeltColor;
  stripes?: number;
  avatar?: string;
  academyId: string;
  academyName?: string;
  password?: string; // Para login com e-mail/senha
  pinCode?: string; // PIN de 6 dígitos para acesso rápido no tatame
  activeClassId?: string; // ID da aula atualmente em andamento ministrada por este professor
  isClassActive?: boolean; // Se a aula foi iniciada oficialmente
  classStartedAt?: string; // Data e hora do início da aula
}

export interface RegisteredAcademy {
  id: string;
  name: string;
  legalName?: string;
  shortName: string;
  branch: string;
  city: string;
  state?: string;
  cnpj?: string;
  address?: string;
  neighborhood?: string;
  cep?: string;
  logo?: string;
  logoPresetId?: string;
  phone: string;
  email?: string;
  headInstructor?: string;
  crefNumber?: string;
  studentCapacity?: number;
  tatamiAreaM2?: number;
  activeStudentsCount?: number;
  voiceEnabled: boolean;
  voiceStyle: AcademyVoiceStyle;
  notificationFormat: NotificationFormat;
  chimeType: ChimeType;
  speechRate: number; // 0.8 to 1.3
  speechPitch: number; // 0.8 to 1.4
  customPhrasePrefix?: string; // e.g. "Aviso da"
  // Financial Settings & Multi-Unit Pricing
  pricingPlans?: AcademyPricingPlan[];
  defaultFinePercent?: number; // Default: 2%
  defaultMonthlyInterestPercent?: number; // Default: 1% (0.0333% ao dia)
  pixKey?: string;
  pixKeyType?: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';
  bankAccount?: string;
  monthlyRevenueTarget?: number;
  status?: 'active' | 'pending_approval' | 'suspended';
  saasPlanTier?: SaasPlanTier; // 'BRONZE' (40), 'PRATA' (150), 'OURO' (999999)
  maxActiveStudentsLimit?: number; // Teto de alunos ativos permitido
  platformPlan?: 'basic' | 'pro' | 'enterprise';
  monthlyPlatformFeeBRL?: number;
  platformFeeStatus?: 'paid' | 'pending' | 'overdue';
  lastPlatformPaymentDate?: string;
  // Legal, Compliance & Security for Both Parties
  managerPasscode?: string; // Senha textual do Gestor/Dono da Academia
  managerPin6?: string; // Senha PIN numérica de 6 dígitos exclusiva do Dono/Gestor da Filial
  staffUsers?: AcademyStaffUser[]; // Professores e instrutores vinculados com login e senhas individuais
  legalRepresentativeName?: string;
  legalRepresentativeCpf?: string;
  legalRepresentativeRole?: string;
  legalRepresentativePhone?: string;
  federationAffiliation?: string;
  federationRegisterNumber?: string;
  fireDepartmentPermit?: string; // AVCB
  operatingLicense?: string; // Alvará
  hasFirstAidKit?: boolean;
  billingDueDay?: number; // 5, 10, 15, 20, 25
  financialContactEmail?: string;
  financialContactPhone?: string;
  termsAccepted?: boolean;
  termsAcceptedDate?: string;
  termsAcceptedIp?: string;
  termsVersion?: string;
  lgpdConsent?: boolean;
  medicalResponsibilityWaiver?: boolean;
  digitalSignatureProtocol?: string;
  voiceSettings?: {
    enabled: boolean;
    voiceStyle: AcademyVoiceStyle;
    voiceSpeed: number;
    voiceVolume: number;
    chimeType: ChimeType;
    customWelcomeMessage?: string;
  };
  operatingHours?: AcademyOperatingDay[];
  createdAt?: string;
}

export interface PlatformGeneralManager {
  id: string;
  name: string; // Messias Batista da Silva junior
  role: string; // CEO & Fundador BJJ Academy
  title?: string; // CEO & Diretor Executivo da Plataforma
  companyName?: string; // BJJ Academy Tecnologia & Gestão Esportiva
  cnpj?: string; // CNPJ da Plataforma
  bio?: string; // Biografia / Missão do CEO
  martialArtsRank?: string; // Faixa de Tatame / Mestre Fundador
  cpf: string; // 58087630378
  formattedCpf: string; // 580.876.303-78
  pixKey: string; // 58087630378
  pixType: 'cpf';
  purpose: string; // Para pagamentos das academias à plataforma BJJ Academy
  email: string;
  password?: string; // Senha master de acesso CEO (ex: Familia@jk4)
  accessPassword?: string; // Alias de senha de acesso master
  phone?: string;
  city?: string;
  state?: string;
  status: 'active' | 'verified';
  monthlyPlatformFeePerAcademy: number; // Legado (compatibilidade)
  fixedMonthlyFee?: number; // R$ 130,00 por academia
  activeStudentFee?: number; // R$ 1,30 por aluno ativo
  registeredAt: string;
}

export interface PlatformAcademyPayment {
  id: string;
  academyId: string;
  academyName: string;
  branch: string;
  amount: number;
  fixedAmount?: number; // R$ 130,00
  variableAmount?: number; // R$ 1,30 x alunos
  activeStudentsCount?: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  referenceMonth: string;
  invoiceRef: string;
  pixCode?: string;
}

// 8. CRM Leads & Sales Funnel (Kanban)
export type CRMLeadStage = 
  | 'novo_lead'
  | 'contato_realizado'
  | 'aula_agendada'
  | 'compareceu'
  | 'matricula_fechada'
  | 'perdido';

export interface CRMLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest: string;
  stage: CRMLeadStage;
  status?: string;
  date?: string;
  createdAt: string;
  trialDate?: string;
  channel?: 'instagram' | 'indicacao' | 'google' | 'passante' | 'whatsapp' | string;
  source?: 'Instagram' | 'Indicação' | 'Google' | 'Passante' | 'WhatsApp' | string;
  notes?: string;
  value?: number; // Valor previsto mensalidade
  estimatedMonthlyFee?: number;
}

// 9. Photo Attendance AI (Gemini Vision)
export interface DetectedAthlete {
  id: string;
  name: string;
  belt: BeltColor;
  stripes: number;
  confidence: number;
  confirmed: boolean;
  notes?: string;
}

// 10. AI Coach Types
export interface AICoachLessonPlan {
  id: string;
  title: string;
  targetLevel: 'Iniciantes' | 'Intermediário / Avançado' | 'Kids' | 'Competição';
  theme: string;
  warmup: {
    title: string;
    durationMinutes: number;
    drills: string[];
  };
  techniqueOfTheWeek: {
    name: string;
    category: TechniqueCategory;
    durationMinutes: number;
    steps: string[];
    invisibleDetails: string[];
  };
  sparringDrill: {
    format: string;
    durationMinutes: number;
    situationalRule: string;
  };
  coachingAdvice: string;
  createdAt: string;
}

// 11. Radar Anti-Evasão & Retenção Ativa (Churn Alert)
export type ChurnRiskLevel = 'baixo' | 'moderado' | 'alto' | 'critico';
export type RetentionContactStatus = 'pendente' | 'contatado' | 'resgatado' | 'pausado' | 'cancelado';

export interface RetentionAlertItem {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentAvatar: string;
  studentBelt: BeltColor;
  academyId: string;
  academyName: string;
  lastAttendanceDate: string;
  daysAbsent: number;
  churnRisk: ChurnRiskLevel;
  contactStatus: RetentionContactStatus;
  lastContactDate?: string;
  contactNotes?: string;
  detectedCause?: 'lesao' | 'trabalho' | 'financeiro' | 'desmotivado' | 'indefinido';
  monthlyFee: number;
  preferredClassTime?: string;
}

// 12. Diário de Rola & Análise de Jogo do Atleta (Sparring Journal & Game Analysis)
export interface SparringSubmission {
  id: string;
  technique: string;
  position: 'Guarda Fechada' | 'Meia-Guarda' | 'Passagem' | 'Montada' | 'Costas' | '100kg / Norte-Sul' | 'Outro';
  count: number;
}

export interface SparringSession {
  id: string;
  studentId: string;
  studentName?: string;
  date: string;
  time?: string;
  trainingPartner: string;
  partnerBelt: BeltColor;
  giType: 'Gi' | 'No-Gi';
  durationMinutes: number;
  roundsCount: number;
  intensity: 'Leve (Técnico)' | 'Moderado' | 'Guerra (Intenso)';
  submissionsApplied: SparringSubmission[];
  submissionsConceded: SparringSubmission[];
  sweepsCount: number;
  guardPassesCount: number;
  takedownsCount: number;
  notes: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt?: string;
}

export interface AthleteGameAnalysis {
  totalSparringSessions: number;
  totalRounds: number;
  totalSubmissionsApplied: number;
  totalSubmissionsConceded: number;
  submissionRatioPercent: number;
  topAttackingPosition: string;
  topFavoriteSubmission: string;
  criticalVulnerability: string;
  defensiveRecommendation: string;
  styleProfile: 'Passador Agressivo' | 'Guardista Técnico' | 'Finalizador Rápido' | 'Lutador Completo';
}

export interface BirthdayPerson {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'kids';
  birthDate: string; // "DD/MM" or "DD/MM/AAAA"
  birthDay: number; // 1 - 31
  birthMonth: number; // 1 - 12 (1 = Jan, 9 = Set)
  phone: string;
  email?: string;
  avatar: string;
  belt?: BeltColor;
  stripes?: number;
  academyId?: string;
  academyName?: string;
  congratulated?: boolean;
  congratulatedDate?: string;
  congratulatedChannel?: 'whatsapp' | 'mural' | 'tatame';
  customMessage?: string;
}

// -------------------------------------------------------------
// 1. CBJJ / IBJJF Graduation Certificate & Rules
// -------------------------------------------------------------
export interface CBJJGraduationCheck {
  isEligible: boolean;
  minAgeRequired: number;
  currentAge: number;
  minMonthsRequired: number;
  monthsInCurrentBelt: number;
  attendanceCompleted: number;
  attendanceRequired: number;
  reason: string;
  nextBelt: BeltColor;
}

export interface OfficialGraduationCertificate {
  id: string;
  studentId: string;
  studentName: string;
  studentCpf?: string;
  academyId: string;
  academyName: string;
  headMasterName: string;
  masterCref: string;
  awardedBelt: BeltColor;
  awardedStripes: number;
  issueDate: string;
  validationQrCodeUrl: string;
  verificationHash: string;
  cbjjFederationNumber?: string;
}

// -------------------------------------------------------------
// 2. Sparring Matchmaker & Smart Round Timer
// -------------------------------------------------------------
export interface SparringPair {
  id: string;
  athlete1: {
    id: string;
    name: string;
    belt: BeltColor;
    weightKg: number;
    injuryNote?: string;
    hasInjuryWarning?: boolean;
  };
  athlete2: {
    id: string;
    name: string;
    belt: BeltColor;
    weightKg: number;
    injuryNote?: string;
    hasInjuryWarning?: boolean;
  };
  weightDiffKg: number;
  balanceScore: 'Perfeito' | 'Equilibrado' | 'Atenção';
}

// -------------------------------------------------------------
// 3. Automated Respectful WhatsApp Billing
// -------------------------------------------------------------
export interface RespectfulBillingTemplate {
  type: 'preventive' | 'due_today' | 'polite_late' | 'kiosk_discrete';
  title: string;
  body: string;
  pixKeyText: string;
}

export interface AutomatedWhatsAppReminderConfig {
  enabled: boolean;
  daysAhead: number; // Padrão: 3 dias antes
  scheduleTime: string; // Ex: '02:00' (Cron diário)
  includePixKey: boolean;
  includePaymentLink: boolean;
  lastRunTimestamp?: string | null;
  totalRemindersSent: number;
}

export interface WhatsAppScheduledReminderResult {
  invoiceId: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  dueDate: string;
  amount: number;
  daysUntilDue: number;
  sent: boolean;
  messageId?: string;
  timestamp: string;
  skippedReason?: string;
}

// -------------------------------------------------------------
// 4. Kids Behavioral & Family Evolution Feed
// -------------------------------------------------------------
export interface KidsBehaviorTask {
  id: string;
  title: string;
  description: string;
  category: 'respeito' | 'disciplina' | 'escola' | 'casa';
  points: number;
  completed: boolean;
  completedAt?: string;
  parentComment?: string;
}

export interface KidsEvolutionRecord {
  id: string;
  studentId: string;
  studentName: string;
  weekLabel: string;
  meritPoints: number;
  tasks: KidsBehaviorTask[];
  awardedStripeCandidate: boolean;
  masterFeedback?: string;
}

// -------------------------------------------------------------
// 5. Tatame TV Digital Signage Mode
// -------------------------------------------------------------
export interface TatameTVSettings {
  academyName: string;
  refreshIntervalSeconds: number;
  showRanking: boolean;
  showBirthdays: boolean;
  showSchedule: boolean;
  showTournaments: boolean;
  announcementTicker: string;
}


