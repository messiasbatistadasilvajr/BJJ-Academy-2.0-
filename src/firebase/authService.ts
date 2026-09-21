import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  ParsedToken
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type AppUserRole = 'admin' | 'professor' | 'aluno' | 'ceo';

export interface UserCustomClaims {
  role?: AppUserRole;
  academyId?: string;
  isCeo?: boolean;
}

export interface AuthenticatedUserProfile {
  uid: string;
  email: string | null;
  role: AppUserRole;
  academyId?: string;
  name?: string;
}

/**
 * 🔐 Observador de Estado de Autenticação com Extração de Custom Claims
 */
export function onAuthUserChanged(
  callback: (userProfile: AuthenticatedUserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      // Força a atualização do token para carregar os Custom Claims mais recentes
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const claims = idTokenResult.claims as ParsedToken & UserCustomClaims;

      let role: AppUserRole = (claims.role as AppUserRole) || 'aluno';
      let academyId = claims.academyId;

      // Se não houver claims no token (ex: usuário legado ou recém-criado), busca no perfil de usuário
      if (!claims.role) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          role = (data.role as AppUserRole) || 'aluno';
          academyId = data.academyId;
        }
      }

      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role,
        academyId,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Atleta'
      });
    } catch (err) {
      console.error('[AuthRBAC] Erro ao extrair custom claims:', err);
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'aluno'
      });
    }
  });
}

/**
 * 🛠️ Rotina de Atribuição de Permissões RBAC (Client-Side & Metadata Sync)
 * Nota: No ambiente produtivo com Cloud Functions (Passo 3), esta chamada
 * aciona a API de Admin SDK `admin.auth().setCustomUserClaims()`.
 */
export async function assignUserRoleRecord(
  targetUid: string, 
  targetEmail: string, 
  role: AppUserRole, 
  academyId: string = 'acad_default'
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  await setDoc(userRef, {
    uid: targetUid,
    email: targetEmail,
    role,
    academyId,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log(`[RBAC] Papel '${role}' registrado com sucesso para o usuário ${targetUid} na academia ${academyId}`);
}

/**
 * Login com e-mail e senha
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

/**
 * Cadastro inicial de novo usuário com papel
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  role: AppUserRole = 'aluno',
  academyId: string = 'acad_default'
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await assignUserRoleRecord(cred.user.uid, email, role, academyId);
  return cred.user;
}

/**
 * Logout
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}
