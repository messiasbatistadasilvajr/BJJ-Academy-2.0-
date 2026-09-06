import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, X, Printer, ExternalLink, AlertTriangle } from 'lucide-react';
import { PlatformGeneralManager } from '../../types';

interface SaaSAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAllTerms?: () => void;
  academyName: string;
  academyCnpj: string;
  representativeName: string;
  representativeCpf: string;
  generalManager: PlatformGeneralManager;
  platformPlan: string;
  monthlyFeeFormatted: string;
  protocol?: string;
  isAccepted?: boolean;
}

export const SaaSAgreementModal: React.FC<SaaSAgreementModalProps> = ({
  isOpen,
  onClose,
  onAcceptAllTerms,
  academyName,
  academyCnpj,
  representativeName,
  representativeCpf,
  generalManager,
  platformPlan,
  monthlyFeeFormatted,
  protocol = 'BJJ-TERMS-2026-AUDIT',
  isAccepted = false
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <ShieldCheck size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Contrato de Adesão & Termos de Licenciamento SaaS
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Versão 2026.2 • LGPD & Mútuo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instrumento de segurança jurídica mútua entre a Plataforma BJJ Academy e a Academia Contratante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contract Scroll Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans divide-y divide-slate-800/80">
          
          {/* Parties Header */}
          <div className="space-y-2 pb-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-400">Identificação das Partes Contratantes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Licenciante / Plataforma:</span>
                  <strong className="text-white block">{generalManager.companyName || 'BJJ Academy Tecnologia & Gestão Esportiva'}</strong>
                  <span className="text-slate-400">CEO: {generalManager.name}</span>
                  <span className="text-slate-400 block">Chave PIX Gestão: {generalManager.pixKey}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Licenciada / Academia Contratante:</span>
                  <strong className="text-white block">{academyName || '[Nome da Academia a Cadastrar]'}</strong>
                  <span className="text-slate-400">CNPJ: {academyCnpj || '[CNPJ não preenchido]'}</span>
                  <span className="text-slate-400 block">Resp. Legal: {representativeName || '[Nome do Representante]'} {representativeCpf ? `(CPF: ${representativeCpf})` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cláusula 1 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <span>1. Cláusula Primeira: Do Objeto do Licenciamento de Software (SaaS)</span>
            </h4>
            <p>
              1.1. O presente instrumento regula o licenciamento não exclusivo e intransferível de uso da plataforma <strong>BJJ Academy</strong>, compreendendo o Painel do Gestor Web, Sistema de Check-in Facial e por QR Code, Módulo de Voz de Tatame na Recepção, CRM de Gestão de Alunos, Controle de Faixas e Graus (CBJJ) e Aplicativo PWA dos Alunos.
            </p>
            <p>
              1.2. O software é fornecido na modalidade <em>Software as a Service</em> (SaaS), operando em nuvem com alta disponibilidade e backups automatizados.
            </p>
          </div>

          {/* Cláusula 2 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <span>2. Cláusula Segunda: Dos Valores, Repasse Direto das Mensalidades e Transparência Financeira</span>
            </h4>
            <p className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-300">
              <strong>2.1. Inviolabilidade das Mensalidades dos Alunos:</strong> A Plataforma BJJ Academy declara e garante expressamente que <strong>NÃO RETÉM, NÃO INTERMEDEIA E NÃO COBRA PORCENTAGEM</strong> sobre as mensalidades pagas pelos alunos da Academia. Todo pagamento via PIX dos alunos é creditado 100% diretamente na conta bancária/chave PIX cadastrada pela própria Academia.
            </p>
            <p>
              2.2. A contraprestação pelo uso do software consiste no valor mensal do plano contratado (Plano {platformPlan.toUpperCase()}: base de R$ 130,00 + R$ 1,30 por aluno ativo), devido pela Academia mensalmente à Plataforma até o dia de vencimento cadastrado.
            </p>
            <p>
              2.3. Em caso de atraso superior a 15 (quinze) dias no pagamento da licença SaaS, o acesso ao painel poderá ser temporariamente suspenso, mantendo-se resguardados os dados dos alunos e da academia para pronta reativação.
            </p>
          </div>

          {/* Cláusula 3 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400" />
              <span>3. Cláusula Terceira: Da Exclusão e Isenção Mútua de Responsabilidade Física e Médica do Tatame</span>
            </h4>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-amber-200">
              <p>
                <strong>3.1. Responsabilidade Exclusiva da Academia:</strong> A BJJ Academy é uma empresa estritamente provedora de tecnologia e softwares de gestão. <strong>A integridade física dos praticantes, a segurança estrutural do tatame, a orientação desportiva, a supervisão de treinos e sparrings, a exigência de atestado médico de aptidão física e a prestação de primeiros socorros são de responsabilidade única e exclusiva da Academia Contratante e de seus respectivos professores/faixas pretas responsáveis.</strong>
              </p>
              <p>
                3.2. A Plataforma não poderá, sob hipótese alguma, ser responsabilizada civil, desportiva ou penalmente por lesões, acidentes ou fatalidades decorrentes da prática de Jiu-Jitsu ou artes marciais no estabelecimento da Contratante.
              </p>
            </div>
          </div>

          {/* Cláusula 4 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <Lock size={14} className="text-blue-400" />
              <span>4. Cláusula Quarta: Da Privacidade e Proteção de Dados (LGPD - Lei nº 13.709/2018)</span>
            </h4>
            <p>
              4.1. As partes reconhecem expressamente que, nos termos da Lei Geral de Proteção de Dados (LGPD):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>A <strong>Academia Contratante</strong> atua como <strong>CONTROLADORA</strong> dos dados pessoais e biométricos de seus alunos, colaboradores e instrutores;</li>
              <li>A <strong>Plataforma BJJ Academy</strong> atua como <strong>OPERADORA</strong>, executando o processamento de dados sob instruções da Controladora e para a estrita finalidade do software;</li>
              <li>Fotos faciais utilizadas no reconhecimento de check-in são protegidas com criptografia de ponta a ponta e jamais comercializadas com terceiros.</li>
            </ul>
          </div>

          {/* Cláusula 5 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <span>5. Cláusula Quinta: Da Autonomia Técnica e Regulamento Marcial (CBJJ/IBJJF)</span>
            </h4>
            <p>
              5.1. A Plataforma BJJ Academy não interfere na graduação de faixas, linhagem de tatame ou critérios pedagógicos de treino adotados pela Academia, fornecendo as regras internacionais da CBJJ/IBJJF como modelo orientativo configurável.
            </p>
          </div>

          {/* Cláusula 6 */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <span>6. Cláusula Sexta: Do Cancelamento e Portabilidade dos Dados</span>
            </h4>
            <p>
              6.1. O presente contrato poderá ser rescindido a qualquer tempo por qualquer das partes mediante aviso prévio de 30 (trinta) dias, <strong>sem qualquer multa rescisória abusiva</strong>.
            </p>
            <p>
              6.2. A Academia tem direito assegurado de exportar a qualquer momento a lista completa de seus alunos e histórico em formato aberto (CSV/Excel).
            </p>
          </div>

          {/* Protocol & Signature Stamp */}
          <div className="pt-4 space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block">Protocolo de Autenticação Digital:</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{protocol}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Data de Registro:</span>
                <span className="text-white font-bold">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic text-center pt-1">
              Registro auditável nos termos da MP 2.200-2/2001 e do Código Civil Brasileiro para contratos eletrônicos.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {isAccepted ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 size={16} /> Termos aceitos pelo Representante Legal
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">
                Marque os campos de aceite no formulário para prosseguir.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAcceptAllTerms && !isAccepted && (
              <button
                type="button"
                onClick={() => {
                  onAcceptAllTerms();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition"
              >
                Concordo e Aceito Todos os Termos
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
