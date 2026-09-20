import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { StudentProfile, Invoice } from '../types';
import { safeLocalStorageGet, safeLocalStorageSet } from './safeStorage';
import { sanitizeForFirestore } from '../firebase/firestoreService';

export interface DataIntegrityIssue {
  id: string;
  category: 'student' | 'invoice';
  entityId: string;
  entityName: string;
  type: 'missing_in_cloud' | 'missing_in_local' | 'data_mismatch' | 'field_divergence';
  description: string;
  localPreview?: any;
  cloudPreview?: any;
  divergentFields?: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface DataIntegrityReport {
  timestamp: string;
  totalStudentsLocal: number;
  totalStudentsCloud: number;
  totalInvoicesLocal: number;
  totalInvoicesCloud: number;
  isConsistent: boolean;
  issuesCount: number;
  issues: DataIntegrityIssue[];
  resolutionSummary?: string;
}

/**
 * Utilitário profissional de verificação de integridade entre Firestore e localStorage
 * para alunos (bjj_students_roster) e faturas financeiras (bjj_invoices).
 */
export async function runDataIntegrityCheck(): Promise<DataIntegrityReport> {
  const issues: DataIntegrityIssue[] = [];

  // 1. Carrega dados do LocalStorage
  const localStudents = safeLocalStorageGet<StudentProfile[]>('bjj_students_roster', []);
  const localInvoices = safeLocalStorageGet<Invoice[]>('bjj_invoices', []);

  // Mapas locais indexados por ID
  const localStudentsMap = new Map<string, StudentProfile>();
  localStudents.forEach((s) => localStudentsMap.set(s.id, s));

  const localInvoicesMap = new Map<string, Invoice>();
  localInvoices.forEach((inv) => localInvoicesMap.set(inv.id, inv));

  // 2. Busca dados reais no Google Cloud Firestore
  const cloudStudents: StudentProfile[] = [];
  const cloudStudentsMap = new Map<string, StudentProfile>();

  const cloudInvoices: Invoice[] = [];
  const cloudInvoicesMap = new Map<string, Invoice>();

  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    studentsSnap.forEach((docSnap) => {
      const student = docSnap.data() as StudentProfile;
      cloudStudents.push(student);
      cloudStudentsMap.set(student.id, student);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'students');
  }

  try {
    const invoicesSnap = await getDocs(collection(db, 'invoices'));
    invoicesSnap.forEach((docSnap) => {
      const invoice = docSnap.data() as Invoice;
      cloudInvoices.push(invoice);
      cloudInvoicesMap.set(invoice.id, invoice);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'invoices');
  }

  // 3. Verificação de Alunos: Local vs Cloud
  localStudentsMap.forEach((localStudent, id) => {
    const cloudStudent = cloudStudentsMap.get(id);
    if (!cloudStudent) {
      issues.push({
        id: `issue_stu_missing_cloud_${id}`,
        category: 'student',
        entityId: id,
        entityName: localStudent.name || 'Aluno Sem Nome',
        type: 'missing_in_cloud',
        description: `Aluno '${localStudent.name}' (${localStudent.belt || 'Faixa'}) existe no navegador mas NÃO foi salvo no Firestore.`,
        localPreview: { name: localStudent.name, belt: localStudent.belt, email: localStudent.email },
        severity: 'high'
      });
    } else {
      // Compara campos vitais
      const divergences: string[] = [];
      if (localStudent.name !== cloudStudent.name) divergences.push('Nome');
      if (localStudent.belt !== cloudStudent.belt) divergences.push('Faixa');
      if (localStudent.stripes !== cloudStudent.stripes) divergences.push('Graus');
      if (localStudent.status !== cloudStudent.status) divergences.push('Status da Matrícula');
      if (localStudent.academyId !== cloudStudent.academyId) divergences.push('Unidade/Filial');

      if (divergences.length > 0) {
        issues.push({
          id: `issue_stu_diff_${id}`,
          category: 'student',
          entityId: id,
          entityName: localStudent.name,
          type: 'field_divergence',
          description: `Divergência de dados detectada em [${divergences.join(', ')}] entre navegador e nuvem.`,
          localPreview: { name: localStudent.name, belt: localStudent.belt, status: localStudent.status },
          cloudPreview: { name: cloudStudent.name, belt: cloudStudent.belt, status: cloudStudent.status },
          divergentFields: divergences,
          severity: 'medium'
        });
      }
    }
  });

  // Alunos no Cloud que não estão no LocalStorage
  cloudStudentsMap.forEach((cloudStudent, id) => {
    if (!localStudentsMap.has(id)) {
      issues.push({
        id: `issue_stu_missing_local_${id}`,
        category: 'student',
        entityId: id,
        entityName: cloudStudent.name || 'Aluno Nuvem',
        type: 'missing_in_local',
        description: `Aluno '${cloudStudent.name}' existe na nuvem Firestore mas está ausente no cache local do dispositivo.`,
        cloudPreview: { name: cloudStudent.name, belt: cloudStudent.belt, email: cloudStudent.email },
        severity: 'medium'
      });
    }
  });

  // 4. Verificação de Faturas: Local vs Cloud
  localInvoicesMap.forEach((localInv, id) => {
    const cloudInv = cloudInvoicesMap.get(id);
    if (!cloudInv) {
      issues.push({
        id: `issue_inv_missing_cloud_${id}`,
        category: 'invoice',
        entityId: id,
        entityName: `Fatura #${localInv.id.slice(-6)} (${localInv.studentName || 'Sem Aluno'})`,
        type: 'missing_in_cloud',
        description: `Fatura de R$ ${localInv.amount?.toFixed(2)} (${localInv.status}) para '${localInv.studentName}' não está persistida no Firestore.`,
        localPreview: { amount: localInv.amount, status: localInv.status, dueDate: localInv.dueDate },
        severity: 'high'
      });
    } else {
      // Divergência financeira
      const divergences: string[] = [];
      if (localInv.status !== cloudInv.status) divergences.push(`Status (${localInv.status} vs ${cloudInv.status})`);
      if (Math.abs((localInv.amount || 0) - (cloudInv.amount || 0)) > 0.01) divergences.push(`Valor (R$ ${localInv.amount} vs R$ ${cloudInv.amount})`);
      if (localInv.dueDate !== cloudInv.dueDate) divergences.push('Data de Vencimento');

      if (divergences.length > 0) {
        issues.push({
          id: `issue_inv_diff_${id}`,
          category: 'invoice',
          entityId: id,
          entityName: `Fatura #${localInv.id.slice(-6)} (${localInv.studentName})`,
          type: 'field_divergence',
          description: `Inconsistência de valores/status na fatura: [${divergences.join(', ')}].`,
          localPreview: { amount: localInv.amount, status: localInv.status },
          cloudPreview: { amount: cloudInv.amount, status: cloudInv.status },
          divergentFields: divergences,
          severity: 'high'
        });
      }
    }
  });

  // Faturas na nuvem ausentes no local
  cloudInvoicesMap.forEach((cloudInv, id) => {
    if (!localInvoicesMap.has(id)) {
      issues.push({
        id: `issue_inv_missing_local_${id}`,
        category: 'invoice',
        entityId: id,
        entityName: `Fatura #${cloudInv.id.slice(-6)} (${cloudInv.studentName || 'Nuvem'})`,
        type: 'missing_in_local',
        description: `Fatura de R$ ${cloudInv.amount?.toFixed(2)} existe no Firestore mas não está sincronizada no navegador.`,
        cloudPreview: { amount: cloudInv.amount, status: cloudInv.status },
        severity: 'medium'
      });
    }
  });

  const report: DataIntegrityReport = {
    timestamp: new Date().toISOString(),
    totalStudentsLocal: localStudents.length,
    totalStudentsCloud: cloudStudents.length,
    totalInvoicesLocal: localInvoices.length,
    totalInvoicesCloud: cloudInvoices.length,
    isConsistent: issues.length === 0,
    issuesCount: issues.length,
    issues
  };

  return report;
}

/**
 * Utilitário de auto-correção / reconciliação:
 * 1. 'cloud_to_local': Atualiza o cache local com os registros oficiais da nuvem.
 * 2. 'local_to_cloud': Envia os registros locais para a nuvem Firestore, resolvendo pendências.
 */
export async function reconcileIntegrityDiscrepancies(
  strategy: 'cloud_to_local' | 'local_to_cloud'
): Promise<{ success: boolean; message: string }> {
  try {
    if (strategy === 'local_to_cloud') {
      // Pega dados locais e garante que estejam na nuvem
      const localStudents = safeLocalStorageGet<StudentProfile[]>('bjj_students_roster', []);
      const localInvoices = safeLocalStorageGet<Invoice[]>('bjj_invoices', []);

      const studentBatch = writeBatch(db);
      localStudents.forEach((s) => {
        studentBatch.set(doc(db, 'students', s.id), sanitizeForFirestore(s), { merge: true });
      });
      await studentBatch.commit();

      const invoiceBatch = writeBatch(db);
      localInvoices.forEach((inv) => {
        invoiceBatch.set(doc(db, 'invoices', inv.id), sanitizeForFirestore(inv), { merge: true });
      });
      await invoiceBatch.commit();

      return {
        success: true,
        message: `Sincronização concluída: ${localStudents.length} alunos e ${localInvoices.length} faturas gravados no Firestore.`
      };
    } else {
      // Puxa do Cloud Firestore e sobrescreve o cache local
      const studentsSnap = await getDocs(collection(db, 'students'));
      const cloudStudents: StudentProfile[] = [];
      studentsSnap.forEach((docSnap) => cloudStudents.push(docSnap.data() as StudentProfile));

      const invoicesSnap = await getDocs(collection(db, 'invoices'));
      const cloudInvoices: Invoice[] = [];
      invoicesSnap.forEach((docSnap) => cloudInvoices.push(docSnap.data() as Invoice));

      safeLocalStorageSet('bjj_students_roster', cloudStudents);
      safeLocalStorageSet('bjj_invoices', cloudInvoices);

      return {
        success: true,
        message: `Cache do navegador reconciliado com o Firestore: ${cloudStudents.length} alunos e ${cloudInvoices.length} faturas atualizados.`
      };
    }
  } catch (err: any) {
    console.error('[Integrity Reconcile Error]:', err);
    return {
      success: false,
      message: `Erro ao reconciliar dados: ${err?.message || 'Falha de comunicação com o Firestore.'}`
    };
  }
}
