import { AsaasWebhookPayload } from '../../src/types';

export interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  sanitizedPayload?: AsaasWebhookPayload;
  chargeId?: string;
  internalReference?: string;
  eventType?: string;
}

const KNOWN_ASAAS_EVENTS = new Set([
  'PAYMENT_CREATED',
  'PAYMENT_AWAITING_RISK_ANALYSIS',
  'PAYMENT_APPROVED_BY_RISK_ANALYSIS',
  'PAYMENT_REAUTHORIZED',
  'PAYMENT_UPDATED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED',
  'PAYMENT_ANTICIPATED',
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_RESTORED',
  'PAYMENT_REFUNDED',
  'PAYMENT_PARTIALLY_REFUNDED',
  'PAYMENT_REFUND_IN_PROGRESS',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'PAYMENT_CHARGEBACK_DISPUTE',
  'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
  'PAYMENT_DUNNING_RECEIVED',
  'PAYMENT_DUNNING_REQUESTED',
  'PAYMENT_BANK_SLIP_VIEWED',
  'PAYMENT_CHECKOUT_VIEWED'
]);

/**
 * Validates Asaas Webhook Authenticity via asaas-access-token header
 */
export function validateWebhookAuth(tokenHeader: string | undefined): { isAuthorized: boolean; reason?: string } {
  const expectedToken = process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

  // If ASAAS_WEBHOOK_ACCESS_TOKEN is configured in the environment, enforce strict match
  if (expectedToken && expectedToken.trim().length > 0) {
    if (!tokenHeader || tokenHeader.trim() !== expectedToken.trim()) {
      return {
        isAuthorized: false,
        reason: 'Invalid or missing asaas-access-token header'
      };
    }
  }

  // In development/test mode without a strict env token set, allow standard requests
  return { isAuthorized: true };
}

/**
 * Validates Asaas webhook payload structure and contents
 */
export function validateAsaasPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errorCode: 'INVALID_PAYLOAD_BODY',
      errorMessage: 'O corpo do webhook deve ser um objeto JSON válido.'
    };
  }

  const payload = body as Record<string, any>;

  // 1. Validate event field
  if (!payload.event || typeof payload.event !== 'string' || payload.event.trim().length === 0) {
    return {
      isValid: false,
      errorCode: 'MISSING_EVENT_TYPE',
      errorMessage: 'Campo "event" ausente ou inválido no payload Asaas.'
    };
  }

  const eventType = payload.event.trim();

  // 2. Validate payment data
  const payment = payload.payment;
  if (!payment || typeof payment !== 'object') {
    // Some event types might pass ID directly (e.g. transfer or subscription)
    if (!payload.id) {
      return {
        isValid: false,
        errorCode: 'MISSING_PAYMENT_ENTITY',
        errorMessage: 'Payload não contém objeto "payment" nem identificador da transação.'
      };
    }
  }

  const chargeId = payment?.id || payload.id;
  if (!chargeId || typeof chargeId !== 'string') {
    return {
      isValid: false,
      errorCode: 'INVALID_CHARGE_ID',
      errorMessage: 'ID da cobrança Asaas ausente ou inválido.'
    };
  }

  // 3. Validate amounts if present
  if (payment && typeof payment.value === 'number' && payment.value < 0) {
    return {
      isValid: false,
      errorCode: 'INVALID_AMOUNT',
      errorMessage: 'Valor da cobrança não pode ser negativo.'
    };
  }

  // 4. Extract externalReference (internal invoice id or student id)
  const internalReference = payment?.externalReference || payment?.invoiceNumber || chargeId;

  // 5. Build sanitized payload (never exposing sensitive tokens or card details)
  const sanitized: AsaasWebhookPayload = {
    event: eventType,
    id: payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    dateCreated: payload.dateCreated || new Date().toISOString(),
    payment: payment ? {
      object: payment.object || 'payment',
      id: payment.id,
      value: payment.value ?? 0,
      netValue: payment.netValue,
      originalValue: payment.originalValue,
      interestValue: payment.interestValue,
      description: payment.description,
      billingType: payment.billingType || 'PIX',
      status: payment.status || 'RECEIVED',
      dueDate: payment.dueDate || new Date().toISOString().split('T')[0],
      paymentDate: payment.paymentDate,
      clientPaymentDate: payment.clientPaymentDate,
      confirmedDate: payment.confirmedDate,
      invoiceUrl: payment.invoiceUrl,
      invoiceNumber: payment.invoiceNumber,
      externalReference: payment.externalReference,
      pixTransaction: payment.pixTransaction,
      customer: payment.customer
    } : undefined
  };

  return {
    isValid: true,
    eventType,
    chargeId,
    internalReference,
    sanitizedPayload: sanitized
  };
}

/**
 * Sanitizes log information for security compliance (PCI-DSS / LGPD)
 */
export function sanitizeLogOutput(obj: any): string {
  try {
    const copy = JSON.parse(JSON.stringify(obj));
    // Redact any potential card numbers, tokens or secret headers
    const redactKeys = ['token', 'secret', 'password', 'creditCardNumber', 'cvv', 'asaas-access-token', 'apiKey'];
    const traverse = (o: any) => {
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) {
        if (redactKeys.some(rk => k.toLowerCase().includes(rk.toLowerCase()))) {
          o[k] = '[REDACTED]';
        } else if (typeof o[k] === 'object') {
          traverse(o[k]);
        }
      }
    };
    traverse(copy);
    return JSON.stringify(copy);
  } catch {
    return '[Log serialization error]';
  }
}
