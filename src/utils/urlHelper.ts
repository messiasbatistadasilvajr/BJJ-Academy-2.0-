/**
 * Utility to obtain the public, shareable URL for BJJ Academy clients and students.
 * In Google AI Studio, URLs starting with "ais-dev-" are private to the logged-in developer session.
 * Sharing an "ais-dev-" link with students/clients results in HTTP 404 / 403 Forbidden ("Erro 44").
 * The public shared link replaces "ais-dev-" with "ais-pre-", which is accessible by anyone on any device.
 */
export const OFFICIAL_PUBLIC_APP_URL = 'https://ais-pre-6hs3znywiyjoz4h5eyr2vl-154268790842.us-east1.run.app';

export function getPublicAppUrl(customPath = ''): string {
  if (typeof window === 'undefined') {
    return `${OFFICIAL_PUBLIC_APP_URL}${customPath}`;
  }

  const currentHref = window.location.href;
  if (currentHref.includes('ais-dev-')) {
    const fixedUrl = currentHref.replace('ais-dev-', 'ais-pre-');
    return customPath ? `${fixedUrl.split('?')[0].split('#')[0]}${customPath}` : fixedUrl;
  }

  if (window.location.origin.includes('ais-dev-')) {
    const fixedOrigin = window.location.origin.replace('ais-dev-', 'ais-pre-');
    return `${fixedOrigin}${customPath || window.location.pathname}`;
  }

  return customPath ? `${window.location.origin}${customPath}` : window.location.href;
}

/**
 * Dispara o WhatsApp pré-formatado com o link público oficial e instruções para instalar sem Erro 44
 */
export function shareAppWithClientWhatsApp(academyName: string = 'BJJ Academy') {
  const publicUrl = getPublicAppUrl();
  const text = 
`🥋 *APLICATIVO OFICIAL • ${academyName.toUpperCase()}*

Olá! Acesse e teste o nosso aplicativo oficial da academia diretamente no seu celular (Android ou iPhone):

🔗 *Link Oficial de Acesso Direto (Sem Erro 44):*
${publicUrl}

📲 *COMO INSTALAR NO SEU CELULAR:*
🤖 *No Android:* Abra o link acima no navegador *Google Chrome*, toque nos 3 pontinhos (⋮) no canto superior direito e selecione *"Instalar Aplicativo"* (ou *"Adicionar à tela inicial"*).
🍎 *No iPhone (iOS):* Abra o link acima no navegador *Safari*, toque no ícone de *Compartilhar* (quadrado com seta ⬆️) no rodapé e selecione *"Adicionar à Tela de Início"*.

Qualquer dúvida avise na recepção. Bons treinos e Oss! 🥋`;

  const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(zapUrl, '_blank');
  }
}
