import { RespectfulBillingTemplate, Invoice } from '../types';

export function parseInvoiceDate(dueDateStr: string): Date {
  if (!dueDateStr) return new Date();
  if (dueDateStr.includes('/')) {
    const parts = dueDateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
  return new Date(dueDateStr);
}

export interface PriorityDebtAnalysis {
  studentId: string;
  studentName: string;
  totalOverdueCount: number;
  hasMultipleDebts: boolean;
  oldestInvoice: Invoice | null;
  newerInvoices: Invoice[];
  allOverdueInvoices: Invoice[];
  formattedPriorityMessage: string;
  refusalMessage: string;
}

/**
 * Analisa a lista de boletos do aluno e identifica se há múltiplos boletos em atraso (>= 2).
 * Ordena cronologicamente pela data de vencimento e seleciona o mais antigo.
 * Aplica a Trava de Segurança que libera exclusivamente o código de barras/PIX do boleto prioritário.
 */
export function analyzeStudentOverdueDebts(
  studentIdOrName: string,
  invoices: Invoice[],
  academyName: string = 'BJJ Academy'
): PriorityDebtAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Localiza faturas associadas ao aluno por id ou por nome
  const studentInvoices = invoices.filter(inv => 
    (inv.studentId && inv.studentId === studentIdOrName) || 
    (inv.studentName && inv.studentName.toLowerCase().trim() === studentIdOrName.toLowerCase().trim())
  );

  // Filtra boletos em atraso (status 'overdue' ou com vencimento anterior à data de hoje)
  const overdueInvoices = studentInvoices.filter(inv => {
    if (inv.status === 'overdue') return true;
    if (inv.status === 'pending') {
      const due = parseInvoiceDate(inv.dueDate);
      return due < today;
    }
    return false;
  });

  // Mapeamento de Prioridade: Ordena pela data de vencimento (o mais antigo primeiro)
  overdueInvoices.sort((a, b) => {
    return parseInvoiceDate(a.dueDate).getTime() - parseInvoiceDate(b.dueDate).getTime();
  });

  const totalOverdueCount = overdueInvoices.length;
  const hasMultipleDebts = totalOverdueCount >= 2;
  const oldestInvoice = overdueInvoices[0] || null;
  const newerInvoices = overdueInvoices.slice(1);
  const studentName = oldestInvoice?.studentName || studentInvoices[0]?.studentName || studentIdOrName;

  const formattedPriorityMessage = oldestInvoice
    ? generatePriorityDebtCollectionMessage({
        studentName,
        totalOverdueCount,
        oldestInvoice,
        academyName
      })
    : '';

  const refusalMessage = oldestInvoice
    ? generateRecentInvoiceRefusalMessage({
        studentName,
        totalOverdueCount,
        oldestInvoice
      })
    : '';

  return {
    studentId: studentIdOrName,
    studentName,
    totalOverdueCount,
    hasMultipleDebts,
    oldestInvoice,
    newerInvoices,
    allOverdueInvoices: overdueInvoices,
    formattedPriorityMessage,
    refusalMessage
  };
}

/**
 * Mensagem Oficial do Assistente Virtual de Atendimento e Cobrança
 * Notifica explicitamente a quantidade de débitos e envia os dados exclusivamente do boleto MAIS ANTIGO.
 */
export function generatePriorityDebtCollectionMessage(params: {
  studentName: string;
  totalOverdueCount: number;
  oldestInvoice: Invoice;
  academyName?: string;
}): string {
  const { studentName, totalOverdueCount, oldestInvoice } = params;
  const updatedAmount = oldestInvoice.totalUpdatedAmount || oldestInvoice.amount;
  const formattedAmount = updatedAmount.toFixed(2).replace('.', ',');
  const pixOrBarcode = oldestInvoice.pixCode || oldestInvoice.invoiceNumber || 'Chave PIX da Academia';

  if (totalOverdueCount >= 2) {
    return `Olá, ${studentName}!

Identificamos que você possui ${totalOverdueCount} boletos pendentes em seu cadastro. 

Para evitar a incidência de novos juros, bloqueio de serviços ou o pagamento da fatura errada, estamos enviando abaixo os dados para quitação do seu boleto MAIS ANTIGO:

📌 Referência: ${oldestInvoice.title}
🗓 Vencimento original: ${oldestInvoice.dueDate}
💰 Valor atualizado: R$ ${formattedAmount}

Código Pix / Linha Digitável para pagamento:
${pixOrBarcode}

⚠️ IMPORTANTE: Por padrão de segurança, a quitação deve seguir a ordem de vencimento. Assim que este pagamento for compensado em nosso sistema, enviaremos os dados para regularização dos demais.`;
  }

  return `Olá, ${studentName}!

Identificamos 1 boleto pendente em seu cadastro:

📌 Referência: ${oldestInvoice.title}
🗓 Vencimento original: ${oldestInvoice.dueDate}
💰 Valor atualizado: R$ ${formattedAmount}

Código Pix / Linha Digitável para pagamento:
${pixOrBarcode}

⚠️ IMPORTANTE: Para evitar juros e suspensão de acesso ao tatame, pedimos a gentileza de realizar a quitação assim que possível. Qualquer dúvida estamos à disposição!`;
}

