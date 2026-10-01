import { 
  StudentProfile, DependentStudent, ClassSession, Invoice, Announcement, 
  ChatMessage, PushNotification, RankingMember, TechniqueItem, 
  GraduationEligibility, ShopProduct, ContractWaiver, TournamentItem, TeamMedal,
  RegisteredAcademy, PlatformGeneralManager, PlatformAcademyPayment,
  RetentionAlertItem, SparringSession, BirthdayPerson, AcademyOperatingDay,
  PayableExpense
} from '../types';

export const mockStudent: StudentProfile = {
  id: 'stu_lucas_01',
  name: 'Lucas Gracie Mendes',
  email: 'lucas.mendes@bjjacademy.com',
  phone: '(11) 98452-1920',
  avatar: '/bjj_media/bjj_student_male.jpg',
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
  status: 'ATIVO',
  tenantId: 'acad_loyalty_jiujitsu',
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
    avatar: '/bjj_media/bjj_kid_student.jpg',
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
    avatar: '/bjj_media/bjj_kid_student.jpg',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_student_female.jpg',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_student_female.jpg',
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
    name: 'Kids 01 (3 a 6 anos)',
    instructor: 'Profª Beatriz Lima - Faixa Marrom',
    instructorAvatar: '/bjj_media/bjj_student_female.jpg',
    time: '18:00',
    duration: '50 min',
    type: 'Kids',
    tatame: 'Tatame 1 (Seg/Qua) & Tatame 2 (Ter/Qui)',
    capacity: 20,
    enrolledCount: 16,
    checkedIn: true,
    tatameAreaM2: 50,
    maxSafeSparringPairs: 7,
    registeredStudents: [
      { id: 'dep_pedro_01', name: 'Pedro Henrique Mendes', belt: 'grey', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'present', note: 'Excelente foco no aquecimento' },
      { id: 'dep_sofia_02', name: 'Sofia Mendes', belt: 'white', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'present', note: 'Ajudou os colegas na guarda' },
      { id: 'kid_3', name: 'Enzo Gabriel Santos', belt: 'grey', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'present' },
      { id: 'kid_4', name: 'Valentina Rossi', belt: 'white', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'absent' },
      { id: 'kid_5', name: 'Matheus Costa', belt: 'yellow', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'present' }
    ]
  },
  {
    id: 'class_02',
    name: 'Jiu-Jitsu Gi (Intermediário / Avançado)',
    instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
    instructorAvatar: '/bjj_media/bjj_professor_mestre.jpg',
    time: '20:00',
    duration: '60 min',
    type: 'Fundamentos',
    tatame: 'Tatame 1 (Principal)',
    capacity: 35,
    enrolledCount: 28,
    checkedIn: true,
    tatameAreaM2: 80,
    maxSafeSparringPairs: 10,
    registeredStudents: [
      { id: 'stu_lucas_01', name: 'Lucas Gracie Mendes', belt: 'blue', avatar: '/bjj_media/bjj_student_male.jpg', status: 'present' },
      { id: 'stu_2', name: 'Gabriel Alencar', belt: 'white', avatar: '/bjj_media/bjj_student_male.jpg', status: 'present' },
      { 
        id: 'stu_3', 
        name: 'Renato Silveira', 
        belt: 'blue', 
        avatar: '/bjj_media/bjj_student_male.jpg', 
        status: 'present',
        hasInjuryWarning: true,
        injuryNote: 'Ombro direito em reabilitação (evitar projeções e chaves de ombro)',
        injurySeverity: 'moderate'
      },
      { id: 'stu_4', name: 'Camila Guimarães', belt: 'white', avatar: '/bjj_media/bjj_student_female.jpg', status: 'pending' },
      { id: 'stu_5', name: 'Felipe Duarte', belt: 'purple', avatar: '/bjj_media/bjj_student_male.jpg', status: 'present' },
      { 
        id: 'stu_6', 
        name: 'Marcos Vinicius', 
        belt: 'blue', 
        avatar: '/bjj_media/bjj_student_male.jpg', 
        status: 'present',
        hasInjuryWarning: true,
        injuryNote: 'Entorse leve de tornozelo — apenas rola posicional sem chaves de pé',
        injurySeverity: 'mild'
      }
    ]
  },
  {
    id: 'class_03',
    name: 'Jiu-Jitsu No Gi (Iniciante / Intermediário)',
    instructor: 'Prof. Alexandre Peçanha - Faixa Preta',
    instructorAvatar: '/bjj_media/bjj_professor_mestre.jpg',
    time: '12:00',
    duration: '60 min',
    type: 'No-Gi',
    tatame: 'Tatame 1 (Principal)',
    capacity: 30,
    enrolledCount: 22,
    checkedIn: false,
    tatameAreaM2: 80,
    maxSafeSparringPairs: 10,
    registeredStudents: [
      { id: 'stu_lucas_01', name: 'Lucas Gracie Mendes', belt: 'blue', avatar: '/bjj_media/bjj_student_male.jpg', status: 'pending' },
      { id: 'stu_7', name: 'Thiago Tavares', belt: 'brown', avatar: '/bjj_media/bjj_student_male.jpg', status: 'present' },
      { id: 'stu_8', name: 'Leonardo Salles', belt: 'purple', avatar: '/bjj_media/bjj_student_male.jpg', status: 'present' }
    ]
  },
  {
    id: 'class_04',
    name: 'Kids 03 (10 a 14 anos) • Time de Competição',
    instructor: 'Mestre Rodrigo "Cavalo" - 3º Grau',
    instructorAvatar: '/bjj_media/bjj_professor_mestre.jpg',
    time: '17:00',
    duration: '60 min',
    type: 'Competição',
    tatame: 'Tatame 2 (Competição Especial)',
    capacity: 25,
    enrolledCount: 18,
    checkedIn: false,
    tatameAreaM2: 60,
    maxSafeSparringPairs: 8,
    registeredStudents: [
      { id: 'dep_pedro_01', name: 'Pedro Henrique Mendes', belt: 'grey', avatar: '/bjj_media/bjj_kid_student.jpg', status: 'present' }
    ]
  },
  {
    id: 'class_05',
    name: 'Muay Thai Tradicional',
    instructor: 'Prof. Alexandre Peçanha',
    instructorAvatar: '/bjj_media/bjj_professor_mestre.jpg',
    time: '19:00',
    duration: '60 min',
    type: 'Muay Thai',
    tatame: 'Tatame 1 (Principal)',
    capacity: 30,
    enrolledCount: 20,
    checkedIn: false,
    tatameAreaM2: 80,
    maxSafeSparringPairs: 10,
    registeredStudents: []
  }
];

