import React, { useState, useEffect } from 'react';
import { UserRole, StudentProfile, DependentStudent, ClassSession, Invoice, Announcement, ChatMessage, PushNotification, BeltColor, RegisteredAcademy, PlatformGeneralManager } from './types';
import { mockStudent, mockDependents, mockClasses, mockInvoices, mockAnnouncements, mockChatMessages, mockRankings, mockPushNotifications, mockRegisteredAcademies, defaultPlatformGeneralManager } from './data/mockData';
import { DeviceFrame } from './components/common/DeviceFrame';
import { StudentView } from './components/views/StudentView';
import { ParentView } from './components/views/ParentView';
import { TeacherView } from './components/views/TeacherView';
import { ManagerView } from './components/views/ManagerView';
import { BiometricModal } from './components/common/BiometricModal';
import { PixModal } from './components/common/PixModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { CameraModal } from './components/common/CameraModal';
import { PushBanner } from './components/common/PushBanner';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { CapacitorDocsModal } from './components/common/CapacitorDocsModal';
import { ScoreboardModal } from './components/common/ScoreboardModal';
import { TechniquesModal } from './components/common/TechniquesModal';
import { KioskTurnstileModal } from './components/common/KioskTurnstileModal';
import { GraduationExamModal } from './components/common/GraduationExamModal';
import { ProShopModal } from './components/common/ProShopModal';
import { DigitalContractModal } from './components/common/DigitalContractModal';
import { TournamentsModal } from './components/common/TournamentsModal';
import { AcademyVoiceSettingsModal } from './components/common/AcademyVoiceSettingsModal';
import { FinancialHubModal } from './components/common/FinancialHubModal';
import { academyVoiceEngine } from './utils/voiceNotification';
import { useOnlineStatus } from './hooks/usePWAInstall';

