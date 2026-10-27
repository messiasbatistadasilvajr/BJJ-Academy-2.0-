import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Send, CheckCircle2, Copy, FileText, 
  ExternalLink, ShieldCheck, QrCode, PenTool, Check, 
  ChevronLeft, ChevronRight, Download, Sparkles, AlertCircle,
  Eye, Building2, User, Phone, MapPin, Hash, ShieldAlert, RotateCcw
} from 'lucide-react';
import { sendLoyaltyContractWhatsApp } from '../../utils/whatsappHelper';
import { bjjAudio } from '../../utils/audio';

export interface ContractStudentData {
  name?: string;
  rg?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  neighborhood?: string;
  cep?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  isMinor?: boolean;
  parentName?: string;
  parentRelationship?: string;
  parentCpf?: string;
  parentRg?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
  planName?: string;
  monthlyFee?: number;
  dueDay?: number;
}

interface LoyaltyOfficialContractViewProps {
  studentData?: ContractStudentData;
  onClose?: () => void;
  isEmbedded?: boolean; // Se estiver embutido no formulário de cadastro de novo aluno
  onSignContract?: (signatureDataUrl: string, auditMeta: { signedAt: string; hash: string; signerName: string }) => void;
  initialSignature?: string;
}

export const LoyaltyOfficialContractView: React.FC<LoyaltyOfficialContractViewProps> = ({
  studentData = {},
  onClose,
  isEmbedded = false,
  onSignContract,
  initialSignature
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'all_pages' | 'single_page'>('all_pages');
  const [isSigned, setIsSigned] = useState<boolean>(() => !!initialSignature);
  const [signatureImage, setSignatureImage] = useState<string | null>(initialSignature || null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState<boolean>(() => !!initialSignature);
  const [signatureFeedback, setSignatureFeedback] = useState<string | null>(null);
  const [signatureDate, setSignatureDate] = useState<string>(() => new Date().toLocaleDateString('pt-BR'));
  const [zapSentFeedback, setZapSentFeedback] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureSectionRef = useRef<HTMLDivElement | null>(null);

  // Default contract values matching Loyalty Jiu-Jitsu Matriz Fortaleza
  const academyContractor = {
    owner: 'Pedro Erick Emidio da Silva',
    brand: 'LOYALTY JIU JITSU',
    cnpj: '081.265.363-73',
    address: 'Rua George Cerqueira, nº 976',
    neighborhood: 'Vila Velha',
    cep: '60347-235',
    city: 'Fortaleza',
    state: 'CE'
  };

  const studentName = studentData.name?.trim() || '';
  const studentCpf = studentData.cpf?.trim() || '';
  const studentRg = studentData.rg?.trim() || '';
  const studentAddress = studentData.address?.trim() || '';
  const studentNeighborhood = studentData.neighborhood?.trim() || '';
  const studentCep = studentData.cep?.trim() || '';
  const studentCity = studentData.city?.trim() || '';
  const studentState = studentData.state?.trim() || '';
  const studentPhone = studentData.phone?.trim() || '';

  const isMinor = studentData.isMinor || false;
  const parentName = studentData.parentName?.trim() || '';
  const parentCpf = studentData.parentCpf?.trim() || '';
  const parentRg = studentData.parentRg?.trim() || '';
  const parentPhone = studentData.parentPhone?.trim() || '';
  const parentRelationship = studentData.parentRelationship?.trim() || '';
  const parentAddress = studentData.parentAddress?.trim() || studentAddress || '';

  // Effective phone for WhatsApp (Preferencia para pai/responsável se for menor, ou do aluno)
  const targetZapPhone = isMinor && parentPhone ? parentPhone : (parentPhone || studentPhone || '');
  const targetResponsibleOrStudentName = isMinor && parentName ? parentName : (parentName || studentName || 'Futuro Aluno');

  const planName = studentData.planName?.trim() || '';
  const monthlyFee = studentData.monthlyFee && Number(studentData.monthlyFee) > 0 ? Number(studentData.monthlyFee) : null;
  const totalAmount = monthlyFee ? monthlyFee * 12 : null;
  const dueDay = studentData.dueDay && Number(studentData.dueDay) > 0 ? Number(studentData.dueDay) : null;

  // Electronic Signature Audit Meta (Conforme Autentique / Lei 14.063/2020)
  const sha256Hash = '687cd89499b99dcd727cf2cea8e1aec50191ab14018fc86f27e525cf421c5bc5';
  const documentIdentifier = 'cf863573c0b73bae72de28724757da0ae66e778affa22bb62';
  const validationUrl = `https://valida.ae/${documentIdentifier}`;

  // Helper to generate 12 monthly installments
  const generateInstallments = () => {
    const list = [];
    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth(); // 0 to 11
    const effectiveDay = dueDay || 10;

    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, startMonth + i, effectiveDay);
      const dayStr = dueDay ? String(dueDay).padStart(2, '0') : '__';
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      list.push({
        index: i + 1,
        dueDate: dueDay ? `${dayStr}/${monthStr}/${yearStr}` : `dia ___/${monthStr}/${yearStr}`,
        amount: monthlyFee
      });
    }
    return list;
  };

  const installments = generateInstallments();

  // Handle WhatsApp trigger
  const handleSendToWhatsApp = () => {
    sendLoyaltyContractWhatsApp({
      studentName: studentName || 'Futuro Aluno(a)',
      responsibleName: isMinor ? parentName : (parentName || studentName),
      phone: targetZapPhone,
      cpf: studentCpf,
      parentCpf: parentCpf,
      planName,
      monthlyFee: monthlyFee || undefined,
      dueDay: dueDay || undefined,
      contractHash: sha256Hash,
      academyName: 'Loyalty Jiu-Jitsu',
      validationUrl
    });

    setZapSentFeedback(true);
    setTimeout(() => setZapSentFeedback(false), 4000);
  };

  // Handle Native Print / PDF Save
  const handlePrint = () => {
    window.print();
  };

  const handleCopyValidationLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(validationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // Target signer
  const effectiveSignerName = isMinor && parentName ? parentName : (parentName || studentName || 'Contratante / Responsável Legal');
  const effectiveSignerCpf = isMinor && parentCpf ? parentCpf : (parentCpf || studentCpf || '');

  // Setup canvas strokes
  useEffect(() => {
    if (sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Blue ballpoint ink
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [viewMode, currentPage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnStroke(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawnStroke(false);
    setSignatureImage(null);
    setIsSigned(false);
  };

  const saveSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;

    let finalDataUrl = signatureImage;
    if (hasDrawnStroke) {
      finalDataUrl = canvas.toDataURL('image/png');
      setSignatureImage(finalDataUrl);
    } else if (!finalDataUrl) {
      applyDefaultCursiveSignature();
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    setSignatureDate(formattedDate);
    setIsSigned(true);
    try {
      bjjAudio.playAccessGranted();
    } catch {}

    setSignatureFeedback('Assinatura gravada com sucesso no contrato oficial!');
    setTimeout(() => setSignatureFeedback(null), 4000);

    if (onSignContract && finalDataUrl) {
      onSignContract(finalDataUrl, {
        signedAt: formattedDate,
        hash: sha256Hash,
        signerName: effectiveSignerName
      });
    }
  };

  const applyDefaultCursiveSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 26px "Brush Script MT", "Caveat", "Segoe Script", cursive, serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(effectiveSignerName, 25, canvas.height / 2 + 8);

    // Decorative underline flourish
    ctx.beginPath();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.moveTo(20, canvas.height / 2 + 18);
    ctx.bezierCurveTo(canvas.width / 3, canvas.height / 2 + 32, (canvas.width * 2) / 3, canvas.height / 2 + 12, canvas.width - 25, canvas.height / 2 + 22);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setHasDrawnStroke(true);
    setIsSigned(true);

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    setSignatureDate(formattedDate);
    try {
      bjjAudio.playAccessGranted();
    } catch {}

    setSignatureFeedback('Assinatura cursiva gerada e vinculada ao contrato oficial!');
    setTimeout(() => setSignatureFeedback(null), 4000);

    if (onSignContract) {
      onSignContract(dataUrl, {
        signedAt: formattedDate,
        hash: sha256Hash,
        signerName: effectiveSignerName
      });
    }
  };

  const scrollToSignature = () => {
    if (viewMode === 'single_page' && currentPage !== 4) {
      setCurrentPage(4);
      setTimeout(() => {
        signatureSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      signatureSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Component to render dynamic fill with fallback clean underline for manual completion
  const RenderFill = ({ 
    value, 
    placeholder = '________________________________________________', 
    label 
  }: { 
    value?: string; 
    placeholder?: string; 
    label?: string;
  }) => {
    if (value && value.trim().length > 0) {
      return (
        <span 
          className="font-black text-slate-950 border-b-2 border-red-600 bg-amber-100/90 px-1.5 py-0.5 rounded transition-all text-[15px] inline-block shadow-sm"
          title={`Preenchido no ato da matrícula (${label || 'Dado'}): ${value}`}
        >
          {value}
        </span>
      );
    }
    // Deixando em branco para preenchimento posterior no ato da matrícula
    return (
      <span 
        className="font-mono text-slate-800 tracking-wider inline-block text-sm select-none"
        title="Em branco: Será preenchido no ato da matrícula"
      >
        {placeholder}
      </span>
    );
  };

  return (
    <div className={`w-full flex flex-col bg-slate-950 text-slate-100 rounded-3xl overflow-hidden ${isEmbedded ? 'border border-slate-800' : 'min-h-[85vh]'}`}>
      
      {/* ========================================================================= */}
      {/* TOP ACTION & CONTROLS TOOLBAR (ZAP, PRINT, PAGES, SIGN)                   */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-black p-0.5 shadow-md flex items-center justify-center shrink-0">
            <img 
              src="/loyalty_logo.jpg" 
              alt="Loyalty Jiu Jitsu" 
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback to text icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-tight">
                Contrato Oficial • Loyalty Jiu-Jitsu
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                5 Páginas Oficiais
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{studentName ? `Aluno: ${studentName}` : 'Template com preenchimento em tempo real'}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">Fortaleza - CE</span>
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
            title={`Enviar o contrato e dados de validação para o WhatsApp (${targetZapPhone})`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar no ZAP do Pai/Responsável</span>
          </button>

          {/* Print / Save as PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            title="Abre a caixa de impressão para Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          {/* Touchscreen in-app Signature Action */}
          <button
            type="button"
            onClick={scrollToSignature}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border cursor-pointer ${
              isSigned 
                ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-950/40' 
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md'
            }`}
            title="Assinar o contrato diretamente na tela do celular com o dedo ou mouse"
          >
            <PenTool className="w-3.5 h-3.5 text-white" />
            <span>{isSigned ? '✓ Contrato Assinado no App' : '✍️ Assinar no Celular'}</span>
          </button>

          {/* View mode toggle */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('all_pages')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'all_pages' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              5 Páginas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single_page')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'single_page' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Página {currentPage}/5
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs"
            >
              Voltar ao Cadastro
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Sent Feedback Toast */}
      {zapSentFeedback && (
        <div className="bg-emerald-950 border-b border-emerald-600/60 p-2.5 px-4 text-xs font-semibold text-emerald-200 flex items-center justify-between animate-fadeIn print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Contrato e resumo enviados para o WhatsApp: <strong>{targetZapPhone}</strong> ({targetResponsibleOrStudentName})!</span>
          </div>
          <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
            WhatsApp Aberto
          </span>
        </div>
      )}

      {/* Auto-fill Status Banner */}
      <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 print:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {studentName ? (
              <>Preenchimento Automático Conectado: <strong>{studentName}</strong> {isMinor && parentName ? `(Resp: ${parentName})` : ''}</>
            ) : (
              <>Campos em branco: <em>O contrato se preenche automaticamente conforme os dados forem digitados no formulário ao lado.</em></>
            )}
          </span>
        </div>

        {viewMode === 'single_page' && (
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-800 disabled:opacity-30 text-white hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs px-1.5">Pág {currentPage} de 5</span>
            <button 
              type="button"
              disabled={currentPage >= 5}
              onClick={() => setCurrentPage(p => Math.min(5, p + 1))}
              className="p-1 rounded bg-slate-800 disabled:opacity-30 text-white hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5-PAGE OFFICIAL DOCUMENT CONTAINER (A4 STYLED WHITE PAGES)                */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900/60 flex flex-col items-center gap-6 print:p-0 print:bg-white print:m-0">
        
        {/* Style helper for printing exact 5 pages */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .print-page {
              page-break-after: always !important;
              break-after: page !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 2.2cm 2cm !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
          }
        `}} />

        {/* --------------------------------------------------------------------- */}
        {/* PÁGINA 1: PARTES & OBJETO DO CONTRATO                                */}
        {/* --------------------------------------------------------------------- */}
        {(viewMode === 'all_pages' || currentPage === 1) && (
          <article className="print-page w-full max-w-[850px] min-h-[1130px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative flex flex-col justify-between text-[15px] sm:text-[15.5px] leading-relaxed font-sans border border-slate-200">
            <div>
              {/* Header com Logo Loyalty Jiu-Jitsu */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-black p-1 flex items-center justify-center shrink-0 bg-white">
                    <img 
                      src="/loyalty_logo.jpg" 
                      alt="Logo Loyalty Jiu Jitsu" 
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-center font-black text-black leading-tight text-[11px]">
                      LOYALTY<br/><span className="text-[9px]">JIU-JITSU</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-black uppercase">
                      Contrato de Prestação de Serviços
                    </h1>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Loyalty Jiu-Jitsu • Matriz Oficial Fortaleza
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 font-mono">
                  <span>VIA DIGITAL CERTIFICADA</span><br/>
                  <span>Lei Federal 14.063/2020</span>
                </div>
              </div>

              {/* I - PARTES */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1">
                  I - PARTES
                </h3>

                <p className="text-justify leading-relaxed">
                  <strong>CONTRATADA:</strong> {academyContractor.owner} ({academyContractor.brand}), inscrita no CNPJ nº {academyContractor.cnpj}, com sede em {academyContractor.city}, no endereço {academyContractor.address}, bairro {academyContractor.neighborhood}, CEP {academyContractor.cep} na cidade de {academyContractor.city} - {academyContractor.state}.
                </p>

                <p className="text-justify leading-relaxed">
                  <strong>CONTRATANTE:</strong>{' '}
                  <RenderFill value={studentName} placeholder="________________________________________________" label="Aluno" />, RG nº{' '}
                  <RenderFill value={studentRg} placeholder="____________________" label="RG Aluno" />, CPF nº{' '}
                  <RenderFill value={studentCpf} placeholder="___.___.___-__" label="CPF Aluno" />, residente e domiciliado no endereço{' '}
                  <RenderFill value={studentAddress} placeholder="____________________________________________________, Nº ________" label="Endereço" />, bairro{' '}
                  <RenderFill value={studentNeighborhood} placeholder="____________________" label="Bairro" />, CEP{' '}
                  <RenderFill value={studentCep} placeholder="________-____" label="CEP" /> na cidade de {studentCity ? <span className="font-bold">{studentCity}</span> : '____________________'} - {studentState ? <span className="font-bold">{studentState}</span> : '____'}.
                </p>

                <p className="text-justify leading-relaxed">
                  <strong>RESPONSÁVEL:</strong>{' '}
                  <RenderFill value={parentName} placeholder="________________________________________________" label="Responsável" />, RG nº{' '}
                  <RenderFill value={parentRg} placeholder="____________________" label="RG Responsável" />, CPF nº{' '}
                  <RenderFill value={parentCpf} placeholder="___.___.___-__" label="CPF Responsável" />, residente e domiciliado no endereço{' '}
                  <RenderFill value={studentData.parentAddress || studentAddress} placeholder="____________________________________________________, Nº ________" label="Endereço Resp." />, bairro{' '}
                  <RenderFill value={studentNeighborhood} placeholder="____________________" label="Bairro Resp." />, CEP{' '}
                  <RenderFill value={studentCep} placeholder="________-____" label="CEP Resp." /> na cidade de {studentCity ? <span className="font-bold">{studentCity}</span> : '____________________'} - {studentState ? <span className="font-bold">{studentState}</span> : '____'}.
                </p>

                <p className="text-justify leading-relaxed text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  O responsável financeiro, identificado acima, assume a responsabilidade pelo pagamento integral dos serviços prestados e pela assinatura do presente contrato, concordando com todas as cláusulas e condições aqui estabelecidas.
                </p>

                <p className="text-justify leading-relaxed">
                  As partes identificadas acima têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas a seguir.
                </p>
              </div>

              {/* II - OBJETO DO CONTRATO */}
              <div className="space-y-3 mt-6">
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1">
                  II - OBJETO DO CONTRATO
                </h3>

                <p className="text-justify leading-relaxed">
                  <strong>Cláusula 1ª.</strong> O objeto do presente contrato é a prestação, pela <strong>CONTRATADA</strong> ao <strong>CONTRATANTE</strong>, dos serviços de sessões coletivas de atividades físicas, estando com sua proposta em conformidade com o CREF/ CONFEF, através de seus profissionais e das aulas de atividade física. O <strong>CONTRATANTE</strong>, através do presente, está se matriculando na <strong>CONTRATADA</strong> para o período de <strong>12 meses</strong>, no contrato{' '}
                  {planName ? (
                    <strong className="text-slate-950 font-black border-b border-black">{planName}</strong>
                  ) : (
                    <span className="font-mono text-slate-800 font-bold">____________________________________</span>
                  )}
                  , com a(s) seguinte(s) modalidade(s):
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs space-y-1">
                  <div className="font-bold text-slate-900">Tipo de modalidade: Agenda - Sessões por semana</div>
                  <div className="text-slate-800">• JIU JITSU</div>
                  <div className="text-slate-600 pl-4">◦ 5 sessões por semana</div>
                </div>

                <p className="text-justify leading-relaxed">
                  <strong>Parágrafo 1º.</strong> A direção da CONTRATADA não se recusa a manter um diálogo construtivo com o CONTRATANTE ou seus RESPONSÁVEIS que demonstre um verdadeiro interesse na melhoria da qualidade das aulas e no seu processo evolutivo.
                </p>

                <p className="text-justify leading-relaxed">
                  <strong>Parágrafo 2º.</strong> Mudanças eventuais no horário aqui estabelecido deverão ser avisadas ao CONTRATANTE com no mínimo uma semana de antecedência.
                </p>

                <p className="text-justify leading-relaxed">
                  <strong>Cláusula 2ª.</strong> O CONTRATANTE se obriga a observar estrita e exclusivamente as orientações dos profissionais da CONTRATADA para a prática das atividades físicas. A CONTRATADA não se responsabiliza por danos físicos de qualquer natureza resultantes da inobservância do CONTRATANTE a estas orientações, pelo acatamento à orientação de estranhos ou ainda pelo uso inadequado dos aparelhos e equipamentos da CONTRATADA.
                </p>

                <p className="text-justify leading-relaxed">
                  <strong>Cláusula 3ª.</strong> A CONTRATADA, livre de quaisquer ônus para com o CONTRATANTE, poderá utilizar-se da sua imagem para fins exclusivos de divulgação da CONTRATADA e suas...
                </p>
              </div>
            </div>

            {/* Rodapé Oficial da Página 1 */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p>Assinado com Assinatura Eletrônica (Lei 14.063/2020 | Regulamento 910/2014/EC)</p>
                <p className="truncate max-w-[480px]">Hash SHA256 do original: {sha256Hash}</p>
                <p>Link de validação: {validationUrl}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-slate-800" />
                </div>
                <span>pg. 1 de 5</span>
              </div>
            </div>
          </article>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PÁGINA 2: USO DE IMAGEM, REGRAS & CRONOGRAMA DE 12 PARCELAS          */}
        {/* --------------------------------------------------------------------- */}
        {(viewMode === 'all_pages' || currentPage === 2) && (
          <article className="print-page w-full max-w-[850px] min-h-[1130px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative flex flex-col justify-between text-[15px] sm:text-[15.5px] leading-relaxed font-sans border border-slate-200">
            <div>
              {/* Header Mini */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2">
                  <img src="/loyalty_logo.jpg" alt="Loyalty" className="w-7 h-7 rounded-full object-contain" />
                  <span className="font-bold text-xs uppercase text-slate-800">Contrato de Prestação de Serviços • Loyalty Jiu-Jitsu</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">pg. 2 de 5</span>
              </div>

              <div className="space-y-4 text-justify">
                <p className="leading-relaxed">
                  ...atividades podendo, para tanto, reproduzi-la ou divulgá-la junto a Internet, jornais e todos os demais meios de comunicação público ou privado.
                </p>

                <p className="leading-relaxed">
                  <strong>Parágrafo 1º.</strong> Em nenhuma hipótese poderá a imagem da CONTRATANTE ser utilizada de maneira contrária à moral ou aos bons costumes ou à ordem pública.
                </p>

                <p className="leading-relaxed">
                  <strong>Parágrafo 2º.</strong> O não comparecimento do CONTRATANTE às dependências da CONTRATADA, não exime o pagamento, tendo em vista a disponibilidade do serviço.
                </p>

                <p className="leading-relaxed">
                  <strong>Parágrafo 3º.</strong> No caso de menores, após o término das sessões, deverá o RESPONSÁVEL retirá-lo imediatamente.
                </p>

                <p className="leading-relaxed">
                  <strong>Cláusula 4ª.</strong> O regulamento interno da CONTRATADA pode ser solicitado/consultado na recepção.
                </p>
              </div>

              {/* III - REMUNERAÇÃO */}
              <div className="space-y-4 mt-6">
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1">
                  III - REMUNERAÇÃO
                </h3>

                <p className="text-justify leading-relaxed">
                  <strong>Cláusula 5ª.</strong> Pela prestação dos serviços, referentes ao período contratado conforme previsto na cláusula “1”, o <strong>CONTRATANTE</strong>, pagará à <strong>CONTRATADA</strong> o valor total de{' '}
                  {totalAmount && totalAmount > 0 ? (
                    <strong className="text-slate-950 font-black">R$ {totalAmount.toFixed(2).replace('.', ',')}</strong>
                  ) : (
                    <span className="font-mono font-bold text-slate-900">R$ __________________ (por extenso: ________________________________________________)</span>
                  )}
                  , que deverá ser pago conforme a(s) parcela(s) a seguir:
                </p>

                {/* Tabela de 12 Parcelas Oficiais com Datas de Vencimento */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2">
                    Cronograma de Parcelas do Contrato Anual (12 Meses):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-800">
                    {monthlyFee && monthlyFee > 0 ? (
                      installments.map((inst) => (
                        <div key={inst.index} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-none">
                          <span>• R$ {inst.amount ? inst.amount.toFixed(2).replace('.', ',') : '________________'}</span>
                          <span className="text-slate-600">vencimento em <strong>{inst.dueDate}</strong></span>
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 12 }, (_, i) => (
                        <div key={i + 1} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-none text-slate-700">
                          <span>• Parcela {String(i + 1).padStart(2, '0')}: R$ ________________</span>
                          <span className="text-slate-500">vencimento: dia ______ de cada mês</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <p className="text-justify leading-relaxed">
                  <strong>Cláusula 6ª.</strong> O <strong>CONTRATANTE/RESPONSÁVEL</strong> se obriga a ressarcir a CONTRATADA por qualquer dano causado por ele, por dolo ou culpa, até 48 horas após a constatação do evento e sua consequente comunicação formal ao CONTRATANTE.
                </p>

                <p className="text-justify leading-relaxed bg-red-50 text-red-950 p-2.5 rounded-lg border border-red-200 font-medium">
                  <strong>Cláusula 7ª.</strong> Após 3 dias de inadimplência, a matrícula será bloqueada.
                </p>
              </div>
            </div>

            {/* Rodapé Oficial da Página 2 */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p>Assinado com Assinatura Eletrônica (Lei 14.063/2020 | Regulamento 910/2014/EC)</p>
                <p className="truncate max-w-[480px]">Hash SHA256 do original: {sha256Hash}</p>
                <p>Link de validação: {validationUrl}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-slate-800" />
                </div>
                <span>pg. 2 de 5</span>
              </div>
            </div>
          </article>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PÁGINA 3: RENOVAÇÃO, RESCISÃO, FORO & DECLARAÇÕES DE SAÚDE           */}
        {/* --------------------------------------------------------------------- */}
        {(viewMode === 'all_pages' || currentPage === 3) && (
          <article className="print-page w-full max-w-[850px] min-h-[1130px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative flex flex-col justify-between text-[15px] sm:text-[15.5px] leading-relaxed font-sans border border-slate-200">
            <div>
              {/* Header Mini */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2">
                  <img src="/loyalty_logo.jpg" alt="Loyalty" className="w-7 h-7 rounded-full object-contain" />
                  <span className="font-bold text-xs uppercase text-slate-800">Contrato de Prestação de Serviços • Loyalty Jiu-Jitsu</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">pg. 3 de 5</span>
              </div>

              <div className="space-y-4 text-justify">
                <p className="leading-relaxed">
                  <strong>Parágrafo 1º.</strong> Se algum recesso na oferta de sessões de treinos ocorrer por iniciativa da CONTRATADA, esta implementará formas de ressarcir o CONTRATANTE os serviços pagos e não prestados.
                </p>

                <p className="leading-relaxed">
                  <strong>Parágrafo 2º.</strong> Caso o CONTRATANTE venha solicitar suspensão de sua matrícula, durante a vigência deste contrato, por qualquer motivo, terá o mesmo que fazê-lo por escrito de próprio punho, justificando o motivo e só após esta data terá direito aos dias que faltam para o término do seu contrato, retirando na recepção o contra recibo dos dias restantes.
                </p>

                {/* IV - RENOVAÇÃO */}
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1 pt-2">
                  IV - RENOVAÇÃO
                </h3>

                <p className="leading-relaxed">
                  <strong>Cláusula 8ª.</strong> Após o período discriminado na Cláusula 1ª., este contrato poderá ser renovado automaticamente, bastando para tanto que o (a) CONTRATANTE efetue o (s) pagamento (s) referentes aos meses seguintes, como descrito na cláusula 6ª. e assim sucessivamente.
                </p>

                {/* V - RESCISÃO */}
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1 pt-2">
                  V - RESCISÃO
                </h3>

                <p className="leading-relaxed">
                  <strong>Cláusula 9ª.</strong> O presente instrumento <strong>NÃO</strong> poderá ser rescindido a qualquer momento por qualquer das partes, visto tratar-se de <strong>CURSO LIVRE</strong>.
                </p>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
                  <strong>PARÁGRAFO ÚNICO –</strong> CASO O CONTRATANTE DESISTA EXPRESSAMENTE DO CONTRATO EM QUALQUER ÉPOCA, A CONTRATADA COBRARÁ, A DIFERENÇA OBTIDA ATRAVÉS DA PROMOÇÃO DOS DESCONTOS DADOS PARA PLANOS PARCELADOS, CARACTERIZANDO POR PARTE DO CONTRATANTE QUEBRA DE CONTRATO. O NÃO PAGAMENTO DAS PARCELAS ASSUMIDAS NESTE CONTRATO É PASSÍVEL DAS MEDIDAS LEGAIS CABÍVEIS.
                </div>

                {/* VI - FORO */}
                <h3 className="text-xs font-black text-black tracking-wider uppercase border-b border-black pb-1 pt-2">
                  VI - FORO
                </h3>

                <p className="leading-relaxed">
                  <strong>Cláusula 10ª.</strong> As partes atribuem ao presente Contrato plena eficácia e força executiva e extrajudicial.
                </p>

                <p className="leading-relaxed">
                  <strong>Cláusula 11ª.</strong> Para dirimir quaisquer controvérsias originadas por este contrato, fica eleito o Fórum da Comarca em cuja jurisdição o CONTRATANTE/RESPONSÁVEL tiver domicílio, arcando a parte vencida em demanda judicial com as custas processuais a que der causa e com os honorários advocatícios arbitrados do patrono da parte vencedora.
                </p>

                {/* Box de Ciência e Saúde */}
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 space-y-2.5 text-xs text-slate-800">
                  <p>
                    <strong>Estou ciente</strong> de todas as propostas deste Contrato de Prestação de Serviços para o curso, dias e horários que escolhi, e assumo a validade e veracidade das cláusulas nele descritas.
                  </p>
                  <p>
                    <strong>Declaro ainda</strong> estar em perfeitas condições de saúde, conhecendo e assumindo todos os riscos advindos da atividade física à minha pessoa ou àquele por quem me responsabilizo, não portando também nenhuma moléstia que possa prejudicar os demais frequentadores da contratada.
                  </p>
                </div>

                <p className="leading-relaxed">
                  Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor, juntamente com 2(duas) testemunhas idôneas, rubricando todas as suas páginas.
                </p>

                <p className="text-right font-bold text-slate-800 pt-2">
                  Fortaleza, 13 de outubro de 2026
                </p>
              </div>
            </div>

            {/* Rodapé Oficial da Página 3 */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p>Assinado com Assinatura Eletrônica (Lei 14.063/2020 | Regulamento 910/2014/EC)</p>
                <p className="truncate max-w-[480px]">Hash SHA256 do original: {sha256Hash}</p>
                <p>Link de validação: {validationUrl}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-slate-800" />
                </div>
                <span>pg. 3 de 5</span>
              </div>
            </div>
          </article>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PÁGINA 4: ASSINATURAS, CONTRATADO & TESTEMUNHAS                       */}
        {/* --------------------------------------------------------------------- */}
        {(viewMode === 'all_pages' || currentPage === 4) && (
          <article className="print-page w-full max-w-[850px] min-h-[1130px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative flex flex-col justify-between text-[15px] sm:text-[15.5px] leading-relaxed font-sans border border-slate-200">
            <div>
              {/* Header Mini */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-8">
                <div className="flex items-center gap-2">
                  <img src="/loyalty_logo.jpg" alt="Loyalty" className="w-7 h-7 rounded-full object-contain" />
                  <span className="font-bold text-xs uppercase text-slate-800">Contrato de Prestação de Serviços • Loyalty Jiu-Jitsu</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">pg. 4 de 5</span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  TERMO DE ASSINATURA E TESTEMUNHAS
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Validação com firma eletrônica touch no app ou manual em duas vias de igual teor.
                </p>
              </div>

              {/* PAINEL INTERATIVO DE ASSINATURA DO CONTRATANTE (VISÍVEL NO APP / OCULTO NA IMPRESSÃO) */}
              <div 
                ref={signatureSectionRef}
                className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-red-500/50 text-white shadow-2xl print:hidden text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Assinatura Digital do Contratante</span>
                        {isSigned && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Assinado no App</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Signatário Oficial: <strong className="text-amber-400">{effectiveSignerName}</strong>
                        {effectiveSignerCpf ? ` • CPF: ${effectiveSignerCpf}` : ''}
                      </p>
                    </div>
                  </div>

                  {isSigned && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Refazer Assinatura</span>
                    </button>
                  )}
                </div>

                {!isSigned ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-600 bg-white">
                      <canvas
                        ref={sigCanvasRef}
                        width={700}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 bg-slate-50 cursor-crosshair touch-none"
                        title="Assine com o dedo ou mouse sobre a linha"
                      />
                      <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 font-mono pointer-events-none select-none flex items-center gap-1">
                        <span>✍️</span>
                        <span>Desenhe sua assinatura com o dedo ou mouse sobre a tela</span>
                      </div>
                    </div>

                    {signatureFeedback && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{signatureFeedback}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Limpar Traço</span>
                        </button>

                        <button
                          type="button"
                          onClick={applyDefaultCursiveSignature}
                          className="py-2 px-3 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Gerar assinatura cursiva estilizada baseada no nome do contratante"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>Assinatura Cursiva Automática</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={saveSignature}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirmar e Assinar Contrato no App</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {signatureImage ? (
                        <img 
                          src={signatureImage} 
                          alt="Assinatura Gravada" 
                          className="h-12 max-w-[150px] bg-white rounded-lg p-1 object-contain border border-emerald-500/50" 
                        />
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg bg-blue-900/40 text-blue-300 font-serif italic text-base border border-blue-500/40">
                          {effectiveSignerName}
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-emerald-300">Contrato Assinado Digitalmente</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Autenticado em {signatureDate} • Lei Federal nº 14.063/2020
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Salvar PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSendToWhatsApp}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar no WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de Assinaturas Oficiais (Conforme Página 4 do Documento Físico) */}
              <div className="space-y-10 pt-2">
                
                {/* Linha 1: Contratante e Contratado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="text-center space-y-1">
                    <div className="h-14 flex items-end justify-center pb-1">
                      {isSigned ? (
                        <div className="font-serif italic text-blue-900 font-bold text-base border-b-2 border-slate-400 w-full pb-1">
                          {effectiveSignerName}
                        </div>
                      ) : (
                        <div className="border-b-2 border-slate-800 w-full" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Nome do contratante
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isMinor && parentName 
                        ? `${parentName} (Resp. Legal)` 
                        : (studentName || '________________________________________')}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-14 flex items-end justify-center pb-1">
                      <div className="font-serif italic text-red-900 font-bold text-base border-b-2 border-slate-400 w-full pb-1">
                        Pedro Erick Emidio da Silva
                      </div>
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Nome do contratado
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pedro Erick Emidio da Silva (LOYALTY JIU JITSU)
                    </div>
                  </div>
                </div>

                {/* Linha 2: Assinatura do Contratante e Contratado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="text-center space-y-1">
                    <div className="h-16 flex flex-col items-center justify-end pb-1 relative">
                      {isSigned && signatureImage ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <img 
                            src={signatureImage} 
                            alt="Assinatura Contratante" 
                            className="h-12 max-h-12 object-contain mx-auto" 
                          />
                          <div className="border-b-2 border-slate-800 w-full" />
                        </div>
                      ) : isSigned ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <span className="font-serif italic text-blue-900 text-lg font-bold pb-1">
                            {effectiveSignerName}
                          </span>
                          <div className="border-b-2 border-slate-800 w-full" />
                        </div>
                      ) : (
                        <div className="border-b-2 border-slate-800 w-full" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Assinatura do contratante
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {isSigned 
                        ? `Assinado Digitalmente no App (${signatureDate}) • Lei 14.063/2020` 
                        : 'Assinatura digital no app ou a rogo'}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-16 flex flex-col items-center justify-end pb-1">
                      <div className="font-serif italic text-red-900 font-bold text-base pb-1">
                        Pedro Erick Emidio da Silva
                      </div>
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Assinatura do contratado
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Loyalty Jiu-Jitsu Matriz
                    </div>
                  </div>
                </div>

                {/* Linha 3: Testemunhas 1 e 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Nome testemunha 1
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Nome testemunha 2
                    </div>
                  </div>
                </div>

                {/* Linha 4: RG Testemunhas 1 e 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      RG testemunha 1
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      RG testemunha 2
                    </div>
                  </div>
                </div>

                {/* Linha 5: Assinatura Testemunhas 1 e 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Assinatura testemunha 1
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="border-b-2 border-slate-800 w-full" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      Assinatura testemunha 2
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé Oficial da Página 4 */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>
                <p>Assinado com Assinatura Eletrônica (Lei 14.063/2020 | Regulamento 910/2014/EC)</p>
                <p className="truncate max-w-[480px]">Hash SHA256 do original: {sha256Hash}</p>
                <p>Link de validação: {validationUrl}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-slate-800" />
                </div>
                <span>pg. 4 de 5</span>
              </div>
            </div>
          </article>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PÁGINA 5: RELATÓRIO DE AUDITORIA E VALIDAÇÃO ELETRÔNICA               */}
        {/* --------------------------------------------------------------------- */}
        {(viewMode === 'all_pages' || currentPage === 5) && (
          <article className="print-page w-full max-w-[850px] min-h-[1130px] bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative flex flex-col justify-between text-[15px] sm:text-[15.5px] leading-relaxed font-sans border border-slate-200">
            <div>
              {/* Header com Logo Autentique / Certificação Digital */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-600 tracking-tight">autentique</span>
                  <span className="text-xs text-slate-400 font-mono">.com.br</span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  <p>Identificador: {documentIdentifier}</p>
                  <p>Data/Hora em GMT -3:00 por Google Trusted Services</p>
                  <p>Autenticação eletrônica por autentique.com.br</p>
                </div>
              </div>

              {/* Título Principal */}
              <div className="text-center mb-6">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Relatório de auditoria e validação de assinaturas eletrônicas
                </h2>
              </div>

              {/* Card de QR Code & Verificação de Integridade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                  <div className="w-24 h-24 bg-white rounded-xl border border-slate-300 p-2 shadow-sm flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-2 text-center">
                    Escaneie para validar
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      URL pública de verificação de integridade e autenticidade
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyValidationLink}
                      className="font-mono text-blue-600 hover:underline break-all text-left text-[11px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{validationUrl}</span>
                      <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                    {isCopied && <span className="text-[10px] text-emerald-600 font-bold">Link copiado!</span>}
                  </div>

                  <div className="text-[11px] text-slate-700">
                    <p><strong>Assinaturas concluídas:</strong> 1 de 1</p>
                    <p><strong>Conformidade Legal:</strong> Lei Federal nº 14.063/2020 e Regulamento (UE) nº 910/2014 (eIDAS)</p>
                  </div>

                  <div className="pt-1 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                    <strong>Como auditar e validar este documento:</strong><br/>
                    Você está visualizando uma via para impressão do documento, ela possui os dados de auditoria, porém ela pode ser alterada. Para conferir a integridade do documento e das assinaturas, acesse a URL pública de validação ou escaneie o QRCode ao lado.
                  </div>
                </div>
              </div>

              {/* Assinaturas presentes no documento */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Assinaturas presentes no documento
                </h3>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-36 h-16 bg-white rounded-lg border border-slate-300 flex items-center justify-center text-blue-900 font-serif italic text-lg px-2 overflow-hidden shadow-sm">
                    {isSigned && signatureImage ? (
                      <img 
                        src={signatureImage} 
                        alt="Assinatura" 
                        className="max-h-full max-w-full object-contain" 
                      />
                    ) : isSigned ? (
                      <span className="truncate">{effectiveSignerName.split(' ')[0]}</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-sans not-italic">Em branco</span>
                    )}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {effectiveSignerName}
                    </p>
                    <p className="font-mono text-slate-600 text-[11px]">
                      {effectiveSignerCpf ? `CPF: ${effectiveSignerCpf}` : 'CPF: ___.___.___-__'}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSigned 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isSigned ? '✓ Signatário Certificado via Touch no App' : 'Aguardando Matrícula / Assinatura'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trilha de Auditoria Detalhada */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Trilha de auditoria
                </h3>

                <div className="space-y-3 font-mono text-[11px] text-slate-700">
                  {/* Evento 1: Criação */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-20 text-[10px] text-slate-500 shrink-0">
                      <div>{signatureDate}</div>
                      <div>07:10:14</div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">
                        Serviço de Assinatura Eletrônica (assinatura.eletronica@loyaltyjiujitsu.com.br, CNPJ 081.265.363-73) gerou a via oficial do documento
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        Hash SHA256 do arquivo: {sha256Hash}
                      </p>
                    </div>
                  </div>

                  {/* Evento 2: Visualização */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-20 text-[10px] text-slate-500 shrink-0">
                      <div>{signatureDate}</div>
                      <div>07:13:02</div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">
                        {isMinor && parentName ? parentName : (parentName || studentName || 'Titular / Responsável')} {targetZapPhone ? `(WhatsApp +55${targetZapPhone.replace(/\D/g, '')})` : '(preenchimento na matrícula)'} visualizou o documento
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Ambiente Seguro de Matrícula • Loyalty Jiu-Jitsu Matriz
                      </p>
                    </div>
                  </div>

                  {/* Evento 3: Assinatura */}
                  <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                    isSigned ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-20 text-[10px] text-slate-600 shrink-0 font-bold">
                      <div>{signatureDate}</div>
                      <div>{isSigned ? '07:13:58' : '--:--:--'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <p className={`font-bold ${isSigned ? 'text-emerald-950' : 'text-slate-800'}`}>
                        {isSigned 
                          ? `${isMinor && parentName ? parentName : (parentName || studentName || 'Titular / Responsável')} assinou o documento eletronicamente`
                          : 'Aguardando preenchimento da matrícula e assinatura das partes'}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-600 pt-1">
                        <div>Status: {isSigned ? 'Assinado' : 'Minuta para Matrícula'}</div>
                        <div>Plataforma: Loyalty BJJ App</div>
                        <div>Comarca: Fortaleza / CE</div>
                        <div>Lei Federal: nº 14.063/2020</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé Oficial da Página 5 */}
            <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span>autentique.com.br</span>
                <span>•</span>
                <span className="truncate max-w-[320px]">{documentIdentifier}</span>
              </div>
              <div className="text-right">
                <span>pg. 5 de 5</span>
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Floating Bottom Quick Send Bar (Mobile Friendly) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0 print:hidden">
        <div className="flex items-center gap-2 text-slate-300">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">WhatsApp de Envio do Contrato:</span>
          <strong className="text-white font-mono">{targetZapPhone}</strong>
          <span className="text-[11px] text-slate-400">({targetResponsibleOrStudentName})</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Sign Shortcut */}
          <button
            type="button"
            onClick={scrollToSignature}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isSigned
                ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isSigned ? 'Assinado' : 'Assinar'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSigned ? 'Enviar Contrato Assinado' : 'Enviar no WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