export const mockInvoices: Invoice[] = [
  // BJJ ACADEMY JARDINS
  {
    id: 'inv_current',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Plano Ilimitado - Setembro/2026',
    amount: 260.00,
    dueDate: '10/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-982142105204000053039865406260.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304E8A2',
    invoiceNumber: 'LOY-2026-09-0842'
  },
  {
    id: 'inv_parent_pedro',
    studentId: 'dep_pedro_01',
    studentName: 'Pedro Henrique Mendes (Kids)',
    studentAvatar: '/bjj_media/bjj_kid_student.jpg',
    title: 'Mensalidade Kids - Setembro/2026',
    amount: 220.00,
    dueDate: '15/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Loyalty Kids & Teens',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-pedro-2205204000053039865406220.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304C921',
    invoiceNumber: 'LOY-KIDS-2026-09-12'
  },
  {
    id: 'inv_parent_sofia',
    studentId: 'dep_sofia_02',
    studentName: 'Sofia Mendes (Baby Kids)',
    studentAvatar: '/bjj_media/bjj_kid_student.jpg',
    title: 'Mensalidade Kids - Setembro/2026',
    amount: 220.00,
    dueDate: '15/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Loyalty Kids & Teens',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-sofia-2205204000053039865406220.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304B104',
    invoiceNumber: 'LOY-KIDS-2026-09-13'
  },
  {
    id: 'inv_overdue_jardins_01',
    studentId: 'stu_marcos_01',
    studentName: 'Marcos Vinicius Ribeiro',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Agosto/2026',
    amount: 290.00,
    dueDate: '10/08/2026',
    status: 'overdue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 23,
    calculatedFine: 5.80,
    calculatedInterest: 2.22,
    totalUpdatedAmount: 298.02,
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-marcos-2985204000053039865406298.025802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304F221',
    invoiceNumber: 'LOY-2026-08-0199'
  },
  {
    id: 'inv_prev_aug',
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    title: 'Mensalidade Loyalty Black - Agosto/2026',
    amount: 290.00,
    dueDate: '10/08/2026',
    status: 'paid',
    paidDate: '08/08/2026 às 14:22',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    paymentMethod: 'pix',
    invoiceNumber: 'LOY-2026-08-0711'
  },

  // Loyalty Mensalidades Alunos
  {
    id: 'inv_gb_01',
    studentId: 'stu_gb_renato',
    studentName: 'Renato Silveira Costa',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Setembro/2026',
    amount: 290.00,
    dueDate: '05/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-2905204000053039865406290.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304A1B2',
    invoiceNumber: 'LOY-2026-09-0051'
  },
  {
    id: 'inv_gb_02_overdue',
    studentId: 'stu_gb_camila',
    studentName: 'Camila Guimarães Barros',
    studentAvatar: '/bjj_media/bjj_student_female.jpg',
    title: 'Mensalidade Loyalty Black - Agosto/2026',
    amount: 290.00,
    dueDate: '05/08/2026',
    status: 'overdue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 28,
    calculatedFine: 5.80,
    calculatedInterest: 2.70,
    totalUpdatedAmount: 298.50,
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-camila-2985204000053039865406298.505802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304D891',
    invoiceNumber: 'LOY-2026-08-0043'
  },
  {
    id: 'inv_gb_03_paid',
    studentId: 'stu_gb_thiago',
    studentName: 'Thiago Farias',
    title: 'Trimestral Loyalty Prime - Jul/Ago/Set 2026',
    amount: 780.00,
    dueDate: '01/07/2026',
    status: 'paid',
    paidDate: '01/07/2026 às 11:00',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Trimestral Loyalty Prime',
    paymentMethod: 'credit_card',
    invoiceNumber: 'LOY-2026-07-0012'
  },
  {
    id: 'inv_all_01',
    studentId: 'stu_all_felipe',
    studentName: 'Felipe Duarte Nogueira',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Setembro/2026',
    amount: 290.00,
    dueDate: '10/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-3105204000053039865406290.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***63047C10',
    invoiceNumber: 'LOY-2026-09-0301'
  },
  {
    id: 'inv_all_02_overdue',
    studentId: 'stu_all_bruno',
    studentName: 'Bruno Henrique Castilho',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Julho/2026',
    amount: 290.00,
    dueDate: '10/07/2026',
    status: 'overdue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 54,
    calculatedFine: 5.80,
    calculatedInterest: 5.21,
    totalUpdatedAmount: 301.01,
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-bruno-3015204000053039865406301.015802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304E190',
    invoiceNumber: 'LOY-2026-07-0240'
  },
  {
    id: 'inv_all_03_paid',
    studentId: 'stu_all_mariana',
    studentName: 'Mariana Lima Prado',
    title: 'Anual Loyalty Champion',
    amount: 2880.00,
    dueDate: '15/01/2026',
    status: 'paid',
    paidDate: '15/01/2026 às 16:30',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Anual Loyalty Champion',
    paymentMethod: 'credit_card',
    invoiceNumber: 'LOY-2026-01-0003'
  },
  {
    id: 'inv_chk_01',
    studentId: 'stu_chk_gabriel',
    studentName: 'Gabriel Alencar Santos',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Setembro/2026',
    amount: 290.00,
    dueDate: '12/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-2905204000053039865406290.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***63049F88',
    invoiceNumber: 'LOY-2026-09-0115'
  },
  {
    id: 'inv_chk_02_paid',
    studentId: 'stu_chk_patricia',
    studentName: 'Patricia Valadares',
    title: 'Mensalidade Loyalty Black - Agosto/2026',
    amount: 290.00,
    dueDate: '12/08/2026',
    status: 'paid',
    paidDate: '11/08/2026 às 09:12',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    paymentMethod: 'pix',
    invoiceNumber: 'LOY-2026-08-0098'
  },
  {
    id: 'inv_nu_01',
    studentId: 'stu_nu_rodrigo',
    studentName: 'Rodrigo Brandão',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Setembro/2026',
    amount: 290.00,
    dueDate: '08/09/2026',
    status: 'pending',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-2905204000053039865406290.005802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***63043D22',
    invoiceNumber: 'LOY-2026-09-0082'
  },
  {
    id: 'inv_nu_02_overdue',
    studentId: 'stu_nu_gustavo',
    studentName: 'Gustavo Paiva Meirelles',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    title: 'Mensalidade Loyalty Black - Agosto/2026',
    amount: 290.00,
    dueDate: '08/08/2026',
    status: 'overdue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    planName: 'Mensal Loyalty Black',
    lateFeePercent: 2.0,
    dailyInterestPercent: 0.0333,
    daysOverdue: 25,
    calculatedFine: 5.80,
    calculatedInterest: 2.41,
    totalUpdatedAmount: 298.21,
    pixCode: '00020126580014br.gov.bcb.pix0136loyalty-bjj-pix-gustavo-2985204000053039865406298.215802BR5918LOYALTY JIU JITSU6009FORTALEZA62070503***6304C771',
    invoiceNumber: 'LOY-2026-08-0074'
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
  { position: 1, id: 'rk_1', name: 'Rafael "Pitbull" Costa', avatar: '/bjj_media/bjj_student_male.jpg', belt: 'purple', classesAttended: 24, points: 1950, streak: 8 },
  { position: 2, id: 'rk_2', name: 'Bruno Guimarães', avatar: '/bjj_media/bjj_student_male.jpg', belt: 'brown', classesAttended: 22, points: 1820, streak: 7 },
  { position: 3, id: 'rk_3', name: 'Mariana Duarte', avatar: '/bjj_media/bjj_student_female.jpg', belt: 'blue', classesAttended: 19, points: 1610, streak: 6 },
  { position: 4, id: 'stu_lucas_01', name: 'Lucas Gracie (Você)', avatar: '/bjj_media/bjj_student_male.jpg', belt: 'blue', classesAttended: 16, points: 1420, streak: 5, isCurrentUser: true },
  { position: 5, id: 'rk_5', name: 'Thiago Silveira', avatar: '/bjj_media/bjj_student_male.jpg', belt: 'white', classesAttended: 15, points: 1290, streak: 4 },
  { position: 6, id: 'rk_6', name: 'Rodrigo Fontes', avatar: '/bjj_media/bjj_student_male.jpg', belt: 'blue', classesAttended: 14, points: 1210, streak: 3 }
];

export const mockTechniques: TechniqueItem[] = [
  {
    id: 'tec_1',
    title: 'Triângulo da Guarda Fechada',
    japaneseName: 'Sankaku-Jime',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: '/bjj_media/bjj_triangle.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/n3gZpI9334o',
    videoDuration: '04:15',
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
    videoThumb: '/bjj_media/bjj_scissor_sweep.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/bWl1Xo-W93o',
    videoDuration: '03:40',
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
    videoThumb: '/bjj_media/bjj_guard_pass.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/K8vUfCkg-c0',
    videoDuration: '05:12',
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
    videoThumb: '/bjj_media/bjj_armbar.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/M0TfH894qUo',
    videoDuration: '04:55',
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
    videoThumb: '/bjj_media/bjj_berimbolo.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/e7zO3C82z-w',
    videoDuration: '06:30',
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
    videoThumb: '/bjj_media/bjj_takedown.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/v9qM4UoX8kM',
    videoDuration: '03:20',
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
    videoThumb: '/bjj_media/bjj_self_defense.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/Yv8H9JqN9-g',
    videoDuration: '04:10',
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
    videoThumb: '/bjj_media/bjj_ezekiel.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/d23nJ7yGg3g',
    videoDuration: '03:45',
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
  },
  {
    id: 'tec_9',
    title: 'Mata-Leão das Costas (Rear Naked Choke)',
    japaneseName: 'Hadaka-Jime',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: '/bjj_media/bjj_rear_naked.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/Z0oYJ8V-1m4',
    videoDuration: '04:05',
    steps: [
      'Com os ganchos estabilizados nas costas, passe o braço dominante ao redor do pescoço até o cotovelo alinhar com o queixo.',
      'Segure o próprio bíceps do braço oposto e esconda a mão de apoio atrás da nuca do adversário.',
      'Infle o peito, aperte as escápulas e faça a pressão sem afrouxar os ganchos.'
    ],
    keyDetails: [
      'O cotovelo deve apontar diretamente para a linha central do peito do oponente.',
      'Esconda a mão que apoia na nuca para evitar que o adversário puxe seus dedos.'
    ],
    masterTip: 'Finalização rainha do Jiu-Jitsu: sem força excessiva, apenas estrangulamento limpo das duas carótidas.',
    learned: true
  },
  {
    id: 'tec_10',
    title: 'Chave Kimura da Guarda Fechada',
    japaneseName: 'Gyaku Ude-Garami',
    category: 'Finalizações',
    minimumBelt: 'white',
    difficulty: 'Iniciante',
    videoThumb: '/bjj_media/bjj_kimura.jpg',
    videoUrl: 'https://www.youtube-nocookie.com/embed/Wb9V2xX8jKc',
    videoDuration: '05:00',
    steps: [
      'Quando o oponente apoiar a mão no tatame, domine o punho dele com pegada de macaco (sem polegar).',
      'Abra a guarda, suba o tronco abraçando por cima do ombro dele.',
      'Passe a mão por baixo do tríceps dele e segure no seu próprio punho (pegada em quatro).',
      'Deite de lado cortando o ângulo e projete o punho dele em direção à nuca.'
    ],
    keyDetails: [
      'Mantenha o cotovelo dele dobrado em exatos 90 graus para criar a alavanca máxima.',
      'Nunca tente girar o braço com as costas retas no chão; deite de lado.'
    ],
    masterTip: 'A Kimura não é apenas finalização: é uma das maiores alavancas de controle posicional do Jiu-Jitsu.',
    learned: false
  }
];

export const mockGraduationCandidates: GraduationEligibility[] = [
  {
    studentId: 'stu_lucas_01',
    studentName: 'Lucas Gracie Mendes',
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_student_female.jpg',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
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
    avatar: '/bjj_media/bjj_kid_student.jpg',
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
    image: '/bjj_media/bjj_gi_kimono.jpg',
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
    image: '/bjj_media/bjj_rashguard.jpg',
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
    image: '/bjj_media/bjj_belts_display.jpg',
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
    image: '/bjj_media/bjj_rashguard_1789765316754.jpg',
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
    image: '/bjj_media/bjj_fighters_bg_1789389198066.jpg',
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
    image: '/bjj_media/bjj_patches.jpg',
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
    athleteAvatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'purple',
    tournamentName: 'Brasileiro CBJJ 2025',
    year: '2025',
    medal: 'gold',
    category: 'Faixa Roxa • Adulto Meio-Pesado'
  },
  {
    id: 'med_2',
    athleteName: 'Lucas Gracie Mendes',
    athleteAvatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'blue',
    tournamentName: 'SP Open IBJJF 2024',
    year: '2024',
    medal: 'silver',
    category: 'Faixa Azul • Adulto Médio'
  },
  {
    id: 'med_3',
    athleteName: 'Mariana Duarte',
    athleteAvatar: '/bjj_media/bjj_student_female.jpg',
    belt: 'blue',
    tournamentName: 'Sul-Americano CBJJ 2025',
    year: '2025',
    medal: 'gold',
    category: 'Faixa Azul • Adulto Leve Feminino'
  },
  {
    id: 'med_4',
    athleteName: 'Pedro Henrique Mendes (Kids)',
    athleteAvatar: '/bjj_media/bjj_kid_student.jpg',
    belt: 'grey',
    tournamentName: 'Copa Kids Futuros Campeões',
    year: '2025',
    medal: 'gold',
    category: 'Infantil B • Pena'
  },
  {
    id: 'med_5',
    athleteName: 'Bruno Guimarães',
    athleteAvatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'brown',
    tournamentName: 'Floripa Open IBJJF',
    year: '2024',
    medal: 'bronze',
    category: 'Faixa Marrom • Master 1 Pesadíssimo'
  }
];

export interface LoyaltyAdultScheduleItem {
  time: string;
  modality: string;
  level?: string;
  days: string;
  type: 'Gi' | 'No Gi' | 'Muay Thai';
}

export interface LoyaltyKidsScheduleItem {
  time: string;
  turma: string;
  ageGroup: string;
  days: string;
  tatame: 'TATAME 01' | 'TATAME 02';
  isCompetitionTeam?: boolean;
}

export interface LoyaltyScheduleGroup {
  groupName: string;
  days: string;
  classes: {
    time: string;
    title: string;
    modality: string;
    tag?: string;
  }[];
}

export interface LoyaltyKidsSchedule {
  turma: string;
  dias: string;
  horario: string;
  faixaEtaria?: string;
}

// -------------------------------------------------------------
// GRADE OFICIAL LOYALTY JIU-JITSU • ADULTOS (POSTER OFICIAL MM XXIII)
// -------------------------------------------------------------
export const loyaltyOfficialAdultSchedule: LoyaltyAdultScheduleItem[] = [
  { time: '07:00', modality: 'No Gi', level: 'Iniciante / Intermediário', days: 'SEG A SEX', type: 'No Gi' },
  { time: '08:00', modality: 'Gi', level: 'Iniciante', days: 'SEG A SEX', type: 'Gi' },
  { time: '11:00', modality: 'Gi', level: 'Intermediário / Avançado', days: 'SEG A SEX', type: 'Gi' },
  { time: '12:00', modality: 'No Gi', level: 'Iniciante / Intermediário', days: 'SEG A SEX', type: 'No Gi' },
  { time: '15:00', modality: 'Gi', level: 'Intermediário', days: 'SEG, QUA E SEX', type: 'Gi' },
  { time: '16:00', modality: 'No Gi', level: 'Iniciante / Intermediário', days: 'SEG A SEX', type: 'No Gi' },
  { time: '19:00', modality: 'Gi', level: 'Iniciante', days: 'SEG, QUA E SEX', type: 'Gi' },
  { time: '20:00', modality: 'Gi', level: 'Intermediário / Avançado', days: 'SEG A SEX', type: 'Gi' },
  { time: '19:00', modality: 'Muay Thai', level: 'Todos os níveis', days: 'SEG, QUA E SEX', type: 'Muay Thai' }
];

// -------------------------------------------------------------
// GRADE OFICIAL LOYALTY JIU-JITSU • KIDS (POSTER OFICIAL MM XXIII)
// -------------------------------------------------------------
export const loyaltyOfficialKidsTatame01: LoyaltyKidsScheduleItem[] = [
  { time: '09:00', turma: 'Kids 02', ageGroup: '7 a 12 anos', days: 'TER E QUI', tatame: 'TATAME 01' },
  { time: '15:00', turma: 'Kids 02', ageGroup: '7 a 12 anos', days: 'TER E QUI', tatame: 'TATAME 01' },
  { time: '17:00', turma: 'Kids 03', ageGroup: '10 a 14 anos', days: 'SEG A SEX', tatame: 'TATAME 01' },
  { time: '18:00', turma: 'Kids 01', ageGroup: '3 a 6 anos', days: 'SEG E QUA', tatame: 'TATAME 01' },
  { time: '18:00', turma: 'Kids 02', ageGroup: '7 a 12 anos', days: 'TER, QUI E SEX', tatame: 'TATAME 01' },
  { time: '19:00', turma: 'Kids 03', ageGroup: '10 a 14 anos', days: 'TER E QUI', tatame: 'TATAME 01' }
];

export const loyaltyOfficialKidsTatame02: LoyaltyKidsScheduleItem[] = [
  { time: '17:00', turma: 'Kids 03', ageGroup: '10 a 14 anos', days: 'SEG, QUA E SEX', tatame: 'TATAME 02', isCompetitionTeam: true },
  { time: '18:00', turma: 'Kids 01', ageGroup: '3 a 6 anos', days: 'TER E QUI', tatame: 'TATAME 02' },
  { time: '19:00', turma: 'Muay Thai Kids', ageGroup: 'Kids 02 • 7 a 12 anos', days: 'TER E QUI', tatame: 'TATAME 02' }
];

// Grupos para compatibilidade
export const loyaltyOfficialScheduleGroups: LoyaltyScheduleGroup[] = [
  {
    groupName: 'Grade de Treinos Adultos (Gi, No Gi & Muay Thai)',
    days: 'Segunda a Sexta',
    classes: loyaltyOfficialAdultSchedule.map(item => ({
      time: item.time,
      title: `${item.modality}${item.level ? ` (${item.level})` : ''}`,
      modality: item.type === 'No Gi' ? 'No-Gi / Sem Kimono' : item.type === 'Muay Thai' ? 'Muay Thai Tradicional' : 'Gi / Com Kimono',
      tag: item.days
    }))
  },
  {
    groupName: 'Grade de Treinos Kids (Tatame 01 & 02)',
    days: 'Segunda a Sexta',
    classes: [
      ...loyaltyOfficialKidsTatame01.map(k => ({
        time: k.time,
        title: `${k.turma} (${k.ageGroup}) • Tatame 01`,
        modality: 'Jiu-Jitsu Infantil',
        tag: k.days
      })),
      ...loyaltyOfficialKidsTatame02.map(k => ({
        time: k.time,
        title: `${k.turma} (${k.ageGroup})${k.isCompetitionTeam ? ' [TIME DE COMPETIÇÃO]' : ''} • Tatame 02`,
        modality: k.turma.includes('Muay Thai') ? 'Muay Thai Kids' : 'Jiu-Jitsu Infantil Competição',
        tag: k.days
      }))
    ]
  }
];

export const loyaltyOfficialKidsSchedule: LoyaltyKidsSchedule[] = [
  { turma: 'Kids 01 (Tatame 01)', dias: 'Segunda e Quarta', horario: '18:00', faixaEtaria: '3 a 6 anos' },
  { turma: 'Kids 01 (Tatame 02)', dias: 'Terça e Quinta', horario: '18:00', faixaEtaria: '3 a 6 anos' },
  { turma: 'Kids 02 (Tatame 01)', dias: 'Terça e Quinta', horario: '09:00', faixaEtaria: '7 a 12 anos' },
  { turma: 'Kids 02 (Tatame 01)', dias: 'Terça e Quinta', horario: '15:00', faixaEtaria: '7 a 12 anos' },
  { turma: 'Kids 02 (Tatame 01)', dias: 'Terça, Quinta e Sexta', horario: '18:00', faixaEtaria: '7 a 12 anos' },
  { turma: 'Kids 03 (Tatame 01)', dias: 'Segunda a Sexta', horario: '17:00', faixaEtaria: '10 a 14 anos' },
  { turma: 'Kids 03 (Tatame 01)', dias: 'Terça e Quinta', horario: '19:00', faixaEtaria: '10 a 14 anos' },
  { turma: 'Kids 03 (Tatame 02 • Competição)', dias: 'Segunda, Quarta e Sexta', horario: '17:00', faixaEtaria: '10 a 14 anos' },
  { turma: 'Muay Thai Kids (Tatame 02)', dias: 'Terça e Quinta', horario: '19:00', faixaEtaria: 'Kids 02 • 7 a 12 anos' }
];

export const loyaltyOfficialOperatingHours: AcademyOperatingDay[] = [
  {
    dayOfWeek: 'segunda',
    dayLabel: 'segunda-feira',
    isOpen: true,
    slots: [
      '07:00 (No Gi • Inic/Inter)',
      '08:00 (Gi • Iniciante)',
      '11:00 (Gi • Inter/Avançado)',
      '12:00 (No Gi • Inic/Inter)',
      '15:00 (Gi • Intermediário)',
      '16:00 (No Gi • Inic/Inter)',
      '17:00 (Kids 03 • T1 e T2 Competição)',
      '18:00 (Kids 01 • T1 3 a 6 anos)',
      '19:00 (Gi Inic & Muay Thai)',
      '20:00 (Gi • Inter/Avançado)'
    ]
  },
  {
    dayOfWeek: 'terca',
    dayLabel: 'terça-feira',
    isOpen: true,
    slots: [
      '07:00 (No Gi • Inic/Inter)',
      '08:00 (Gi • Iniciante)',
      '09:00 (Kids 02 • T1 7 a 12 anos)',
      '11:00 (Gi • Inter/Avançado)',
      '12:00 (No Gi • Inic/Inter)',
      '15:00 (Kids 02 • T1 7 a 12 anos)',
      '16:00 (No Gi • Inic/Inter)',
      '17:00 (Kids 03 • T1 10 a 14 anos)',
      '18:00 (Kids 02 • T1 & Kids 01 • T2)',
      '19:00 (Kids 03 • T1 & Muay Thai Kids • T2)',
      '20:00 (Gi • Inter/Avançado)'
    ]
  },
  {
    dayOfWeek: 'quarta',
    dayLabel: 'quarta-feira',
    isOpen: true,
    slots: [
      '07:00 (No Gi • Inic/Inter)',
      '08:00 (Gi • Iniciante)',
      '11:00 (Gi • Inter/Avançado)',
      '12:00 (No Gi • Inic/Inter)',
      '15:00 (Gi • Intermediário)',
      '16:00 (No Gi • Inic/Inter)',
      '17:00 (Kids 03 • T1 e T2 Competição)',
      '18:00 (Kids 01 • T1 3 a 6 anos)',
      '19:00 (Gi Inic & Muay Thai)',
      '20:00 (Gi • Inter/Avançado)'
    ]
  },
  {
    dayOfWeek: 'quinta',
    dayLabel: 'quinta-feira',
    isOpen: true,
    slots: [
      '07:00 (No Gi • Inic/Inter)',
      '08:00 (Gi • Iniciante)',
      '09:00 (Kids 02 • T1 7 a 12 anos)',
      '11:00 (Gi • Inter/Avançado)',
      '12:00 (No Gi • Inic/Inter)',
      '15:00 (Kids 02 • T1 7 a 12 anos)',
      '16:00 (No Gi • Inic/Inter)',
      '17:00 (Kids 03 • T1 10 a 14 anos)',
      '18:00 (Kids 02 • T1 & Kids 01 • T2)',
      '19:00 (Kids 03 • T1 & Muay Thai Kids • T2)',
      '20:00 (Gi • Inter/Avançado)'
    ]
  },
  {
    dayOfWeek: 'sexta',
    dayLabel: 'sexta-feira',
    isOpen: true,
    slots: [
      '07:00 (No Gi • Inic/Inter)',
      '08:00 (Gi • Iniciante)',
      '11:00 (Gi • Inter/Avançado)',
      '12:00 (No Gi • Inic/Inter)',
      '15:00 (Gi • Intermediário)',
      '16:00 (No Gi • Inic/Inter)',
      '17:00 (Kids 03 • T1 e T2 Competição)',
      '18:00 (Kids 02 • T1 7 a 12 anos)',
      '19:00 (Gi Inic & Muay Thai)',
      '20:00 (Gi • Inter/Avançado)'
    ]
  },
  {
    dayOfWeek: 'sabado',
    dayLabel: 'sábado',
    isOpen: false,
    slots: []
  },
  {
    dayOfWeek: 'domingo',
    dayLabel: 'domingo',
    isOpen: false,
    slots: []
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
    phone: '(85) 9-9136-2789',
    email: 'contato@loyaltyjiujitsu.com.br',
    headInstructor: 'Messias Batista da Silva Junior (• Mestre Fundador)',
    crefNumber: '019844-G/CE',
    studentCapacity: 350,
    tatamiAreaM2: 220,
    activeStudentsCount: 165,
    saasPlanTier: 'OURO',
    maxActiveStudentsLimit: 999999,
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
    legalRepresentativePhone: '(85) 9-9136-2789',
    federationAffiliation: 'CBJJ / IBJJF',
    federationRegisterNumber: 'CBJJ-CE-10928',
    fireDepartmentPermit: 'AVCB nº 2024-918293',
    operatingLicense: 'Alvará Municipal nº 2024/0912',
    hasFirstAidKit: true,
    billingDueDay: 10,
    financialContactEmail: 'financeiro@loyaltyjiujitsu.com.br',
    financialContactPhone: '(85) 9-9136-2789',
    termsAccepted: true,
    termsAcceptedDate: '15/01/2026 14:30',
    termsAcceptedIp: '189.120.44.12',
    termsVersion: '2026.2',
    lgpdConsent: true,
    medicalResponsibilityWaiver: true,
    digitalSignatureProtocol: 'BJJ-TERMS-2026-0178-LOYALTY-OFFICIAL',
    managerPin6: '123456', // Senha de 6 dígitos do Gestor / Dono da Academia
    managerPasscode: 'Dono@2026',
    staffUsers: [
      {
        id: 'prof_rodrigo_cavalo',
        name: 'Mestre Rodrigo "Cavalo"',
        email: 'rodrigo.cavalo@loyaltyjiujitsu.com.br',
        role: 'PROFESSOR',
        belt: 'black',
        stripes: 3,
        avatar: '/bjj_media/bjj_professor_mestre.jpg',
        academyId: 'acad_loyalty_jiujitsu',
        academyName: 'Loyalty Jiu-Jitsu',
        password: 'Cavalo@tatame1',
        pinCode: '333333',
        activeClassId: 'class_02',
        isClassActive: false
      },
      {
        id: 'prof_beatriz_lima',
        name: 'Profª Beatriz Lima',
        email: 'beatriz.lima@loyaltyjiujitsu.com.br',
        role: 'PROFESSOR',
        belt: 'brown',
        stripes: 1,
        avatar: '/bjj_media/bjj_student_female.jpg',
        academyId: 'acad_loyalty_jiujitsu',
        academyName: 'Loyalty Jiu-Jitsu',
        password: 'Beatriz@kids2',
        pinCode: '222222',
        activeClassId: 'class_01',
        isClassActive: false
      },
      {
        id: 'prof_alexandre_pecanha',
        name: 'Prof. Alexandre Peçanha',
        email: 'alexandre.pecanha@loyaltyjiujitsu.com.br',
        role: 'PROFESSOR',
        belt: 'black',
        stripes: 1,
        avatar: '/bjj_media/bjj_professor_mestre.jpg',
        academyId: 'acad_loyalty_jiujitsu',
        academyName: 'Loyalty Jiu-Jitsu',
        password: 'Pecanha@bjj1',
        pinCode: '111111',
        activeClassId: 'class_03',
        isClassActive: false
      }
    ],
    pricingPlans: [
      { id: 'plan_loyalty_mensal', name: 'Mensal Loyalty Black', periodMonths: 1, price: 290.00, monthlyEquivalent: 290.00, description: 'Acesso total aos tatames da Loyalty Jiu-Jitsu com metodologia de elite MM XXIII.', isPopular: true },
      { id: 'plan_loyalty_trimestral', name: 'Trimestral Loyalty Prime', periodMonths: 3, price: 780.00, monthlyEquivalent: 260.00, description: 'Condição especial para treino contínuo no tatame.' },
      { id: 'plan_loyalty_anual', name: 'Anual Loyalty Champion', periodMonths: 12, price: 2880.00, monthlyEquivalent: 240.00, description: 'Plano anual com rashguard e kimono oficial Loyalty inclusos.' },
      { id: 'plan_loyalty_kids', name: 'Loyalty Kids & Teens', periodMonths: 1, price: 220.00, monthlyEquivalent: 220.00, description: 'Valores, respeito e defesa pessoal para a juventude.' }
    ],
    operatingHours: loyaltyOfficialOperatingHours
  },
  {
    id: 'acad_gracie_barra_sp',
    name: 'Gracie Barra Jardins',
    shortName: 'GB Jardins',
    branch: 'Unidade Jardins • SP',
    city: 'São Paulo - SP',
    state: 'SP',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Oscar Freire, 1120',
    phone: '(11) 98111-2233',
    email: 'carlos.gracie@gbjardins.com.br',
    headInstructor: 'Prof. Carlos Eduardo Gracie',
    crefNumber: '028114-G/SP',
    studentCapacity: 200,
    tatamiAreaM2: 180,
    activeStudentsCount: 110,
    saasPlanTier: 'AVANCADO',
    maxActiveStudentsLimit: 150,
    status: 'active',
    voiceEnabled: true,
    voiceStyle: 'tatame_master',
    notificationFormat: 'name_and_title',
    chimeType: 'tatame_bell',
    speechRate: 1.0,
    speechPitch: 1.0,
    billingDueDay: 5,
    legalRepresentativeName: 'Prof. Carlos Eduardo Gracie',
    pricingPlans: []
  },
  {
    id: 'acad_alliance_campinas',
    name: 'Alliance Campinas',
    shortName: 'Alliance Campinas',
    branch: 'Taquaral • Campinas SP',
    city: 'Campinas - SP',
    state: 'SP',
    cnpj: '23.456.789/0001-01',
    address: 'Av. Barão de Itapura, 940',
    phone: '(19) 97222-3344',
    email: 'fernando@alliancecampinas.com.br',
    headInstructor: 'Mestre Fernando Ramos',
    crefNumber: '018992-G/SP',
    studentCapacity: 120,
    tatamiAreaM2: 110,
    activeStudentsCount: 38,
    saasPlanTier: 'BASICO',
    maxActiveStudentsLimit: 40,
    status: 'suspended',
    voiceEnabled: false,
    voiceStyle: 'commercial',
    notificationFormat: 'name_only',
    chimeType: 'chime_bright',
    speechRate: 1.0,
    speechPitch: 1.0,
    billingDueDay: 15,
    legalRepresentativeName: 'Mestre Fernando Ramos',
    pricingPlans: []
  },
  {
    id: 'acad_checkmat_santos',
    name: 'Checkmat Baixada',
    shortName: 'Checkmat Santos',
    branch: 'Gonzaga • Santos SP',
    city: 'Santos - SP',
    state: 'SP',
    cnpj: '34.567.890/0001-12',
    address: 'Av. Ana Costa, 400',
    phone: '(13) 99333-4455',
    email: 'contato@checkmatsantos.com.br',
    headInstructor: 'Prof. Rodrigo Martins',
    crefNumber: '023199-G/SP',
    studentCapacity: 180,
    tatamiAreaM2: 150,
    activeStudentsCount: 95,
    saasPlanTier: 'AVANCADO',
    maxActiveStudentsLimit: 150,
    status: 'active',
    voiceEnabled: true,
    voiceStyle: 'energetic',
    notificationFormat: 'name_and_title',
    chimeType: 'tatame_bell',
    speechRate: 1.0,
    speechPitch: 1.0,
    billingDueDay: 20,
    legalRepresentativeName: 'Prof. Rodrigo Martins',
    pricingPlans: []
  },
  {
    id: 'acad_nova_uniao_bh',
    name: 'Nova União Minas',
    shortName: 'Nova União BH',
    branch: 'Savassi • Belo Horizonte MG',
    city: 'Belo Horizonte - MG',
    state: 'MG',
    cnpj: '45.678.901/0001-23',
    address: 'Rua Fernandes Tourinho, 210',
    phone: '(31) 98444-5566',
    email: 'leandro@novauniaominas.com.br',
    headInstructor: 'Prof. Leandro Barbosa',
    crefNumber: '011244-G/MG',
    studentCapacity: 100,
    tatamiAreaM2: 90,
    activeStudentsCount: 32,
    saasPlanTier: 'BASICO',
    maxActiveStudentsLimit: 40,
    status: 'suspended',
    voiceEnabled: false,
    voiceStyle: 'tatame_master',
    notificationFormat: 'full_message',
    chimeType: 'tatame_bell',
    speechRate: 1.0,
    speechPitch: 1.0,
    billingDueDay: 25,
    legalRepresentativeName: 'Prof. Leandro Barbosa',
    pricingPlans: []
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
    id: 'plat_pay_loyalty',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    branch: 'Matriz Oficial • CE',
    activeStudentsCount: 165,
    fixedAmount: 130.00,
    variableAmount: 214.50, // 165 x 1.30
    amount: 344.50, // 130 + 214.50
    dueDate: '10/09/2026',
    status: 'paid',
    paidDate: '05/09/2026',
    referenceMonth: '09/2026',
    invoiceRef: 'FAT-PLAT-2026-001',
    pixCode: '00020126580014br.gov.bcb.pix0111580876303785204000053039865406344.505802BR5925MESSIAS B SILVA JR6009SAO PAULO62170513BJJPLAT0016304D1A2'
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
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    studentBelt: 'white',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '12/08/2026',
    daysAbsent: 23,
    churnRisk: 'critico',
    contactStatus: 'pendente',
    detectedCause: 'desmotivado',
    monthlyFee: 290.0,
    preferredClassTime: '19:30 (Noite)'
  },
  {
    id: 'ret_02',
    studentId: 'stu_juliana_04',
    studentName: 'Juliana Camargo Silva',
    studentPhone: '(11) 99342-8811',
    studentAvatar: '/bjj_media/bjj_student_female.jpg',
    studentBelt: 'blue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '20/08/2026',
    daysAbsent: 15,
    churnRisk: 'alto',
    contactStatus: 'contatado',
    lastContactDate: '02/09/2026',
    contactNotes: 'Relatou dores nas costas; fisioterapia em andamento. Volta dia 10.',
    detectedCause: 'lesao',
    monthlyFee: 290.0,
    preferredClassTime: '07:00 (Manhã)'
  },
  {
    id: 'ret_03',
    studentId: 'stu_felipe_07',
    studentName: 'Felipe Antunes Barreto',
    studentPhone: '(11) 97123-5599',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    studentBelt: 'purple',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '27/08/2026',
    daysAbsent: 8,
    churnRisk: 'moderado',
    contactStatus: 'pendente',
    detectedCause: 'trabalho',
    monthlyFee: 290.0,
    preferredClassTime: '20:30 (Competição)'
  },
  {
    id: 'ret_04',
    studentId: 'stu_ricardo_08',
    studentName: 'Ricardo Duarte Meirelles',
    studentPhone: '(11) 96543-2211',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    studentBelt: 'white',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '05/08/2026',
    daysAbsent: 30,
    churnRisk: 'critico',
    contactStatus: 'pendente',
    detectedCause: 'indefinido',
    monthlyFee: 290.0,
    preferredClassTime: '12:00 (Almoço)'
  },
  {
    id: 'ret_05',
    studentId: 'stu_gabriel_03',
    studentName: 'Gabriel Siqueira',
    studentPhone: '(11) 98111-3322',
    studentAvatar: '/bjj_media/bjj_student_male.jpg',
    studentBelt: 'blue',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '18/08/2026',
    daysAbsent: 17,
    churnRisk: 'alto',
    contactStatus: 'pendente',
    detectedCause: 'trabalho',
    monthlyFee: 290.0,
    preferredClassTime: '19:30 (Noite)'
  },
  {
    id: 'ret_06',
    studentId: 'stu_carolina_06',
    studentName: 'Carolina Braga',
    studentPhone: '(11) 97444-9988',
    studentAvatar: '/bjj_media/bjj_student_female.jpg',
    studentBelt: 'white',
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    lastAttendanceDate: '26/08/2026',
    daysAbsent: 9,
    churnRisk: 'moderado',
    contactStatus: 'resgatado',
    lastContactDate: '01/09/2026',
    contactNotes: 'Confirmou presença para o treino de sexta!',
    detectedCause: 'desmotivado',
    monthlyFee: 290.0,
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
    avatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'blue',
    stripes: 3,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_kid_student.jpg',
    belt: 'grey_white',
    stripes: 2,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_student_female.jpg',
    belt: 'brown',
    stripes: 1,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'white',
    stripes: 2,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_professor_mestre.jpg',
    belt: 'black',
    stripes: 3,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_professor_mestre.jpg',
    belt: 'black',
    stripes: 1,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_student_female.jpg',
    belt: 'white',
    stripes: 4,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_student_male.jpg',
    belt: 'purple',
    stripes: 1,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
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
    avatar: '/bjj_media/bjj_kid_student.jpg',
    belt: 'yellow_white',
    stripes: 2,
    academyId: 'acad_loyalty_jiujitsu',
    academyName: 'Loyalty Jiu-Jitsu',
    congratulated: false
  }
];

// Helper para gerar datas no mês corrente e mês anterior garantindo dados ricos em qualquer data de execução
const _now = new Date();
const _year = _now.getFullYear();
const _month = String(_now.getMonth() + 1).padStart(2, '0');
const _prevMonth = String(_now.getMonth() === 0 ? 12 : _now.getMonth()).padStart(2, '0');
const _prevYear = _now.getMonth() === 0 ? _year - 1 : _year;

export const mockPayableExpenses: PayableExpense[] = [
  // 🏢 1. ALUGUEL E CUSTOS FIXOS
  {
    id: 'exp_aluguel_matriz_01',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'aluguel_fixos',
    categoryLabel: 'Aluguel e custos fixos',
    description: 'Aluguel do Galpão Principal (Loyalty Matriz)',
    amount: 3800.00,
    dueDate: `${_year}-${_month}-10`,
    status: 'paid',
    paidDate: `${_year}-${_month}-09`,
    recipientName: 'Imobiliária Fortaleza Prime Imóveis',
    paymentMethod: 'pix',
    pixKey: 'financeiro@primeimoveis.com.br',
    notes: 'Contrato com bonificação de pontualidade aplicada.',
    createdAt: `${_year}-${_month}-01T08:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_condominio_02',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'aluguel_fixos',
    categoryLabel: 'Aluguel e custos fixos',
    description: 'Taxa de Condomínio Empresarial & IPTU Rateado',
    amount: 650.00,
    dueDate: `${_year}-${_month}-15`,
    status: 'paid',
    paidDate: `${_year}-${_month}-14`,
    recipientName: 'Condomínio Centro Empresarial Aldeota',
    paymentMethod: 'boleto',
    notes: 'Boleto bancário quitado pelo app do banco.',
    createdAt: `${_year}-${_month}-01T08:10:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_seguro_predial_03',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'aluguel_fixos',
    categoryLabel: 'Aluguel e custos fixos',
    description: 'Seguro Predial Contra Incêndio & Responsabilidade Civil',
    amount: 280.00,
    dueDate: `${_year}-${_month}-28`,
    status: 'pending',
    recipientName: 'Porto Seguro Cia de Seguros',
    paymentMethod: 'boleto',
    notes: 'Parcela 09/12 da apólice de segurança do tatame.',
    createdAt: `${_year}-${_month}-02T09:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },

  // 🥋 2. FOLHA DE PAGAMENTO (Salários de professores e outros funcionários)
  {
    id: 'exp_folha_rodrigo_04',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'folha_pagamento',
    categoryLabel: 'Folha de pagamento (salários de professores e outros funcionários)',
    description: 'Salário Professor Rodrigo Cavalo (Tatame Adulto / Pro)',
    amount: 2500.00,
    dueDate: `${_year}-${_month}-05`,
    status: 'paid',
    paidDate: `${_year}-${_month}-05`,
    recipientName: 'Rodrigo "Cavalo" Silva',
    paymentMethod: 'pix',
    pixKey: 'rodrigo.cavalo@loyaltybjj.com',
    notes: 'Aulas noturnas e preparação dos atletas para o Estadual.',
    createdAt: `${_year}-${_month}-01T10:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_folha_camila_05',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'folha_pagamento',
    categoryLabel: 'Folha de pagamento (salários de professores e outros funcionários)',
    description: 'Salário Professora Camila (Tatame Kids & BJJ Feminino)',
    amount: 1900.00,
    dueDate: `${_year}-${_month}-05`,
    status: 'paid',
    paidDate: `${_year}-${_month}-05`,
    recipientName: 'Camila Guimarães',
    paymentMethod: 'pix',
    pixKey: 'camila.bjj@loyaltybjj.com',
    notes: 'Turmas Kids (4 a 12 anos) e turma feminina das terças/quintas.',
    createdAt: `${_year}-${_month}-01T10:15:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_folha_recepcao_06',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'folha_pagamento',
    categoryLabel: 'Folha de pagamento (salários de professores e outros funcionários)',
    description: 'Bolsa Suporte Recepção & Controle de Acesso',
    amount: 1200.00,
    dueDate: `${_year}-${_month}-05`,
    status: 'paid',
    paidDate: `${_year}-${_month}-05`,
    recipientName: 'Ana Beatriz Souza',
    paymentMethod: 'pix',
    pixKey: 'anabeatriz.rec@gmail.com',
    notes: 'Atendimento do WhatsApp, cadastros e totem de presença.',
    createdAt: `${_year}-${_month}-01T10:30:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_folha_limpeza_07',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'folha_pagamento',
    categoryLabel: 'Folha de pagamento (salários de professores e outros funcionários)',
    description: 'Serviço de Higienização e Limpeza Noturna de Tatame',
    amount: 950.00,
    dueDate: `${_year}-${_month}-20`,
    status: 'pending',
    recipientName: 'Marcos Vinícius Oliveira',
    paymentMethod: 'pix',
    pixKey: 'marcos.limpeza@outlook.com',
    notes: 'Higienização e desinfecção pós-treinos das 21h30.',
    createdAt: `${_year}-${_month}-02T11:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },

  // ⚡ 3. SERVIÇOS EXTRAS (Água, luz, internet, limpeza, manutenção)
  {
    id: 'exp_luz_enel_08',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'servicos_extras',
    categoryLabel: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    description: 'Energia Elétrica Enel (Iluminação LED Tatame + Climatização)',
    amount: 840.50,
    dueDate: `${_year}-${_month}-12`,
    status: 'paid',
    paidDate: `${_year}-${_month}-11`,
    recipientName: 'Enel Distribuição Ceará',
    paymentMethod: 'boleto',
    notes: 'Código de barras débito em conta.',
    createdAt: `${_year}-${_month}-01T11:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_agua_cagece_09',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'servicos_extras',
    categoryLabel: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    description: 'Água e Esgoto Cagece (Bebedouros e Vestiários)',
    amount: 245.80,
    dueDate: `${_year}-${_month}-14`,
    status: 'paid',
    paidDate: `${_year}-${_month}-14`,
    recipientName: 'Cagece Companhia de Água e Esgoto',
    paymentMethod: 'pix',
    pixKey: 'pix.arrecadacao@cagece.com.br',
    notes: 'Consumo do mês dentro da meta sustentável da academia.',
    createdAt: `${_year}-${_month}-01T11:20:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_internet_fibra_10',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'servicos_extras',
    categoryLabel: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    description: 'Internet Fibra Óptica 600MB (Câmeras de Segurança e Totem)',
    amount: 149.90,
    dueDate: `${_year}-${_month}-18`,
    status: 'paid',
    paidDate: `${_year}-${_month}-17`,
    recipientName: 'Brisanet Telecomunicações S.A.',
    paymentMethod: 'pix',
    pixKey: 'cobranca@brisanet.com.br',
    notes: 'IP dedicado para streaming da Tatame TV e aplicativo dos alunos.',
    createdAt: `${_year}-${_month}-01T11:35:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_quimica_tatame_11',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'servicos_extras',
    categoryLabel: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    description: 'Galões de Quaternário de Amônio 5ª Geração (Sanitização Anti-Fúngica)',
    amount: 320.00,
    dueDate: `${_year}-${_month}-22`,
    status: 'pending',
    recipientName: 'Detergel Distribuidora Hospitalar',
    paymentMethod: 'boleto',
    notes: 'Essencial para prevenção de dermatite e micose no tatame.',
    createdAt: `${_year}-${_month}-03T14:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_manutencao_ventiladores_12',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'servicos_extras',
    categoryLabel: 'Serviços extras (água, luz, internet, limpeza, manutenção)',
    description: 'Manutenção Preventiva de 4 Ventiladores de Coluna e Exaustor',
    amount: 180.00,
    dueDate: `${_year}-${_month}-25`,
    status: 'pending',
    recipientName: 'EletroRefrigeração Silva',
    paymentMethod: 'cash',
    notes: 'Troca de rolamentos e balanceamento das pás.',
    createdAt: `${_year}-${_month}-05T15:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },

  // 📝 4. DESPESAS AVULSAS (Com campo para descrição e valor)
  {
    id: 'exp_faixas_graduacao_13',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'despesas_avulsas',
    categoryLabel: 'Despesas avulsas (com campo para descrição e valor)',
    description: 'Lote de 25 Faixas Oficiais CBJJ e Esparadrapos de Grau',
    amount: 550.00,
    dueDate: `${_year}-${_month}-08`,
    status: 'paid',
    paidDate: `${_year}-${_month}-08`,
    recipientName: 'Kimonos & Cia BJJ Store',
    paymentMethod: 'pix',
    pixKey: 'vendas@kimonosecia.com.br',
    notes: 'Faixas brancas, azuis e roxas para cerimônia trimestral de graduação.',
    createdAt: `${_year}-${_month}-02T16:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_primeiros_socorros_14',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'despesas_avulsas',
    categoryLabel: 'Despesas avulsas (com campo para descrição e valor)',
    description: 'Reposição Farmácia Tatame (Spray de Cloreto, Gelo Rápido, Bandagens)',
    amount: 165.40,
    dueDate: `${_year}-${_month}-13`,
    status: 'paid',
    paidDate: `${_year}-${_month}-13`,
    recipientName: 'Farmácia Pague Menos Aldeota',
    paymentMethod: 'credit_card',
    notes: 'Estojo de emergência para treinos fortes de sparring.',
    createdAt: `${_year}-${_month}-04T12:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },
  {
    id: 'exp_banner_campeonato_15',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'despesas_avulsas',
    categoryLabel: 'Despesas avulsas (com campo para descrição e valor)',
    description: 'Banner em Lona com Quadro de Honra e Regulamento dos Treinos',
    amount: 210.00,
    dueDate: `${_year}-${_month}-27`,
    status: 'pending',
    recipientName: 'Gráfica Rápida Express Fortaleza',
    paymentMethod: 'pix',
    pixKey: 'financeiro@graficaexpress.com.br',
    notes: 'Impressão 3x1.5m em alta resolução para entrada da academia.',
    createdAt: `${_year}-${_month}-06T14:30:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  },

  // Despesa do mês anterior para testar histórico comparativo
  {
    id: 'exp_aluguel_anterior_16',
    tenantId: 'acad_loyalty_jiujitsu',
    category: 'aluguel_fixos',
    categoryLabel: 'Aluguel e custos fixos',
    description: 'Aluguel do Galpão Principal (Mês Anterior)',
    amount: 3800.00,
    dueDate: `${_prevYear}-${_prevMonth}-10`,
    status: 'paid',
    paidDate: `${_prevYear}-${_prevMonth}-09`,
    recipientName: 'Imobiliária Fortaleza Prime Imóveis',
    paymentMethod: 'pix',
    pixKey: 'financeiro@primeimoveis.com.br',
    createdAt: `${_prevYear}-${_prevMonth}-01T08:00:00.000Z`,
    createdBy: { id: 'mgr_loyalty', name: 'Gestor Matriz', role: 'manager' }
  }
];

