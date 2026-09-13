import { 
  StudentProfile, DependentStudent, ClassSession, Invoice, Announcement, 
  ChatMessage, PushNotification, RankingMember, TechniqueItem, 
  GraduationEligibility, ShopProduct, ContractWaiver, TournamentItem, TeamMedal,
  RegisteredAcademy, PlatformGeneralManager, PlatformAcademyPayment,
  RetentionAlertItem, SparringSession, BirthdayPerson
} from '../types';

export const mockStudent: StudentProfile = {
  id: 'stu_lucas_01',
  name: 'Lucas Gracie Mendes',
  email: 'lucas.mendes@bjjacademy.com',
  phone: '(11) 98452-1920',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  belt: 'blue',
  stripes: 3,
  degreesNeededForNext: 4,
  currentAttendanceCount: 37,
  classesForNextDegree: 40,
  joinDate: '15/02/2023',
  rankingPosition: 4,
  rankingPoints: 1420,
  category: 'Adulto Médio',
  weightKg: 79.5,
  streakWeeks: 5,
  promotions: [
    {
      id: 'prom_01',
      belt: 'white',
      stripes: 4,
      date: '10/08/2023',
      instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
      notes: 'Excelente postura nos treinos de fundamentos e disciplina no tatame.'
    },
    {
      id: 'prom_02',
      belt: 'blue',
      stripes: 0,
      date: '15/12/2023',
      instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
      notes: 'Graduado a Faixa Azul no Exame de Fim de Ano. Parabéns pela jornada!'
    },
    {
      id: 'prom_03',
      belt: 'blue',
      stripes: 1,
      date: '20/04/2024',
      instructor: 'Prof. Alexandre Peçanha',
      notes: 'Evolução consistente no jogo de guarda aberta e passagens.'
    },
    {
      id: 'prom_04',
      belt: 'blue',
      stripes: 2,
      date: '18/09/2024',
      instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
      notes: 'Destaque no Campeonato Estadual BJJ - Medalha de Prata.'
    },
    {
      id: 'prom_05',
      belt: 'blue',
      stripes: 3,
      date: '12/03/2025',
      instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
      notes: '3º Grau conquistado com 120 presenças no ano.'
    }
  ]
};

export const mockDependents: DependentStudent[] = [
  {
    id: 'dep_pedro_01',
    name: 'Pedro Henrique Mendes',
    email: 'marcelo.pai@gmail.com',
    phone: '(11) 99123-4567',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
    belt: 'grey_white',
    stripes: 2,
    degreesNeededForNext: 4,
    currentAttendanceCount: 18,
    classesForNextDegree: 25,
    joinDate: '10/05/2024',
    rankingPosition: 2,
    rankingPoints: 850,
    category: 'Infantil B',
    weightKg: 34.0,
    streakWeeks: 6,
    age: 9,
    schoolGrade: '4º Ano Fundamental',
    parentRelationship: 'Pai (Marcelo Mendes)',
    emergencyContact: '(11) 99123-4567 (Mãe: Fernanda)',
    promotions: [
      {
        id: 'p_pedro_1',
        belt: 'white',
        stripes: 4,
        date: '10/12/2024',
        instructor: 'Profª Beatriz Lima',
        notes: 'Desenvolveu excelente equilíbrio e companheirismo com os colegas.'
      },
      {
        id: 'p_pedro_2',
        belt: 'grey_white',
        stripes: 2,
        date: '15/06/2025',
        instructor: 'Mestre Rodrigo "Cavalo"',
        notes: 'Graduado a Faixa Cinza e Branca Infantil IBJJF com 2 graus. Ótima defesa pessoal!'
      }
    ]
  },
  {
    id: 'dep_sofia_02',
    name: 'Sofia Mendes',
    email: 'marcelo.pai@gmail.com',
    phone: '(11) 99123-4567',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    belt: 'white',
    stripes: 3,
    degreesNeededForNext: 4,
    currentAttendanceCount: 14,
    classesForNextDegree: 20,
    joinDate: '01/02/2025',
    rankingPosition: 5,
    rankingPoints: 520,
    category: 'Infantil B',
    weightKg: 21.5,
    streakWeeks: 3,
    age: 6,
    schoolGrade: '1º Ano Fundamental',
    parentRelationship: 'Pai (Marcelo Mendes)',
    emergencyContact: '(11) 99123-4567',
    promotions: [
      {
        id: 'p_sofia_1',
        belt: 'white',
        stripes: 3,
        date: '20/07/2025',
        instructor: 'Profª Beatriz Lima',
        notes: 'Super dedicada nos rolamentos e brincadeiras motoras.'
      }
    ]
  }
];

export const mockInitialStudents: StudentProfile[] = [
  mockStudent,
  {
    id: 'stu_rafael_pitbull',
    name: 'Rafael "Pitbull" Costa',
    email: 'rafael.pitbull@bjjacademy.com',
    phone: '(11) 98765-4321',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    belt: 'purple',
    stripes: 2,
    degreesNeededForNext: 4,
    currentAttendanceCount: 52,
    classesForNextDegree: 60,
    joinDate: '10/01/2022',
    rankingPosition: 1,
    rankingPoints: 1950,
    category: 'Adulto Médio',
    weightKg: 82.0,
    streakWeeks: 8,
    promotions: []
  },
  {
    id: 'stu_bruno_guimaraes',
    name: 'Bruno Guimarães',
    email: 'bruno.guimaraes@bjjacademy.com',
    phone: '(11) 97654-3210',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    belt: 'brown',
    stripes: 1,
    degreesNeededForNext: 4,
    currentAttendanceCount: 68,
    classesForNextDegree: 75,
    joinDate: '15/06/2020',
    rankingPosition: 2,
    rankingPoints: 1820,
    category: 'Master 1 Pesado',
    weightKg: 91.0,
    streakWeeks: 7,
    promotions: []
  },
  {
    id: 'stu_mariana_duarte',
    name: 'Mariana Duarte',
    email: 'mariana.duarte@bjjacademy.com',
    phone: '(11) 99887-6655',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    belt: 'blue',
    stripes: 2,
    degreesNeededForNext: 4,
    currentAttendanceCount: 39,
    classesForNextDegree: 45,
    joinDate: '20/03/2023',
    rankingPosition: 3,
    rankingPoints: 1610,
    category: 'Adulto Médio',
    weightKg: 64.0,
    streakWeeks: 6,
    promotions: []
  },
  {
    id: 'stu_marcos_vinicius',
    name: 'Marcos Vinicius Ribeiro',
    email: 'marcos.vinicius@gmail.com',
    phone: '(11) 98111-2233',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    belt: 'blue',
    stripes: 1,
    degreesNeededForNext: 4,
    currentAttendanceCount: 22,
    classesForNextDegree: 35,
    joinDate: '01/08/2024',
    rankingPosition: 6,
    rankingPoints: 980,
    category: 'Adulto Médio',
    weightKg: 77.0,
    streakWeeks: 2,
    promotions: []
  },
  {
    id: 'stu_camila_guimaraes',
    name: 'Camila Guimarães Barros',
    email: 'camila.barros@gmail.com',
    phone: '(11) 99444-5566',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    belt: 'white',
    stripes: 2,
    degreesNeededForNext: 4,
    currentAttendanceCount: 19,
    classesForNextDegree: 25,
    joinDate: '12/11/2024',
    rankingPosition: 7,
    rankingPoints: 740,
    category: 'Adulto Médio',
    weightKg: 58.0,
    streakWeeks: 4,
    promotions: []
  }
];

