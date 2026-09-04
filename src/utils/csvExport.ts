import { Invoice, RegisteredAcademy, ClassSession } from '../types';

/**
 * Helper to trigger a direct native browser download of a CSV file.
 * Includes UTF-8 BOM (\uFEFF) so Excel (Windows & Mac) automatically opens
 * with proper Brazilian Portuguese accents (ç, ã, é, etc.) and semicolon delimiter.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports financial invoices (mensalidades, taxas de exame, pro-shop) to Excel-friendly CSV.
 */
export function exportFinancialInvoicesCSV(invoices: Invoice[], academyName: string = 'BJJ Academy') {
  const headers = [
    'Nº Fatura',
    'Aluno / Pagador',
    'Descrição',
    'Valor (R$)',
    'Vencimento',
    'Status',
    'Data de Pagamento',
    'Forma de Pagamento'
  ];

  const rows = invoices.map(inv => [
    `"${inv.invoiceNumber}"`,
    `"${inv.studentName}"`,
    `"${inv.title}"`,
    inv.amount.toFixed(2).replace('.', ','),
    `"${inv.dueDate}"`,
    `"${inv.status === 'paid' ? 'PAGO' : inv.status === 'overdue' ? 'VENCIDO' : 'PENDENTE'}"`,
    `"${inv.paidDate || '-'}"`,
    `"PIX Instantâneo / Asaas"`
  ]);

  const csvContent = [
    `RELATÓRIO FINANCEIRO - ${academyName.toUpperCase()}`,
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  const safeName = academyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(csvContent, `relatorio_financeiro_${safeName}_${Date.now()}.csv`);
}

/**
 * Exports list of registered academies & platform revenue share to CSV.
 */
export function exportAcademiesListCSV(academies: RegisteredAcademy[], gmName: string = 'Messias Batista da Silva junior') {
  const headers = [
    'Nome Oficial',
    'Nome Fantasia',
    'Filial / Unidade',
    'Cidade / UF',
    'CNPJ',
    'Telefone / WhatsApp',
    'Head Coach / Faixa Preta',
    'Chave PIX da Academia',
    'Capacidade Alunos',
    'Voz Tatame',
    'Repasse Mensal Plataforma (R$)',
    'Status'
  ];

  const rows = academies.map(a => [
    `"${a.name}"`,
    `"${a.shortName}"`,
    `"${a.branch}"`,
    `"${a.city}"`,
    `"${a.cnpj || 'Não inf.'}"`,
    `"${a.phone}"`,
    `"${a.headInstructor || 'Não inf.'}"`,
    `"${a.pixKey || 'Não inf.'}"`,
    a.studentCapacity || 200,
    `"${a.voiceEnabled ? 'Ativa' : 'Desativada'}"`,
    '250,00',
    `"${a.status === 'active' ? 'ATIVA' : 'PENDENTE'}"`
  ]);

  const csvContent = [
    `REDE DE ACADEMIAS BJJ ACADEMY - GESTOR GERAL: ${gmName.toUpperCase()}`,
    `Total de Unidades: ${academies.length}`,
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  downloadCSV(csvContent, `academias_rede_bjj_${Date.now()}.csv`);
}

/**
 * Exports class attendance (chamada do tatame) to CSV.
 */
export function exportAttendanceReportCSV(session: ClassSession) {
  const headers = [
    'ID Aluno',
    'Nome do Aluno',
    'Faixa',
    'Status Presença',
    'Horário da Turma',
    'Tatame',
    'Observações'
  ];

  const rows = session.registeredStudents.map(stu => [
    `"${stu.id}"`,
    `"${stu.name}"`,
    `"${stu.belt}"`,
    `"${stu.status === 'present' ? 'PRESENTE' : 'AUSENTE'}"`,
    `"${session.time}"`,
    `"${session.tatame}"`,
    `"${stu.note || '-'}"`
  ]);

  const presentTotal = session.registeredStudents.filter(s => s.status === 'present').length;

  const csvContent = [
    `CHAMADA DE TATAME - ${session.name.toUpperCase()}`,
    `Data: ${new Date().toLocaleDateString('pt-BR')} • Horário: ${session.time} • Tatame: ${session.tatame}`,
    `Total Presentes: ${presentTotal} de ${session.registeredStudents.length}`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  const safeTitle = session.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadCSV(csvContent, `chamada_tatame_${safeTitle}_${Date.now()}.csv`);
}
