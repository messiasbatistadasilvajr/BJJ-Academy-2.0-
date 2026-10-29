import { Invoice } from '../types';

/**
 * Creates and opens a WhatsApp chat with a pre-formatted, professional receipt message.
 */
export function sendReceiptViaWhatsApp(invoice: Invoice, academyName: string = 'BJJ Academy') {
  const amountFormatted = invoice.amount.toFixed(2).replace('.', ',');
  const methodLabel =
    invoice.manualPaymentMethod ||
    (invoice.paymentMethod === 'dinheiro'
      ? 'Dinheiro (Espécie)'
      : invoice.paymentMethod === 'cartao_balcao' || invoice.paymentMethod === 'cartao'
      ? 'Cartão (Maquininha Física)'
      : 'PIX Direto da Academia');

  const text = 
`🥋 *COMPROVANTE DE PAGAMENTO • BJJ ACADEMY*
🏢 *Academia:* ${academyName}
👤 *Aluno/Pagador:* ${invoice.studentName}
📄 *Nº do Recibo:* ${invoice.invoiceNumber}
📝 *Referência:* ${invoice.title}
💰 *Valor Pago:* R$ ${amountFormatted}
📅 *Data de Liquidação:* ${invoice.paidDate || new Date().toLocaleDateString('pt-BR')}
💳 *Forma de Pagamento:* ${methodLabel}
🔒 *Autenticação Digital:* #BJJ-${Math.floor(100000 + Math.random() * 900000)}

_Agradecemos a pontualidade. Bons treinos no tatame! Oss!_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Creates and opens a WhatsApp message with a gentle, polite invoice reminder (aviso de vencimento)
 * containing the academy PIX key and the instruction "Envie o comprovante para este número".
 */
export function sendReminderViaWhatsApp(
  invoice: Invoice,
  updatedAmountOrAcademy?: number | string,
  academyName: string = 'BJJ Academy',
  pixKey?: string
) {
  let finalAmount = invoice.amount;
  let customAcademy = academyName;

  if (typeof updatedAmountOrAcademy === 'number') {
    finalAmount = updatedAmountOrAcademy;
  } else if (typeof updatedAmountOrAcademy === 'string' && !isNaN(Number(updatedAmountOrAcademy))) {
    finalAmount = Number(updatedAmountOrAcademy);
  } else if (typeof updatedAmountOrAcademy === 'string') {
    customAcademy = updatedAmountOrAcademy;
  }

  const amountFormatted = finalAmount.toFixed(2).replace('.', ',');
  const effectivePix = pixKey || invoice.pixCode || '58087630378';
  const pixInfo = `\n🔑 *Chave PIX da Academia:* \`${effectivePix}\`\n📲 *Importante:* Envie o comprovante para este número para darmos baixa imediata no seu acesso.`;

  const isOverdue = invoice.status === 'overdue';
  const header = isOverdue
    ? `🥋 *NOTIFICAÇÃO DE MENSALIDADE EM ABERTO • ${customAcademy.toUpperCase()}*`
    : `🥋 *LEMBRETE DE MENSALIDADE • ${customAcademy.toUpperCase()}*`;

  const bodyText = isOverdue
    ? `Sua mensalidade referente a *"${invoice.title}"* venceu na data *${invoice.dueDate}*.\n💰 *Valor Atualizado:* R$ ${amountFormatted}${pixInfo}`
    : `Passando para lembrar que a mensalidade do tatame referente a *"${invoice.title}"* vence em *${invoice.dueDate}*.\n💰 *Valor:* R$ ${amountFormatted}${pixInfo}`;

  const text = 
`${header}
Olá, *${invoice.studentName}*! Tudo bem?

${bodyText}

Qualquer dúvida, fale com a recepção.
_Nos vemos no tatame! Oss!_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Dispara lembrete amigável específico com antecedência de 3 dias (D-3)
 */
export function sendAdvance3DaysReminderViaWhatsApp(
  invoice: Invoice,
  studentPhone?: string,
  academyName: string = 'BJJ Academy',
  pixKey?: string
) {
  const amountFormatted = invoice.amount.toFixed(2).replace('.', ',');
  const pix = pixKey || invoice.pixCode || '58087630378';
  const phoneParam = studentPhone ? `phone=${studentPhone.replace(/\D/g, '')}&` : '';

  const text =
`🥋 *LEMBRETE ANTECIPADO (3 DIAS) • ${academyName.toUpperCase()}*

Oss, *${invoice.studentName}*! Tudo bem? 🥋
Passando para avisar com antecedência que a sua mensalidade do tatame (*"${invoice.title}"*) vence em *3 dias* (${invoice.dueDate}).

💰 *Valor:* R$ ${amountFormatted}
🔑 *Chave PIX da Academia:* \`${pix}\`
📲 *Importante:* Envie o comprovante para este número assim que realizar o pagamento.

Manter seu plano em dia nos ajuda a manter a melhor estrutura, tatame limpo e ambiente propício para a sua evolução rumo aos próximos graus! 🔥

_Nos vemos no tatame! Oss!_`;

  const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Creates a notification when a student misses training.
 */
export function sendMissedClassWhatsApp(studentName: string, className: string, academyName: string = 'BJJ Academy') {
  const text = 
`🥋 *SENTIMOS SUA FALTA NO TATAME! • ${academyName.toUpperCase()}*
Olá, *${studentName}*!

Notamos que você não pôde comparecer ao treino de hoje (*${className}*).

Lembre-se de manter a constância para conquistar seus próximos graus e evolução na faixa! Esperamos você no próximo horário.

_Foco na jornada! Oss!_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Generates the URL for a personalized WhatsApp message for the Retention / Churn Radar.
 */
export function getRetentionRescueWhatsAppUrl(
  studentName: string,
  studentPhone: string,
  daysAbsent: number,
  academyName: string = 'BJJ Academy',
  customMessage?: string,
  preferredTime?: string
): string {
  const cleanPhone = studentPhone.replace(/\D/g, '');
  const phoneParam = cleanPhone.length >= 10 ? `phone=55${cleanPhone}&` : '';

  const defaultText = 
`🥋 *FALA, ${studentName.toUpperCase()}! • ${academyName.toUpperCase()}*

Tudo bem, guerreiro(a)? Sentimos muito a sua falta no tatame!

Notamos que já faz *${daysAbsent} dias* desde o seu último rola com a gente.${preferredTime ? `\nSeu horário preferido (${preferredTime}) continua com a galera toda reunida.` : ''}

A disciplina vence o cansaço e a consistência é o verdadeiro segredo para a evolução no Jiu-Jitsu. Dá uma passada hoje nem que seja para rever a galera e soltar o corpo!

Qualquer coisa que você esteja passando ou precisando ajustar na sua rotina, conte sempre com nossa equipe.

_Nos vemos no tatame hoje? Um forte abraço e OSS! 🥋🔥_`;

  const text = customMessage || defaultText;
  return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
}

/**
 * Creates a personalized WhatsApp message for the Retention / Churn Radar.
 */
export function sendRetentionRescueWhatsApp(
  studentName: string,
  studentPhone: string,
  daysAbsent: number,
  academyName: string = 'BJJ Academy',
  customMessage?: string,
  preferredTime?: string
): string {
  const url = getRetentionRescueWhatsAppUrl(studentName, studentPhone, daysAbsent, academyName, customMessage, preferredTime);
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    console.warn('Could not open window:', e);
  }
  return url;
}

/**
 * Generates a warm, professional birthday congratulations text
 * that ALWAYS includes the Academy's Name as requested.
 */
export function generateBirthdayMessage({
  name,
  role,
  academyName = 'BJJ Academy',
  belt,
  customNote
}: {
  name: string;
  role: 'student' | 'teacher' | 'kids';
  academyName: string;
  belt?: string;
  customNote?: string;
}): string {
  const safeAcademy = academyName.trim() || 'BJJ Academy';

  if (role === 'teacher') {
    return (
`🥋🎂 *FELIZ ANIVERSÁRIO, MESTRE / PROFESSOR(A)! • ${safeAcademy.toUpperCase()}*

Hoje o tatame da *${safeAcademy}* está em festa! 🎉🎈

Parabéns pelo seu aniversário, *${name}*!

Em nome de todos os alunos, instrutores e da diretoria da *${safeAcademy}*, queremos agradecer de coração por toda dedicação, paciência e liderança diária no nosso tatame. Você não apenas ensina a arte suave, mas transforma vidas e constrói um ambiente de respeito e união.

Que este novo ano traga muita saúde, paz, prosperidade e ainda mais conquistas no tatame e na vida pessoal!

${customNote ? `${customNote}\n\n` : ''}_Um forte abraço e parabéns de toda a família ${safeAcademy}! OSS! 🥋🎈🔥_`
    );
  }

  if (role === 'kids') {
    return (
`🥋🎉 *PARABÉNS PELO SEU ANIVERSÁRIO! • ${safeAcademy.toUpperCase()}*

Hoje é o dia do nosso pequeno campeão! 🎈🎂

Parabéns pelo seu aniversário, *${name}*!

Toda a equipe da *${safeAcademy}* deseja um dia muito divertido, com muitas brincadeiras, saúde e alegria ao lado da família e dos amigos!

Estamos muito orgulhosos da sua disciplina, respeito e dedicação nos treinos de Jiu-Jitsu. Continue sendo esse exemplo brilhante no tatame!

${customNote ? `${customNote}\n\n` : ''}_Com muito carinho de toda a família ${safeAcademy}! Parabéns e OSS! 🥋🌟🥇_`
    );
  }

  // Default: student
  return (
`🥋🎂 *FELIZ ANIVERSÁRIO! • ${safeAcademy.toUpperCase()}*

Hoje é um dia muito especial no tatame da *${safeAcademy}*! 🎉🎈

Parabéns pelo seu aniversário, *${name}*!

Toda a família e equipe da *${safeAcademy}* vem desejar a você muita saúde, paz, alegria e muitas vitórias — dentro e fora dos tatames!

Que este novo ciclo traga ainda mais evolução na sua faixa, consistência nos treinos e realização em todas as suas metas. É um privilégio ter você treinando e evoluindo com a gente todos os dias.

${customNote ? `${customNote}\n\n` : ''}Hoje o rola de aniversário é garantido! 😄 Comemore bastante com a família e nos vemos no próximo treino.

_Um forte abraço de toda a equipe ${safeAcademy}! Parabéns e OSS! 🥋🎉_`
  );
}

/**
 * Sends birthday congratulations directly via WhatsApp,
 * ensuring the academy name is always explicitly included.
 */
export function sendBirthdayCongratulationsWhatsApp({
  name,
  phone,
  role,
  academyName = 'BJJ Academy',
  belt,
  customMessage
}: {
  name: string;
  phone: string;
  role: 'student' | 'teacher' | 'kids';
  academyName: string;
  belt?: string;
  customMessage?: string;
}) {
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneParam = cleanPhone.length >= 10 ? `phone=55${cleanPhone}&` : '';

  const text = customMessage || generateBirthdayMessage({ name, role, academyName, belt });
  const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export interface LoyaltyContractWhatsAppParams {
  studentName?: string;
  responsibleName?: string;
  phone: string;
  cpf?: string;
  parentCpf?: string;
  planName?: string;
  monthlyFee?: number;
  dueDay?: number;
  contractHash?: string;
  academyName?: string;
  validationUrl?: string;
}

/**
 * Envia o Contrato Oficial de Prestação de Serviços da Loyalty Jiu-Jitsu
 * formatado com link, dados da matrícula, parcelas e hash SHA-256 para o WhatsApp do pai/responsável.
 */
export function sendLoyaltyContractWhatsApp({
  studentName,
  responsibleName,
  phone,
  cpf,
  parentCpf,
  planName = '',
  monthlyFee,
  dueDay,
  contractHash = '687cd89499b99dcd727cf2cea8e1aec50191ab14018fc86f27e525cf421c5bc5',
  academyName = 'Loyalty Jiu-Jitsu',
  validationUrl = 'https://valida.ae/cf863573c0b73bae72de28724757da0ae66e778affa22bb62'
}: LoyaltyContractWhatsAppParams): { success: boolean; url: string } {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const phoneParam = cleanPhone.length >= 10 ? `phone=55${cleanPhone}&` : '';
  const effectiveName = studentName?.trim() || '____________________';
  const effectiveResp = responsibleName?.trim() ? `\n👤 *Responsável Legal:* ${responsibleName.trim()}` : '';
  const effectivePlan = planName?.trim() || 'A preencher no ato da matrícula';
  const monthlyFormatted = monthlyFee && Number(monthlyFee) > 0 ? `12x de R$ ${Number(monthlyFee).toFixed(2).replace('.', ',')}` : '12x de R$ _________';
  const totalFormatted = monthlyFee && Number(monthlyFee) > 0 ? `R$ ${(Number(monthlyFee) * 12).toFixed(2).replace('.', ',')}` : 'R$ _________';
  const dueDayFormatted = dueDay ? `todo dia ${dueDay}` : 'a definir no ato da matrícula';

  const message = 
`🥋 *CONTRATO DE PRESTAÇÃO DE SERVIÇOS • ${academyName.toUpperCase()}*
📍 *Unidade Matriz Oficial:* Rua George Cerqueira, nº 976, Vila Velha, Fortaleza - CE
🏢 *CNPJ:* 081.265.363-73 (Pedro Erick Emidio da Silva)

Olá${responsibleName ? `, ${responsibleName}` : ''}! Segue a via digital do Contrato de Matrícula para conferência e arquivo:

📋 *DADOS DA MATRÍCULA:*
🥋 *Aluno:* ${effectiveName}${effectiveResp}
${cpf ? `🆔 *CPF Aluno:* ${cpf}\n` : ''}${parentCpf ? `🆔 *CPF Responsável:* ${parentCpf}\n` : ''}📌 *Plano Contratado:* ${effectivePlan} (Vigência 12 Meses)
🥋 *Modalidade:* Jiu-Jitsu (5 sessões por semana)
💰 *Valor Mensal:* ${monthlyFormatted} (Vencimento ${dueDayFormatted})
💵 *Valor Global:* ${totalFormatted}

🔒 *AUTENTICAÇÃO & ASSINATURA ELETRÔNICA:*
⚖️ *Validade Jurídica:* Lei Federal nº 14.063/2020 e Regulamento (UE) 910/2014
🔐 *Hash SHA-256:* \`${contractHash.substring(0, 32)}...\`
🔗 *Link de Validação & Auditoria:* ${validationUrl}

📄 _O contrato em formato PDF com as 5 páginas oficiais (Cláusulas, Remuneração, Foro, Assinaturas e Relatório de Auditoria) foi gerado pelo sistema oficial da academia._

Qualquer dúvida estamos à disposição na recepção ou por este canal. Bons treinos e OSS! 🥋`;

  const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.warn('Erro ao abrir WhatsApp via window.open:', e);
    }
  }
  return { success: true, url };
}

