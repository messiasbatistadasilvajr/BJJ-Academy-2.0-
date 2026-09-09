import { Invoice, PayableExpense, SansaoFinancialQueryResult } from '../../src/types';

export class SansaoFinancialQueryService {
  /**
   * Responds to natural language financial queries strictly in READ-ONLY mode.
   * Guarantees zero mutations on financial ledger.
   */
  public static answerFinancialQuery(
    queryText: string,
    invoices: Invoice[],
    expenses: PayableExpense[] = [],
    tenantId = 'all'
  ): SansaoFinancialQueryResult {
    const q = queryText.toLowerCase().trim();

    // Multi-tenant filter
    const tenantInvoices = invoices.filter(inv => {
      if (tenantId === 'all') return true;
      return inv.academyId === tenantId || inv.tenantId === tenantId;
    });

    const tenantExpenses = expenses.filter(exp => {
      if (tenantId === 'all') return true;
      return exp.tenantId === tenantId;
    });

    const paidInvoices = tenantInvoices.filter(i => i.status === 'paid');
    const pendingInvoices = tenantInvoices.filter(i => i.status === 'pending');
    const overdueInvoices = tenantInvoices.filter(i => i.status === 'overdue');

    const totalPaid = paidInvoices.reduce((acc, c) => acc + c.amount, 0);
    const totalPending = pendingInvoices.reduce((acc, c) => acc + c.amount, 0);
    const totalOverdue = overdueInvoices.reduce((acc, c) => acc + (c.totalUpdatedAmount || c.amount), 0);

    const paidExpenses = tenantExpenses.filter(e => e.status === 'paid');
    const pendingExpenses = tenantExpenses.filter(e => e.status === 'pending' || e.status === 'overdue');
    const totalExpensesPaid = paidExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalExpensesPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);

    const realCashBalance = Math.max(0, totalPaid - totalExpensesPaid);

    let answer = '';
    const metrics: Record<string, any> = {
      totalPaid,
      totalPending,
      totalOverdue,
      countOverdue: overdueInvoices.length,
      realCashBalance,
      totalExpensesPending
    };

    if (q.includes('inadimplente') || q.includes('devendo') || q.includes('atraso') || q.includes('quem deve')) {
      if (overdueInvoices.length === 0) {
        answer = 'Excelente notícia, Mestre! No momento não há nenhum aluno com faturas em atraso sob a sua gestão. A inadimplência está em 0%.';
      } else {
        const studentList = overdueInvoices
          .map(i => `• ${i.studentName}: R$ ${(i.totalUpdatedAmount || i.amount).toFixed(2)} (vencido em ${i.dueDate})`)
          .join('\n');
        answer = `Atualmente temos ${overdueInvoices.length} cobrança(s) em atraso, totalizando R$ ${totalOverdue.toFixed(2)} com encargos legais aplicados:\n\n${studentList}\n\nVocê pode gerar a 2ª via com juros ou cobrar amigavelmente via WhatsApp com 1 clique.`;
      }
    } else if (q.includes('receber') || q.includes('previsão') || q.includes('previsto')) {
      answer = `Você tem R$ ${totalPending.toFixed(2)} a receber em mensalidades vigentes neste mês (total de ${pendingInvoices.length} faturas aguardando pagamento), além de R$ ${totalOverdue.toFixed(2)} em cobranças em atraso. Faturamento previsto total: R$ ${(totalPaid + totalPending).toFixed(2)}.`;
    } else if (q.includes('recebi') || q.includes('liquidado') || q.includes('caixa') || q.includes('hoje')) {
      answer = `Até o momento foram liquidados R$ ${totalPaid.toFixed(2)} em ${paidInvoices.length} pagamentos confirmados via PIX e Asaas. Descontando despesas quitadas de R$ ${totalExpensesPaid.toFixed(2)}, o saldo líquido disponível em caixa é de R$ ${realCashBalance.toFixed(2)}.`;
    } else if (q.includes('pagar') || q.includes('despesa') || q.includes('conta')) {
      answer = `Você possui R$ ${totalExpensesPending.toFixed(2)} em contas a pagar pendentes para esta competência (${pendingExpenses.length} despesas operacionais cadastradas, incluindo aluguel e utilidades).`;
    } else {
      answer = `Visão Financeira Geral:\n• Total Recebido: R$ ${totalPaid.toFixed(2)} (${paidInvoices.length} alunos)\n• A Receber: R$ ${totalPending.toFixed(2)} (${pendingInvoices.length} faturas)\n• Inadimplência: R$ ${totalOverdue.toFixed(2)} (${overdueInvoices.length} faturas)\n• Saldo Líquido em Caixa: R$ ${realCashBalance.toFixed(2)}\n\nTodas as informações são consultadas em tempo real com garantia de segurança somente-leitura.`;
    }

    return {
      query: queryText,
      answer,
      metrics,
      timestamp: new Date().toISOString(),
      readOnlyGuaranteed: true
    };
  }
}
