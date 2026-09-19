import {
  TournamentItem,
  RegisteredAcademy,
  AcademyTournamentBroadcast,
  TournamentBroadcastLog,
  Announcement
} from '../types';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/safeStorage';
import { mockRegisteredAcademies } from '../data/mockData';

export const INITIAL_COMPETITIONS_LIST: TournamentItem[] = [
  {
    id: 'tourn_fortaleza_open',
    name: 'Fortaleza International Open IBJJF Championship 2026',
    federation: 'IBJJF',
    date: '17 e 18 de Outubro de 2026',
    location: 'Ginásio Paulo Sarasate, Dionísio Torres',
    city: 'Fortaleza',
    state: 'CE',
    registrationDeadline: '06 de Outubro de 2026',
    registrationOpen: true,
    registrationFee: 210.0,
    enrolledAcademyCount: 24,
    categories: ['Juvenil, Adulto e Master 1 a 6', 'Faixas Branca a Preta', 'Gi & No-Gi'],
    description: 'Um dos maiores eventos do Norte/Nordeste com pontuação oficial no ranking mundial da IBJJF.',
    bannerImage: '/bjj_media/bjj_fighters_bg_1789389198066.jpg',
    broadcastCount: 1,
    lastBroadcastAt: '12/09/2026 14:30'
  },
  {
    id: 'tourn_salvador_open',
    name: 'Salvador International Open IBJJF 2026',
    federation: 'IBJJF',
    date: '07 e 08 de Novembro de 2026',
    location: 'Arena de Esportes da Bahia, Ipitanga',
    city: 'Salvador',
    state: 'BA',
    registrationDeadline: '27 de Outubro de 2026',
    registrationOpen: true,
    registrationFee: 220.0,
    enrolledAcademyCount: 19,
    categories: ['Mirim, Infantil, Juvenil e Adulto', 'Todas as Faixas', 'Gi & No-Gi'],
    description: 'Etapa histórica em Salvador com estrutura de 10 tatames e premiações especiais para absolutos.',
    bannerImage: '/bjj_media/bjj_team_group.jpg',
    broadcastCount: 0
  },
  {
    id: 'tourn_grand_slam_rio',
    name: 'Abu Dhabi Grand Slam Jiu-Jitsu World Tour - Rio de Janeiro',
    federation: 'AJP Tour',
    date: '04 a 06 de Dezembro de 2026',
    location: 'Arena Carioca 1, Parque Olímpico da Barra',
    city: 'Rio de Janeiro',
    state: 'RJ',
    registrationDeadline: '20 de Novembro de 2026',
    registrationOpen: true,
    registrationFee: 290.0,
    enrolledAcademyCount: 42,
    categories: ['Profissional e Master', 'Faixas Roxa, Marrom e Preta', 'Premiação em Dólar'],
    description: 'Torneio internacional oficial da AJP Tour com premiação em dinheiro em todas as categorias principais.',
    bannerImage: '/bjj_media/bjj_berimbolo.jpg',
    broadcastCount: 2,
    lastBroadcastAt: '10/09/2026 09:15'
  },
  {
    id: 'tourn_brasileiro_cbjj',
    name: 'Campeonato Brasileiro de Jiu-Jitsu CBJJ 2026',
    federation: 'CBJJ',
    date: '25 a 30 de Outubro de 2026',
    location: 'Ginásio Poliesportivo José Corrêa',
    city: 'Barueri',
    state: 'SP',
    registrationDeadline: '10 de Outubro de 2026',
    registrationOpen: true,
    registrationFee: 240.0,
    enrolledAcademyCount: 68,
    categories: ['Pré-Mirim a Master 7', 'Todas as Faixas', 'Gi & No-Gi'],
    description: 'O maior campeonato de Jiu-Jitsu do Brasil. Disputa por equipes e consagração nacional.',
    bannerImage: '/bjj_media/bjj_guard_pass.jpg',
    broadcastCount: 1,
    lastBroadcastAt: '08/09/2026 18:00'
  },
  {
    id: 'tourn_sp_open',
    name: 'São Paulo International Open IBJJF Championship',
    federation: 'IBJJF',
    date: '14 e 15 de Novembro de 2026',
    location: 'Complexo Esportivo do Ibirapuera - Ginásio Mauro Pinheiro',
    city: 'São Paulo',
    state: 'SP',
    registrationDeadline: '02 de Novembro de 2026',
    registrationOpen: true,
    registrationFee: 220.0,
    enrolledAcademyCount: 35,
    categories: ['Juvenil, Adulto e Master', 'Todas as Faixas', 'Com e Sem Kimono'],
    description: 'Tradicional Open da capital paulista reunindo os maiores times do sudeste.',
    bannerImage: '/bjj_media/bjj_triangle.jpg',
    broadcastCount: 0
  },
  {
    id: 'tourn_curitiba_open',
    name: 'Curitiba Spring International Open IBJJF 2026',
    federation: 'IBJJF',
    date: '21 e 22 de Novembro de 2026',
    location: 'Ginásio do Tarumã',
    city: 'Curitiba',
    state: 'PR',
    registrationDeadline: '09 de Novembro de 2026',
    registrationOpen: true,
    registrationFee: 200.0,
    enrolledAcademyCount: 21,
    categories: ['Todas as Divisões de Idade e Peso', 'Branca a Preta'],
    description: 'Etapa oficial no sul do país com grande tradição de atletas de alto nível.',
    bannerImage: '/bjj_media/bjj_scissor_sweep.jpg',
    broadcastCount: 0
  }
];