export default function App() {
  const isOnline = useOnlineStatus();

  // App State
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [isDesktopView, setIsDesktopView] = useState<boolean>(false);
  const [os, setOs] = useState<'ios' | 'android'>('ios');

  // Domain Data State (Reactive with persistence fallback)
  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('bjj_student');
    return saved ? JSON.parse(saved) : mockStudent;
  });

  const [dependents, setDependents] = useState<DependentStudent[]>(() => {
    const saved = localStorage.getItem('bjj_dependents');
    return saved ? JSON.parse(saved) : mockDependents;
  });

  const [classes, setClasses] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('bjj_classes');
    return saved ? JSON.parse(saved) : mockClasses;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('bjj_invoices');
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [rankings, setRankings] = useState(mockRankings);

  // Modals & Native Simulation States
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraConfig, setCameraConfig] = useState({
    title: 'Foto de Presença no Tatame',
    subtitle: 'Tire sua foto de kimono para o feed do treino',
  });
  const [selectedPixInvoice, setSelectedPixInvoice] = useState<Invoice | null>(null);
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<Invoice | null>(null);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isCapacitorDocsOpen, setIsCapacitorDocsOpen] = useState(false);

  // New modules states (7 tips)
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isTechniquesOpen, setIsTechniquesOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isGraduationOpen, setIsGraduationOpen] = useState(false);
  const [isProShopOpen, setIsProShopOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);

  // Platform General Manager (Messias Batista da Silva junior)
  const [generalManager, setGeneralManager] = useState<PlatformGeneralManager>(() => {
    const saved = localStorage.getItem('bjj_general_manager');
    return saved ? JSON.parse(saved) : defaultPlatformGeneralManager;
  });

  // Registered Academies State (Persisted in localStorage)
  const [academies, setAcademies] = useState<RegisteredAcademy[]>(() => {
    const saved = localStorage.getItem('bjj_academies');
    return saved ? JSON.parse(saved) : mockRegisteredAcademies;
  });
  const [activeAcademyId, setActiveAcademyId] = useState<string>(() => {
    const saved = localStorage.getItem('bjj_active_academy_id');
    return saved || mockRegisteredAcademies[0].id;
  });

  const activeAcademy = academies.find((a) => a.id === activeAcademyId) || academies[0];

  // Dynamic Island & Push Notifications State
  const [activePush, setActivePush] = useState<PushNotification | null>(null);
  const [dynamicIslandNotice, setDynamicIslandNotice] = useState<string | null>(null);

  // Save to localStorage when critical items change
  useEffect(() => {
    localStorage.setItem('bjj_general_manager', JSON.stringify(generalManager));
  }, [generalManager]);

  // Save to localStorage when critical items change
  useEffect(() => {
    localStorage.setItem('bjj_student', JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem('bjj_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('bjj_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('bjj_academies', JSON.stringify(academies));
  }, [academies]);

  useEffect(() => {
    localStorage.setItem('bjj_active_academy_id', activeAcademyId);
  }, [activeAcademyId]);

  // Initial welcoming push notification after 2 seconds with Voice
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPushNotification(
        '🥋 Bem-vindo ao BJJ Academy 2.0!',
        'Seu aplicativo está pronto com PWA, Capacitor e portais para Alunos, Pais, Professores e Gestor.'
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const triggerPushNotification = (title: string, body: string, type: PushNotification['type'] = 'class') => {
    const notif: PushNotification = {
      id: String(Date.now()),
      title,
      body,
      timestamp: 'Agora',
      type,
      read: false,
    };
    setActivePush(notif);
    setDynamicIslandNotice(title);

    // Dispara o jingle e a voz com o nome da academia cadastrada (estilo Mercado Livre)!
    if (activeAcademy && activeAcademy.voiceEnabled) {
      academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
    }

    setTimeout(() => {
      setDynamicIslandNotice(null);
    }, 5000);
  };

  // Student Check-in
  const handleToggleCheckIn = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const nextState = !c.checkedIn;
          if (nextState) {
            triggerPushNotification(
              '🥋 Check-in Confirmado!',
              `Você está confirmado na aula ${c.name} às ${c.time}. OSS!`
            );
            // Increase student attendances
            setStudent((s) => ({
              ...s,
              currentAttendanceCount: Math.min(s.classesForNextDegree, s.currentAttendanceCount + 1),
            }));
          } else {
            triggerPushNotification(
              'Cancelamento de Presença',
              `Check-in para ${c.name} foi cancelado.`
            );
          }
          return {
            ...c,
            checkedIn: nextState,
            enrolledCount: nextState ? c.enrolledCount + 1 : Math.max(0, c.enrolledCount - 1),
          };
        }
        return c;
      })
    );
  };

  // Payment confirmation via PIX Webhook simulation
  const handlePaymentSuccess = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const paidInv: Invoice = {
            ...inv,
            status: 'paid',
            paidDate: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          };
          triggerPushNotification(
            '💰 Mensalidade Liquidada via PIX!',
            `O pagamento de R$ ${inv.amount.toFixed(2)} foi confirmado pelo Asaas com baixa imediata.`,
            'payment'
          );
          return paidInv;
        }
        return inv;
      })
    );
  };

  // Photo of attendance taken
  const handlePhotoTaken = (photoUrl: string) => {
    triggerPushNotification(
      '📸 Foto Registrada no Tatame!',
      'Sua presença fotográfica foi salva no feed da academia com a chancela oficial BJJ Academy.'
    );
  };

  // Teacher marks student attendance
  const handleUpdateAttendance = (classId: string, studentId: string, status: 'present' | 'absent') => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            registeredStudents: c.registeredStudents.map((s) => {
              if (s.id === studentId) {
                return { ...s, status };
              }
              return s;
            }),
          };
        }
        return c;
      })
    );
  };

  // Teacher marks all present
  const handleMarkAllPresent = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          triggerPushNotification(
            '📋 Chamada Concluída!',
            `Todos os alunos da turma ${c.name} foram marcados como presentes.`
          );
          return {
            ...c,
            registeredStudents: c.registeredStudents.map((s) => ({ ...s, status: 'present' })),
          };
        }
        return c;
      })
    );
  };

  // Teacher promotes student
  const handlePromoteStudent = (
    studentId: string,
    studentName: string,
    newBelt: BeltColor,
    newStripes: number,
    note: string
  ) => {
    // Check if it is the main student Lucas
    if (studentId === student.id) {
      setStudent((prev) => ({
        ...prev,
        belt: newBelt,
        stripes: newStripes,
        promotions: [
          {
            id: String(Date.now()),
            belt: newBelt,
            stripes: newStripes,
            date: new Date().toLocaleDateString('pt-BR'),
            instructor: 'Mestre Rodrigo "Cavalo" (3º Grau)',
            notes: note,
          },
          ...prev.promotions,
        ],
      }));
    }

    // Check if it is a dependent
    setDependents((prev) =>
      prev.map((dep) => {
        if (dep.id === studentId) {
          return {
            ...dep,
            belt: newBelt,
            stripes: newStripes,
            promotions: [
              {
                id: String(Date.now()),
                belt: newBelt,
                stripes: newStripes,
                date: new Date().toLocaleDateString('pt-BR'),
                instructor: 'Mestre Rodrigo "Cavalo"',
                notes: note,
              },
              ...dep.promotions,
            ],
          };
        }
        return dep;
      })
    );

    triggerPushNotification(
      `🏆 Graduação Oficial: ${studentName}!`,
      `Parabéns guerreiro! Graduação confirmada para Faixa ${newBelt} (${newStripes}º grau). OSS!`,
      'promotion'
    );
  };

  // Teacher adds student technical note
  const handleAddStudentNote = (studentId: string, studentName: string, note: string) => {
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        registeredStudents: c.registeredStudents.map((s) => {
          if (s.id === studentId) {
            return { ...s, note };
          }
          return s;
        }),
      }))
    );

    triggerPushNotification(
      '⭐ Observação Técnica do Mestre',
      `Nota registrada para ${studentName}: "${note}"`
    );
  };

  // Chat message sending with realistic bot auto-reply
  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      senderId: 'current_user',
      senderName: activeRole === 'student' ? student.name : 'Responsável',
      senderRole: activeRole,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      read: true,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Simulated academy auto-response
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: String(Date.now() + 1),
        senderId: 'teacher_rodrigo',
        senderName: 'Mestre Rodrigo "Cavalo"',
        senderRole: 'teacher',
        text: 'OSS! Mensagem recebida. Nos vemos hoje no tatame!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        read: false,
      };
      setChatMessages((prev) => [...prev, replyMsg]);
      triggerPushNotification(
        '💬 Nova Resposta da Academia',
        'Mestre Rodrigo: "OSS! Mensagem recebida. Nos vemos hoje no tatame!"',
        'message'
      );
    }, 1400);
  };

  // Push broadcast by manager
  const handleSendPushBroadcast = (title: string, body: string, target: 'all' | 'students' | 'parents') => {
    triggerPushNotification(title, `[Para ${target === 'all' ? 'Todos' : target}]: ${body}`);
  };

  return (
    <DeviceFrame
      activeRole={activeRole}
      onSelectRole={(r) => setActiveRole(r)}
      isDesktopView={isDesktopView}
      onToggleDesktopView={() => setIsDesktopView((prev) => !prev)}
      os={os}
      onToggleOs={() => setOs((prev) => (prev === 'ios' ? 'android' : 'ios'))}
      onOpenCapacitorDocs={() => setIsCapacitorDocsOpen(true)}
      onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
      isOnline={isOnline}
      dynamicIslandNotice={dynamicIslandNotice}
      onOpenScoreboard={() => setIsScoreboardOpen(true)}
      onOpenTechniques={() => setIsTechniquesOpen(true)}
      onOpenKiosk={() => setIsKioskOpen(true)}
      onOpenGraduation={() => setIsGraduationOpen(true)}
      onOpenProShop={() => setIsProShopOpen(true)}
      onOpenContract={() => setIsContractOpen(true)}
      onOpenTournaments={() => setIsTournamentsOpen(true)}
      onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      onOpenFinancial={() => setIsFinancialOpen(true)}
      activeAcademyName={activeAcademy.shortName || activeAcademy.name}
    >
      {/* Push Notification Banner with Academy Voice */}
      <PushBanner
        notification={activePush}
        onDismiss={() => setActivePush(null)}
        onOpen={() => setActivePush(null)}
        academyName={activeAcademy.shortName || activeAcademy.name}
        onReplayVoice={() => {
          if (activePush) {
            academyVoiceEngine.announceAcademyMessage(activeAcademy, activePush.title, activePush.body);
          }
        }}
      />

      {/* Role-Based Active View */}
      {activeRole === 'student' && (
        <StudentView
          student={student}
          classes={classes}
          invoices={invoices}
          announcements={announcements}
          chatMessages={chatMessages}
          rankings={rankings}
          onOpenBiometrics={() => setIsBiometricsOpen(true)}
          onOpenCamera={() => {
            setCameraConfig({
              title: 'Selfie de Presença no Tatame',
              subtitle: 'Registre seu treino pago com o carimbo oficial BJJ Academy',
            });
            setIsCameraOpen(true);
          }}
          onOpenPix={(inv) => setSelectedPixInvoice(inv)}
          onOpenReceipt={(inv) => setSelectedReceiptInvoice(inv)}
          onToggleCheckIn={handleToggleCheckIn}
          onSendMessage={handleSendMessage}
          onOpenScoreboard={() => setIsScoreboardOpen(true)}
          onOpenTechniques={() => setIsTechniquesOpen(true)}
          onOpenGraduation={() => setIsGraduationOpen(true)}
          onOpenProShop={() => setIsProShopOpen(true)}
          onOpenContract={() => setIsContractOpen(true)}
          onOpenTournaments={() => setIsTournamentsOpen(true)}
          onOpenFinancial={() => setIsFinancialOpen(true)}
          academyName={activeAcademy.name}
        />
      )}

      {activeRole === 'parent' && (
        <ParentView
          dependents={dependents}
          invoices={invoices}
          announcements={announcements}
          chatMessages={chatMessages}
          onOpenPix={(inv) => setSelectedPixInvoice(inv)}
          onOpenReceipt={(inv) => setSelectedReceiptInvoice(inv)}
          onSendMessage={handleSendMessage}
          onOpenContract={() => setIsContractOpen(true)}
          onOpenProShop={() => setIsProShopOpen(true)}
          onOpenTournaments={() => setIsTournamentsOpen(true)}
        />
      )}

      {activeRole === 'teacher' && (
        <TeacherView
          classes={classes}
          onOpenCamera={(title, subtitle) => {
            setCameraConfig({ title, subtitle });
            setIsCameraOpen(true);
          }}
          onPromoteStudent={handlePromoteStudent}
          onAddStudentNote={handleAddStudentNote}
          onUpdateAttendance={handleUpdateAttendance}
          onMarkAllPresent={handleMarkAllPresent}
          onOpenScoreboard={() => setIsScoreboardOpen(true)}
          onOpenTechniques={() => setIsTechniquesOpen(true)}
          onOpenGraduation={() => setIsGraduationOpen(true)}
        />
      )}

      {activeRole === 'manager' && (
        <ManagerView
          classes={classes}
          invoices={invoices}
          announcements={announcements}
          isDesktopLayout={isDesktopView}
          onToggleDesktopLayout={() => setIsDesktopView((prev) => !prev)}
          onSendPushBroadcast={handleSendPushBroadcast}
          onOpenCapacitorDocs={() => setIsCapacitorDocsOpen(true)}
          onOpenKiosk={() => setIsKioskOpen(true)}
          onOpenProShop={() => setIsProShopOpen(true)}
          onOpenGraduation={() => setIsGraduationOpen(true)}
          onOpenContract={() => setIsContractOpen(true)}
          onOpenTournaments={() => setIsTournamentsOpen(true)}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          onOpenFinancial={() => setIsFinancialOpen(true)}
          activeAcademyName={activeAcademy.shortName || activeAcademy.name}
          activeAcademyId={activeAcademy.id}
          academies={academies}
          generalManager={generalManager}
          onUpdateGeneralManager={setGeneralManager}
        />
      )}

      {/* Global Modals */}
      <BiometricModal
        isOpen={isBiometricsOpen}
        onClose={() => setIsBiometricsOpen(false)}
        onSuccess={() => {
          triggerPushNotification(
            '🔓 Biometria Confirmada',
            'Sua identidade biométrica foi validada com sucesso pelo Face ID.'
          );
        }}
        userName={student.name}
      />

      <PixModal
        isOpen={!!selectedPixInvoice}
        onClose={() => setSelectedPixInvoice(null)}
        invoice={selectedPixInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={!!selectedReceiptInvoice}
        onClose={() => setSelectedReceiptInvoice(null)}
        invoice={selectedReceiptInvoice}
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoTaken={handlePhotoTaken}
        title={cameraConfig.title}
        subtitle={cameraConfig.subtitle}
      />

      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />

      <CapacitorDocsModal
        isOpen={isCapacitorDocsOpen}
        onClose={() => setIsCapacitorDocsOpen(false)}
      />

      {/* 7 Tip Modals */}
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
      />

      <TechniquesModal
        isOpen={isTechniquesOpen}
        onClose={() => setIsTechniquesOpen(false)}
      />

      <KioskTurnstileModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
      />

      <GraduationExamModal
        isOpen={isGraduationOpen}
        onClose={() => setIsGraduationOpen(false)}
      />

      <ProShopModal
        isOpen={isProShopOpen}
        onClose={() => setIsProShopOpen(false)}
        onOpenPix={(amount, title) => {
          setSelectedPixInvoice({
            id: 'pix_shop_' + Date.now(),
            studentId: student.id,
            studentName: student.name,
            title,
            amount,
            dueDate: 'Hoje',
            status: 'pending',
            invoiceNumber: 'SHOP-' + Math.floor(1000 + Math.random() * 9000),
          });
        }}
      />

      <DigitalContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        studentName={activeRole === 'parent' ? dependents[0]?.name : student.name}
      />

      <TournamentsModal
        isOpen={isTournamentsOpen}
        onClose={() => setIsTournamentsOpen(false)}
      />

      {/* Academy Voice Notification Modal (Mercado Livre Style) */}
      <AcademyVoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        academies={academies}
        activeAcademy={activeAcademy}
        onSelectAcademy={(acad) => setActiveAcademyId(acad.id)}
        onUpdateAcademy={(updated) => {
          setAcademies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
        onAddAcademy={(created) => {
          setAcademies((prev) => [created, ...prev]);
          setActiveAcademyId(created.id);
        }}
        onTriggerTestPush={(title, body) => {
          triggerPushNotification(title, body);
        }}
      />

      {/* Financial Hub Modal (Multi-Academy, Late Fees & Interest, RBAC Access) */}
      <FinancialHubModal
        isOpen={isFinancialOpen}
        onClose={() => setIsFinancialOpen(false)}
        academies={academies}
        invoices={invoices}
        activeAcademy={activeAcademy}
        onUpdateInvoices={(updated) => {
          setInvoices(updated);
          localStorage.setItem('bjj_invoices', JSON.stringify(updated));
        }}
        onOpenVoiceNotice={(title, body) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
        }}
        generalManager={generalManager}
        onUpdateGeneralManager={setGeneralManager}
      />
    </DeviceFrame>
  );
}
