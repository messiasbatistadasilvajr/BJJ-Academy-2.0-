import React, { useState } from 'react';
import { 
  X, Cake, Sparkles, Send, CheckCircle2, Phone, 
  Calendar, Volume2, Users, Award, ShieldAlert, Plus,
  MessageSquare, Copy, Check, BellRing
} from 'lucide-react';
import { BirthdayPerson, BeltColor } from '../../types';
import { BeltBadge } from './BeltBadge';
import { 
  sendBirthdayCongratulationsWhatsApp, 
  generateBirthdayMessage 
} from '../../utils/whatsappHelper';

interface BirthdayAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdays: BirthdayPerson[];
  onUpdateBirthdays: (updated: BirthdayPerson[]) => void;
  activeAcademyName: string;
  onAnnounceVoice?: (title: string, body: string) => void;
  onPublishAnnouncement?: (title: string, content: string) => void;
}

export const BirthdayAlertModal: React.FC<BirthdayAlertModalProps> = ({
  isOpen,
  onClose,
  birthdays,
  onUpdateBirthdays,
  activeAcademyName,
  onAnnounceVoice,
  onPublishAnnouncement
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student' | 'kids'>('all');
  const [selectedPersonForPreview, setSelectedPersonForPreview] = useState<BirthdayPerson | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New birthday form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'teacher' | 'kids'>('student');
  const [newDay, setNewDay] = useState<number>(4);
  const [newMonth, setNewMonth] = useState<number>(9);
  const [newPhone, setNewPhone] = useState('');
  const [newBelt, setNewBelt] = useState<BeltColor>('white');

  if (!isOpen) return null;

  // Assume reference date is Sept 4th, 2026
  const currentDay = 4;
  const currentMonth = 9;

  // Helper to test if a person is birthday today
  const isToday = (person: BirthdayPerson) => {
    return person.birthDay === currentDay && person.birthMonth === currentMonth;
  };

  // Helper to test if within next 7 days
  const isThisWeek = (person: BirthdayPerson) => {
    if (person.birthMonth === currentMonth) {
      const diff = person.birthDay - currentDay;
      return diff >= 0 && diff <= 7;
    }
    return false;
  };

  // Helper to test if this month
  const isThisMonth = (person: BirthdayPerson) => {
    return person.birthMonth === currentMonth;
  };

  // Filtered list
  const filteredList = birthdays.filter((person) => {
    // Role filter
    if (roleFilter !== 'all' && person.role !== roleFilter) return false;

    // Tab filter
    if (activeTab === 'today') return isToday(person);
    if (activeTab === 'week') return isThisWeek(person);
    if (activeTab === 'month') return isThisMonth(person);
    return true; // all
  });

  const todayCount = birthdays.filter(isToday).length;
  const weekCount = birthdays.filter(isThisWeek).length;
  const monthCount = birthdays.filter(isThisMonth).length;
  const congratulatedCount = birthdays.filter((b) => b.congratulated).length;

  const handleMarkAsCongratulated = (personId: string, channel: 'whatsapp' | 'mural' | 'tatame') => {
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const updated = birthdays.map((b) => {
      if (b.id === personId) {
        return {
          ...b,
          congratulated: true,
          congratulatedDate: dateFormatted,
          congratulatedChannel: channel
        };
      }
      return b;
    });

    onUpdateBirthdays(updated);
  };

  const handleSendWhatsApp = (person: BirthdayPerson) => {
    sendBirthdayCongratulationsWhatsApp({
      name: person.name,
      phone: person.phone,
      role: person.role,
      academyName: activeAcademyName,
      belt: person.belt
    });
    handleMarkAsCongratulated(person.id, 'whatsapp');
  };

  const handleVoiceSalute = (person: BirthdayPerson) => {
    if (onAnnounceVoice) {
      const roleText = person.role === 'teacher' ? 'ao nosso Mestre e Professor' : person.role === 'kids' ? 'ao nosso pequeno campeão' : 'ao nosso guerreiro';
      onAnnounceVoice(
        `Parabéns pelo Aniversário de ${person.name}`,
        `Atenção família ${activeAcademyName}! Hoje é dia de festa no tatame! Desejamos um feliz aniversário ${roleText} ${person.name}. Muita saúde, paz e evolução no Jiu-Jitsu! OSS!`
      );
      handleMarkAsCongratulated(person.id, 'tatame');
    }
  };

  const handlePublishMural = (person: BirthdayPerson) => {
    if (onPublishAnnouncement) {
      const message = generateBirthdayMessage({
        name: person.name,
        role: person.role,
        academyName: activeAcademyName,
        belt: person.belt
      });
      onPublishAnnouncement(`🎉 Parabéns, ${person.name}! Aniversariante do Tatame`, message);
      handleMarkAsCongratulated(person.id, 'mural');
    }
  };

  const handleCopyMessage = (person: BirthdayPerson) => {
    const text = generateBirthdayMessage({
      name: person.name,
      role: person.role,
      academyName: activeAcademyName,
      belt: person.belt
    });
    navigator.clipboard.writeText(text);
    setCopiedId(person.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPerson: BirthdayPerson = {
      id: `bday_${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      birthDate: `${String(newDay).padStart(2, '0')}/${String(newMonth).padStart(2, '0')}`,
      birthDay: Number(newDay),
      birthMonth: Number(newMonth),
      phone: newPhone.trim() || '(11) 98000-0000',
      avatar: newRole === 'kids' 
        ? 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80'
        : newRole === 'teacher'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      belt: newBelt,
      stripes: 0,
      academyName: activeAcademyName,
      congratulated: false
    };

    onUpdateBirthdays([newPerson, ...birthdays]);
    setIsNewModalOpen(false);
    setNewName('');
    setNewPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Academy Branding */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Cake className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                  Alerta de Aniversariantes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {todayCount} hoje
                </span>
              </div>
              <p className="text-xs text-amber-200/80 flex items-center gap-1 font-medium mt-0.5">
                <span>Mensagens com o nome oficial da:</span>
                <span className="font-bold text-amber-400 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-500/30">
                  {activeAcademyName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Stats Bar */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-slate-950/50 border-b border-slate-800/80">
          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center">
            <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">Hoje</span>
            <span className="text-xl font-black text-white">{todayCount}</span>
            <span className="text-[9px] text-slate-400 block">no tatame</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-sky-400 block uppercase tracking-wider">7 Dias</span>
            <span className="text-xl font-black text-white">{weekCount}</span>
            <span className="text-[9px] text-slate-400 block">esta semana</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">Mês Atual</span>
            <span className="text-xl font-black text-white">{monthCount}</span>
            <span className="text-[9px] text-slate-400 block">em Setembro</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Enviados</span>
            <span className="text-xl font-black text-emerald-400">{congratulatedCount}</span>
            <span className="text-[9px] text-slate-400 block">parabenizados</span>
          </div>
        </div>

        {/* Tabs and Role Filter Controls */}
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Main Period Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Hoje</span>
              {todayCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  activeTab === 'today' ? 'bg-slate-900 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {todayCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('week')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'week'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Esta Semana</span>
              <span className="text-[10px] opacity-80">({weekCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'month'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Mês</span>
              <span className="text-[10px] opacity-80">({monthCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({birthdays.length})
            </button>
          </div>

          {/* Role Filter & Add Button */}
          <div className="flex items-center gap-1.5 ml-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              aria-label="Filtrar por papel"
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Papéis</option>
              <option value="student">Apenas Alunos</option>
              <option value="teacher">Professores / Mestres</option>
              <option value="kids">Alunos Kids</option>
            </select>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition"
              title="Cadastrar Aniversariante"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <Cake className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-300">Nenhum aniversariante encontrado neste filtro.</p>
              <p className="text-xs text-slate-500 mt-1">
                Alterne entre as abas "Esta Semana" ou "Mês" para conferir as próximas datas.
              </p>
            </div>
          ) : (
            filteredList.map((person) => {
              const personIsToday = isToday(person);
              const daysDiff = person.birthDay - currentDay;
              
              let dateLabel = `${person.birthDate}`;
              if (personIsToday) {
                dateLabel = '🎉 HOJE!';
              } else if (person.birthMonth === currentMonth) {
                if (daysDiff === 1) dateLabel = 'Amanhã (05/09)';
                else if (daysDiff > 1 && daysDiff <= 7) dateLabel = `Em ${daysDiff} dias (${person.birthDate})`;
              }

              return (
                <div
                  key={person.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    personIsToday
                      ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-yellow-950/30 border-amber-500/60 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700"
                        />
                        {personIsToday && (
                          <span className="absolute -top-1.5 -right-1.5 text-base select-none">
                            🎂
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white">{person.name}</span>
                          
                          {/* Role Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            person.role === 'teacher'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                              : person.role === 'kids'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                          }`}>
                            {person.role === 'teacher' ? '🥋 Professor' : person.role === 'kids' ? '👶 Kids' : 'Aluno'}
                          </span>

                          {person.belt && (
                            <BeltBadge belt={person.belt} stripes={person.stripes} />
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className={`font-bold flex items-center gap-1 ${
                            personIsToday ? 'text-amber-400 font-black' : 'text-slate-300'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {dateLabel}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Phone className="w-3 h-3" />
                            {person.phone}
                          </span>
                        </div>

                        {/* Status / History */}
                        {person.congratulated ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Parabenizado ({person.congratulatedDate}) via {person.congratulatedChannel || 'WhatsApp'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 font-medium mt-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Felicitação da academia pendente</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:self-center shrink-0 flex-wrap">
                      
                      {/* 1-Click WhatsApp felicitation (Ensuring Academy Name) */}
                      <button
                        onClick={() => handleSendWhatsApp(person)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                          personIsToday
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                            : 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
                        }`}
                        title={`Enviar parabéns oficial da ${activeAcademyName} via WhatsApp`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Preview Message */}
                      <button
                        onClick={() => setSelectedPersonForPreview(person)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Ver mensagem com nome da academia"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Tatame Voice salute */}
                      {onAnnounceVoice && (
                        <button
                          onClick={() => handleVoiceSalute(person)}
                          className="p-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 transition"
                          title={`Anunciar no som oficial da ${activeAcademyName}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Publish in Mural / Push */}
                      {onPublishAnnouncement && (
                        <button
                          onClick={() => handlePublishMural(person)}
                          className="p-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 transition"
                          title="Publicar aviso no Mural da Academia"
                        >
                          <BellRing className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Preview Drawer / Modal */}
        {selectedPersonForPreview && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Texto de Felicitações para {selectedPersonForPreview.name}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                  Nome da Academia Incluído
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyMessage(selectedPersonForPreview)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition"
                >
                  {copiedId === selectedPersonForPreview.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPersonForPreview(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {generateBirthdayMessage({
                name: selectedPersonForPreview.name,
                role: selectedPersonForPreview.role,
                academyName: activeAcademyName,
                belt: selectedPersonForPreview.belt
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>* O nome da academia é sempre inserido no cabeçalho e na assinatura oficial.</span>
              <button
                onClick={() => handleSendWhatsApp(selectedPersonForPreview)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Enviar pelo WhatsApp Agora</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Engajamento & Cultura de Família no Tatame</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Mini Modal to Add Birthday */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Cadastrar Data de Aniversário</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBirthday} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriel Santos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Papel</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="student">Aluno Adulto</option>
                    <option value="teacher">Professor / Mestre</option>
                    <option value="kids">Aluno Kids</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Faixa</label>
                  <select
                    value={newBelt}
                    onChange={(e) => setNewBelt(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="white">Branca</option>
                    <option value="grey">Cinza (Kids)</option>
                    <option value="yellow">Amarela (Kids)</option>
                    <option value="blue">Azul</option>
                    <option value="purple">Roxa</option>
                    <option value="brown">Marrom</option>
                    <option value="black">Preta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dia do Aniversário</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mês</label>
                  <select
                    value={newMonth}
                    onChange={(e) => setNewMonth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>Janeiro</option>
                    <option value={2}>Fevereiro</option>
                    <option value={3}>Março</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Maio</option>
                    <option value={6}>Junho</option>
                    <option value={7}>Julho</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Setembro</option>
                    <option value={10}>Outubro</option>
                    <option value={11}>Novembro</option>
                    <option value={12}>Dezembro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  Salvar Aniversariante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
