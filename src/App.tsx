import React, { useState, useEffect } from 'react';
import { UserRole, StudentProfile, DependentStudent, ClassSession, Invoice, Announcement, ChatMessage, PushNotification, BeltColor, RegisteredAcademy, PlatformGeneralManager, RetentionAlertItem, SparringSession, BirthdayPerson } from './types';
import { mockStudent, mockDependents, mockClasses, mockInvoices, mockAnnouncements, mockChatMessages, mockRankings, mockPushNotifications, mockRegisteredAcademies, defaultPlatformGeneralManager, mockRetentionAlerts, mockSparringSessions, mockBirthdays, mockInitialStudents } from './data/mockData';
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
import { AcademyRegistrationModal } from './components/common/AcademyRegistrationModal';
import { AcademyRegistrationView } from './components/views/AcademyRegistrationView';
import { SaaSSimulatorModal } from './components/common/SaaSSimulatorModal';
import { MySaaSSubscriptionModal } from './components/common/MySaaSSubscriptionModal';
import { PhotoAttendanceModal } from './components/common/PhotoAttendanceModal';
import { AICoachModal } from './components/common/AICoachModal';
import { DataMigrationModal } from './components/common/DataMigrationModal';
import { RetentionRadarModal } from './components/common/RetentionRadarModal';
import { SparringJournalModal } from './components/common/SparringJournalModal';
import { BirthdayAlertModal } from './components/common/BirthdayAlertModal';
import { IBJJFBeltGuideModal } from './components/common/IBJJFBeltGuideModal';
import { StudentManagementModal } from './components/common/StudentManagementModal';
import { CloudDatabaseStatusModal } from './components/common/CloudDatabaseStatusModal';
import { academyVoiceEngine } from './utils/voiceNotification';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { safeLocalStorageGet, safeLocalStorageSet } from './utils/safeStorage';
import { triggerNativeHaptic } from './utils/nativeApp';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import {
  subscribeToStudents,
  saveStudentToFirestore,
  subscribeToAcademies,
  saveAcademyToFirestore,
  subscribeToClasses,
  saveClassToFirestore,
  subscribeToInvoices,
  saveInvoiceToFirestore,
  subscribeToSparringSessions,
  saveSparringSessionToFirestore,
  subscribeToBirthdays,
  saveBirthdayToFirestore,
  seedInitialFirestoreDataIfEmpty
} from './firebase/firestoreService';

