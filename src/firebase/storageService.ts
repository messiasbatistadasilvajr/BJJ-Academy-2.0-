import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage, auth } from './config';

export interface StorageUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progressPercent: number;
}

/**
 * 📸 Upload Seguro de Foto de Perfil / Avatar
 */
export async function uploadProfileAvatar(
  userId: string, 
  file: File, 
  onProgress?: (progress: StorageUploadProgress) => void
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Formato inválido: apenas imagens (PNG, JPG, WebP) são permitidas.');
  }

  // Sanitização de nome de arquivo
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `avatars/${userId}/avatar_${Date.now()}.${ext}`;
  const fileRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: auth.currentUser?.uid || userId,
        uploadDate: new Date().toISOString()
      }
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progressPercent
          });
        }
      },
      (error) => {
        console.error('[Firebase Storage] Erro no upload de avatar:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

/**
 * 🥋 Upload de Certificado Oficial CBJJ / IBJJF (PDF ou Imagem)
 */
export async function uploadGraduationCertificateDocument(
  studentId: string, 
  certificateId: string, 
  blobOrFile: Blob | File
): Promise<string> {
  const filePath = `certificates/${studentId}/${certificateId}.pdf`;
  const fileRef = ref(storage, filePath);

  const snapshot = await uploadBytesResumable(fileRef, blobOrFile, {
    contentType: blobOrFile.type || 'application/pdf',
    customMetadata: {
      studentId,
      certificateId,
      issuedAt: new Date().toISOString()
    }
  });

  return await getDownloadURL(snapshot.ref);
}

/**
 * 📄 Upload de Comprovante de Pagamento PIX / Fatura
 */
export async function uploadPaymentReceipt(
  tenantId: string, 
  invoiceId: string, 
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const filePath = `receipts/${tenantId}/${invoiceId}/receipt_${Date.now()}.${ext}`;
  const fileRef = ref(storage, filePath);

  const snapshot = await uploadBytesResumable(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      tenantId,
      invoiceId,
      uploadedAt: new Date().toISOString()
    }
  });

  return await getDownloadURL(snapshot.ref);
}

/**
 * 🗑️ Exclusão Segura de Arquivo no Storage
 */
export async function deleteStorageFile(storageUrlOrPath: string): Promise<void> {
  try {
    const fileRef = ref(storage, storageUrlOrPath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('[Firebase Storage] Falha ao deletar arquivo:', err);
  }
}