const BROADCASTS_STORAGE_KEY = 'bjj_academy_tournament_broadcasts';
const BROADCAST_LOGS_STORAGE_KEY = 'bjj_tournament_broadcast_logs';
const ANNOUNCEMENTS_STORAGE_KEY = 'bjj_announcements';

export interface BroadcastExecutionResult {
  success: boolean;
  tournamentName: string;
  totalAcademies: number;
  targetAcademyNames: string[];
  logSummary: string;
  broadcastsCreated: AcademyTournamentBroadcast[];
  timestamp: string;
}

/**
 * Recovers persisted competitions or initializes default mock list
 */
export function getStoredCompetitions(): TournamentItem[] {
  return safeLocalStorageGet<TournamentItem[]>('bjj_competitions_list', INITIAL_COMPETITIONS_LIST);
}

/**
 * Saves competitions list to local persistence
 */
export function saveCompetitions(list: TournamentItem[]): void {
  safeLocalStorageSet('bjj_competitions_list', list);
}

/**
 * Recovers all broadcasts delivered to academies
 */
export function getAllAcademyBroadcasts(): AcademyTournamentBroadcast[] {
  return safeLocalStorageGet<AcademyTournamentBroadcast[]>(BROADCASTS_STORAGE_KEY, []);
}

/**
 * Recovers broadcasts delivered to a specific academy
 */
export function getBroadcastsForAcademy(academyId: string): AcademyTournamentBroadcast[] {
  const all = getAllAcademyBroadcasts();
  return all.filter((b) => b.academyId === academyId);
}

/**
 * Recovers broadcast logs
 */
export function getBroadcastLogs(): TournamentBroadcastLog[] {
  return safeLocalStorageGet<TournamentBroadcastLog[]>(BROADCAST_LOGS_STORAGE_KEY, []);
}

/**
 * Core Bridge Function:
 * Iterates through all registered partner academies, creates individual announcements
 * and replicates the competition communication directly into each academy's inbox.
 */
