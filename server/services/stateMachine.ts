export type InternalInvoiceStatus = 'paid' | 'pending' | 'overdue' | 'refunded' | 'canceled';

interface TransitionRule {
  from: InternalInvoiceStatus;
  to: InternalInvoiceStatus;
  allowed: boolean;
  description: string;
}

const ALLOWED_TRANSITIONS: Record<InternalInvoiceStatus, InternalInvoiceStatus[]> = {
  pending: ['paid', 'overdue', 'canceled'],
  overdue: ['paid', 'canceled'],
  paid: ['refunded'],
  refunded: [],
  canceled: ['pending'] // in rare manual uncancel case
};

export class FinancialStateMachine {
  /**
   * Validates whether moving an invoice from currentStatus to targetStatus is legally valid
   */
  public static canTransition(currentStatus: InternalInvoiceStatus, targetStatus: InternalInvoiceStatus): boolean {
    // If status is unchanged, it is always a safe idempotent operation
    if (currentStatus === targetStatus) return true;

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowedNext.includes(targetStatus);
  }

  /**
   * Maps an incoming Asaas webhook event to internal Invoice status
   */
  public static mapAsaasEventToStatus(eventType: string): InternalInvoiceStatus | null {
    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_DUNNING_RECEIVED':
      case 'PAYMENT_ANTICIPATED':
        return 'paid';

      case 'PAYMENT_OVERDUE':
        return 'overdue';

      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_PARTIALLY_REFUNDED':
        return 'refunded';

      case 'PAYMENT_DELETED':
        return 'canceled';

      case 'PAYMENT_CREATED':
      case 'PAYMENT_UPDATED':
      case 'PAYMENT_RESTORED':
        return 'pending';

      default:
        // Other events (e.g. PAYMENT_CHECKOUT_VIEWED) do not mutate the core financial status
        return null;
    }
  }

  /**
   * Evaluates state machine transition and provides diagnostic explanation
   */
  public static evaluateTransition(
    currentStatus: InternalInvoiceStatus,
    targetStatus: InternalInvoiceStatus,
    eventType: string
  ): { isValid: boolean; action: 'apply' | 'ignore_obsolete' | 'reject'; message: string } {
    if (currentStatus === targetStatus) {
      return {
        isValid: true,
        action: 'apply',
        message: `Status já é ${currentStatus}. Operação idempotente confirmada.`
      };
    }

    // Protection against late webhooks arriving after payment
    if ((currentStatus === 'paid') && (targetStatus === 'overdue' || targetStatus === 'pending')) {
      return {
        isValid: false,
        action: 'ignore_obsolete',
        message: `Proteção de Máquina de Estados: Cobrança já liquidada (paid). Evento obsoleto "${eventType}" ignorado com sucesso para não corromper o saldo.`
      };
    }

    const isAllowed = this.canTransition(currentStatus, targetStatus);
    if (!isAllowed) {
      return {
        isValid: false,
        action: 'reject',
        message: `Transição inválida de "${currentStatus}" para "${targetStatus}" disparada pelo evento "${eventType}".`
      };
    }

    return {
      isValid: true,
      action: 'apply',
      message: `Transição válida de "${currentStatus}" para "${targetStatus}".`
    };
  }
}
