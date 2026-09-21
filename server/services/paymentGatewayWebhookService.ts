/**
 * ⚡ Webhook Gateway Multi-Provedor (Asaas, Stripe, Mercado Pago)
 * Executa a liquidação e baixa automática de faturas instantaneamente.
 */

export interface UnifiedWebhookEvent {
  gateway: 'asaas' | 'stripe' | 'mercadopago';
  eventType: string;
  externalChargeId: string;
  amount: number;
  status: 'paid' | 'overdue' | 'refunded' | 'canceled';
  paymentMethod: 'pix' | 'credit_card' | 'bank_slip';
  paidAt: string;
  customerEmail?: string;
  customerName?: string;
  tenantId?: string;
}

export class PaymentGatewayWebhookService {
  private static instance: PaymentGatewayWebhookService;

  private constructor() {}

  public static getInstance(): PaymentGatewayWebhookService {
    if (!PaymentGatewayWebhookService.instance) {
      PaymentGatewayWebhookService.instance = new PaymentGatewayWebhookService();
    }
    return PaymentGatewayWebhookService.instance;
  }

  /**
   * Processa webhook padronizado de qualquer gateway com baixa automática
   */
  public parseWebhookPayload(gateway: string, body: any): UnifiedWebhookEvent | null {
    if (gateway === 'asaas') {
      const eventType = body?.event;
      const payment = body?.payment;
      if (!payment) return null;

      let status: 'paid' | 'overdue' | 'refunded' | 'canceled' = 'paid';
      if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
        status = 'paid';
      } else if (eventType === 'PAYMENT_OVERDUE') {
        status = 'overdue';
      } else if (eventType === 'PAYMENT_REFUNDED') {
        status = 'refunded';
      } else {
        return null;
      }

      return {
        gateway: 'asaas',
        eventType,
        externalChargeId: payment.id,
        amount: payment.value || 0,
        status,
        paymentMethod: payment.billingType === 'PIX' ? 'pix' : payment.billingType === 'CREDIT_CARD' ? 'credit_card' : 'bank_slip',
        paidAt: payment.clientPaymentDate || new Date().toISOString(),
        customerEmail: payment.customerEmail,
        customerName: payment.customerName,
        tenantId: payment.customer?.startsWith('acad_') ? payment.customer : 'acad_matriz'
      };
    }

    if (gateway === 'mercadopago') {
      const type = body?.type || body?.action;
      const data = body?.data;
      if (!data) return null;

      return {
        gateway: 'mercadopago',
        eventType: type || 'payment.updated',
        externalChargeId: String(data.id),
        amount: body?.transaction_amount || 0,
        status: 'paid',
        paymentMethod: 'pix',
        paidAt: new Date().toISOString(),
        tenantId: 'acad_matriz'
      };
    }

    if (gateway === 'stripe') {
      const eventType = body?.type;
      const session = body?.data?.object;
      if (!session) return null;

      return {
        gateway: 'stripe',
        eventType,
        externalChargeId: session.id,
        amount: (session.amount_total || session.amount || 0) / 100,
        status: 'paid',
        paymentMethod: 'credit_card',
        paidAt: new Date().toISOString(),
        tenantId: 'acad_matriz'
      };
    }

    return null;
  }
}

export const paymentGatewayWebhookService = PaymentGatewayWebhookService.getInstance();