export function broadcastTournamentToAcademies(
  tournament: TournamentItem,
  academies: RegisteredAcademy[] = mockRegisteredAcademies,
  senderName = 'Administrador BJJ Academy Central'
): BroadcastExecutionResult {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const timestampStr = `${dateFormatted} às ${timeFormatted}`;

  const targetAcademies = academies.length > 0 ? academies : mockRegisteredAcademies;
  const createdBroadcasts: AcademyTournamentBroadcast[] = [];
  const targetNames: string[] = [];

  // Existing announcements
  const existingAnnouncements = safeLocalStorageGet<Announcement[]>(ANNOUNCEMENTS_STORAGE_KEY, []);
  const newAnnouncements: Announcement[] = [];

  // Iterate through all partner academies
  targetAcademies.forEach((academy) => {
    targetNames.push(academy.name);

    const broadcastItem: AcademyTournamentBroadcast = {
      id: `bcast_${tournament.id}_${academy.id}_${Date.now()}`,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      federation: tournament.federation,
      academyId: academy.id,
      academyName: academy.name,
      sentAt: timestampStr,
      status: 'delivered',
      messageTitle: `🥋 CONVOCAÇÃO: ${tournament.name}`,
      messageBody: `Atenção equipe ${academy.shortName || academy.name}! A central do BJJ ACADEMY convoca os atletas para o torneio ${tournament.name} (${tournament.federation}). Local: ${tournament.location} (${tournament.city || ''} - ${tournament.state || ''}). Data do evento: ${tournament.date}. Inscrições abertas até ${tournament.registrationDeadline}. Façam a confirmação da lista de atletas da sua filial!`,
      registrationDeadline: tournament.registrationDeadline,
      location: tournament.location,
      broadcastBy: senderName,
      categories: tournament.categories
    };

    createdBroadcasts.push(broadcastItem);

    // Also replicate as a formal Announcement for this academy's students and teachers
    const announcementItem: Announcement = {
      id: `ann_tourn_${tournament.id}_${academy.id}_${Date.now()}`,
      title: `🏆 Convocação Oficial: ${tournament.name}`,
      date: dateFormatted,
      category: 'Competição',
      content: `Atenção atletas e professores da ${academy.name}! As inscrições para o ${tournament.name} estão confirmadas. Preparem a equipe! Data: ${tournament.date}. Local: ${tournament.location}. Prazo final de inscrição: ${tournament.registrationDeadline}.`,
      author: `${senderName} • Central de Torneios`,
      read: false,
      priority: 'urgent',
      academyId: academy.id,
      tournamentId: tournament.id,
      tournamentData: {
        location: tournament.location,
        registrationDeadline: tournament.registrationDeadline,
        federation: tournament.federation,
        categories: tournament.categories
      }
    };

    newAnnouncements.push(announcementItem);
  });

  // 1. Persist broadcasts list
  const existingBroadcasts = getAllAcademyBroadcasts();
  const updatedBroadcasts = [...createdBroadcasts, ...existingBroadcasts];
  safeLocalStorageSet(BROADCASTS_STORAGE_KEY, updatedBroadcasts);

  // 2. Persist announcements (prepended so they show on top)
  const updatedAnnouncements = [...newAnnouncements, ...existingAnnouncements];
  safeLocalStorageSet(ANNOUNCEMENTS_STORAGE_KEY, updatedAnnouncements);

  // 3. Update broadcast metadata on the tournament itself
  const currentCompetitions = getStoredCompetitions();
  const updatedCompetitions = currentCompetitions.map((t) => {
    if (t.id === tournament.id) {
      return {
        ...t,
        broadcastCount: (t.broadcastCount || 0) + 1,
        lastBroadcastAt: timestampStr
      };
    }
    return t;
  });
  saveCompetitions(updatedCompetitions);

  // 4. Exact Output Log Specification required by user:
  // "Mensagem do evento [Fortaleza Open] enviada com sucesso para todas as X academias cadastradas!"
  const logSummary = `Mensagem do evento [${tournament.name}] enviada com sucesso para todas as ${targetAcademies.length} academias cadastradas!`;

  const logItem: TournamentBroadcastLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    timestamp: timestampStr,
    totalAcademies: targetAcademies.length,
    targetAcademyNames: targetNames,
    status: 'success',
    logSummary
  };

  const existingLogs = getBroadcastLogs();
  safeLocalStorageSet(BROADCAST_LOGS_STORAGE_KEY, [logItem, ...existingLogs]);

  // Console log simulation output
  console.log(`[BJJ ACADEMY MOBILE - DISPARO DE COMPETIÇÕES]`);
  console.log(logSummary);
  console.log(`Academias notificadas (${targetAcademies.length}):`, targetNames.join(', '));
  console.log(`Timestamp: ${timestampStr}`);

  return {
    success: true,
    tournamentName: tournament.name,
    totalAcademies: targetAcademies.length,
    targetAcademyNames: targetNames,
    logSummary,
    broadcastsCreated: createdBroadcasts,
    timestamp: timestampStr
  };
}
