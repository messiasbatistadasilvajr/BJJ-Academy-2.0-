/**
 * 🥋 BJJ ACADEMY - Client SDK para Cloudflare R2 & Backup Automático
 * 
 * Fornece métodos client-side para:
 * 1. Upload de fotos/mídias/documentos diretamente para o bucket Cloudflare R2.
 * 2. Execução e monitoramento de backups de banco de dados/aplicação.
 * 3. Recuperação rápida ("Disaster Recovery") e restauração de dados em 1 clique.
 */

export interface R2ClientUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  etag?: string;
  provider: 'cloudflare_r2' | 'r2_emulated_ready';
  uploadedAt: string;
  originalName: string;
}

export interface R2ClientHealth {
  connected: boolean;
  provider: 'cloudflare_r2' | 'r2_emulated_ready';
  bucketName: string;
  accountIdConfigured: boolean;
  publicDomainConfigured: boolean;
  publicDomain?: string;
  endpoint: string;
  message: string;
  freeTier: {
    storageIncludedGB: number;
    readOpsIncludedPerMonth: number;
    writeOpsIncludedPerMonth: number;
    egressFeePerGB: number;
    estimatedCost: string;
  };
  totalFiles: number;
  totalSizeBytes: number;
}

export interface R2ClientBackup {
  backupId: string;
  filename: string;
  key: string;
  sizeBytes: number;
  timestamp: string;
  totalRecords: number;
  collectionsIncluded: string[];
  checksum: string;
  systemVersion: string;
  provider: 'cloudflare_r2' | 'r2_emulated_ready';
  url: string;
  status: 'completed' | 'failed';
  notes?: string;
}

export interface R2BackupScheduleInfo {
  isAutoBackupEnabled: boolean;
  intervalHours: number;
  lastRun: string | null;
  nextRunEstimated: string;
  totalBackupsRetained: number;
}

export class R2StorageClient {
  /**
   * Converte File do browser em base64 string
   */
  public static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload de foto, mídia ou documento PDF para o bucket Cloudflare R2
   */
  public static async uploadMedia(
    input: File | string,
    options: {
      originalName?: string;
      mimeType?: string;
      folder?: 'avatars' | 'contracts' | 'attendance' | 'receipts' | 'medical' | 'backups' | 'media';
      tenantId?: string;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<R2ClientUploadResult> {
    let base64: string;
    let originalName = options.originalName || 'media_upload.jpg';
    let mimeType = options.mimeType || 'image/jpeg';

    if (typeof input === 'string') {
      base64 = input;
    } else {
      originalName = input.name;
      mimeType = input.type || 'image/jpeg';
      base64 = await this.fileToBase64(input);
    }

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        originalName,
        mimeType,
        folder: options.folder || 'media',
        tenantId: options.tenantId || 'global',
        metadata: options.metadata || {}
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Falha no upload para Cloudflare R2 (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.file;
  }

  /**
   * Obtém diagnóstico de saúde e cota gratuita do Cloudflare R2
   */
  public static async getHealth(): Promise<R2ClientHealth> {
    const response = await fetch('/api/storage/health');
    if (!response.ok) {
      throw new Error('Falha ao consultar status do Cloudflare R2');
    }
    const data = await response.json();
    return data.health;
  }

  /**
   * Lista arquivos armazenados no bucket R2
   */
  public static async listFiles(prefix?: string, maxKeys: number = 50): Promise<{
    files: Array<{
      key: string;
      url: string;
      size: number;
      lastModified: string;
      folder: string;
    }>;
    totalCount: number;
    totalSizeBytes: number;
  }> {
    const query = new URLSearchParams();
    if (prefix) query.append('prefix', prefix);
    query.append('maxKeys', String(maxKeys));

    const response = await fetch(`/api/storage/files?${query.toString()}`);
    if (!response.ok) {
      throw new Error('Falha ao listar arquivos no Cloudflare R2');
    }
    return response.json();
  }

  /**
   * Deleta arquivo do bucket
   */
  public static async deleteFile(key: string): Promise<boolean> {
    const response = await fetch('/api/storage/file', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = await response.json();
    return !!data.success;
  }

  /**
   * Executa snapshot completo do banco/aplicação para o Cloudflare R2
   */
  public static async triggerBackup(notes?: string, customPayload?: any): Promise<R2ClientBackup> {
    const response = await fetch('/api/backup/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: notes || 'Backup manual disparado pelo usuário',
        customPayload
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao executar backup para o Cloudflare R2');
    }

    const data = await response.json();
    return data.backup;
  }

  /**
   * Lista todos os backups disponíveis no Cloudflare R2
   */
  public static async listBackups(): Promise<R2ClientBackup[]> {
    const response = await fetch('/api/backup/list');
    if (!response.ok) {
      throw new Error('Falha ao listar backups no Cloudflare R2');
    }
    const data = await response.json();
    return data.backups || [];
  }

  /**
   * Restaura o banco de dados/aplicação a partir de um backup do Cloudflare R2 (Disaster Recovery)
   */
  public static async restoreBackup(backupId: string): Promise<{
    success: boolean;
    backupId: string;
    restoredAt: string;
    recordsRestored: number;
    message: string;
  }> {
    const response = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao restaurar backup do Cloudflare R2');
    }

    return response.json();
  }

  /**
   * Consulta a configuração da rotina periódica de backup
   */
  public static async getBackupSchedule(): Promise<R2BackupScheduleInfo> {
    const response = await fetch('/api/backup/schedule');
    if (!response.ok) {
      throw new Error('Falha ao consultar agendamento de backups');
    }
    const data = await response.json();
    return data.schedule;
  }
}