/**
 * Dispara mensagem oficial do Assistente Virtual de Atendimento e Cobrança
 * Notifica explicitamente múltiplos débitos e trava no envio do boleto mais antigo.
 */
export function sendPriorityDebtWhatsApp({
  studentName,
  totalOverdueCount,
  oldestInvoice,
  phone
}: {
  studentName: string;
  totalOverdueCount: number;
  oldestInvoice: Invoice;
  phone?: string;
}) {
  const updatedAmount = oldestInvoice.totalUpdatedAmount || oldestInvoice.amount;
  const formattedAmount = updatedAmount.toFixed(2).replace('.', ',');
  const pixKey = oldestInvoice.pixCode || oldestInvoice.invoiceNumber || 'Chave PIX da Academia';
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const phoneParam = cleanPhone.length >= 10 ? `phone=55${cleanPhone}&` : '';

  let message = '';
  if (totalOverdueCount >= 2) {
    message = 
`Olá, ${studentName}!

Identificamos que você possui ${totalOverdueCount} boletos pendentes em seu cadastro. 

Para evitar a incidência de novos juros, bloqueio de serviços ou o pagamento da fatura errada, estamos enviando abaixo os dados para quitação do seu boleto MAIS ANTIGO:

📌 Referência: ${oldestInvoice.title}
🗓 Vencimento original: ${oldestInvoice.dueDate}
💰 Valor atualizado: R$ ${formattedAmount}

Código Pix / Linha Digitável para pagamento:
${pixKey}

⚠️ IMPORTANTE: Por padrão de segurança, a quitação deve seguir a ordem de vencimento. Assim que este pagamento for compensado em nosso sistema, enviaremos os dados para regularização dos demais.`;
  } else {
    message =
`Olá, ${studentName}!

Identificamos 1 boleto pendente em seu cadastro:

📌 Referência: ${oldestInvoice.title}
🗓 Vencimento original: ${oldestInvoice.dueDate}
💰 Valor atualizado: R$ ${formattedAmount}

Código Pix / Linha Digitável para pagamento:
${pixKey}

⚠️ IMPORTANTE: Para evitar juros e suspensão de acesso ao tatame, pedimos a gentileza de realizar a quitação assim que possível. Qualquer dúvida estamos à disposição!`;
  }

  const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return { success: true, url };
}

