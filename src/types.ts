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
  | 'academy_registration'; // 🏛️ Cadastrar / Gerenciar Rede de Academias

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
    role === RoleEnum.SUPER_ADMIN
  );
}

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

  // Identificação Civil & Dados Pessoais
  birthDate?: string;
  age?: number;
  cpf?: string;
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
  type: 'Gi' | 'No-Gi' | 'Kids' | 'Competição' | 'Fundamentos';
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
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  pixCode?: string;
  paymentMethod?: 'pix' | 'credit_card' | 'boleto';
  invoiceNumber: string;
  // Multi-Academy & Financial Fields
  academyId: string;
  academyName: string;
  planName?: string;
  lateFeePercent?: number; // default 2%
  dailyInterestPercent?: number; // default 0.0333% (1% monthly)
  daysOverdue?: number;
  calculatedFine?: number;
  calculatedInterest?: number;
  totalUpdatedAmount?: number;
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
  federation: 'CBJJ' | 'IBJJF' | 'FPJJ' | 'Local Open';
  date: string;
  location: string;
  registrationDeadline: string;
  registrationOpen: boolean;
  enrolledAcademyCount: number;
  categories: string[];
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
  platformPlan?: 'basic' | 'pro' | 'enterprise';
  monthlyPlatformFeeBRL?: number;
  platformFeeStatus?: 'paid' | 'pending' | 'overdue';
  lastPlatformPaymentDate?: string;
  // Legal, Compliance & Security for Both Parties
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

