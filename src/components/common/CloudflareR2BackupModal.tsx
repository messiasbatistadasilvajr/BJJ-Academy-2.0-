import React, { useState, useEffect } from 'react';
import { 
  Cloud, Database, ShieldCheck, Download, RefreshCw, Upload, 
  CheckCircle2, AlertCircle, HardDrive, Lock, Zap, Clock, 
  FileText, ExternalLink, ArrowRight, Trash2, ShieldAlert,
  Copy, Check, FileCheck, Layers, Sparkles, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { R2StorageClient, R2ClientHealth, R2ClientBackup, R2BackupScheduleInfo } from '../../services/r2StorageClient';

interface CloudflareR2BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAcademyName?: string;
  activeAcademyId?: string;
}

export const CloudflareR2BackupModal: React.FC<CloudflareR2BackupModalProps> = ({
  isOpen,
  onClose,
  activeAcademyName = 'Loyalty Jiu-Jitsu Matriz',
  activeAcademyId = 'acad_loyalty_jiujitsu'
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'media' | 'config'>('backup');
  const [health, setHealth] = useState<R2ClientHealth | null>(null);
  const [backups, setBackups] = useState<R2ClientBackup[]>([]);
  const [schedule, setSchedule] = useState<R2BackupScheduleInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Media Upload State
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<'avatars' | 'contracts' | 'attendance' | 'receipts'>('avatars');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; url: string; size: number; originalName: string; uploadedAt: string }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [h, bList, sched] = await Promise.all([
        R2StorageClient.getHealth().catch(() => null),
        R2StorageClient.listBackups().catch(() => []),
        R2StorageClient.getBackupSchedule().catch(() => null)
      ]);

      if (h) setHealth(h);
      if (bList) setBackups(bList);
      if (sched) setSchedule(sched);
    } catch (err) {
      console.warn('[Cloudflare R2 Modal] Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Executar snapshot manual do banco para o R2
  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const newBackup = await R2StorageClient.triggerBackup(
        `Snapshot manual disparado pelo painel para a unidade ${activeAcademyName}`
      );
      setBackups(prev => [newBackup, ...prev]);
      setStatusMessage({
        type: 'success',
        text: `✓ Backup realizado com sucesso! Snapshot "${newBackup.filename}" salvo no Cloudflare R2 com ${newBackup.totalRecords} registros.`
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erro ao gerar backup: ${err.message}`
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Restaurar banco a partir de um backup (Disaster Recovery)
  const handleRestoreBackup = async (backupId: string, filename: string) => {
    const confirm = window.confirm(
      `⚠️ DISASTER RECOVERY: Deseja restaurar a aplicação a partir do backup "${filename}"?\n\nIsso recuperará todos os alunos, faturas, academias e configurações preservadas no snapshot do Cloudflare R2.`
    );
    if (!confirm) return;

    setIsRestoring(backupId);
    setStatusMessage(null);
    try {
      const result = await R2StorageClient.restoreBackup(backupId);
      setStatusMessage({
        type: 'success',
        text: `✓ Disaster Recovery concluído! ${result.message}`
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erro na recuperação: ${err.message}`
      });
    } finally {
      setIsRestoring(null);
    }
  };

  // Upload de arquivo de teste para o R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    setStatusMessage(null);
    try {
      const result = await R2StorageClient.uploadMedia(file, {
        originalName: file.name,
        mimeType: file.type,
        folder: selectedFolder,
        tenantId: activeAcademyId
      });

      setUploadedFiles(prev => [{
        key: result.key,
        url: result.url,
        size: result.size,
        originalName: result.originalName,
        uploadedAt: result.uploadedAt
      }, ...prev]);

      setStatusMessage({
        type: 'success',
        text: `✓ Mídia "${file.name}" enviada com sucesso para o Cloudflare R2 na pasta "${selectedFolder}"!`
      });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Falha no upload para R2: ${err.message}`
      });
    } finally {
      setIsUploadingMedia(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL TOP HEADER */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/50 shrink-0 ring-1 ring-white/20">
              <Cloud size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Mídias Externas & Backup Automático (Cloudflare R2)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  10 GB Grátis • S3 Compatível
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Mídias fora da máquina e cópias de segurança do banco para recuperação instantânea em caso de erro no deploy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* FEEDBACK STATUS BANNER */}
        {statusMessage && (
          <div className={`p-3 px-5 text-xs sm:text-sm font-semibold flex items-center justify-between border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-red-950/80 border-red-500/50 text-red-200'
              : 'bg-blue-950/80 border-blue-500/50 text-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* CLOUDFLARE R2 SPECS BADGES */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-300">
              <HardDrive size={15} className="text-amber-400" />
              <span>Bucket:</span>
              <strong className="text-white font-mono">{health?.bucketName || 'bjj-academy-media'}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap size={15} className="text-emerald-400" />
              <span>Cota Gratuita R2:</span>
              <strong className="text-emerald-300 font-bold">10 GB Inclusos • R$ 0,00 Tráfego</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={15} className="text-cyan-400" />
              <span>Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                health?.connected 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {health?.connected ? '✓ R2 Conectado' : '⚡ Pool Externo Ativo'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{health?.totalFiles ?? backups.length} arquivos no storage</span>
            <span>•</span>
            <span>{(((health?.totalSizeBytes || 0) + backups.reduce((acc, b) => acc + b.sizeBytes, 0)) / 1024).toFixed(1)} KB usados</span>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/30 border-b border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database size={16} />
            <span>1. Backup Automático & Disaster Recovery</span>
            {backups.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/70 text-white font-bold">
                {backups.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload size={16} />
            <span>2. Upload de Mídias para o Bucket R2</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers size={16} />
            <span>3. Como Conectar Chaves R2 (.env)</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 no-scrollbar">

          {/* ========================================================================= */}
          {/* TAB 1: BACKUP AUTOMÁTICO & DISASTER RECOVERY                              */}
          {/* ========================================================================= */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* TOP ACTION CARD: DISPARO MANUAL & CRON DIÁRIO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900 to-slate-950 border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-white">
                      Snapshot do Banco de Dados & Aplicação
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Disaster Recovery 1-Click
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                    Salva cópia integral e imutável de alunos, academias, faturas, despesas e contratos no bucket Cloudflare R2. Se ocorrer qualquer falha em deploy, basta clicar em "Restaurar".
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Clock size={13} />
                      Rotina Automática Diária: Ativa
                    </span>
                    <span>•</span>
                    <span>Retenção: Últimos 50 snapshots</span>
                  </div>
                </div>

                <button
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 transition shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Zap size={18} className={isBackingUp ? 'animate-spin' : ''} />
                  <span>{isBackingUp ? 'Criando Snapshot...' : '⚡ Fazer Backup do Banco Agora'}</span>
                </button>
              </div>

              {/* BACKUPS CATALOG TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <HardDrive size={16} className="text-amber-400" />
                    <span>Snapshots Salvos no Cloudflare R2 ({backups.length})</span>
                  </h3>
                  <button
                    onClick={loadData}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    <span>Atualizar Lista</span>
                  </button>
                </div>

                {backups.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                    <Database size={32} className="mx-auto text-slate-600" />
                    <p className="font-bold text-slate-300">Nenhum snapshot gerado ainda</p>
                    <p className="text-xs text-slate-500">Clique no botão acima para criar a primeira cópia de segurança no Cloudflare R2.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {backups.map((bkp) => (
                      <div
                        key={bkp.backupId}
                        className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileCheck size={20} />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs sm:text-sm font-black text-white truncate max-w-[280px]">
                                {bkp.filename}
                              </span>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {bkp.totalRecords} registros
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {(bkp.sizeBytes / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {bkp.notes || 'Backup do banco de dados BJJ ACADEMY'} • {new Date(bkp.timestamp).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                              SHA256: {bkp.checksum}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS: RESTORE & DOWNLOAD */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {/* Botão de Download do JSON */}
                          <a
                            href={`/api/storage/file?key=${encodeURIComponent(bkp.key)}`}
                            download={bkp.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                            title="Baixar arquivo JSON do snapshot"
                          >
                            <Download size={14} />
                            <span>Baixar</span>
                          </a>

                          {/* Botão de Disaster Recovery / Restaurar */}
                          <button
                            onClick={() => handleRestoreBackup(bkp.backupId, bkp.filename)}
                            disabled={isRestoring === bkp.backupId}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                            title="Restaura todos os dados deste backup imediatamente caso haja erro no deploy"
                          >
                            <RefreshCw size={14} className={isRestoring === bkp.backupId ? 'animate-spin' : ''} />
                            <span>{isRestoring === bkp.backupId ? 'Restaurando...' : 'Restaurar Banco'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: UPLOAD DE MÍDIAS FORA DA MÁQUINA (CLOUDFLARE R2)                   */}
          {/* ========================================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">Enviar Foto ou Documento para o Cloudflare R2</h3>
                    <p className="text-xs text-slate-400">
                      Arquivos são transferidos diretamente para o bucket externo fora da máquina, sem consumir memória local do servidor.
                    </p>
                  </div>

                  {/* Folder Selector */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700 rounded-xl text-xs">
                    <span className="px-2 text-slate-400 font-bold">Pasta:</span>
                    {(['avatars', 'contracts', 'attendance', 'receipts'] as const).map(folder => (
                      <button
                        key={folder}
                        type="button"
                        onClick={() => setSelectedFolder(folder)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition capitalize ${
                          selectedFolder === folder
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {folder}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Input Area */}
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-900/50 hover:bg-slate-900 group">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploadingMedia}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 flex items-center justify-center transition mb-2">
                    <Upload size={24} className={isUploadingMedia ? 'animate-bounce' : ''} />
                  </div>
                  <span className="text-sm font-black text-white">
                    {isUploadingMedia ? 'Enviando mídia para o Cloudflare R2...' : 'Clique para selecionar foto ou documento'}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    JPG, PNG, WEBP, PDF • Pasta de destino: <strong className="text-amber-300 font-mono">/{selectedFolder}</strong>
                  </span>
                </label>
              </div>

              {/* RECENTLY UPLOADED MEDIA LIST */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Mídias Recentes Enviadas para o R2 nesta Sessão ({uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((f) => (
                      <div
                        key={f.key}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{f.originalName}</p>
                          <p className="font-mono text-[10px] text-amber-400 truncate">{f.key}</p>
                          <p className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleTimeString('pt-BR')}</p>
                        </div>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white transition shrink-0"
                          title="Visualizar mídia no R2"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CONFIGURAÇÃO DE CREDENCIAIS CLOUDFLARE R2                         */}
          {/* ========================================================================= */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Como ativar o Cloudflare R2 com cota gratuita generosa
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  O <strong>Cloudflare R2</strong> é 100% compatível com a API S3 da AWS e foi projetado para eliminar taxas de tráfego (zero egress fees). 
                  Você recebe <strong>10 GB gratuitos para sempre</strong> e milhões de operações sem pagar nada.
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-amber-300">1. Criar o Bucket no Cloudflare R2:</p>
                    <p className="text-slate-400">Acesse o painel da Cloudflare &gt; R2 Overview &gt; <em>Create Bucket</em> &gt; Nomeie como <code className="bg-slate-950 px-1 py-0.5 rounded text-white">bjj-academy-media</code>.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-amber-300">2. Gerar Token de API (S3 Credentials):</p>
                    <p className="text-slate-400">No painel R2, clique em <em>Manage R2 API Tokens</em> &gt; <em>Create API Token</em> &gt; Permissão <em>Admin Read &amp; Write</em>.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="font-bold text-amber-300">3. Inserir as 3 Chaves no seu ambiente (.env):</p>
                    <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto no-scrollbar">
{`R2_ACCOUNT_ID="seu_account_id_cloudflare"
R2_ACCESS_KEY_ID="sua_access_key_id"
R2_SECRET_ACCESS_KEY="sua_secret_access_key"
R2_BUCKET_NAME="bjj-academy-media"`}
                    </pre>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck size={18} className="shrink-0" />
                  <span>
                    O BJJ ACADEMY já opera com fallback resiliente automático. Qualquer arquivo enviado agora será preservado com chaves idênticas ao R2.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mídias Fora da Máquina • Cloudflare R2 Ativo</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