export default function App() {
  const isOnline = useOnlineStatus();

  // App State
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [isDesktopView, setIsDesktopView] = useState<boolean>(false);
  const [os, setOs] = useState<'ios' | 'android'>('ios');

  // Domain Data State (Reactive with persistence fallback)
  const [student, setStudent] = useState<StudentProfile>(() => {
    return safeLocalStorageGet<StudentProfile>('bjj_student', mockStudent);
  });

  const [dependents, setDependents] = useState<DependentStudent[]>(() => {
    return safeLocalStorageGet<DependentStudent[]>('bjj_dependents', mockDependents);
  });

  const [classes, setClasses] = useState<ClassSession[]>(() => {
    return safeLocalStorageGet<ClassSession[]>('bjj_classes', mockClasses);
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    return safeLocalStorageGet<Invoice[]>('bjj_invoices', mockInvoices);
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
  const [isAcademyRegistrationOpen, setIsAcademyRegistrationOpen] = useState(false);

  // SaaS Master & AI Tatame Modals
  const [isSaaSSimulatorOpen, setIsSaaSSimulatorOpen] = useState(false);
  const [isMySaaSSubscriptionOpen, setIsMySaaSSubscriptionOpen] = useState(false);
  const [isPhotoAttendanceOpen, setIsPhotoAttendanceOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isDataMigrationOpen, setIsDataMigrationOpen] = useState(false);

  // Improvement #3: Radar Anti-Evasão
  const [isRetentionRadarOpen, setIsRetentionRadarOpen] = useState(false);
  const [retentionAlerts, setRetentionAlerts] = useState<RetentionAlertItem[]>(() => {
    return safeLocalStorageGet<RetentionAlertItem[]>('bjj_retention_alerts', mockRetentionAlerts);
  });

  // Improvement #5: Diário de Rola & Raio-X Técnico
  const [isSparringJournalOpen, setIsSparringJournalOpen] = useState(false);
  const [sparringSessions, setSparringSessions] = useState<SparringSession[]>(() => {
    return safeLocalStorageGet<SparringSession[]>('bjj_sparring_sessions', mockSparringSessions);
  });

  // Birthday Alert System
  const [isBirthdayAlertOpen, setIsBirthdayAlertOpen] = useState(false);
  
  // Official IBJJF Belt Guide Modal
  const [isBeltGuideOpen, setIsBeltGuideOpen] = useState(false);
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>(() => {
    return safeLocalStorageGet<BirthdayPerson[]>('bjj_birthdays', mockBirthdays);
  });

  // Students Roster state (cloud-synced across devices and sessions)
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() => {
    return safeLocalStorageGet<StudentProfile[]>('bjj_students_roster', mockInitialStudents);
  });
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState(false);
  const [isCloudStatusOpen, setIsCloudStatusOpen] = useState(false);

  useEffect(() => {
    safeLocalStorageSet('bjj_birthdays', birthdays);
  }, [birthdays]);

  useEffect(() => {
    safeLocalStorageSet('bjj_students_roster', studentsList);
  }, [studentsList]);

  // Today's birthdays count (reference date Sept 4th)
  const todayBirthdaysCount = birthdays.filter(
    (b) => b.birthDay === 4 && b.birthMonth === 9
  ).length;

  // Platform General Manager (Messias Batista da Silva junior)
  const [generalManager, setGeneralManager] = useState<PlatformGeneralManager>(() => {
    return safeLocalStorageGet<PlatformGeneralManager>('bjj_general_manager', defaultPlatformGeneralManager);
  });

  // Registered Academies State (Persisted in localStorage & Firestore)
  const [academies, setAcademies] = useState<RegisteredAcademy[]>(() => {
    return safeLocalStorageGet<RegisteredAcademy[]>('bjj_academies', mockRegisteredAcademies);
  });
  const [activeAcademyId, setActiveAcademyId] = useState<string>(() => {
    return safeLocalStorageGet<string>('bjj_active_academy_id', mockRegisteredAcademies[0].id);
  });

  const activeAcademy = academies.find((a) => a.id === activeAcademyId) || academies[0];

  // Dynamic Island & Push Notifications State
  const [activePush, setActivePush] = useState<PushNotification | null>(null);
  const [dynamicIslandNotice, setDynamicIslandNotice] = useState<string | null>(null);

  // Real-time Firestore Cloud Synchronization (Multi-User, Multi-Device, Zero Data Loss)
  useEffect(() => {
    // 1. Initial Cloud Seeding (ensures local data is migrated to cloud without loss)
    seedInitialFirestoreDataIfEmpty({
      students: studentsList,
      academies,
      classes,
      invoices,
      sparringSessions,
      birthdays,
    });

    // 2. Real-time listeners
    const unsubStudents = subscribeToStudents((updatedStudents) => {
      if (updatedStudents && updatedStudents.length > 0) {
        setStudentsList(updatedStudents);
        safeLocalStorageSet('bjj_students_roster', updatedStudents);
        // If current active student is in the roster, keep active student profile fresh
        setStudent((curr) => {
          const matched = updatedStudents.find((s) => s.id === curr.id);
          return matched || curr;
        });
        setIsCloudSynced(true);
      }
    });

    const unsubAcademies = subscribeToAcademies((updatedAcademies) => {
      if (updatedAcademies && updatedAcademies.length > 0) {
        setAcademies(updatedAcademies);
        safeLocalStorageSet('bjj_academies', updatedAcademies);
        setIsCloudSynced(true);
      }
    });

    const unsubClasses = subscribeToClasses((updatedClasses) => {
      if (updatedClasses && updatedClasses.length > 0) {
        setClasses(updatedClasses);
        safeLocalStorageSet('bjj_classes', updatedClasses);
        setIsCloudSynced(true);
      }
    });

    const unsubInvoices = subscribeToInvoices((updatedInvoices) => {
      if (updatedInvoices && updatedInvoices.length > 0) {
        setInvoices(updatedInvoices);
        safeLocalStorageSet('bjj_invoices', updatedInvoices);
        setIsCloudSynced(true);
      }
    });

    const unsubSparring = subscribeToSparringSessions((updatedSparring) => {
      if (updatedSparring && updatedSparring.length > 0) {
        setSparringSessions(updatedSparring);
        safeLocalStorageSet('bjj_sparring_sessions', updatedSparring);
        setIsCloudSynced(true);
      }
    });

    const unsubBirthdays = subscribeToBirthdays((updatedBirthdays) => {
      if (updatedBirthdays && updatedBirthdays.length > 0) {
        setBirthdays(updatedBirthdays);
        safeLocalStorageSet('bjj_birthdays', updatedBirthdays);
        setIsCloudSynced(true);
      }
    });

    return () => {
      unsubStudents();
      unsubAcademies();
      unsubClasses();
      unsubInvoices();
      unsubSparring();
      unsubBirthdays();
    };
  }, []);

  // Save to localStorage when critical items change
  useEffect(() => {
    safeLocalStorageSet('bjj_general_manager', generalManager);
  }, [generalManager]);

  // Save to localStorage when critical items change
  useEffect(() => {
    safeLocalStorageSet('bjj_student', student);
  }, [student]);

  useEffect(() => {
    safeLocalStorageSet('bjj_invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    safeLocalStorageSet('bjj_classes', classes);
  }, [classes]);

  useEffect(() => {
    safeLocalStorageSet('bjj_academies', academies);
  }, [academies]);

  useEffect(() => {
    safeLocalStorageSet('bjj_active_academy_id', activeAcademyId);
  }, [activeAcademyId]);

  useEffect(() => {
    safeLocalStorageSet('bjj_retention_alerts', retentionAlerts);
  }, [retentionAlerts]);

  useEffect(() => {
    safeLocalStorageSet('bjj_sparring_sessions', sparringSessions);
  }, [sparringSessions]);

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
    triggerNativeHaptic(type === 'promotion' ? 'success' : 'medium');

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
            // Increase student attendances and sync to Firestore
            setStudent((s) => {
              const updated = {
                ...s,
                currentAttendanceCount: Math.min(s.classesForNextDegree, s.currentAttendanceCount + 1),
              };
              saveStudentToFirestore(updated);
              return updated;
            });
          } else {
            triggerPushNotification(
              'Cancelamento de Presença',
              `Check-in para ${c.name} foi cancelado.`
            );
          }
          const updatedClass: ClassSession = {
            ...c,
            checkedIn: nextState,
            enrolledCount: nextState ? c.enrolledCount + 1 : Math.max(0, c.enrolledCount - 1),
          };
          saveClassToFirestore(updatedClass);
          return updatedClass;
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
          saveInvoiceToFirestore(paidInv);
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
      setStudent((prev) => {
        const updated: StudentProfile = {
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
        };
        saveStudentToFirestore(updated);
        return updated;
      });
    }

    // Check in students roster
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated: StudentProfile = {
            ...s,
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
              ...s.promotions,
            ],
          };
          saveStudentToFirestore(updated);
          return updated;
        }
        return s;
      })
    );

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
    <ErrorBoundary>
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
      onOpenAcademyRegistration={() => setActiveRole('academy_registration')}
      activeAcademyName={activeAcademy.shortName || activeAcademy.name}
      onOpenCloudStatus={() => setIsCloudStatusOpen(true)}
      onOpenStudentManagement={() => setIsStudentManagementOpen(true)}
      studentsCount={studentsList.length}
      isCloudSynced={isCloudSynced}
    >
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="w-full bg-amber-950/90 border-b border-amber-600/50 text-amber-200 px-3 py-1.5 text-[11px] font-bold flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Modo Tatame Offline Ativo • Frequências e dados sincronizados localmente</span>
        </div>
      )}

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
          onOpenSparringJournal={() => setIsSparringJournalOpen(true)}
          onOpenBeltGuide={() => setIsBeltGuideOpen(true)}
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
          onOpenBeltGuide={() => setIsBeltGuideOpen(true)}
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
          onOpenPhotoAttendance={() => setIsPhotoAttendanceOpen(true)}
          onOpenAICoach={() => setIsAICoachOpen(true)}
          onOpenTournaments={() => setIsTournamentsOpen(true)}
          onOpenRetentionRadar={() => setIsRetentionRadarOpen(true)}
          onOpenBirthdayAlert={() => setIsBirthdayAlertOpen(true)}
          onOpenBeltGuide={() => setIsBeltGuideOpen(true)}
          todayBirthdaysCount={todayBirthdaysCount}
          academyName={activeAcademy.shortName || activeAcademy.name}
          onAddClass={(newClass) => {
            setClasses((prev) => [newClass, ...prev]);
            localStorage.setItem('bjj_classes', JSON.stringify([newClass, ...classes]));
            triggerPushNotification(
              '🥋 Nova Aula Criada no Tatame!',
              `${newClass.name} (${newClass.time}) foi adicionada com sucesso.`
            );
          }}
          onSendClassAnnouncement={(title, content, priority) => {
            const created: Announcement = {
              id: `ann_teacher_${Date.now()}`,
              title,
              content,
              date: 'Hoje',
              category: 'Mural do Tatame',
              author: 'Professor do Tatame',
              priority,
              read: false,
            };
            setAnnouncements((prev) => [created, ...prev]);
            triggerPushNotification(`📢 Comunicado do Professor: ${title}`, content);
          }}
          onAddTournamentReminder={(reminder) => {
            const created: Announcement = {
              id: `ann_tourn_${Date.now()}`,
              title: `🏆 Convocação: ${reminder.name} (${reminder.federation})`,
              content: `Data: ${reminder.date} • Inscrições até: ${reminder.registrationDeadline} • Local: ${reminder.location}. Dicas: ${reminder.notes || 'Atenção ao peso e kimono oficial.'}`,
              date: 'Hoje',
              category: 'Competição',
              author: 'Professor do Tatame',
              priority: 'urgent',
              read: false,
            };
            setAnnouncements((prev) => [created, ...prev]);
            triggerPushNotification(`🏆 Convocação Torneio: ${reminder.name}`, `Inscrições até ${reminder.registrationDeadline}`);
          }}
        />
      )}

      {(activeRole === 'manager' || activeRole === 'general_manager') && (
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
          onOpenSaaSSimulator={() => setIsSaaSSimulatorOpen(true)}
          onOpenMySaaSSubscription={() => setIsMySaaSSubscriptionOpen(true)}
          onOpenDataMigration={() => setIsDataMigrationOpen(true)}
          onOpenAICoach={() => setIsAICoachOpen(true)}
          onOpenRetentionRadar={() => setIsRetentionRadarOpen(true)}
          retentionAlertsCount={retentionAlerts.filter((a) => a.contactStatus !== 'resgatado').length}
          onOpenBirthdayAlert={() => setIsBirthdayAlertOpen(true)}
          todayBirthdaysCount={todayBirthdaysCount}
          activeAcademyName={activeAcademy.shortName || activeAcademy.name}
          activeAcademyId={activeAcademy.id}
          academies={academies}
          generalManager={generalManager}
          onUpdateGeneralManager={setGeneralManager}
          onOpenAcademyRegistration={() => setActiveRole('academy_registration')}
          isGeneralManager={activeRole === 'general_manager'}
          onOpenStudentManagement={() => setIsStudentManagementOpen(true)}
          onOpenCloudStatus={() => setIsCloudStatusOpen(true)}
          studentsCount={studentsList.length}
        />
      )}

      {activeRole === 'academy_registration' && (
        <AcademyRegistrationView
          academies={academies}
          activeAcademy={activeAcademy}
          onSelectActiveAcademy={(acad) => {
            setActiveAcademyId(acad.id);
            localStorage.setItem('bjj_active_academy_id', acad.id);
          }}
          onAddAcademy={(created) => {
            setAcademies((prev) => {
              const next = [created, ...prev];
              localStorage.setItem('bjj_academies', JSON.stringify(next));
              return next;
            });
            setActiveAcademyId(created.id);
            localStorage.setItem('bjj_active_academy_id', created.id);
            triggerPushNotification(
              '🏛️ Nova Filial Cadastrada!',
              `${created.name} foi adicionada à rede com sucesso.`
            );
          }}
          onUpdateAcademy={(updated) => {
            setAcademies((prev) => {
              const next = prev.map((a) => (a.id === updated.id ? updated : a));
              localStorage.setItem('bjj_academies', JSON.stringify(next));
              return next;
            });
          }}
          onDeleteAcademy={(id) => {
            setAcademies((prev) => {
              const next = prev.filter((a) => a.id !== id);
              localStorage.setItem('bjj_academies', JSON.stringify(next));
              return next;
            });
          }}
          generalManager={generalManager}
          onOpenVoiceNotice={(title, body) => {
            academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
          }}
          onBackToManager={() => setActiveRole('manager')}
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
            academyId: activeAcademy.id,
            academyName: activeAcademy.shortName || activeAcademy.name,
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
        isGeneralManager={activeRole === 'general_manager'}
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

      {/* Academy Registration & Branch Management Modal */}
      <AcademyRegistrationModal
        isOpen={isAcademyRegistrationOpen}
        onClose={() => setIsAcademyRegistrationOpen(false)}
        academies={academies}
        activeAcademy={activeAcademy}
        onSelectActiveAcademy={(acad) => {
          setActiveAcademyId(acad.id);
          localStorage.setItem('bjj_active_academy_id', acad.id);
        }}
        onAddAcademy={(created) => {
          setAcademies((prev) => {
            const next = [created, ...prev];
            localStorage.setItem('bjj_academies', JSON.stringify(next));
            return next;
          });
          setActiveAcademyId(created.id);
          localStorage.setItem('bjj_active_academy_id', created.id);
          triggerPushNotification(
            '🏛️ Nova Filial Cadastrada!',
            `${created.name} foi adicionada à rede com sucesso.`
          );
        }}
        onUpdateAcademy={(updated) => {
          setAcademies((prev) => {
            const next = prev.map((a) => (a.id === updated.id ? updated : a));
            localStorage.setItem('bjj_academies', JSON.stringify(next));
            return next;
          });
        }}
        onDeleteAcademy={(id) => {
          setAcademies((prev) => {
            const next = prev.filter((a) => a.id !== id);
            localStorage.setItem('bjj_academies', JSON.stringify(next));
            return next;
          });
        }}
        generalManager={generalManager}
        onOpenVoiceNotice={(title, body) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
        }}
      />

      {/* SaaS Simulator Modal */}
      <SaaSSimulatorModal
        isOpen={isSaaSSimulatorOpen}
        onClose={() => setIsSaaSSimulatorOpen(false)}
        initialAcademiesCount={academies.length}
        generalManager={generalManager}
      />

      {/* My SaaS Subscription Modal (Academy Manager view) */}
      <MySaaSSubscriptionModal
        isOpen={isMySaaSSubscriptionOpen}
        onClose={() => setIsMySaaSSubscriptionOpen(false)}
        activeAcademy={activeAcademy}
        generalManager={generalManager}
      />

      {/* Photo Attendance Modal (Gemini Vision AI) */}
      <PhotoAttendanceModal
        isOpen={isPhotoAttendanceOpen}
        onClose={() => setIsPhotoAttendanceOpen(false)}
        currentClass={classes[1] || classes[0]}
        onConfirmAttendance={(presentStudentIds) => {
          const targetClassId = (classes[1] || classes[0])?.id;
          if (!targetClassId) return;
          setClasses((prev) =>
            prev.map((c) => {
              if (c.id === targetClassId) {
                return {
                  ...c,
                  registeredStudents: c.registeredStudents.map((s) => ({
                    ...s,
                    status: presentStudentIds.includes(s.id) ? 'present' : s.status,
                  })),
                };
              }
              return c;
            })
          );
          triggerPushNotification(
            '📸 Chamada por Foto Concluída!',
            `${presentStudentIds.length} atletas identificados via Gemini Vision com presenças computadas.`
          );
        }}
        onAnnounceVoice={(msg) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, 'Chamada Tatame IA', msg);
        }}
      />

      {/* BJJ AI Coach Modal */}
      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        onPublishToAnnouncements={(title, content) => {
          const created: Announcement = {
            id: `ann_coach_${Date.now()}`,
            title,
            content,
            date: 'Hoje',
            category: 'Geral',
            author: 'AI Coach BJJ',
            priority: 'urgent',
            read: false,
          };
          setAnnouncements((prev) => [created, ...prev]);
          triggerPushNotification(
            '🧠 Novo Plano de Aula no Mural!',
            `AI Coach publicou: ${title}`
          );
        }}
        onAnnounceVoice={(msg) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, 'AI Coach BJJ', msg);
        }}
      />

      {/* Data Migration Modal (CSV Import/Export) */}
      <DataMigrationModal
        isOpen={isDataMigrationOpen}
        onClose={() => setIsDataMigrationOpen(false)}
        academyName={activeAcademy.name}
        onImportStudentsSuccess={(count) => {
          triggerPushNotification(
            '📥 Migração em Lote Concluída!',
            `${count} alunos importados com sucesso para o banco de dados da academia.`
          );
        }}
      />

      {/* Improvement #3: Radar Anti-Evasão Modal */}
      <RetentionRadarModal
        isOpen={isRetentionRadarOpen}
        onClose={() => setIsRetentionRadarOpen(false)}
        alerts={retentionAlerts}
        onUpdateAlerts={(updated) => {
          setRetentionAlerts(updated);
          localStorage.setItem('bjj_retention_alerts', JSON.stringify(updated));
        }}
        academies={academies}
        activeAcademyId={activeAcademy.id}
        activeAcademyName={activeAcademy.shortName || activeAcademy.name}
        isGeneralManager={activeRole === 'general_manager'}
        onAnnounceVoice={(title, body) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
        }}
      />

      {/* Improvement #5: Diário de Rola & Raio-X Técnico Modal */}
      <SparringJournalModal
        isOpen={isSparringJournalOpen}
        onClose={() => setIsSparringJournalOpen(false)}
        sessions={sparringSessions}
        onUpdateSessions={(updated) => {
          setSparringSessions(updated);
          localStorage.setItem('bjj_sparring_sessions', JSON.stringify(updated));
        }}
        student={student}
        onAnnounceVoice={(title, body) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
        }}
      />

      {/* 🎂 Birthday Alert & Official Congratulations Modal */}
      <BirthdayAlertModal
        isOpen={isBirthdayAlertOpen}
        onClose={() => setIsBirthdayAlertOpen(false)}
        birthdays={birthdays}
        onUpdateBirthdays={(updated) => {
          setBirthdays(updated);
          localStorage.setItem('bjj_birthdays', JSON.stringify(updated));
        }}
        activeAcademyName={activeAcademy.name}
        onAnnounceVoice={(title, body) => {
          academyVoiceEngine.announceAcademyMessage(activeAcademy, title, body);
        }}
        onPublishAnnouncement={(title, content) => {
          const created: Announcement = {
            id: `ann_bday_${Date.now()}`,
            title,
            content,
            date: 'Hoje',
            category: 'Geral',
            author: activeAcademy.name,
            priority: 'urgent',
            read: false,
          };
          setAnnouncements((prev) => [created, ...prev]);
          triggerPushNotification(
            '🎂 Felicitações no Mural do Tatame!',
            `Anúncio oficial de aniversário publicado: ${title}`
          );
        }}
      />

      {/* 🥋 Official IBJJF / CBJJ Graduation & Belt Guide Modal */}
      <IBJJFBeltGuideModal
        isOpen={isBeltGuideOpen}
        onClose={() => setIsBeltGuideOpen(false)}
      />

      {/* 👥 Cloud Student Management & Multi-User Roster Modal */}
      <StudentManagementModal
        isOpen={isStudentManagementOpen}
        onClose={() => setIsStudentManagementOpen(false)}
        students={studentsList}
        activeStudentId={student.id}
        onSelectStudent={(selected) => {
          setStudent(selected);
          setActiveRole('student');
          triggerPushNotification(
            '👤 Perfil de Aluno Selecionado',
            `Visualizando agora o perfil e tatame de ${selected.name}.`
          );
        }}
        onStudentSaved={(saved) => {
          triggerPushNotification(
            '🥋 Aluno Salvo no Banco Nuvem!',
            `${saved.name} foi sincronizado no Firebase Firestore com sucesso.`
          );
        }}
        academyName={activeAcademy.name}
      />

      {/* ☁️ Cloud Database Architecture & Real-Time Sync Status Modal */}
      <CloudDatabaseStatusModal
        isOpen={isCloudStatusOpen}
        onClose={() => setIsCloudStatusOpen(false)}
        studentsCount={studentsList.length}
        classesCount={classes.length}
        invoicesCount={invoices.length}
        academiesCount={academies.length}
        isCloudSynced={isCloudSynced}
      />
    </DeviceFrame>
    </ErrorBoundary>
  );
}
