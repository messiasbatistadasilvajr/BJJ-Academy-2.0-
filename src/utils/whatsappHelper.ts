import { Invoice } from '../types';

/**
 * Creates and opens a WhatsApp chat with a pre-formatted, professional receipt message.
 */
export function sendReceiptViaWhatsApp(invoice: Invoice, academyName: string = 'BJJ Academy') {
  const amountFormatted = invoice.amount.toFixed(2).replace('.', ',');
  const text = 
`🥋 *COMPROVANTE DE PAGAMENTO • BJJ ACADEMY*
🏢 *Academia:* ${academyName}
👤 *Aluno/Pagador:* ${invoice.studentName}
📄 *Nº do Recibo:* ${invoice.invoiceNumber}
📝 *Referência:* ${invoice.title}
💰 *Valor Pago:* R$ ${amountFormatted}
📅 *Data de Liquidação:* ${invoice.paidDate || new Date().toLocaleDateString('pt-BR')}
💳 *Forma de Pagamento:* PIX Instantâneo Asaas
🔒 *Autenticação Digital:* #BJJ-${Math.floor(100000 + Math.random() * 900000)}

_Agradecemos a pontualidade. Bons treinos no tatame! Oss!_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Creates and opens a WhatsApp message with a gentle, polite invoice reminder (aviso de vencimento).
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
  const pixInfo = (pixKey || invoice.pixCode) ? `\n🔑 *Chave PIX da Academia:* \`${pixKey || invoice.pixCode}\`` : '';

  const isOverdue = invoice.status === 'overdue';
  const header = isOverdue
    ? `🥋 *NOTIFICAÇÃO DE MENSALIDADE EM ABERTO • ${customAcademy.toUpperCase()}*`
    : `🥋 *LEMBRETE DE MENSALIDADE • ${customAcademy.toUpperCase()}*`;

  const bodyText = isOverdue
    ? `Sua mensalidade referente a *"${invoice.title}"* venceu na data *${invoice.dueDate}*.\n💰 *Valor Atualizado:* R$ ${amountFormatted}${pixInfo}\n\nPara manter seu plano e acesso liberado às aulas de kimono e no-gi, você pode realizar a transferência PIX diretamente pelo app.`
    : `Passando para lembrar que a mensalidade do tatame referente a *"${invoice.title}"* vence em *${invoice.dueDate}*.\n💰 *Valor:* R$ ${amountFormatted}${pixInfo}\n\nCaso já tenha efetuado o pagamento via PIX no app, por favor desconsidere esta mensagem.`;

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