export const mockClasses: ClassSession[] = [
  {
    id: 'class_01',
    name: 'Jiu-Jitsu Kids (6 a 11 anos)',
    instructor: 'Profª Beatriz Lima - Faixa Marrom',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    time: '17:30',
    duration: '50 min',
    type: 'Kids',
    tatame: 'Tatame 2 (Acolchoado Especial)',
    capacity: 20,
    enrolledCount: 16,
    checkedIn: true,
    tatameAreaM2: 50,
    maxSafeSparringPairs: 7,
    registeredStudents: [
      { id: 'dep_pedro_01', name: 'Pedro Henrique Mendes', belt: 'grey', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80', status: 'present', note: 'Excelente foco no aquecimento' },
      { id: 'dep_sofia_02', name: 'Sofia Mendes', belt: 'white', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', status: 'present', note: 'Ajudou os colegas na guarda' },
      { id: 'kid_3', name: 'Enzo Gabriel Santos', belt: 'grey', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', status: 'present' },
      { id: 'kid_4', name: 'Valentina Rossi', belt: 'white', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', status: 'absent' },
      { id: 'kid_5', name: 'Matheus Costa', belt: 'yellow', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', status: 'present' }
    ]
  },
  {
    id: 'class_02',
    name: 'Jiu-Jitsu Fundamentos (Adulto)',
    instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    time: '18:30',
    duration: '60 min',
    type: 'Fundamentos',
    tatame: 'Tatame 1 (Principal)',
    capacity: 35,
    enrolledCount: 28,
    checkedIn: true,
    tatameAreaM2: 80,
    maxSafeSparringPairs: 10,
    registeredStudents: [
      { id: 'stu_lucas_01', name: 'Lucas Gracie Mendes', belt: 'blue', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', status: 'present' },
      { id: 'stu_2', name: 'Gabriel Alencar', belt: 'white', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', status: 'present' },
      { 
        id: 'stu_3', 
        name: 'Renato Silveira', 
        belt: 'blue', 
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', 
        status: 'present',
        hasInjuryWarning: true,
        injuryNote: 'Ombro direito em reabilitação (evitar projeções e chaves de ombro)',
        injurySeverity: 'moderate'
      },
      { id: 'stu_4', name: 'Camila Guimarães', belt: 'white', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', status: 'pending' },
      { id: 'stu_5', name: 'Felipe Duarte', belt: 'purple', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', status: 'present' },
      { 
        id: 'stu_6', 
        name: 'Marcos Vinicius', 
        belt: 'blue', 
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', 
        status: 'present',
        hasInjuryWarning: true,
        injuryNote: 'Entorse leve de tornozelo — apenas rola posicional sem chaves de pé',
        injurySeverity: 'mild'
      }
    ]
  },
  {
    id: 'class_03',
    name: 'Submission / No-Gi (Sem Kimono)',
    instructor: 'Prof. Alexandre Peçanha - Faixa Preta',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    time: '20:00',
    duration: '75 min',
    type: 'No-Gi',
    tatame: 'Tatame 1 (Principal)',
    capacity: 30,
    enrolledCount: 22,
    checkedIn: false,
    tatameAreaM2: 80,
    maxSafeSparringPairs: 10,
    registeredStudents: [
      { id: 'stu_lucas_01', name: 'Lucas Gracie Mendes', belt: 'blue', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', status: 'pending' },
      { id: 'stu_7', name: 'Thiago Tavares', belt: 'brown', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', status: 'present' },
      { id: 'stu_8', name: 'Leonardo Salles', belt: 'purple', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', status: 'present' }
    ]
  }
];

export const mockInvoices: Invoice[] = [
  // BJJ ACADEMY JARDINS
  {
    id: 'inv_current',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Plano Ilimitado - Setembro/2026',
    amount: 260.00,
    dueDate: '10/09/2026',
    status: 'pending',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    planName: 'Mensal Ilimitado',
    pixCode: '00020126580014br.gov.bcb.pix0136bjjacademy-asaas-pix-982142105204000053039865406260.005802BR5918BJJ ACADEMY LTDA6009SAO PAULO62070503***6304E8A2',
    invoiceNumber: 'BJJ-2026-09-0842'
  },
  {
    id: 'inv_parent_pedro',
    studentId: 'dep_pedro_01',
    studentName: 'Pedro Henrique Mendes (Kids)',
    studentAvatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Kids - Setembro/2026',
    amount: 210.00,
    dueDate: '15/09/2026',
    status: 'pending',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    planName: 'Plano Kids Tatame',
    pixCode: '00020126580014br.gov.bcb.pix0136bjjacademy-asaas-pix-pedro-2105204000053039865406210.005802BR5918BJJ ACADEMY LTDA6009SAO PAULO62070503***6304C921',
    invoiceNumber: 'BJJ-KIDS-2026-09-12'
  },
  {
    id: 'inv_parent_sofia',
    studentId: 'dep_sofia_02',
    studentName: 'Sofia Mendes (Baby Kids)',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Kids - Setembro/2026',
    amount: 210.00,
    dueDate: '15/09/2026',
    status: 'pending',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    planName: 'Plano Kids Tatame',
    pixCode: '00020126580014br.gov.bcb.pix0136bjjacademy-asaas-pix-sofia-2105204000053039865406210.005802BR5918BJJ ACADEMY LTDA6009SAO PAULO62070503***6304B104',
    invoiceNumber: 'BJJ-KIDS-2026-09-13'
  },
  {
    id: 'inv_overdue_jardins_01',
    studentId: 'stu_marcos_01',
    studentName: 'Marcos Vinicius Ribeiro',
    studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Plano Ilimitado - Agosto/2026',
    amount: 260.00,
    dueDate: '10/08/2026',
    status: 'overdue',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    planName: 'Mensal Ilimitado',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 23,
    calculatedFine: 5.20,
    calculatedInterest: 1.99,
    totalUpdatedAmount: 267.19,
    pixCode: '00020126580014br.gov.bcb.pix0136bjjacademy-asaas-pix-marcos-2675204000053039865406267.195802BR5918BJJ ACADEMY LTDA6009SAO PAULO62070503***6304F221',
    invoiceNumber: 'BJJ-2026-08-0199'
  },
  {
    id: 'inv_prev_aug',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    title: 'Mensalidade Plano Ilimitado - Agosto/2026',
    amount: 260.00,
    dueDate: '10/08/2026',
    status: 'paid',
    paidDate: '08/08/2026 às 14:22',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    planName: 'Mensal Ilimitado',
    paymentMethod: 'pix',
    invoiceNumber: 'BJJ-2026-08-0711'
  },

  // GRACIE BARRA CENTRO (Mensalidade R$ 195,00)
  {
    id: 'inv_gb_01',
    studentId: 'stu_gb_renato',
    studentName: 'Renato Silveira Costa',
    studentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Regular - Setembro/2026',
    amount: 195.00,
    dueDate: '05/09/2026',
    status: 'pending',
    academyId: 'acad_gracie_barra',
    academyName: 'Gracie Barra Centro',
    planName: 'Mensal GB Adulto',
    pixCode: '00020126580014br.gov.bcb.pix0136gbcentro-pix-1955204000053039865406195.005802BR5920GRACIE BARRA CENTRO6009SAO PAULO62070503***6304A1B2',
    invoiceNumber: 'GB-2026-09-0051'
  },
  {
    id: 'inv_gb_02_overdue',
    studentId: 'stu_gb_camila',
    studentName: 'Camila Guimarães Barros',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Regular - Agosto/2026',
    amount: 195.00,
    dueDate: '05/08/2026',
    status: 'overdue',
    academyId: 'acad_gracie_barra',
    academyName: 'Gracie Barra Centro',
    planName: 'Mensal GB Adulto',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 28,
    calculatedFine: 3.90,
    calculatedInterest: 1.82,
    totalUpdatedAmount: 200.72,
    pixCode: '00020126580014br.gov.bcb.pix0136gbcentro-pix-camila-2005204000053039865406200.725802BR5920GRACIE BARRA CENTRO6009SAO PAULO62070503***6304D891',
    invoiceNumber: 'GB-2026-08-0043'
  },
  {
    id: 'inv_gb_03_paid',
    studentId: 'stu_gb_thiago',
    studentName: 'Thiago Farias',
    title: 'Trimestral GB Ouro - Jul/Ago/Set 2026',
    amount: 540.00,
    dueDate: '01/07/2026',
    status: 'paid',
    paidDate: '01/07/2026 às 11:00',
    academyId: 'acad_gracie_barra',
    academyName: 'Gracie Barra Centro',
    planName: 'Trimestral GB Ouro',
    paymentMethod: 'credit_card',
    invoiceNumber: 'GB-2026-07-0012'
  },

  // ALLIANCE MORUMBI (Mensalidade R$ 310,00)
  {
    id: 'inv_all_01',
    studentId: 'stu_all_felipe',
    studentName: 'Felipe Duarte Nogueira',
    studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Alliance VIP - Setembro/2026',
    amount: 310.00,
    dueDate: '10/09/2026',
    status: 'pending',
    academyId: 'acad_alliance_morumbi',
    academyName: 'Alliance Jiu-Jitsu Morumbi',
    planName: 'Alliance VIP Unlimited',
    pixCode: '00020126580014br.gov.bcb.pix0136alliance-morumbi-pix-3105204000053039865406310.005802BR5916ALLIANCE MORUMBI6009SAO PAULO62070503***63047C10',
    invoiceNumber: 'ALL-2026-09-0301'
  },
  {
    id: 'inv_all_02_overdue',
    studentId: 'stu_all_bruno',
    studentName: 'Bruno Henrique Castilho',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Alliance VIP - Julho/2026',
    amount: 310.00,
    dueDate: '10/07/2026',
    status: 'overdue',
    academyId: 'acad_alliance_morumbi',
    academyName: 'Alliance Jiu-Jitsu Morumbi',
    planName: 'Alliance VIP Unlimited',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 54,
    calculatedFine: 6.20,
    calculatedInterest: 5.57,
    totalUpdatedAmount: 321.77,
    pixCode: '00020126580014br.gov.bcb.pix0136alliance-morumbi-pix-bruno-3215204000053039865406321.775802BR5916ALLIANCE MORUMBI6009SAO PAULO62070503***6304E190',
    invoiceNumber: 'ALL-2026-07-0240'
  },
  {
    id: 'inv_all_03_paid',
    studentId: 'stu_all_mariana',
    studentName: 'Mariana Lima Prado',
    title: 'Anual Alliance Black Belt Club',
    amount: 3120.00,
    dueDate: '15/01/2026',
    status: 'paid',
    paidDate: '15/01/2026 às 16:30',
    academyId: 'acad_alliance_morumbi',
    academyName: 'Alliance Jiu-Jitsu Morumbi',
    planName: 'Anual Black Belt Club',
    paymentMethod: 'credit_card',
    invoiceNumber: 'ALL-2026-01-0003'
  },

  // CHECKMAT VILA MARIANA (Mensalidade R$ 220,00)
  {
    id: 'inv_chk_01',
    studentId: 'stu_chk_gabriel',
    studentName: 'Gabriel Alencar Santos',
    studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade Checkmat Tatame - Setembro/2026',
    amount: 220.00,
    dueDate: '12/09/2026',
    status: 'pending',
    academyId: 'acad_checkmat_vm',
    academyName: 'Checkmat Tatame Vila Mariana',
    planName: 'Mensal Checkmat',
    pixCode: '00020126580014br.gov.bcb.pix0136checkmat-vm-pix-2205204000053039865406220.005802BR5915CHECKMAT TATAME6009SAO PAULO62070503***63049F88',
    invoiceNumber: 'CHK-2026-09-0115'
  },
  {
    id: 'inv_chk_02_paid',
    studentId: 'stu_chk_patricia',
    studentName: 'Patricia Valadares',
    title: 'Mensalidade Checkmat Tatame - Agosto/2026',
    amount: 220.00,
    dueDate: '12/08/2026',
    status: 'paid',
    paidDate: '11/08/2026 às 09:12',
    academyId: 'acad_checkmat_vm',
    academyName: 'Checkmat Tatame Vila Mariana',
    planName: 'Mensal Checkmat',
    paymentMethod: 'pix',
    invoiceNumber: 'CHK-2026-08-0098'
  },

  // NOVA UNIÃO MOEMA (Mensalidade R$ 240,00)
  {
    id: 'inv_nu_01',
    studentId: 'stu_nu_rodrigo',
    studentName: 'Rodrigo Brandão',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade NU Tatame - Setembro/2026',
    amount: 240.00,
    dueDate: '08/09/2026',
    status: 'pending',
    academyId: 'acad_nova_uniao',
    academyName: 'Nova União Moema',
    planName: 'Mensal Nova União',
    pixCode: '00020126580014br.gov.bcb.pix0136novauniao-moema-pix-2405204000053039865406240.005802BR5916NOVA UNIAO MOEMA6009SAO PAULO62070503***63043D22',
    invoiceNumber: 'NU-2026-09-0082'
  },
  {
    id: 'inv_nu_02_overdue',
    studentId: 'stu_nu_gustavo',
    studentName: 'Gustavo Paiva Meirelles',
    studentAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    title: 'Mensalidade NU Tatame - Agosto/2026',
    amount: 240.00,
    dueDate: '08/08/2026',
    status: 'overdue',
    academyId: 'acad_nova_uniao',
    academyName: 'Nova União Moema',
    planName: 'Mensal Nova União',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 25,
    calculatedFine: 4.80,
    calculatedInterest: 2.00,
    totalUpdatedAmount: 246.80,
    pixCode: '00020126580014br.gov.bcb.pix0136novauniao-moema-gustavo-2465204000053039865406246.805802BR5916NOVA UNIAO MOEMA6009SAO PAULO62070503***6304C771',
    invoiceNumber: 'NU-2026-08-0074'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_01',
    title: 'Seminário Especial: Passagem de Guarda Moderna',
    date: 'Hoje, 09:30',
    category: 'Seminário',
    author: 'Mestre Rodrigo "Cavalo"',
    priority: 'urgent',
    content: 'No próximo sábado, dia 12 de Setembro, receberemos o Campeão Mundial de Jiu-Jitsu para 3 horas de puro detalhe técnico e treino livre com graduação ao final. Vagas limitadas para alunos e pais!',
    read: false
  },
  {
    id: 'ann_02',
    title: 'Novo Tatame Olímpico Instalado na Área 1',
    date: 'Ontem',
    category: 'Geral',
    author: 'Gestão BJJ Academy',
    priority: 'normal',
    content: 'Finalizamos a renovação do Tatame Principal com lona antibacteriana e amortecimento duplo de alta absorção para maior segurança nas quedas e rolas fortes. OSS!',
    read: true
  },
  {
    id: 'ann_03',
    title: 'Reunião e Festival de Graduação Kids',
    date: '01/09/2026',
    category: 'Kids',
    author: 'Profª Beatriz Lima',
    priority: 'normal',
    content: 'Convidamos todos os papais e mamães do Portal do Responsável para o nosso Festival Lúdico das Crianças no próximo dia 20. Teremos demonstração técnica e entrega de graus.',
    read: true
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg_01',
    senderId: 'teacher_rodrigo',
    senderName: 'Mestre Rodrigo "Cavalo"',
    senderRole: 'teacher',
    text: 'Fala Lucas! Vi que você treinou muito bem a raspagem de guarda aranha ontem. Continue focado que o 4º grau está próximo.',
    timestamp: '11:20',
    isMe: false,
    read: true
  },
  {
    id: 'msg_02',
    senderId: 'stu_lucas_01',
    senderName: 'Lucas Gracie',
    senderRole: 'student',
    text: 'Valeu, Mestre! Tenho focado bastante na pegada cruzada. Hoje estou confirmado no treino das 18:30!',
    timestamp: '11:42',
    isMe: true,
    read: true
  },
  {
    id: 'msg_03',
    senderId: 'secretary',
    senderName: 'Secretaria BJJ Academy',
    senderRole: 'manager',
    text: 'Olá! O comprovante do seminário já está emitido na sua aba de recibos.',
    timestamp: '14:05',
    isMe: false,
    read: false
  }
];

export const mockPushNotifications: PushNotification[] = [
  {
    id: 'notif_1',
    title: '🥋 Treino Confirmado!',
    body: 'Você fez check-in para Jiu-Jitsu Fundamentos às 18:30 no Tatame 1.',
    timestamp: 'Há 15 min',
    type: 'class',
    read: false
  },
  {
    id: 'notif_2',
    title: '⭐ Nova Observação do Professor',
    body: 'Mestre Rodrigo adicionou uma nota técnica sobre sua defesa de passagem.',
    timestamp: 'Há 2 horas',
    type: 'promotion',
    read: false
  },
  {
    id: 'notif_3',
    title: '🔔 Fatura Disponível via PIX',
    body: 'Sua mensalidade de Setembro está pronta. Pague com 1 clique.',
    timestamp: 'Ontem',
    type: 'payment',
    read: true
  }
];

export const mockRankings: RankingMember[] = [
  { position: 1, id: 'rk_1', name: 'Rafael "Pitbull" Costa', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', belt: 'purple', classesAttended: 24, points: 1950, streak: 8 },
  { position: 2, id: 'rk_2', name: 'Bruno Guimarães', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', belt: 'brown', classesAttended: 22, points: 1820, streak: 7 },
  { position: 3, id: 'rk_3', name: 'Mariana Duarte', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', belt: 'blue', classesAttended: 19, points: 1610, streak: 6 },
  { position: 4, id: 'stu_lucas_01', name: 'Lucas Gracie (Você)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', belt: 'blue', classesAttended: 16, points: 1420, streak: 5, isCurrentUser: true },
  { position: 5, id: 'rk_5', name: 'Thiago Silveira', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', belt: 'white', classesAttended: 15, points: 1290, streak: 4 },
  { position: 6, id: 'rk_6', name: 'Rodrigo Fontes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', belt: 'blue', classesAttended: 14, points: 1210, streak: 3 }
];

export const mockTechniques: TechniqueItem[] = [
  {
    id: 'tec_1',
    title: 'Triângulo da Guarda Fechada',
    japaneseName: 'Sankaku-Jime',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Controle um dos braços do oponente com pegada no punho e abra a guarda projetando o quadril.',
      'Passe uma perna por cima do ombro e feche o joelho atrás do pescoço adversário.',
      'Cruze o braço do oponente em direção ao seu quadril oposto.',
      'Traga a canela com a mão oposta, trave o pé atrás do próprio joelho formando um "4".',
      'Puxe a cabeça do adversário e eleve o quadril para finalizar.'
    ],
    keyDetails: [
      'Corte o ângulo: fique perpendicular ao oponente para tirar o peso da pressão.',
      'Esconda o ombro dele para fechar completamente a artéria carótida.'
    ],
    masterTip: 'Não aperte apenas com a força das pernas. O segredo do estrangulamento está no ângulo do quadril!',
    learned: true,
    notes: 'Praticado com sucesso no treino de terça-feira com o instrutor Rodrigo.'
  },
  {
    id: 'tec_2',
    title: 'Raspagem Tesourinha (Scissor Sweep)',
    category: 'Raspagens',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Faça pegada de gola cruzada e manga do mesmo lado na guarda fechada.',
      'Fugir de quadril para o lado da manga dominada e apoiar a canela no peito do oponente.',
      'A outra perna fica rente ao tatame, travando a perna de apoio dele.',
      'Puxe a gola trazendo o peso dele para frente e faça o movimento de tesoura com as duas pernas.',
      'Suba montando com o quadril firme.'
    ],
    keyDetails: [
      'A canela superior atua como escudo e alavanca.',
      'Nunca tente a tesoura sem antes desequilibrar o adversário para frente.'
    ],
    masterTip: 'Timing é tudo: espere o adversário tentar posturar para aplicar a alavanca.',
    learned: true
  },
  {
    id: 'tec_3',
    title: 'Passagem Toreando (Bullfighter Pass)',
    category: 'Passagem de Guarda',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Segure com pegada firme na altura dos joelhos ou bainha da calça do oponente.',
      'Empurre os joelhos dele para baixo e recue um passo para esticar a perna.',
      'Jogue as pernas do adversário para um lado enquanto você dá um passo explosivo para o lado oposto.',
      'Abaixe o quadril colocando o joelho no peito ou estabilizando nos 100kg.'
    ],
    keyDetails: [
      'Mantenha a cabeça erguida e o peito aberto durante o passe.',
      'Mude a direção repentinamente para quebrar o enquadramento de quadril dele.'
    ],
    masterTip: 'Não tente correr ao redor dele. Force o quadril dele para um lado e ganhe o espaço que se abriu.',
    learned: false
  },
  {
    id: 'tec_4',
    title: 'Armlock da Guarda Fechada',
    japaneseName: 'Juji-Gatame',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Controle o braço do oponente abraçando acima do cotovelo e faça pegada na gola.',
      'Apoie o pé no quadril do mesmo lado do braço atacado e fuja o quadril.',
      'Passe a perna da axila subindo pelas costas até travar a postura dele.',
      'Passe a outra perna por cima do rosto com o calcanhar apontando para baixo.',
      'Junte os joelhos, segure o punho com o polegar voltado para cima e eleve a bacia.'
    ],
    keyDetails: [
      'Joelhos sempre prensados um contra o outro.',
      'Polegar do adversário deve apontar exatamente para o seu teto/peito.'
    ],
    masterTip: 'Se ele tentar cruzar as mãos para defender, faça a pegada americana de braço ou transicione para o triângulo.',
    learned: true
  },
  {
    id: 'tec_5',
    title: 'De La Riva para Raspagem Berimbolo',
    category: 'Raspagens',
    minimumBelt: 'blue',
    difficulty: 'Avançado',
    videoThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Estabeleça o gancho De La Riva profundo com pegada no calcanhar e faixa.',
      'Empurre a perna oposta do oponente para sentá-lo no tatame.',
      'Inverta o giro de cabeça no chão, abraçando as pernas e rolamento sobre o ombro.',
      'Pegue as costas no duplo gancho e trave os 4 pontos.'
    ],
    keyDetails: [
      'Flexibilidade da coluna e manutenção da pegada na calça ou faixa durante todo o giro.'
    ],
    masterTip: 'Treine o rolamento solo nos aquecimentos antes de forçar com parceiro resistente.',
    learned: false
  },
  {
    id: 'tec_6',
    title: 'Queda O-Soto-Gari (Grande Ceifa Externa)',
    japaneseName: 'O-Soto-Gari',
    category: 'Quedas & Projeções',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Pegada clássica: gola e manga.',
      'Dê um passo firme ao lado do pé do oponente, quebrando a postura dele para trás.',
      'Lance sua perna para frente e ceife a perna dele por trás da dobra do joelho.',
      'Direcione o tronco dele em direção ao chão acompanhando a queda.'
    ],
    keyDetails: [
      'O peito deve colar no peito do oponente para impedir que ele contra-ataque.'
    ],
    masterTip: 'A força da queda não vem da perna que ceifa, e sim do desequilíbrio (kuzushi) gerado com a gola.',
    learned: true
  },
  {
    id: 'tec_7',
    title: 'Defesa Contra Gravata com Cabeça Travada',
    category: 'Defesa Pessoal',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
    steps: [
      'Vire o queixo em direção ao corpo do agressor para proteger a traqueia.',
      'Abaixe a base e envolva as costas dele com um braço e segure o pulso dele com o outro.',
      'Pise atrás das duas pernas do agressor e empurre o queixo dele para trás.',
      'Derrube e estabilize montado ou afaste-se com segurança.'
    ],
    keyDetails: [
      'Proteção imediata da via aérea assim que o golpe encaixa.'
    ],
    masterTip: 'Jiu-Jitsu de raiz: a prioridade número um é sempre a preservação da integridade física!',
    learned: true
  },
  {
    id: 'tec_8',
    title: 'Estrangulamento Ezequiel da Montada',
    japaneseName: 'Sode-Guruma-Jime',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Intermediário',
    videoThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    steps: [
      'A partir da montada firme com ganchos baixos, passe um braço por trás da cabeça dele.',
      'Segure por dentro da própria manga do kimono com quatro dedos.',
      'Passe a mão oposta na frente da garganta em formato de faca.',
      'Empurre a faca da mão contra a traqueia enquanto estica o braço da manga.'
    ],
    keyDetails: [
      'Pode ser aplicado dentro da guarda fechada do oponente, mas exige postura rígida.'
    ],
    masterTip: 'Use o peso do seu peito para colar o oponente no chão, impedindo o alívio da pressão.',
    learned: false
  }
];

export const mockGraduationCandidates: GraduationEligibility[] = [
  {
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    currentBelt: 'blue',
    currentStripes: 3,
    timeInCurrentBeltMonths: 21,
    minimumTimeMonthsNeeded: 24,
    attendancesCount: 37,
    minimumAttendancesNeeded: 40,
    isEligible: false,
    recommendedNextBelt: 'blue',
    recommendedNextStripes: 4,
    convokedForExam: false,
    certificateIssued: false
  },
  {
    studentId: 'stu_cand_02',
    studentName: 'Mariana Duarte',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    currentBelt: 'blue',
    currentStripes: 4,
    timeInCurrentBeltMonths: 26,
    minimumTimeMonthsNeeded: 24,
    attendancesCount: 195,
    minimumAttendancesNeeded: 180,
    isEligible: true,
    recommendedNextBelt: 'purple',
    recommendedNextStripes: 0,
    convokedForExam: true,
    certificateIssued: false
  },
  {
    studentId: 'stu_cand_03',
    studentName: 'Rafael "Pitbull" Costa',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    currentBelt: 'purple',
    currentStripes: 4,
    timeInCurrentBeltMonths: 20,
    minimumTimeMonthsNeeded: 18,
    attendancesCount: 220,
    minimumAttendancesNeeded: 160,
    isEligible: true,
    recommendedNextBelt: 'brown',
    recommendedNextStripes: 0,
    convokedForExam: true,
    certificateIssued: false
  },
  {
    studentId: 'stu_cand_04',
    studentName: 'Thiago Silveira',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    currentBelt: 'white',
    currentStripes: 4,
    timeInCurrentBeltMonths: 14,
    minimumTimeMonthsNeeded: 12,
    attendancesCount: 112,
    minimumAttendancesNeeded: 100,
    isEligible: true,
    recommendedNextBelt: 'blue',
    recommendedNextStripes: 0,
    convokedForExam: false,
    certificateIssued: false
  },
  {
    studentId: 'stu_cand_pedro_kids',
    studentName: 'Pedro Henrique Mendes (Kids)',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&auto=format&fit=crop&q=80',
    currentBelt: 'grey_white',
    currentStripes: 4,
    timeInCurrentBeltMonths: 12,
    minimumTimeMonthsNeeded: 12,
    attendancesCount: 52,
    minimumAttendancesNeeded: 45,
    isEligible: true,
    recommendedNextBelt: 'grey',
    recommendedNextStripes: 0,
    convokedForExam: true,
    certificateIssued: false
  }
];

export const mockShopProducts: ShopProduct[] = [
  {
    id: 'prod_1',
    name: 'Kimono Oficial BJJ Academy Gold Weave 450g',
    category: 'Kimonos',
    price: 489.90,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    sizes: ['A1', 'A2', 'A3', 'A4'],
    colors: ['Branco Oficial', 'Azul Royal', 'Preto'],
    inStock: true,
    description: 'Kimono trançado ouro 100% algodão pré-encolhido com bordados de alta definição e patch oficial no peito e costas. Autorizado para competições CBJJ e IBJJF.',
    officialAcademy: true
  },
  {
    id: 'prod_2',
    name: 'Rashguard Compressão No-Gi Black Armor',
    category: 'No-Gi / Rashguard',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto / Vermelho', 'Preto / Azul'],
    inStock: true,
    description: 'Tecido tecnológico respirável com proteção UV50+ e costuras reforçadas anti-desfiamento. Ideal para treinos No-Gi intensos.',
    officialAcademy: true
  },
  {
    id: 'prod_3',
    name: 'Faixa Grossa Premium Especial (12 Costuras)',
    category: 'Faixas',
    price: 98.00,
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&auto=format&fit=crop&q=80',
    sizes: ['A1 (2.60m)', 'A2 (2.80m)', 'A3 (3.00m)', 'A4 (3.20m)'],
    colors: ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'],
    inStock: true,
    description: 'Faixa pesada com tarja preta de ponta e 12 costuras alinhadas, proporcionando amarração firme que não desata no rola.',
    officialAcademy: true
  },
  {
    id: 'prod_4',
    name: 'Bermuda Fight Shorts Pro Comp No-Gi',
    category: 'No-Gi / Rashguard',
    price: 169.90,
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&auto=format&fit=crop&q=80',
    sizes: ['38', '40', '42', '44'],
    colors: ['Preto / Chumbo'],
    inStock: true,
    description: 'Sem zíperes ou bolsos externos para total conformidade com as regras esportivas. Fenda lateral e elastano entrepernas.',
    officialAcademy: true
  },
  {
    id: 'prod_5',
    name: 'Creatina Creapure 100% Pura 300g Tatame',
    category: 'Nutrição',
    price: 119.00,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80',
    sizes: ['300g'],
    colors: ['Sem Sabor'],
    inStock: true,
    description: 'Selo Creapure de pureza máxima. Melhora a força explosiva de pegada e a recuperação muscular entre rounds de treino.',
    officialAcademy: false
  },
  {
    id: 'prod_6',
    name: 'Kit com 3 Patches Oficiais Bordados para Kimono',
    category: 'Acessórios & Patches',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    sizes: ['Padrão Oficial'],
    colors: ['Colorido'],
    inStock: true,
    description: 'Patch redondo grande para costas (24cm), patch peito (10cm) e patch perna (12cm). Termocolantes e bordados.',
    officialAcademy: true
  }
];

export const mockContract: ContractWaiver = {
  id: 'ctr_lucas_2024',
  studentId: 'stu_lucas_01',
  studentName: 'Lucas Gracie Mendes',
  status: 'signed',
  signedDate: '15/02/2023 às 19:42',
  signatureImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 50 10, 90 35 T 180 20" stroke="%23dc2626" stroke-width="2.5" fill="none"/></svg>',
  termsAccepted: true,
  medicalFitnessStatus: 'valid',
  medicalFitnessExpiry: '15/02/2026'
};

export const mockTournaments: TournamentItem[] = [
  {
    id: 'tourn_1',
    name: 'Campeonato Brasileiro de Jiu-Jitsu CBJJ 2026',
    federation: 'CBJJ',
    date: '25 a 30 de Outubro de 2026',
    location: 'Ginásio José Corrêa, Barueri - SP',
    registrationDeadline: '10 de Outubro de 2026',
    registrationOpen: true,
    enrolledAcademyCount: 18,
    categories: ['Pré-Mirim a Master 7', 'Todas as Faixas', 'Gi & No-Gi']
  },
  {
    id: 'tourn_2',
    name: 'São Paulo International Open IBJJF Championship',
    federation: 'IBJJF',
    date: '14 e 15 de Novembro de 2026',
    location: 'Complexo Esportivo do Ibirapuera - SP',
    registrationDeadline: '02 de Novembro de 2026',
    registrationOpen: true,
    enrolledAcademyCount: 12,
    categories: ['Juvenil, Adulto e Master', 'Todas as Faixas']
  },
  {
    id: 'tourn_3',
    name: 'Copa Paulista de Estreantes & Graduados',
    federation: 'FPJJ',
    date: '06 de Dezembro de 2026',
    location: 'Ginásio Baby Barioni, Água Branca - SP',
    registrationDeadline: '25 de Novembro de 2026',
    registrationOpen: true,
    enrolledAcademyCount: 26,
    categories: ['Branca a Marrom', 'Foco em Novos Competidores']
  }
];

export const mockTeamMedals: TeamMedal[] = [
  {
    id: 'med_1',
    athleteName: 'Rafael "Pitbull" Costa',
    athleteAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    belt: 'purple',
    tournamentName: 'Brasileiro CBJJ 2025',
    year: '2025',
    medal: 'gold',
    category: 'Faixa Roxa • Adulto Meio-Pesado'
  },
  {
    id: 'med_2',
    athleteName: 'Lucas Gracie Mendes',
    athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    belt: 'blue',
    tournamentName: 'SP Open IBJJF 2024',
    year: '2024',
    medal: 'silver',
    category: 'Faixa Azul • Adulto Médio'
  },
  {
    id: 'med_3',
    athleteName: 'Mariana Duarte',
    athleteAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    belt: 'blue',
    tournamentName: 'Sul-Americano CBJJ 2025',
    year: '2025',
    medal: 'gold',
    category: 'Faixa Azul • Adulto Leve Feminino'
  },
  {
    id: 'med_4',
    athleteName: 'Pedro Henrique Mendes (Kids)',
    athleteAvatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100&auto=format&fit=crop&q=80',
    belt: 'grey',
    tournamentName: 'Copa Kids Futuros Campeões',
    year: '2025',
    medal: 'gold',
    category: 'Infantil B • Pena'
  },
  {
    id: 'med_5',
    athleteName: 'Bruno Guimarães',
    athleteAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    belt: 'brown',
    tournamentName: 'Floripa Open IBJJF',
    year: '2024',
    medal: 'bronze',
    category: 'Faixa Marrom • Master 1 Pesadíssimo'
  }
];

export const mockRegisteredAcademies: RegisteredAcademy[] = [
  {
    id: 'acad_loyalty_jiujitsu',
    name: 'Loyalty Jiu-Jitsu',
    shortName: 'Loyalty BJJ',
    branch: 'Matriz Oficial • CE',
    city: 'Fortaleza - CE',
    state: 'CE',
    cnpj: '58.087.630/0001-78',
    address: 'Av. Beira Mar, 2800',
    neighborhood: 'Meireles',
    cep: '60165-121',
    phone: '(85) 98765-4321',
    email: 'contato@loyaltyjiujitsu.com.br',
    headInstructor: 'Messias Batista da Silva Junior (• Mestre Fundador)',
    crefNumber: '019844-G/CE',
    studentCapacity: 350,
    tatamiAreaM2: 220,
    activeStudentsCount: 165,
    logo: '/loyalty_logo.jpg',
    logoPresetId: 'loyalty_official',
    status: 'active',
    voiceEnabled: true,
    voiceStyle: 'tatame_master',
    notificationFormat: 'name_and_title',
    chimeType: 'tatame_bell',
    speechRate: 1.05,
    speechPitch: 1.0,
    customPhrasePrefix: 'Loyalty Jiu-Jitsu informa',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: '58087630378',
    pixKeyType: 'cpf',
    bankAccount: 'Banco Inter (077) Ag 0001 CC 580876-0',
    monthlyRevenueTarget: 95000,
    legalRepresentativeName: 'Messias Batista da Silva Junior',
    legalRepresentativeCpf: '580.876.303-78',
    legalRepresentativeRole: 'Sócio Fundador & Mestre Responsável',
    legalRepresentativePhone: '(85) 98765-4321',
    federationAffiliation: 'CBJJ / IBJJF',
    federationRegisterNumber: 'CBJJ-CE-10928',
    fireDepartmentPermit: 'AVCB nº 2024-918293',
    operatingLicense: 'Alvará Municipal nº 2024/0912',
    hasFirstAidKit: true,
    billingDueDay: 10,
    financialContactEmail: 'financeiro@loyaltyjiujitsu.com.br',
    financialContactPhone: '(85) 98765-4321',
    termsAccepted: true,
    termsAcceptedDate: '15/01/2026 14:30',
    termsAcceptedIp: '189.120.44.12',
    termsVersion: '2026.2',
    lgpdConsent: true,
    medicalResponsibilityWaiver: true,
    digitalSignatureProtocol: 'BJJ-TERMS-2026-0178-LOYALTY-OFFICIAL',
    pricingPlans: [
      { id: 'plan_loyalty_mensal', name: 'Mensal Loyalty Black', periodMonths: 1, price: 290.00, monthlyEquivalent: 290.00, description: 'Acesso total aos tatames da Loyalty Jiu-Jitsu com metodologia de elite MM XXIII.', isPopular: true },
      { id: 'plan_loyalty_trimestral', name: 'Trimestral Loyalty Prime', periodMonths: 3, price: 780.00, monthlyEquivalent: 260.00, description: 'Condição especial para treino contínuo no tatame.' },
      { id: 'plan_loyalty_anual', name: 'Anual Loyalty Champion', periodMonths: 12, price: 2880.00, monthlyEquivalent: 240.00, description: 'Plano anual com rashguard e kimono oficial Loyalty inclusos.' },
      { id: 'plan_loyalty_kids', name: 'Loyalty Kids & Teens', periodMonths: 1, price: 220.00, monthlyEquivalent: 220.00, description: 'Valores, respeito e defesa pessoal para a juventude.' }
    ]
  },
  {
    id: 'acad_bjj_jardins',
    name: 'BJJ Academy Jardins',
    shortName: 'BJJ Academy',
    branch: 'Matriz Jardins - SP',
    city: 'São Paulo - SP',
    phone: '(11) 98452-1920',
    voiceEnabled: true,
    voiceStyle: 'mercado_livre',
    notificationFormat: 'name_and_title',
    chimeType: 'mercado_livre',
    speechRate: 1.08,
    speechPitch: 1.15,
    customPhrasePrefix: 'BJJ Academy avisa',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: 'financeiro@bjjacademy.com.br',
    bankAccount: 'Banco Itaú (341) Ag 0920 CC 44210-9',
    monthlyRevenueTarget: 75000,
    pricingPlans: [
      { id: 'plan_jardins_mensal', name: 'Mensal Ilimitado', periodMonths: 1, price: 260.00, monthlyEquivalent: 260.00, description: 'Acesso livre a todas as aulas de Gi e No-Gi da Matriz.', isPopular: true },
      { id: 'plan_jardins_trimestral', name: 'Trimestral Prime', periodMonths: 3, price: 720.00, monthlyEquivalent: 240.00, description: 'Economia de R$ 60,00 no trimestre com renovação automática.' },
      { id: 'plan_jardins_anual', name: 'Anual Black Belt Club', periodMonths: 12, price: 2640.00, monthlyEquivalent: 220.00, description: 'O melhor custo-benefício. Ganha Kimono Oficial da Matriz.' },
      { id: 'plan_jardins_kids', name: 'Plano Kids Tatame', periodMonths: 1, price: 210.00, monthlyEquivalent: 210.00, description: 'Aulas de desenvolvimento motor e jiu-jitsu infantil.' }
    ]
  },
  {
    id: 'acad_gracie_barra',
    name: 'Gracie Barra Centro',
    shortName: 'Gracie Barra',
    branch: 'Unidade Centro Histórico',
    city: 'São Paulo - SP',
    phone: '(11) 3221-8800',
    voiceEnabled: true,
    voiceStyle: 'mercado_livre',
    notificationFormat: 'name_and_title',
    chimeType: 'mercado_livre',
    speechRate: 1.05,
    speechPitch: 1.12,
    customPhrasePrefix: 'Gracie Barra informa',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: 'pix@gbcentro.com.br',
    bankAccount: 'Banco Bradesco (237) Ag 1432 CC 18820-3',
    monthlyRevenueTarget: 48000,
    pricingPlans: [
      { id: 'plan_gb_mensal', name: 'Mensal GB Adulto', periodMonths: 1, price: 195.00, monthlyEquivalent: 195.00, description: 'Treinos diários no Centro de SP.', isPopular: true },
      { id: 'plan_gb_trimestral', name: 'Trimestral GB Ouro', periodMonths: 3, price: 540.00, monthlyEquivalent: 180.00, description: 'Desconto exclusivo para mensalistas trimestrais.' },
      { id: 'plan_gb_anual', name: 'Anual Red Shield', periodMonths: 12, price: 1980.00, monthlyEquivalent: 165.00, description: 'Plano anual com kimono e rashguard inclusos.' },
      { id: 'plan_gb_kids', name: 'GB Kids & Teens', periodMonths: 1, price: 160.00, monthlyEquivalent: 160.00, description: 'Turmas de 4 a 15 anos divididas por faixa etária.' }
    ]
  },
  {
    id: 'acad_alliance_morumbi',
    name: 'Alliance Jiu-Jitsu Morumbi',
    shortName: 'Alliance Morumbi',
    branch: 'Unidade Portal do Morumbi',
    city: 'São Paulo - SP',
    phone: '(11) 3744-1020',
    voiceEnabled: true,
    voiceStyle: 'tatame_master',
    notificationFormat: 'name_and_title',
    chimeType: 'tatame_bell',
    speechRate: 0.98,
    speechPitch: 0.88,
    customPhrasePrefix: 'Mestre da Alliance avisa',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: 'financeiro@alliancemorumbi.com.br',
    bankAccount: 'Banco Santander (033) Ag 2209 CC 83011-5',
    monthlyRevenueTarget: 82000,
    pricingPlans: [
      { id: 'plan_all_mensal', name: 'Alliance VIP Unlimited', periodMonths: 1, price: 310.00, monthlyEquivalent: 310.00, description: 'Tatame climatizado, preparação física e toalhas inclusas.', isPopular: true },
      { id: 'plan_all_trimestral', name: 'Trimestral Eagle Club', periodMonths: 3, price: 870.00, monthlyEquivalent: 290.00, description: 'Plano intermediário com flexibilidade de horário.' },
      { id: 'plan_all_anual', name: 'Anual Black Belt Club', periodMonths: 12, price: 3120.00, monthlyEquivalent: 260.00, description: 'Plano elite com 2 kimonos Shoyoroll personalizados.' },
      { id: 'plan_all_kids', name: 'Alliance Kids & Little Eagles', periodMonths: 1, price: 250.00, monthlyEquivalent: 250.00, description: 'Metodologia exclusiva de liderança e disciplina infantil.' }
    ]
  },
  {
    id: 'acad_checkmat_vm',
    name: 'Checkmat Tatame Vila Mariana',
    shortName: 'Checkmat',
    branch: 'Unidade Vila Mariana',
    city: 'São Paulo - SP',
    phone: '(11) 5082-3344',
    voiceEnabled: true,
    voiceStyle: 'energetic',
    notificationFormat: 'name_only',
    chimeType: 'mercado_livre',
    speechRate: 1.15,
    speechPitch: 1.20,
    customPhrasePrefix: 'Checkmat!',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: 'contato@checkmatvm.com.br',
    bankAccount: 'Banco do Brasil (001) Ag 3302 CC 55190-2',
    monthlyRevenueTarget: 52000,
    pricingPlans: [
      { id: 'plan_chk_mensal', name: 'Mensal Checkmat', periodMonths: 1, price: 220.00, monthlyEquivalent: 220.00, description: 'Jiu-jitsu de alta performance para todos os níveis.', isPopular: true },
      { id: 'plan_chk_trimestral', name: 'Trimestral Checkmat', periodMonths: 3, price: 600.00, monthlyEquivalent: 200.00, description: 'Excelente custo benefício na Vila Mariana.' },
      { id: 'plan_chk_anual', name: 'Anual Cavalo de Aço', periodMonths: 12, price: 2160.00, monthlyEquivalent: 180.00, description: 'Treino ilimitado com acompanhamento nutricional.' },
      { id: 'plan_chk_kids', name: 'Checkmat Kids', periodMonths: 1, price: 180.00, monthlyEquivalent: 180.00, description: 'Turmas infantis com foco em autoconfiança.' }
    ]
  },
  {
    id: 'acad_nova_uniao',
    name: 'Nova União Moema',
    shortName: 'Nova União',
    branch: 'Unidade Moema Pássaros',
    city: 'São Paulo - SP',
    phone: '(11) 5051-7788',
    voiceEnabled: true,
    voiceStyle: 'gentle',
    notificationFormat: 'full_message',
    chimeType: 'chime_bright',
    speechRate: 0.95,
    speechPitch: 1.02,
    customPhrasePrefix: 'Nova União Comunica',
    defaultFinePercent: 2.0,
    defaultMonthlyInterestPercent: 1.0,
    pixKey: 'pix@novauniaomoema.com.br',
    bankAccount: 'Banco Inter (077) Ag 0001 CC 991204-1',
    monthlyRevenueTarget: 58000,
    pricingPlans: [
      { id: 'plan_nu_mensal', name: 'Mensal Nova União', periodMonths: 1, price: 240.00, monthlyEquivalent: 240.00, description: 'Tradição em Gi e No-Gi em Moema.', isPopular: true },
      { id: 'plan_nu_trimestral', name: 'Trimestral Moema Prime', periodMonths: 3, price: 660.00, monthlyEquivalent: 220.00, description: 'Treine quando quiser com taxa de matrícula isenta.' },
      { id: 'plan_nu_anual', name: 'Anual Campeões NU', periodMonths: 12, price: 2400.00, monthlyEquivalent: 200.00, description: 'Plano completo com direito a treinar em filiais.' },
      { id: 'plan_nu_kids', name: 'Nova União Kids', periodMonths: 1, price: 190.00, monthlyEquivalent: 190.00, description: 'Disciplina e amizade no tatame para crianças.' }
    ]
  }
];

export const defaultPlatformGeneralManager: PlatformGeneralManager = {
  id: 'mgr_messias_general',
  name: 'Messias Batista da Silva Junior',
  role: 'CEO & Fundador',
  title: 'CEO & Fundador',
  companyName: 'BJJ Academy Tecnologia & Gestão Esportiva',
  cnpj: '58.087.630/0001-78',
  bio: 'Fundador e arquiteto da plataforma BJJ ACADEMY 2.0. Responsável pelo ecossistema nacional e internacional de gestão de academias de artes marciais.',
  martialArtsRank: '• Mestre Fundador',
  cpf: '58087630378',
  formattedCpf: '580.876.303-78',
  pixKey: '58087630378',
  pixType: 'cpf',
  purpose: 'Para pagamentos das academias à plataforma BJJ Academy (Royalties, Licença de Software SaaS & Repasses)',
  email: 'messiasbjunior@yahoo.com.br',
  password: 'Familia@jk4',
  accessPassword: 'Familia@jk4',
  phone: '(11) 98765-4321',
  city: 'São Paulo',
  state: 'SP',
  status: 'verified',
  monthlyPlatformFeePerAcademy: 250.00,
  fixedMonthlyFee: 130.00,
  activeStudentFee: 1.30,
  registeredAt: '02/09/2026'
};

export const mockPlatformAcademyPayments: PlatformAcademyPayment[] = [
  {
    id: 'plat_pay_1',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    branch: 'Matriz Jardins - SP',
    activeStudentsCount: 120,
    fixedAmount: 130.00,
    variableAmount: 156.00, // 120 x 1.30
    amount: 286.00, // 130 + 156
    dueDate: '05/09/2026',
    status: 'paid',
    paidDate: '01/09/2026',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-001',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406286.005802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0016304D1A2'
  },
  {
    id: 'plat_pay_2',
    academyId: 'acad_gracie_barra',
    academyName: 'Gracie Barra Centro',
    branch: 'Unidade Centro Histórico',
    activeStudentsCount: 85,
    fixedAmount: 130.00,
    variableAmount: 110.50, // 85 x 1.30
    amount: 240.50, // 130 + 110.50
    dueDate: '05/09/2026',
    status: 'paid',
    paidDate: '02/09/2026',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-002',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406240.505802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0026304F2B3'
  },
  {
    id: 'plat_pay_3',
    academyId: 'acad_alliance_morumbi',
    academyName: 'Alliance Jiu-Jitsu Morumbi',
    branch: 'Unidade Portal do Morumbi',
    activeStudentsCount: 150,
    fixedAmount: 130.00,
    variableAmount: 195.00, // 150 x 1.30
    amount: 325.00, // 130 + 195
    dueDate: '05/09/2026',
    status: 'pending',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-003',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406325.005802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0036304A3C4'
  },
  {
    id: 'plat_pay_4',
    academyId: 'acad_checkmat_vm',
    academyName: 'Checkmat Tatame Vila Mariana',
    branch: 'Unidade Vila Mariana',
    activeStudentsCount: 90,
    fixedAmount: 130.00,
    variableAmount: 117.00, // 90 x 1.30
    amount: 247.00, // 130 + 117
    dueDate: '05/09/2026',
    status: 'pending',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-004',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406247.005802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0046304B4D5'
  },
  {
    id: 'plat_pay_5',
    academyId: 'acad_nova_uniao',
    academyName: 'Nova União Moema',
    branch: 'Unidade Moema Pássaros',
    activeStudentsCount: 75,
    fixedAmount: 130.00,
    variableAmount: 97.50, // 75 x 1.30
    amount: 227.50, // 130 + 97.50
    dueDate: '05/09/2026',
    status: 'pending',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-005',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406227.505802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0056304C5E6'
  }
];

export const mockCRMLeads: import('../types').CRMLead[] = [
  {
    id: 'lead_1',
    name: 'Guilherme Sampaio',
    phone: '(11) 98123-4567',
    email: 'guilherme.sampaio@gmail.com',
    interest: 'Adulto Gi',
    stage: 'novo_lead',
    createdAt: '01/09/2026',
    source: 'Instagram',
    notes: 'Nunca treinou antes. Procura condicionamento e defesa pessoal.',
    value: 260.00
  },
  {
    id: 'lead_2',
    name: 'Beatriz Fagundes',
    phone: '(11) 97234-8899',
    email: 'beatriz.fagundes@outlook.com',
    interest: 'Feminino',
    stage: 'contato_realizado',
    createdAt: '30/08/2026',
    source: 'Indicação',
    notes: 'Amiga da Mariana Costa (roxa). Quer conhecer a turma feminina.',
    value: 260.00
  },
  {
    id: 'lead_3',
    name: 'Felipe Alcantara',
    phone: '(11) 99345-1234',
    email: 'felipe.alcantara@hotmail.com',
    interest: 'No-Gi Submission',
    stage: 'aula_agendada',
    createdAt: '28/08/2026',
    trialDate: '04/09/2026 às 19:30',
    source: 'Google',
    notes: 'Veio do judô, quer aprender guarda e chave de calcanhar.',
    value: 280.00
  },
  {
    id: 'lead_4',
    name: 'Enzo e Nicolas (Pais: Roberto)',
    phone: '(11) 98456-7890',
    email: 'roberto.kids@gmail.com',
    interest: 'Kids',
    stage: 'compareceu',
    createdAt: '26/08/2026',
    trialDate: '02/09/2026 às 17:00',
    source: 'Passante',
    notes: 'Meninos de 7 e 9 anos. Adoraram a aula do Mestre Rodrigo!',
    value: 400.00 // Plano 2 irmãos
  },
  {
    id: 'lead_5',
    name: 'Renan Vianna',
    phone: '(11) 97567-3344',
    email: 'renan.vianna@gmail.com',
    interest: 'Competição',
    stage: 'matricula_fechada',
    createdAt: '22/08/2026',
    source: 'Instagram',
    notes: 'Faixa azul ex-aluno do RJ. Fechou plano anual!',
    value: 220.00
  },
  {
    id: 'lead_6',
    name: 'Lucas Brandão',
    phone: '(11) 96123-9988',
    email: 'lucas.brandao@uol.com.br',
    interest: 'Adulto Gi',
    stage: 'perdido',
    createdAt: '15/08/2026',
    source: 'Google',
    notes: 'Horário do trabalho incompatível com a grade atual.',
    value: 260.00
  }
];

export const mockAICoachPlans: import('../types').AICoachLessonPlan[] = [
  {
    id: 'coach_plan_1',
    title: 'Domínio de Guarda Fechada & Ataques Triplos',
    targetLevel: 'Intermediário / Avançado',
    theme: 'Guarda Fechada Tradicional e Conexão de Ataques (Triângulo, Armlock, Omoplata)',
    warmup: {
      title: 'Drill Específico de Articulação e Fuga de Quadril',
      durationMinutes: 10,
      drills: [
        'Fuga de quadril com mão no ombro do parceiro (2 min cada lado)',
        'Escalada de guarda e ajuste de pegadas cruzadas na gola',
        'Sprawl explosivo e entrada de guarda sentada'
      ]
    },
    techniqueOfTheWeek: {
      name: 'Sequência Triângulo da Guarda Fechada com transição para Armlock',
      category: 'Finalizações',
      durationMinutes: 25,
      steps: [
        '1. Controle da manga adversária e quebra de postura com pegada na nuca.',
        '2. Pisar com o pé do mesmo lado no quadril adversário para angular a cintura.',
        '3. Lançar a perna oposta por cima do ombro e fechar a pegada de canela.',
        '4. Ajustar o ângulo de 90 graus com corte de cabeça para estrangulamento perfeito.',
        '5. Se o adversário esconder o braço, transicionar direto para o Armlock reto esticando o quadril.'
      ],
      invisibleDetails: [
        'O ângulo é tudo: nunca tente fechar o triângulo de frente, corte o pescoço em 90°.',
        'Puxe o joelho em direção ao seu ombro para tirar a base do oponente antes de cruzar o braço.'
      ]
    },
    sparringDrill: {
      format: 'Rola Situacional com Vantagem',
      durationMinutes: 25,
      situationalRule: 'Quem está por baixo deve finalizar ou raspar em 3 minutos. Quem está por cima deve passar a guarda fechada e estabilizar os 100kg.'
    },
    coachingAdvice: 'Lembre os alunos de não fazerem força excessiva nos punhos: a alavanca do quadril substitui 90% da força dos braços.',
    createdAt: '03/09/2026'
  }
];

export const mockRetentionAlerts: RetentionAlertItem[] = [
  {
    id: 'ret_01',
    studentId: 'stu_marcos_09',
    studentName: 'Marcos Vinicius Andrade',
    studentPhone: '(11) 98721-4321',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'white',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    lastAttendanceDate: '12/08/2026',
    daysAbsent: 23,
    churnRisk: 'critico',
    contactStatus: 'pendente',
    detectedCause: 'desmotivado',
    monthlyFee: 240.0,
    preferredClassTime: '19:30 (Noite)'
  },
  {
    id: 'ret_02',
    studentId: 'stu_juliana_04',
    studentName: 'Juliana Camargo Silva',
    studentPhone: '(11) 99342-8811',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'blue',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    lastAttendanceDate: '20/08/2026',
    daysAbsent: 15,
    churnRisk: 'alto',
    contactStatus: 'contatado',
    lastContactDate: '02/09/2026',
    contactNotes: 'Relatou dores nas costas; fisioterapia em andamento. Volta dia 10.',
    detectedCause: 'lesao',
    monthlyFee: 260.0,
    preferredClassTime: '07:00 (Manhã)'
  },
  {
    id: 'ret_03',
    studentId: 'stu_felipe_07',
    studentName: 'Felipe Antunes Barreto',
    studentPhone: '(11) 97123-5599',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'purple',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    lastAttendanceDate: '27/08/2026',
    daysAbsent: 8,
    churnRisk: 'moderado',
    contactStatus: 'pendente',
    detectedCause: 'trabalho',
    monthlyFee: 220.0,
    preferredClassTime: '20:30 (Competição)'
  },
  {
    id: 'ret_04',
    studentId: 'stu_ricardo_08',
    studentName: 'Ricardo Duarte Meirelles',
    studentPhone: '(11) 96543-2211',
    studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'white',
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    lastAttendanceDate: '05/08/2026',
    daysAbsent: 30,
    churnRisk: 'critico',
    contactStatus: 'pendente',
    detectedCause: 'indefinido',
    monthlyFee: 240.0,
    preferredClassTime: '12:00 (Almoço)'
  },
  {
    id: 'ret_05',
    studentId: 'stu_gabriel_03',
    studentName: 'Gabriel Siqueira',
    studentPhone: '(11) 98111-3322',
    studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'blue',
    academyId: 'acad_bjj_morumbi',
    academyName: 'BJJ Academy Morumbi',
    lastAttendanceDate: '18/08/2026',
    daysAbsent: 17,
    churnRisk: 'alto',
    contactStatus: 'pendente',
    detectedCause: 'trabalho',
    monthlyFee: 280.0,
    preferredClassTime: '19:30 (Noite)'
  },
  {
    id: 'ret_06',
    studentId: 'stu_carolina_06',
    studentName: 'Carolina Braga',
    studentPhone: '(11) 97444-9988',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    studentBelt: 'white',
    academyId: 'acad_bjj_morumbi',
    academyName: 'BJJ Academy Morumbi',
    lastAttendanceDate: '26/08/2026',
    daysAbsent: 9,
    churnRisk: 'moderado',
    contactStatus: 'resgatado',
    lastContactDate: '01/09/2026',
    contactNotes: 'Confirmou presença para o treino de sexta!',
    detectedCause: 'desmotivado',
    monthlyFee: 250.0,
    preferredClassTime: '18:30 (Feminino)'
  }
];

export const mockSparringSessions: SparringSession[] = [
  {
    id: 'spar_01',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    date: '03/09/2026',
    time: '20:15',
    trainingPartner: 'Rodrigo "Cavalo" Sanches',
    partnerBelt: 'purple',
    giType: 'Gi',
    durationMinutes: 30,
    roundsCount: 5,
    intensity: 'Guerra (Intenso)',
    submissionsApplied: [
      { id: 'sub_1', technique: 'Triângulo', position: 'Guarda Fechada', count: 2 },
      { id: 'sub_2', technique: 'Armlock', position: 'Costas', count: 1 }
    ],
    submissionsConceded: [
      { id: 'con_1', technique: 'Americana', position: '100kg / Norte-Sul', count: 1 }
    ],
    sweepsCount: 3,
    guardPassesCount: 2,
    takedownsCount: 1,
    rating: 5,
    notes: 'Excelente rola! Consegui ajustar a pegada na nuca para o triângulo de 90°. Preciso proteger melhor o braço quando o adversário estabiliza os 100kg.',
    createdAt: '03/09/2026 às 21:00'
  },
  {
    id: 'spar_02',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    date: '01/09/2026',
    time: '19:40',
    trainingPartner: 'Gabriel Siqueira',
    partnerBelt: 'blue',
    giType: 'Gi',
    durationMinutes: 24,
    roundsCount: 4,
    intensity: 'Moderado',
    submissionsApplied: [
      { id: 'sub_3', technique: 'Mata-Leão', position: 'Costas', count: 1 },
      { id: 'sub_4', technique: 'Triângulo', position: 'Guarda Fechada', count: 1 }
    ],
    submissionsConceded: [
      { id: 'con_2', technique: 'Armlock', position: 'Passagem', count: 1 }
    ],
    sweepsCount: 2,
    guardPassesCount: 1,
    takedownsCount: 0,
    rating: 4,
    notes: 'Treinei bastante a transição da pegada de costas para estrangulamento mão com mão. Bati num contra-ataque de armlock quando tentei passar desatento.',
    createdAt: '01/09/2026 às 20:20'
  },
  {
    id: 'spar_03',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    date: '28/08/2026',
    time: '20:00',
    trainingPartner: 'Felipe Antunes',
    partnerBelt: 'purple',
    giType: 'No-Gi',
    durationMinutes: 30,
    roundsCount: 5,
    intensity: 'Guerra (Intenso)',
    submissionsApplied: [
      { id: 'sub_5', technique: 'Guilhotina', position: 'Meia-Guarda', count: 1 },
      { id: 'sub_6', technique: 'Kimura', position: 'Guarda Fechada', count: 1 }
    ],
    submissionsConceded: [
      { id: 'con_3', technique: 'Chave de Pé / Botinha', position: 'Outro', count: 2 }
    ],
    sweepsCount: 1,
    guardPassesCount: 0,
    takedownsCount: 2,
    rating: 4,
    notes: 'Treino sem kimono bem pegado. Duas quedas boas de single-leg. Preciso afinar a defesa de leglock / chave reta de pé na guarda 50/50.',
    createdAt: '28/08/2026 às 21:10'
  },
  {
    id: 'spar_04',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    date: '25/08/2026',
    time: '19:30',
    trainingPartner: 'Marcos Vinicius',
    partnerBelt: 'white',
    giType: 'Gi',
    durationMinutes: 18,
    roundsCount: 3,
    intensity: 'Leve (Técnico)',
    submissionsApplied: [
      { id: 'sub_7', technique: 'Armlock', position: 'Montada', count: 2 },
      { id: 'sub_8', technique: 'Triângulo', position: 'Guarda Fechada', count: 1 },
      { id: 'sub_9', technique: 'Omoplata', position: 'Guarda Fechada', count: 1 }
    ],
    submissionsConceded: [],
    sweepsCount: 4,
    guardPassesCount: 3,
    takedownsCount: 1,
    rating: 5,
    notes: 'Rola solto e técnico. Foquei em dar espaço para o parceiro movimentar e trabalhar minhas raspagens de guarda aranha e laçada.',
    createdAt: '25/08/2026 às 20:15'
  }
];

export const mockBirthdays: BirthdayPerson[] = [
  {
    id: 'bday_lucas_01',
    name: 'Lucas Gracie Mendes',
    role: 'student',
    birthDate: '04/09',
    birthDay: 4,
    birthMonth: 9,
    phone: '(11) 98452-1920',
    email: 'lucas.mendes@bjjacademy.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    belt: 'blue',
    stripes: 3,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_pedro_kids',
    name: 'Pedro Henrique Mendes',
    role: 'kids',
    birthDate: '04/09',
    birthDay: 4,
    birthMonth: 9,
    phone: '(11) 99123-4567',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
    belt: 'grey_white',
    stripes: 2,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: true,
    congratulatedDate: '04/09 às 08:15',
    congratulatedChannel: 'whatsapp'
  },
  {
    id: 'bday_beatriz_prof',
    name: 'Profª Beatriz Lima',
    role: 'teacher',
    birthDate: '05/09',
    birthDay: 5,
    birthMonth: 9,
    phone: '(11) 98765-4321',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    belt: 'brown',
    stripes: 1,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_gabriel_02',
    name: 'Gabriel Alencar',
    role: 'student',
    birthDate: '07/09',
    birthDay: 7,
    birthMonth: 9,
    phone: '(11) 97123-4455',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    belt: 'white',
    stripes: 2,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_rodrigo_mestre',
    name: 'Mestre Rodrigo "Cavalo"',
    role: 'teacher',
    birthDate: '12/09',
    birthDay: 12,
    birthMonth: 9,
    phone: '(11) 99888-1122',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    belt: 'black',
    stripes: 3,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_alexandre_prof',
    name: 'Prof. Alexandre Peçanha',
    role: 'teacher',
    birthDate: '18/09',
    birthDay: 18,
    birthMonth: 9,
    phone: '(11) 99555-3344',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    belt: 'black',
    stripes: 1,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_camila_04',
    name: 'Camila Guimarães',
    role: 'student',
    birthDate: '22/09',
    birthDay: 22,
    birthMonth: 9,
    phone: '(11) 98222-7788',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    belt: 'white',
    stripes: 4,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_felipe_05',
    name: 'Felipe Duarte',
    role: 'student',
    birthDate: '25/09',
    birthDay: 25,
    birthMonth: 9,
    phone: '(11) 98111-9900',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    belt: 'purple',
    stripes: 1,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  },
  {
    id: 'bday_valentina_kids',
    name: 'Valentina Rossi',
    role: 'kids',
    birthDate: '15/10',
    birthDay: 15,
    birthMonth: 10,
    phone: '(11) 99333-8877',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    belt: 'yellow_white',
    stripes: 2,
    academyId: 'acad_bjj_jardins',
    academyName: 'BJJ Academy Jardins',
    congratulated: false
  }
];

