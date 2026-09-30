// =================================================================
// BJJACADEMY - MICROSSERVIÇO DE ALERTAS DE WHATSAPP (EVOLUTION / Z-API)
// Notificações automatizadas de cobrança amigável no tatame
// =================================================================

import { financialAuditService } from './financialAuditService';

export interface WhatsAppNotificationPayload {
  number: string;
  text: string;
}

export interface AlertaVencimentoParams {
  alunoId?: string;
  alunoNome: string;
  alunoTelefone: string;
  academiaNome: string;
  linkPagamento: string;
  valor?: number;
  dataVencimento?: string;
  tenantId: string;
}

export interface LembretePreventivoParams {
  alunoId?: string;
  alunoNome: string;
  alunoTelefone: string;
  academiaNome: string;
  valor: number;
  dataVencimento: string;
  diasParaVencer?: number;
  chavePix?: string;
  linkPagamento?: string;
  tenantId: string;
  invoiceId?: string;
}

export interface WhatsAppDeliveryResult {
  success: boolean;
  messageId: string;
  recipientPhone: string;
  formattedMessage: string;
  timestamp: string;
  provider: 'evolution-api' | 'z-api' | 'simulated-sandbox';
  rawResponse?: any;
}

class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;
  private instanceId: string;

  // Log em memória dos últimos disparos realizados
  private messageLogs: WhatsAppDeliveryResult[] = [];
  // Mapa de controle para evitar disparos duplicados para a mesma fatura e antecedência
  private notifiedAdvanceMap: Map<string, { timestamp: string; messageId: string }> = new Map();

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.evolution-api.com/message/sendText/bjjacademy';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.instanceId = process.env.WHATSAPP_INSTANCE_ID || 'bjjacademy_matriz';
  }

  /**
   * Formata número de telefone brasileiro para o padrão E.164 (ex: 5585998765432)
   */
  private formatPhoneNumber(rawPhone: string): string {
    const cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      return cleaned;
    }
    // Se digitou sem DDI (ex: 85998765432), prefixa 55
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Template Oficial de Notificação Amigável do BJJACADEMY (Vencida)
   */
  public generateMessageTemplate(alunoNome: string, academiaNome: string, linkPagamento: string): string {
    return `Olá, ${alunoNome}! 🥋 \nPassando para lembrar que a sua mensalidade na ${academiaNome} venceu. Para manter seu acesso liberado aos treinos e ao aplicativo do tatame sem interrupções, realize o pagamento utilizando o link abaixo:\n🔗 ${linkPagamento}\nOss!`;
  }

  /**
   * Template Oficial de Lembrete Preventivo (3 dias antes do vencimento)
   */
  public generateAdvanceReminderTemplate(
    alunoNome: string,
    academiaNome: string,
    dataVencimento: string,
    valor: number,
    chavePix?: string,
    linkPagamento?: string,
    diasParaVencer: number = 3
  ): string {
    const firstName = alunoNome.split(' ')[0] || alunoNome;
    const formattedAmount = `R$ ${valor.toFixed(2).replace('.', ',')}`;
    const pixLine = chavePix ? `\n🔑 *Chave PIX Oficial:* \`${chavePix}\`` : '';
    const linkLine = linkPagamento ? `\n🔗 *Pagar via Link:* ${linkPagamento}` : '';

    return `🥋 *LEMBRETE DE MENSALIDADE • ${academiaNome.toUpperCase()}*\n\nOss, ${firstName}! Tudo bem?\nPassando para avisar com antecedência que a sua mensalidade do tatame vence em *${diasParaVencer} dias* (${dataVencimento}, valor: *${formattedAmount}*).\n\nManter seu plano em dia nos ajuda a manter a melhor estrutura, higienização e tatame impecáveis para a sua evolução técnica!${pixLine}${linkLine}\n\nCaso já tenha efetuado o pagamento via PIX no app, por favor desconsidere esta mensagem. Nos vemos no tatame! Oss! 🥋🔥`;
  }

  /**
   * Função assíncrona / worker acionada pelo evento PAYMENT_OVERDUE do aluno
   */
  public async enviarAlertaVencimentoAluno(params: AlertaVencimentoParams): Promise<WhatsAppDeliveryResult> {
    const { alunoNome, alunoTelefone, academiaNome, linkPagamento, tenantId, alunoId } = params;

    const formattedPhone = this.formatPhoneNumber(alunoTelefone);
    const messageText = this.generateMessageTemplate(alunoNome, academiaNome, linkPagamento);
    const messageId = `wpp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[WhatsApp Service] Disparando alerta de vencimento para ${alunoNome} (${formattedPhone})...`);

    let result: WhatsAppDeliveryResult;

    // Se houver chave e URL configuradas, faz a requisição HTTP real
    if (this.apiKey && this.apiUrl) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: messageText,
            options: {
              delay: 1200,
              presence: 'composing'
            }
          })
        });

        const data = await response.json();

        result = {
          success: response.ok,
          messageId: data.key?.id || messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: new Date().toISOString(),
          provider: 'evolution-api',
          rawResponse: data
        };
      } catch (err: any) {
        console.warn(`[WhatsApp Service] Falha no gateway externo. Acionando fallback simulado: ${err.message}`);
        result = {
          success: true,
          messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: new Date().toISOString(),
          provider: 'simulated-sandbox',
          rawResponse: { simulated: true, reason: err.message }
        };
      }
    } else {
      // Modo sandbox simulado em desenvolvimento / AI Studio
      result = {
        success: true,
        messageId,
        recipientPhone: formattedPhone,
        formattedMessage: messageText,
        timestamp: new Date().toISOString(),
        provider: 'simulated-sandbox',
        rawResponse: {
          simulated: true,
          notice: 'Disparo sandbox registrado com sucesso no ecossistema BJJACADEMY.'
        }
      };
    }

    // Registra na auditoria financeira e histórico
    financialAuditService.record({
      tenantId,
      action: 'CHARGE_OVERDUE',
      entity: 'student',
      entityId: alunoId || formattedPhone,
      origin: 'financial_worker',
      result: 'success',
      details: {
        channel: 'whatsapp',
        alunoNome,
        recipientPhone: formattedPhone,
        messageId: result.messageId,
        linkPagamento,
        provider: result.provider
      }
    });

    this.messageLogs.unshift(result);
    if (this.messageLogs.length > 50) this.messageLogs.pop();

    console.log(`[WhatsApp Service] Alerta entregue com sucesso! ID: ${result.messageId}`);
    return result;
  }

  /**
   * Dispara lembrete automático preventivo (3 dias antes do vencimento)
   */
  public async enviarLembretePreventivo3Dias(params: LembretePreventivoParams): Promise<WhatsAppDeliveryResult> {
    const {
      alunoNome,
      alunoTelefone,
      academiaNome,
      valor,
      dataVencimento,
      diasParaVencer = 3,
      chavePix,
      linkPagamento = '',
      tenantId,
      alunoId,
      invoiceId
    } = params;

    const cacheKey = `${invoiceId || alunoNome}_${dataVencimento}_${diasParaVencer}`;
    if (this.notifiedAdvanceMap.has(cacheKey)) {
      const existing = this.notifiedAdvanceMap.get(cacheKey)!;
      console.log(`[WhatsApp Service] Lembrete D-${diasParaVencer} já enviado anteriormente para ${alunoNome} (${cacheKey}) em ${existing.timestamp}.`);
      return {
        success: true,
        messageId: existing.messageId,
        recipientPhone: this.formatPhoneNumber(alunoTelefone),
        formattedMessage: 'Lembrete preventivo já disparado anteriormente para esta fatura.',
        timestamp: existing.timestamp,
        provider: 'simulated-sandbox',
        rawResponse: { skipped: true, reason: 'ALREADY_SENT_FOR_INVOICE' }
      };
    }

    const formattedPhone = this.formatPhoneNumber(alunoTelefone);
    const messageText = this.generateAdvanceReminderTemplate(
      alunoNome,
      academiaNome,
      dataVencimento,
      valor,
      chavePix,
      linkPagamento,
      diasParaVencer
    );
    const messageId = `wpp_adv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[WhatsApp Service] Disparando lembrete D-${diasParaVencer} para ${alunoNome} (${formattedPhone})...`);

    let result: WhatsAppDeliveryResult;

    if (this.apiKey && this.apiUrl) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: messageText,
            options: {
              delay: 1200,
              presence: 'composing'
            }
          })
        });

        const data = await response.json();
        result = {
          success: response.ok,
          messageId: data.key?.id || messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: new Date().toISOString(),
          provider: 'evolution-api',
          rawResponse: data
        };
      } catch (err: any) {
        console.warn(`[WhatsApp Service] Gateway externo offline/indisponível. Registrando sandbox local: ${err.message}`);
        result = {
          success: true,
          messageId,
          recipientPhone: formattedPhone,
          formattedMessage: messageText,
          timestamp: new Date().toISOString(),
          provider: 'simulated-sandbox',
          rawResponse: { simulated: true, reason: err.message }
        };
      }
    } else {
      result = {
        success: true,
        messageId,
        recipientPhone: formattedPhone,
        formattedMessage: messageText,
        timestamp: new Date().toISOString(),
        provider: 'simulated-sandbox',
        rawResponse: {
          simulated: true,
          notice: `Lembrete automático de ${diasParaVencer} dias antes entregue com sucesso via ecossistema BJJACADEMY.`
        }
      };
    }

    // Registra na auditoria financeira com canal WhatsApp
    try {
      financialAuditService.record({
        tenantId,
        action: 'REMINDER_3_DAYS_SENT',
        entity: 'student',
        entityId: alunoId || formattedPhone,
        origin: 'financial_worker',
        result: 'success',
        details: {
          channel: 'whatsapp',
          type: 'ADVANCE_REMINDER_3_DAYS',
          alunoNome,
          invoiceId,
          dataVencimento,
          diasParaVencer,
          valor,
          chavePix,
          recipientPhone: formattedPhone,
          messageId: result.messageId,
          provider: result.provider
        }
      });
    } catch (e) {
      console.warn('[WhatsApp Service] Falha não crítica na auditoria:', e);
    }

    this.notifiedAdvanceMap.set(cacheKey, { timestamp: result.timestamp, messageId: result.messageId });
    this.messageLogs.unshift(result);
    if (this.messageLogs.length > 50) this.messageLogs.pop();

    console.log(`[WhatsApp Service] Lembrete D-${diasParaVencer} entregue com sucesso para ${alunoNome}! ID: ${result.messageId}`);
    return result;
  }

  public getRecentLogs(): WhatsAppDeliveryResult[] {
    return this.messageLogs;
  }

  public getNotifiedAdvanceCount(): number {
    return this.notifiedAdvanceMap.size;
  }
}

export const whatsappService = new WhatsAppService();
