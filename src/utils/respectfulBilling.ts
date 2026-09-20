import { RespectfulBillingTemplate } from '../types';

export function getRespectfulBillingMessage(
  type: 'preventive' | 'due_today' | 'polite_late' | 'kiosk_discrete',
  studentName: string,
  academyName: string,
  amount: number,
  dueDateStr: string,
  pixKey: string
): RespectfulBillingTemplate {
  const firstName = studentName.split(' ')[0];
  const formattedAmount = `R$ ${amount.toFixed(2).replace('.', ',')}`;

  switch (type) {
    case 'preventive':
      return {
        type,
        title: 'Lembrete Amigável (3 dias antes)',
        body: `Oss, ${firstName}! Tudo bem?\nPassando para lembrar que sua mensalidade na ${academyName} vence no dia ${dueDateStr} (${formattedAmount}).\nManter seu plano em dia nos ajuda a manter a estrutura e o tatame sempre impecáveis para a sua evolução! 🥋🔥`,
        pixKeyText: pixKey
      };

    case 'due_today':
      return {
        type,
        title: 'Vencimento Hoje',
        body: `Oss, guerreiro ${firstName}!\nSua mensalidade na ${academyName} vence hoje (${dueDateStr}) no valor de ${formattedAmount}.\nSegue a chave PIX para sua comodidade. Nos vemos no tatame mais tarde! 🥋🤝`,
        pixKeyText: pixKey
      };

    case 'polite_late':
      return {
        type,
        title: 'Aviso Respeitoso (Após vencimento)',
        body: `Olá, ${firstName}! Esperamos que você e sua família estejam ótimos.\nIdentificamos uma pendência da mensalidade com vencimento em ${dueDateStr} (${formattedAmount}) na ${academyName}.\nSabemos que a correria do dia a dia acontece! Segue o PIX para regularização fácil. Se precisar de qualquer suporte, nossa recepção está à disposição. Oss! 🥋🙏`,
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
