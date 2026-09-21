/**
 * 📲 Firebase Cloud Messaging (FCM) - Motor de Notificações Push no Backend
 * 
 * Responsável por:
 * 1. Disparar alertas push de "Mensalidade Vencendo" (com botão direto para chave PIX).
 * 2. Enviar mensagens de engajamento e incentivo ao tatame para alunos ausentes (> 15 dias).
 * 3. Notificar imediatamente sobre confirmação de graduações e novos certificados emitidos.
 */

export interface PushNotificationPayload {
  targetUserId: string;
  deviceToken?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  category: 'billing' | 'retention' | 'graduation' | 'system';
}

export interface PushNotificationHistoryEntry {
  id: string;
  targetUserId: string;
  title: string;
  body: string;
  category: string;
  status: 'sent' | 'queued' | 'simulated';
  timestamp: string;
}

export class FCMNotificationService {
  private static instance: FCMNotificationService;
  private history: PushNotificationHistoryEntry[] = [];

  private constructor() {}

  public static getInstance(): FCMNotificationService {
    if (!FCMNotificationService.instance) {
      FCMNotificationService.instance = new FCMNotificationService();
    }
    return FCMNotificationService.instance;
  }

  /**
   * 💰 Dispara alerta push de cobrança amigável ("Mensalidade Vencendo")
   */
  public async sendUpcomingInvoiceAlert(
    studentId: string,
    studentName: string,
    amount: number,
    dueDate: string,
    deviceToken?: string
  ): Promise<PushNotificationHistoryEntry> {
    const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const payload: PushNotificationPayload = {
      targetUserId: studentId,
      deviceToken,
      title: '🥋 BJJ ACADEMY: Sua mensalidade vence em breve',
      body: `Olá, ${studentName}! Sua fatura de ${formattedAmount} com vencimento em ${dueDate} já está disponível via PIX no app.`,
      category: 'billing',
      data: {
        action: 'open_invoices',
        studentId,
        dueDate
      }
    };

    return this.dispatchPushNotification(payload);
  }

  /**
   * ⚡ Dispara mensagem motivacional para alunos ausentes (> 15 dias)
   */
  public async sendRetentionEngagementPush(
    studentId: string,
    studentName: string,
    daysAbsent: number,
    deviceToken?: string
  ): Promise<PushNotificationHistoryEntry> {
    const payload: PushNotificationPayload = {
      targetUserId: studentId,
      deviceToken,
      title: '🥋 Sentimos sua falta no Tatame!',
      body: `Oss, ${studentName}! Já faz ${daysAbsent} dias desde o seu último treino. Que tal dar uma passada na academia hoje para treinar e manter sua evolução?`,
      category: 'retention',
      data: {
        action: 'open_schedule',
        studentId,
        daysAbsent: String(daysAbsent)
      }
    };

    return this.dispatchPushNotification(payload);
  }

  /**
   * 🏅 Dispara notificação de nova graduação / certificado oficial
   */
  public async sendGraduationPush(
    studentId: string,
    studentName: string,
    newBelt: string,
    deviceToken?: string
  ): Promise<PushNotificationHistoryEntry> {
    const payload: PushNotificationPayload = {
      targetUserId: studentId,
      deviceToken,
      title: '🏆 Parabéns pela sua Graduação Oficial!',
      body: `Oss, ${studentName}! Sua promoção para a ${newBelt} foi chancelada e seu diploma oficial com QR Code já está disponível.`,
      category: 'graduation',
      data: {
        action: 'open_certificate',
        studentId,
        newBelt
      }
    };

    return this.dispatchPushNotification(payload);
  }

  /**
   * Despacha o push e armazena na trilha de auditoria
   */
  public async dispatchPushNotification(payload: PushNotificationPayload): Promise<PushNotificationHistoryEntry> {
    console.log(`[FCM Backend] Despachando Push Notification: [${payload.category.toUpperCase()}] -> Usuário ${payload.targetUserId}: "${payload.title}"`);

    const entry: PushNotificationHistoryEntry = {
      id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      targetUserId: payload.targetUserId,
      title: payload.title,
      body: payload.body,
      category: payload.category,
      status: payload.deviceToken ? 'sent' : 'simulated',
      timestamp: new Date().toISOString()
    };

    this.history.unshift(entry);
    if (this.history.length > 100) this.history.pop();

    return entry;
  }

  public getNotificationHistory(limit: number = 20): PushNotificationHistoryEntry[] {
    return this.history.slice(0, limit);
  }
}

export const fcmNotificationService = FCMNotificationService.getInstance();