/**
 * Resposta Amigável de Recusa do Envio de Boleto Recente
 * Se o cliente solicitar a chave de um boleto mais recente enquanto houver um anterior em aberto.
 */
export function generateRecentInvoiceRefusalMessage(params: {
  studentName: string;
  totalOverdueCount: number;
  oldestInvoice: Invoice;
}): string {
  const { studentName, totalOverdueCount, oldestInvoice } = params;
  return `Olá, ${studentName}! Compreendemos o seu pedido, mas por padrão de segurança financeira da sua conta, nosso sistema segue estritamente a ordem cronológica de vencimento.

Você possui ${totalOverdueCount} boletos pendentes no sistema, e liberamos exclusivamente a quitação da fatura mais antiga primeiro (${oldestInvoice.title}, com vencimento original em ${oldestInvoice.dueDate}). O pagamento de faturas mais recentes não quitaria o atraso prioritário nem suspenderia o acúmulo de juros do débito mais antigo.

Assim que a compensação deste boleto for identificada em nosso sistema, enviaremos imediatamente os dados para a regularização dos demais. Contamos com a sua compreensão e estamos à disposição!`;
}

export function getRespectfulBillingMessage(
  type: 'preventive' | 'due_today' | 'polite_late' | 'kiosk_discrete' | 'priority_debt',
  studentName: string,
  academyName: string,
  amount: number,
  dueDateStr: string,
  pixKey: string,
  totalOverdueCount: number = 1,
  oldestTitle?: string
): RespectfulBillingTemplate {
  const firstName = studentName.split(' ')[0];
  const formattedAmount = `R$ ${amount.toFixed(2).replace('.', ',')}`;

  switch (type) {
    case 'priority_debt':
      return {
        type: 'priority_debt',
        title: `Trava de Segurança: Boleto Mais Antigo Prioritário (${totalOverdueCount} pendências)`,
        body: totalOverdueCount >= 2
          ? `Olá, ${studentName}!

Identificamos que você possui ${totalOverdueCount} boletos pendentes em seu cadastro. 

Para evitar a incidência de novos juros, bloqueio de serviços ou o pagamento da fatura errada, estamos enviando abaixo os dados para quitação do seu boleto MAIS ANTIGO:

📌 Referência: ${oldestTitle || 'Mensalidade do Tatame'}
🗓 Vencimento original: ${dueDateStr}
💰 Valor atualizado: ${formattedAmount}

Código Pix / Linha Digitável para pagamento:
${pixKey}

⚠️ IMPORTANTE: Por padrão de segurança, a quitação deve seguir a ordem de vencimento. Assim que este pagamento for compensado em nosso sistema, enviaremos os dados para regularização dos demais.`
          : `Olá, ${studentName}!\nIdentificamos 1 boleto pendente em seu cadastro:\n📌 Referência: ${oldestTitle || 'Mensalidade do Tatame'}\n🗓 Vencimento original: ${dueDateStr}\n💰 Valor atualizado: ${formattedAmount}\n\nCódigo Pix / Linha Digitável:\n${pixKey}`,
        pixKeyText: pixKey
      };

    case 'preventive':
      return {
        type,
        title: 'Lembrete Amigável (3 dias antes)',
        body: `Oss, ${firstName}! Tudo bem?\nPassando para lembrar que sua mensalidade na ${academyName} vence no dia ${dueDateStr} (${formattedAmount}).\n🔑 Chave PIX da Academia: ${pixKey}\n📲 Envie o comprovante para este número assim que realizar o pagamento.\nManter seu plano em dia nos ajuda a manter a estrutura e o tatame sempre impecáveis para a sua evolução! 🥋🔥`,
        pixKeyText: pixKey
      };

    case 'due_today':
      return {
        type,
        title: 'Vencimento Hoje',
        body: `Oss, guerreiro ${firstName}!\nSua mensalidade na ${academyName} vence hoje (${dueDateStr}) no valor de ${formattedAmount}.\n🔑 Chave PIX da Academia: ${pixKey}\n📲 Envie o comprovante para este número para darmos baixa imediata. Nos vemos no tatame mais tarde! 🥋🤝`,
        pixKeyText: pixKey
      };

    case 'polite_late':
      return {
        type,
        title: 'Aviso Respeitoso (Após vencimento)',
        body: `Olá, ${firstName}! Esperamos que você e sua família estejam ótimos.\nIdentificamos uma pendência da mensalidade com vencimento em ${dueDateStr} (${formattedAmount}) na ${academyName}.\n🔑 Chave PIX da Academia: ${pixKey}\n📲 Envie o comprovante para este número para regularização imediata do seu acesso. Qualquer dúvida, nossa recepção está à disposição. Oss! 🥋🙏`,
        pixKeyText: pixKey
      };

    case 'kiosk_discrete':
      return {
        type,
        title: 'Mensagem Discreta de Recepção / Catraca',
        body: `Bem-vindo, ${firstName}! Por gentileza, antes de subir ao tatame, dê uma passada rápida na recepção com nossa equipe para atualizarmos seu cadastro. Bom treino!`,
        pixKeyText: pixKey
      };
  }
}
