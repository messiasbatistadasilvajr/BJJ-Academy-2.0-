import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, Sparkles, Mic, Play, Square, Check, 
  Building2, Plus, BellRing, Settings2, Sliders, Radio, 
  ChevronRight, ArrowRight, Zap, ShieldCheck
} from 'lucide-react';
import { RegisteredAcademy, AcademyVoiceStyle, NotificationFormat, ChimeType } from '../../types';
import { academyVoiceEngine } from '../../utils/voiceNotification';

interface AcademyVoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  academies: RegisteredAcademy[];
  activeAcademy: RegisteredAcademy;
  onSelectAcademy: (academy: RegisteredAcademy) => void;
  onUpdateAcademy: (academy: RegisteredAcademy) => void;
  onAddAcademy: (academy: RegisteredAcademy) => void;
  onTriggerTestPush: (title: string, body: string) => void;
}

export const AcademyVoiceSettingsModal: React.FC<AcademyVoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  academies,
  activeAcademy,
  onSelectAcademy,
  onUpdateAcademy,
  onAddAcademy,
  onTriggerTestPush,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings' | 'academies'>('preview');
  const [showAddForm, setShowAddForm] = useState(false);

  // New academy form state
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newCity, setNewCity] = useState('');

  // Selected test preset
  const [testScenario, setTestScenario] = useState<{
    id: string;
    title: string;
    body: string;
    label: string;
    icon: string;
  }>({
    id: 'checkin',
    label: 'Check-in no Tatame',
    icon: '🥋',
    title: 'Check-in Confirmado!',
    body: 'Presença confirmada no treino das 19h com Mestre Rodrigo. Bom rola!'
  });

  useEffect(() => {
    const unsubscribe = academyVoiceEngine.onStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handlePlayVoicePreview = async (customTitle?: string, customBody?: string) => {
    const title = customTitle || testScenario.title;
    const body = customBody || testScenario.body;
    await academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
  };

  const handleStopVoice = () => {
    academyVoiceEngine.stop();
  };

  const handleSaveAddAcademy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: RegisteredAcademy = {
      id: 'acad_' + Date.now(),
      name: newName.trim(),
      shortName: newShortName.trim() || newName.trim(),
      branch: newBranch.trim() || 'Unidade Principal',
      city: newCity.trim() || 'São Paulo - SP',
      phone: '(11) 99999-0000',
      voiceEnabled: true,
      voiceStyle: 'mercado_livre',
      notificationFormat: 'name_and_title',
      chimeType: 'mercado_livre',
      speechRate: 1.08,
      speechPitch: 1.15,
      customPhrasePrefix: newName.trim() + ' avisa',
      defaultFinePercent: 2.0,
      defaultMonthlyInterestPercent: 1.0,
      pricingPlans: [
        { id: 'plan_m_' + Date.now(), name: 'Plano Mensal Livre', periodMonths: 1, price: 270, monthlyEquivalent: 270, description: 'Acesso total aos treinos da unidade' },
        { id: 'plan_t_' + Date.now(), name: 'Plano Trimestral', periodMonths: 3, price: 720, monthlyEquivalent: 240, description: 'Economia com fidelidade de 3 meses', isPopular: true },
        { id: 'plan_a_' + Date.now(), name: 'Plano Anual Master', periodMonths: 12, price: 2400, monthlyEquivalent: 200, description: 'O melhor custo por treino com kimono incluso' }
      ]
    };

    onAddAcademy(created);
    onSelectAcademy(created);
    setShowAddForm(false);
    setNewName('');
    setNewShortName('');
    setNewBranch('');
    setNewCity('');

    // Pre-listen to new academy
    setTimeout(() => {
      academyVoiceEngine.announceAcademyMessage(
        created,
        'Academia Cadastrada com Sucesso!',
        'A voz oficial da sua nova academia agora está ativa no aplicativo.'
      );
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-academy-voice-settings"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md">
              <Volume2 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base leading-tight">
                  Voz da Academia
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  Estilo Mercado Livre
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Notificações faladas com o nome de cada academia cadastrada
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play size={13} className="fill-current" />
            <span>Ouvir Prévia</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Ajustes de Voz</span>
          </button>

          <button
            onClick={() => setActiveTab('academies')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'academies'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={13} />
            <span>Academias ({academies.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Academy Card Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
                🥋
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Academia Ativa no Dispositivo
                </span>
                <h3 className="font-bold text-white text-sm">
                  {activeAcademy.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeAcademy.branch} • {activeAcademy.city}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('academies')}
              className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1"
            >
              Trocar
              <ChevronRight size={14} />
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Voice Player & Equalizer Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/30 relative overflow-hidden shadow-xl text-center space-y-4">
                {/* Background decorative glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Equalizer or Idle Indicator */}
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {isSpeaking ? (
                    // Live equalizer bars
                    [0.4, 0.9, 0.6, 1.0, 0.7, 0.95, 0.5, 0.85, 0.3].map((height, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(16, height * 44)}px`,
                          animationDuration: `${0.3 + (i % 3) * 0.2}s`,
                        }}
                      />
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>Toque no botão abaixo para escutar a voz da academia</span>
                    </div>
                  )}
                </div>

                {/* What will be spoken preview text */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Locução que o cliente escutará:
                  </span>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs font-bold whitespace-nowrap">
                      [Jingle Melódico] 🎵
                    </span>
                    <p className="text-xs text-white font-medium italic">
                      "{activeAcademy.shortName || activeAcademy.name}! {testScenario.title}"
                    </p>
                  </div>
                </div>

                {/* Big Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isSpeaking ? (
                    <button
                      onClick={() => handlePlayVoicePreview()}
                      className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Ouvir Voz da Academia Agora</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopVoice}
                      className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Parar Áudio</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      // Disparar push real no app com voz
                      onTriggerTestPush(testScenario.title, testScenario.body);
                    }}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                    title="Disparar notificação push real no topo da tela com o som e voz da academia"
                  >
                    <BellRing className="w-4 h-4" />
                    <span className="hidden sm:inline">Disparar Push Real</span>
                  </button>
                </div>
              </div>

              {/* Scenarios Picker */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Testar com Diferentes Tipos de Mensagem:
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'welcome_specific',
                      label: 'Boas-Vindas Academia',
                      icon: '🥋',
                      title: `Oss! Seja bem-vindo à academia ${activeAcademy.name}.`,
                      body: 'Acesso pelo aplicativo do aluno e professor.',
                      isWelcomeSpecific: true
                    },
                    {
                      id: 'welcome_general',
                      label: 'Boas-Vindas BJJACADEMY',
                      icon: '🌐',
                      title: 'Oss! Seja bem-vindo ao BJJACADEMY.',
                      body: 'Acesso pela plataforma geral do sistema.',
                      isWelcomeGeneral: true
                    },
                    {
                      id: 'checkin',
                      label: 'Check-in Tatame',
                      icon: '🥋',
                      title: 'Check-in Confirmado!',
                      body: 'Presença confirmada no treino das 19h. Bom rola!'
                    },
                    {
                      id: 'pix',
                      label: 'Mensalidade PIX',
                      icon: '💰',
                      title: 'PIX Confirmado!',
                      body: 'Sua mensalidade deste mês foi quitada com sucesso.'
                    },
                    {
                      id: 'graduation',
                      label: 'Exame de Faixa',
                      icon: '🏆',
                      title: 'Convocação de Graduação!',
                      body: 'Parabéns guerreiro! Você atingiu as aulas para o exame de faixa.'
                    },
                    {
                      id: 'seminar',
                      label: 'Aviso do Mestre',
                      icon: '📢',
                      title: 'Recado do Mestre Rodrigo!',
                      body: 'Seminário especial de raspagens neste sábado às 10h.'
                    }
                  ].map((sc: any) => {
                    const isSelected = testScenario.id === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setTestScenario(sc);
                          if (sc.isWelcomeSpecific) {
                            academyVoiceEngine.speakWelcomeAnnouncement('PAGINA_ACADEMIA', activeAcademy);
                          } else if (sc.isWelcomeGeneral) {
                            academyVoiceEngine.speakWelcomeAnnouncement('SISTEMA_GERAL', null);
                          } else {
                            handlePlayVoicePreview(sc.title, sc.body);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60 text-white'
                            : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl">{sc.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate">{sc.label}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            "{sc.title}"
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* How it works info card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <strong className="text-slate-200 block">
                    Como funciona o efeito igual ao Mercado Livre?
                  </strong>
                  <p className="leading-relaxed text-[11px]">
                    Assim como o Mercado Livre toca seu jingle característico e fala o nome da marca ao entregar compras, o BJJ Academy toca um chime melódico agradável de tatame e anuncia com voz nativa o <strong>nome exato da sua academia</strong> ("{activeAcademy.shortName}!"), gerando identidade de marca e engajamento imediato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Enable / Disable Master Toggle */}
              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">
                    Notificação por Voz Ativada
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Tocar som e falar nome da academia nas mensagens
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeAcademy.voiceEnabled}
                    onChange={(e) => {
                      onUpdateAcademy({
                        ...activeAcademy,
                        voiceEnabled: e.target.checked
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Notification Format */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Formato da Locução:
                </label>

                <div className="space-y-2">
                  {[
                    {
                      id: 'name_and_title',
                      label: 'Nome da Academia + Título (Padrão Mercado Livre)',
                      example: `"${activeAcademy.shortName}! Check-in Confirmado!"`
                    },
                    {
                      id: 'name_only',
                      label: 'Apenas o Nome da Academia (Jingle Curto)',
                      example: `"${activeAcademy.shortName}!"`
                    },
                    {
                      id: 'full_message',
                      label: 'Nome + Mensagem Completa',
                      example: `"${activeAcademy.name}: Check-in confirmado na turma das 19h."`
                    }
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        onUpdateAcademy({
                          ...activeAcademy,
                          notificationFormat: fmt.id as NotificationFormat
                        });
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        activeAcademy.notificationFormat === fmt.id
                          ? 'bg-amber-500/10 border-amber-500/60 text-white'
                          : 'bg-slate-850/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{fmt.label}</div>
                        <div className="text-[11px] text-amber-400/90 font-medium italic mt-0.5">
                          {fmt.example}
                        </div>
                      </div>
                      {activeAcademy.notificationFormat === fmt.id && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Style Personality */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Estilo da Locução & Personalidade:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'mercado_livre',
                      name: 'Estilo Mercado Livre',
                      desc: 'Voz ágil, amigável e luminosa'
                    },
                    {
                      id: 'tatame_master',
                      name: 'Mestre do Tatame',
                      desc: 'Grave, solene e respeitosa (OSS)'
                    },
                    {
                      id: 'energetic',
                      name: 'Competição & Garra',
                      desc: 'Rápida, enérgica e motivadora'
                    },
                    {
                      id: 'gentle',
                      name: 'Suave & Acolhedora',
                      desc: 'Calma e ideal para kids e família'
                    }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        const updated: RegisteredAcademy = {
                          ...activeAcademy,
                          voiceStyle: style.id as AcademyVoiceStyle
                        };
                        onUpdateAcademy(updated);
                        academyVoiceEngine.announceAcademyMessage(
                          updated,
                          style.name,
                          'Exemplo da voz oficial configurada.'
                        );
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        activeAcademy.voiceStyle === style.id
                          ? 'bg-amber-500/10 border-amber-500/60 text-white'
                          : 'bg-slate-850/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{style.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chime / Jingle Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Jingle de Abertura (Chime de Atenção):
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mercado_livre', name: 'Jingle Melódico 🎵', type: 'mercado_livre' as ChimeType },
                    { id: 'tatame_bell', name: 'Sino Tatame 🔔', type: 'tatame_bell' as ChimeType },
                    { id: 'chime_bright', name: 'Chime Cristal ✨', type: 'chime_bright' as ChimeType },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={async () => {
                        onUpdateAcademy({
                          ...activeAcademy,
                          chimeType: ch.type
                        });
                        await academyVoiceEngine.playChime(ch.type);
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                        activeAcademy.chimeType === ch.type
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Academias Cadastradas no Sistema
                </span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} />
                  <span>Cadastrar Academia</span>
                </button>
              </div>

              {/* Add Academy Form */}
              {showAddForm && (
                <form onSubmit={handleSaveAddAcademy} className="p-4 rounded-2xl bg-slate-850 border border-amber-500/40 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Cadastrar Nova Academia / Filial
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">
                        Nome Oficial da Academia:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Gracie Barra Alphaville"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">
                          Nome Curto para a Voz:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Gracie Barra"
                          value={newShortName}
                          onChange={(e) => setNewShortName(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">
                          Unidade / Bairro:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Alphaville"
                          value={newBranch}
                          onChange={(e) => setNewBranch(e.target.value)}
                          className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">
                        Cidade / Estado:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Barueri - SP"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Salvar e Ativar Voz
                    </button>
                  </div>
                </form>
              )}

              {/* List of Registered Academies */}
              <div className="space-y-2.5">
                {academies.map((acad) => {
                  const isSelected = activeAcademy.id === acad.id;
                  return (
                    <div
                      key={acad.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          🥋
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs truncate">
                              {acad.name}
                            </h4>
                            {isSelected && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                                Ativa
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {acad.branch} • {acad.city}
                          </p>
                          <p className="text-[9px] text-amber-400/80 font-medium truncate mt-0.5">
                            Locução: "{acad.shortName || acad.name}!"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            academyVoiceEngine.announceAcademyMessage(
                              acad,
                              'Demonstração da Voz!',
                              'Essa é a voz cadastrada para esta academia.'
                            );
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                          title="Ouvir voz desta academia"
                        >
                          <Volume2 size={15} />
                        </button>

                        {!isSelected && (
                          <button
                            onClick={() => {
                              onSelectAcademy(acad);
                              academyVoiceEngine.announceAcademyMessage(
                                acad,
                                'Academia Selecionada!',
                                'Bem-vindo ao tatame da ' + acad.name
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition"
                          >
                            Selecionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">
              Voz: <strong>{activeAcademy.shortName}</strong>
            </span>
          </div>

          <button
            onClick={() => handlePlayVoicePreview()}
            className="text-amber-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Testar Fala</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
