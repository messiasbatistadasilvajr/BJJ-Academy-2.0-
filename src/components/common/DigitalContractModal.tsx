import React, { useState, useRef, useEffect } from 'react';
import { 
  X, FileText, CheckCircle, ShieldCheck, PenTool, 
  RotateCcw, Upload, AlertCircle, HeartPulse, Check
} from 'lucide-react';
import { ContractWaiver } from '../../types';
import { mockContract } from '../../data/mockData';
import { bjjAudio } from '../../utils/audio';

interface DigitalContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export const DigitalContractModal: React.FC<DigitalContractModalProps> = ({ 
  isOpen, 
  onClose,
  studentName = 'Lucas Gracie Mendes'
}) => {
  const [contract, setContract] = useState<ContractWaiver>(mockContract);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Setup canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#dc2626'; // red signature line
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw initial mock signature if already signed
        if (contract.status === 'signed') {
          ctx.beginPath();
          ctx.moveTo(30, 45);
          ctx.bezierCurveTo(80, 10, 120, 60, 180, 25);
          ctx.bezierCurveTo(200, 30, 240, 15, 270, 40);
          ctx.stroke();
          setHasSignature(true);
        }
      }
    }
  }, [isOpen, contract.status]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveContract = () => {
    bjjAudio.playAccessGranted();
    setContract(prev => ({
      ...prev,
      status: 'signed',
      signedDate: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      termsAccepted: true
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-digital-contract"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">
                Contrato & Termo de Isenção de Risco (Waiver)
              </h2>
              <p className="text-xs text-slate-400">
                Assinatura Eletrônica Válida & Atestado Médico de Aptidão
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Status badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div>
              <div className="font-bold text-white text-sm">{studentName}</div>
              <div className="text-slate-400 text-[11px]">
                {contract.status === 'signed' ? `Assinado em ${contract.signedDate}` : 'Pendente de assinatura'}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
              contract.status === 'signed' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              <CheckCircle size={13} />
              {contract.status === 'signed' ? 'Regularizado' : 'Assinatura Pendente'}
            </span>
          </div>

          {/* Medical fitness alert */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-600/40 flex items-start gap-3">
            <HeartPulse size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-white">Atestado Médico de Aptidão Física</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Status: <strong className="text-emerald-400">Válido até 15/02/2026</strong>.
              </div>
            </div>
            <button className="px-2.5 py-1 rounded-lg bg-blue-800 text-blue-100 hover:bg-blue-700 font-semibold text-[11px] flex items-center gap-1">
              <Upload size={12} /> Atualizar
            </button>
          </div>

          {/* Legal clauses text container */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5 max-h-48 overflow-y-auto text-slate-300 leading-relaxed text-[11px]">
            <h4 className="font-bold text-white text-xs uppercase tracking-wide">
              CLÁUSULAS GERAIS DE PRÁTICA E RESPONSABILIDADE:
            </h4>
            <p>
              1. <strong>Natureza da Atividade:</strong> O ALUNO ou seu RESPONSÁVEL declara ter pleno conhecimento de que o Jiu-Jitsu Brasileiro é uma arte marcial e modalidade esportiva de contato, envolvendo alavancas articulares, projeções e estrangulamentos controlados.
            </p>
            <p>
              2. <strong>Aptidão Física e Condição de Saúde:</strong> O ALUNO declara estar em plenas condições físicas e mentais para a realização dos treinos, inexistindo contraindicação médica para a prática desportiva de alto impacto.
            </p>
            <p>
              3. <strong>Conduta no Tatame & Higiene:</strong> É obrigatório o uso de kimono limpo oficial da equipe, unhas aparadas, respeito absoluto aos mestres, instrutores e companheiros de treino.
            </p>
            <p>
              4. <strong>Isenção de Danos Acidentais:</strong> O praticante reconhece os riscos inerentes à modalidade desportiva e isenta a academia e seus instrutores por acidentes oriundos da dinâmica normal de lutas, desde que não comprovada negligência grave.
            </p>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-300">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700"
            />
            <span className="text-xs">
              Li e concordo com todas as cláusulas do Termo de Adesão e Regulamento Disciplinar.
            </span>
          </label>

          {/* Interactive Digital Signature Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white text-xs flex items-center gap-1.5">
                <PenTool size={14} className="text-red-400" />
                Assine com o dedo ou mouse no campo abaixo:
              </label>
              <button
                onClick={clearCanvas}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                <RotateCcw size={12} /> Limpar
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950 p-2 text-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={120}
                className="w-full h-28 touch-none cursor-crosshair bg-transparent"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-1">
                Linha de Assinatura Digital do Aluno / Responsável Legal
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-center flex items-center justify-center gap-2">
              <Check size={16} /> Contrato e Assinatura gravados com sucesso!
            </div>
          )}

          {/* Save Action */}
          <button
            onClick={handleSaveContract}
            disabled={!hasSignature || !termsAccepted}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
              hasSignature && termsAccepted 
                ? 'bg-red-600 hover:bg-red-500 text-white active:scale-95' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShieldCheck size={16} /> Salvar & Validar Contrato Digital
          </button>
        </div>
      </div>
    </div>
  );
};
