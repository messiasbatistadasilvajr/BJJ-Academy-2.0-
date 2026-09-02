export type UserRole = 'student' | 'parent' | 'teacher' | 'manager';

export type BeltColor = 
  | 'white' 
  | 'grey' 
  | 'yellow' 
  | 'orange' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'brown' 
  | 'black';

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
  category: 'Adulto Médio' | 'Infantil B' | 'Master 1 Pesado' | 'Juvenil Leve';
  weightKg: number;
  promotions: PromotionRecord[];
  streakWeeks: number;
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
  registeredStudents: {
    id: string;
    name: string;
    belt: BeltColor;
    avatar: string;
    status: 'present' | 'absent' | 'pending';
    note?: string;
  }[];
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
  category: 'Geral' | 'Seminário' | 'Graduação' | 'Horários' | 'Kids';
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
export type AcademyVoiceStyle = 'mercado_livre' | 'tatame_master' | 'energetic' | 'gentle';
export type NotificationFormat = 'name_and_title' | 'name_only' | 'full_message';
export type ChimeType = 'mercado_livre' | 'tatame_bell' | 'chime_bright';

export interface AcademyPricingPlan {
  id: string;
  name: string; // e.g. 'Mensal Ilimitado', 'Trimestral VIP', 'Anual Master', 'Kids Tatame'
  periodMonths: number; // 1, 3, 6, 12
  price: number; // e.g. 260.00
  monthlyEquivalent: number; // e.g. 220.00
  description: string;
  isPopular?: boolean;
}

export type FinancialAccessProfile = 'general_manager' | 'unit_manager';

export interface RegisteredAcademy {
  id: string;
  name: string;
  shortName: string;
  branch: string;
  city: string;
  state?: string;
  cnpj?: string;
  address?: string;
  neighborhood?: string;
  cep?: string;
  logo?: string;
  phone: string;
  email?: string;
  headInstructor?: string;
  crefNumber?: string;
  studentCapacity?: number;
  tatamiAreaM2?: number;
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
  createdAt?: string;
}

export interface PlatformGeneralManager {
  id: string;
  name: string; // Messias Batista da Silva junior
  role: string; // Gestor Geral BJJ Academy
  cpf: string; // 58087630378
  formattedCpf: string; // 580.876.303-78
  pixKey: string; // 58087630378
  pixType: 'cpf';
  purpose: string; // Para pagamentos das academias à plataforma BJJ Academy
  email: string;
  status: 'active' | 'verified';
  monthlyPlatformFeePerAcademy: number; // e.g. R$ 250,00
  registeredAt: string;
}

export interface PlatformAcademyPayment {
  id: string;
  academyId: string;
  academyName: string;
  branch: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  referenceMonth: string;
  invoiceRef: string;
  pixCode?: string;
}

