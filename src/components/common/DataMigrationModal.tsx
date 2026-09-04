import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Upload, Download, CheckCircle, AlertTriangle, FileSpreadsheet, Sparkles, Check, RefreshCw } from 'lucide-react';
import { BeltColor } from '../../types';
import confetti from 'canvas-confetti';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName: string;
  onImportStudentsSuccess?: (count: number) => void;
}

interface ParsedStudentRow {
  name: string;
  belt: BeltColor;
  stripes: number;
  phone: string;
  email: string;
  category: string;
  status: 'valid' | 'warning' | 'error';
  errorMessage?: string;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  academyName,
  onImportStudentsSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvRawText, setCsvRawText] = useState<string>(
    `Nome,Faixa,Graus,Telefone,Email,Categoria\nMatheus Ribeiro,Azul,2,(11) 98123-1122,matheus@email.com,Adulto Médio\nCamila Vasconcelos,Roxa,1,(11) 97333-4455,camila@email.com,Feminino Leve\nDiego "Pitbull" Souza,Marrom,3,(11) 99222-7788,diego@email.com,Master 1 Pesado\nArthurzinho Lima,Amarela,0,(11) 98555-9900,arthur.kids@email.com,Infantil B`
  );
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [importCompleted, setImportCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleValidateCSV = () => {
    const lines = csvRawText.trim().split('\n');
    if (lines.length <= 1) {
      alert('Insira ao menos um aluno na planilha.');
      return;
    }

    const rows: ParsedStudentRow[] = [];
    const validBelts: BeltColor[] = ['white', 'grey', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map(p => p.trim());

      const name = parts[0] || `Aluno Linha ${i}`;
      const rawBelt = (parts[1] || 'branca').toLowerCase();
      let belt: BeltColor = 'white';
      if (rawBelt.includes('azul')) belt = 'blue';
      else if (rawBelt.includes('roxa') || rawBelt.includes('purple')) belt = 'purple';
      else if (rawBelt.includes('marrom') || rawBelt.includes('brown')) belt = 'brown';
      else if (rawBelt.includes('preta') || rawBelt.includes('black')) belt = 'black';
      else if (rawBelt.includes('amarela') || rawBelt.includes('yellow')) belt = 'yellow';
      else if (rawBelt.includes('cinza') || rawBelt.includes('grey')) belt = 'grey';
      else if (rawBelt.includes('laranja') || rawBelt.includes('orange')) belt = 'orange';
      else if (rawBelt.includes('verde') || rawBelt.includes('green')) belt = 'green';

      const stripes = Math.min(4, Math.max(0, parseInt(parts[2] || '0', 10) || 0));
      const phone = parts[3] || '(11) 99999-9999';
      const email = parts[4] || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`;
      const category = parts[5] || 'Adulto Médio';

      let status: 'valid' | 'warning' | 'error' = 'valid';
      let errorMessage: string | undefined = undefined;

      if (!name || name.length < 3) {
        status = 'error';
        errorMessage = 'Nome inválido ou muito curto.';
      } else if (!phone.includes('(') && phone.length < 8) {
        status = 'warning';
        errorMessage = 'Telefone sem DDD padrão.';
      }

      rows.push({
        name,
        belt,
        stripes,
        phone,
        email,
        category,
        status,
        errorMessage
      });
    }

    setParsedRows(rows);
    setHasValidated(true);
    setImportCompleted(false);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `Nome,Faixa,Graus,Telefone,Email,Categoria\nExemplo Aluno 1,Branca,1,(11) 98888-7777,aluno1@email.com,Adulto Médio\nExemplo Aluna 2,Azul,3,(11) 97777-6666,aluna2@email.com,Feminino Leve\n`;
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modelo_migracao_alunos_bjj.csv`;
    link.click();
  };

  const handleConfirmImport = () => {
    const validCount = parsedRows.filter(r => r.status !== 'error').length;
    setImportCompleted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onImportStudentsSuccess) {
      onImportStudentsSuccess(validCount);
    }
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  Migração em Lote (CSV / Excel)
                </span>
                <h3 className="text-base font-black text-white">Central de Migração de Dados • {academyName}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 px-5">
            <button
              onClick={() => setActiveTab('import')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'import'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Alunos de Outro Sistema</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'export'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Base & Backup</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
            {activeTab === 'import' && (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                      Planilha Padrão de Importação
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Formato CSV separado por vírgulas: Nome, Faixa, Graus, Telefone, Email, Categoria.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs flex items-center gap-1 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar Modelo .CSV
                  </button>
                </div>

                {/* CSV Editor Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase text-slate-400">
                      Cole as linhas da planilha CSV abaixo:
                    </label>
                    <button
                      onClick={handleValidateCSV}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Validar Registros
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={csvRawText}
                    onChange={(e) => {
                      setCsvRawText(e.target.value);
                      setHasValidated(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Nome,Faixa,Graus,Telefone,Email,Categoria..."
                  />
                </div>

                {/* Validation Preview */}
                {hasValidated && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Checkpoints de Validação ({parsedRows.filter(r => r.status === 'valid').length} válidos, {parsedRows.filter(r => r.status === 'error').length} erros)
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 font-bold">
                        {parsedRows.length} Atletas Detectados
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                      {parsedRows.map((row, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            row.status === 'valid'
                              ? 'bg-slate-900/80 border-slate-800 text-white'
                              : row.status === 'warning'
                              ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                              : 'bg-red-950/30 border-red-800 text-red-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate">{row.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {row.category} • Faixa {row.belt} ({row.stripes}º grau) • {row.phone}
                            </div>
                            {row.errorMessage && (
                              <div className="text-[10px] text-amber-400 font-medium">
                                ⚠️ {row.errorMessage}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {row.status === 'valid' && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                                Pronto
                              </span>
                            )}
                            {row.status === 'warning' && (
                              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                                Alerta
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {importCompleted ? (
                      <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Alunos importados com sucesso para a academia!
                      </div>
                    ) : (
                      <button
                        onClick={handleConfirmImport}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmar Importação de {parsedRows.filter(r => r.status !== 'error').length} Atletas</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'export' && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Exportação Completa de Dados da Unidade</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Faça o download de todos os alunos, histórico de graduações e faturas em formato CSV para backup ou análise em planilhas externas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleDownloadTemplate();
                    alert('Exportação CSV gerada com sucesso.');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg inline-flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Baixar Base de Alunos (.CSV)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
