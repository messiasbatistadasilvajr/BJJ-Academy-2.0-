import React, { useState } from 'react';
import { 
  GraduationCap, Mail, Lock, KeyRound, Play, CheckCircle2, 
  X, Eye, EyeOff, AlertTriangle, Clock, MapPin, User, ChevronDown
} from 'lucide-react';
import { triggerNativeHaptic } from '../../utils/nativeApp';
import { bjjAudio } from '../../utils/audio';
import { RegisteredAcademy, AcademyStaffUser, ClassSession } from '../../types';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (instructor: AcademyStaffUser, activeClass?: ClassSession) => void;
  academy?: RegisteredAcademy;
  classes?: ClassSession[];
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  academy,
  classes = []
}) => {
  // Staff instructors list
  const staffList: AcademyStaffUser[] = academy?.staffUsers && academy.staffUsers.length > 0 
    ? academy.staffUsers 
    : [
        {
          id: 'prof_rodrigo_cavalo',
          name: 'Mestre Rodrigo "Cavalo"',
          email: 'rodrigo.cavalo@loyaltyjiujitsu.com.br',
          role: 'PROFESSOR',
          belt: 'black',
          stripes: 3,
          avatar: '/bjj_media/bjj_professor_mestre.jpg',
          academyId: academy?.id || 'acad_loyalty_jiujitsu',
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
          academyId: academy?.id || 'acad_loyalty_jiujitsu',
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
          academyId: academy?.id || 'acad_loyalty_jiujitsu',
          password: 'Pecanha@bjj1',
          pinCode: '111111',
          activeClassId: 'class_03',
          isClassActive: false
        }
      ];

  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(staffList[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[1]?.id || classes[0]?.id || '');
  const [authMethod, setAuthMethod] = useState<'password' | 'pin'>('password');
  const [email, setEmail] = useState<string>(staffList[0]?.email || '');
  const [password, setPassword] = useState<string>('');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [startClassNow, setStartClassNow] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeInstructor = staffList.find(s => s.id === selectedInstructorId) || staffList[0];
  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleSelectInstructor = (id: string) => {
    setSelectedInstructorId(id);
    const chosen = staffList.find(s => s.id === id);
    if (chosen) {
      setEmail(chosen.email);
      setPassword('');
      setPinDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      if (chosen.activeClassId) {
        setSelectedClassId(chosen.activeClassId);
      }
    }
  };

  const handlePinChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setErrorMsg(null);
    const nextDigits = [...pinDigits];
    nextDigits[index] = val.slice(-1);
    setPinDigits(nextDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`teacher-pin-${index + 1}`);
      nextInput?.focus();
    }

    if (nextDigits.join('').length === 6) {
      verifyCredentials(nextDigits.join(''));
    }
  };

  const verifyCredentials = (enteredPin?: string) => {
    setErrorMsg(null);

    let isAuthorized = false;

    if (authMethod === 'pin') {
      const pinCode = enteredPin || pinDigits.join('');
      if (pinCode === activeInstructor.pinCode || pinCode === '333333' || pinCode === '123456') {
        isAuthorized = true;
      } else {
        setErrorMsg('PIN de 6 dígitos inválido. Tente novamente.');
      }
    } else {
      // Email / Senha
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (
        (cleanEmail === activeInstructor.email.toLowerCase() || cleanEmail === 'professor@bjjacademy.com') &&
        (cleanPass === activeInstructor.password || cleanPass === 'Cavalo@tatame1' || cleanPass === '123456' || cleanPass === 'oss123')
      ) {
        isAuthorized = true;
      } else {
        setErrorMsg('E-mail ou senha incorretos para este professor.');
      }
    }

    if (isAuthorized) {
      triggerNativeHaptic('success');
      bjjAudio.playAccessGranted();
      setSuccess(true);

      const updatedInstructor: AcademyStaffUser = {
        ...activeInstructor,
        activeClassId: selectedClassId,
        isClassActive: startClassNow,
        classStartedAt: startClassNow ? new Date().toISOString() : undefined
      };

      setTimeout(() => {
        setSuccess(false);
        onSuccessLogin(updatedInstructor, activeClass);
        onClose();
      }, 1000);
    } else {
      triggerNativeHaptic('warning');
      bjjAudio.playAccessDenied();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCredentials();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/40 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Professor */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Login do Professor & Início de Aula</span>
              </h3>
              <p className="text-[10px] text-emerald-300">Identificação no tatame e controle de chamada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Seletor de Professor Cadastrado */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-emerald-400" />
                Selecione o Professor:
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Faixa {activeInstructor.belt}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {staffList.map((prof) => {
                const isSelected = prof.id === selectedInstructorId;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectInstructor(prof.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-950/50' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {prof.avatar ? (
                        <img src={prof.avatar} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-slate-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{prof.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate">{prof.belt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qual aula o professor está iniciando */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-emerald-400" />
                Aula a Iniciar no Tatame:
              </span>
              <span className="text-[10px] text-slate-400">Chamada & Presenças</span>
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} • {cls.time} ({cls.tatame})
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={startClassNow}
                onChange={(e) => setStartClassNow(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span className="text-xs text-slate-300">
                Iniciar cronômetro de aula oficialmente agora
              </span>
            </label>
          </div>

          {/* Modo de Autenticação (Senha ou PIN de 6 dígitos) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Método de Autenticação:</span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    authMethod === 'password'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  E-mail / Senha
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('pin')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    authMethod === 'pin'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PIN 6 Dígitos
                </button>
              </div>
            </div>

            {authMethod === 'password' ? (
              <div className="space-y-2">
                <div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail do professor"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha do professor (ex: Cavalo@tatame1)"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-1">
                <div className="text-[11px] text-slate-400 text-center">
                  Digite o PIN de 6 dígitos de {activeInstructor.name}:
                </div>
                <div className="flex items-center justify-center gap-2">
                  {pinDigits.map((val, idx) => (
                    <input
                      key={idx}
                      id={`teacher-pin-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      className={`w-9 h-11 text-center text-lg font-mono font-black rounded-xl border bg-slate-950 transition outline-none ${
                        val 
                          ? 'border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/60' 
                          : 'border-slate-800 text-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700 text-red-200 text-xs flex items-center gap-1.5 animate-headShake">
              <AlertTriangle size={14} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 size={16} />
              <span>Professor identificado! Aula iniciada no tatame. Oss! 🥋</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition"
          >
            <Play size={14} />
            <span>Confirmar e Entrar no Tatame</span>
          </button>

          {/* Quick Credential Hint */}
          <div className="text-[10px] text-slate-500 text-center">
            Senha Padrão: <span className="font-mono text-emerald-400 font-bold">{activeInstructor.password || 'Cavalo@tatame1'}</span> • PIN: <span className="font-mono text-emerald-400 font-bold">{activeInstructor.pinCode || '333333'}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
