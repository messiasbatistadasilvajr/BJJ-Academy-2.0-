import { RoleEnum, UserRole, isCeoRole, isSuperAdminOrCeoRole } from '../types';

/**
 * Interface do Usuário Autenticado via JWT
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleEnum | UserRole;
  academyId?: string; // Se for ADMIN_ACADEMIA ou PROFESSOR, fica restrito a esta filial
  permissions: string[];
}

/**
 * Mock de Sessão do CEO (Messias Batista da Silva Jr)
 */
export const MOCK_CEO_USER: AuthUser = {
  id: 'usr_ceo_messias_master',
  name: 'Messias Batista da Silva Jr',
  email: 'messiasbjunior@yahoo.com.br',
  role: RoleEnum.CEO,
  academyId: undefined, // Sem restrição de tenant (Acesso global a todas as filiais)
  permissions: [
    'GLOBAL_MULTI_TENANT_ACCESS',
    'FULL_FINANCIAL_SPLIT_ASAAS',
    'GLOBAL_CHURN_AI_MONITOR',
    'ACADEMY_REGISTRATION_MANAGE',
    'CEO_MASTER_OVERRIDE',
    'INFRASTRUCTURE_MANAGE'
  ]
};

/**
 * Validação de Credenciais Master do CEO
 */
export function validateCeoCredentials(email: string, pass: string): boolean {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();
  const validEmails = ['messiasbjunior@yahoo.com.br', 'messiasbjunior76@gmail.com'];
  const validPasswords = ['Familia@jk4', 'familia@jk4'];
  return validEmails.includes(cleanEmail) && validPasswords.includes(cleanPass);
}

/**
 * Mock de Decodificação e Validação de Token JWT
 */
export function verifyJwtToken(token: string): AuthUser | null {
  if (!token) return null;
  
  // Se for o token master do CEO
  if (token === 'jwt_token_ceo_messias_master' || token.startsWith('bearer_ceo_')) {
    return MOCK_CEO_USER;
  }

  // Token genérico simulado
  try {
    if (token.startsWith('mock_jwt_')) {
      const rolePart = token.split('_')[2] as RoleEnum;
      return {
        id: 'usr_mock_session',
        name: 'Usuário Autenticado',
        email: 'user@bjjacademy.com.br',
        role: rolePart || RoleEnum.ALUNO,
        permissions: []
      };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Middleware RBAC: requireSuperAdminOrCEO
 * Permite acesso irrestrito para SUPER_ADMIN e CEO.
 * Garante que o CEO nunca seja barrado em rotas de infraestrutura, faturamento e multi-tenant.
 */
export function checkSuperAdminOrCEO(user: AuthUser | null | undefined): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: '401: Usuário não autenticado.' };
  }

  const isAuthorized = isSuperAdminOrCeoRole(user.role);

  if (!isAuthorized) {
    return {
      allowed: false,
      reason: `403: Acesso Negado. Esta rota exige perfil SUPER_ADMIN ou CEO. Perfil fornecido: ${user.role}`
    };
  }

  return { allowed: true };
}

/**
 * Validação de Multi-Tenant:
 * Garante que o CEO e SUPER_ADMIN possam enxergar e operar QUALQUER academia da rede.
 * Usuários com ADMIN_ACADEMIA só acessam a sua própria filial.
 */
export function canAccessAcademyTenant(user: AuthUser | null | undefined, targetAcademyId: string): boolean {
  if (!user) return false;

  // CEO e SUPER_ADMIN possuem poder total sobre todos os tenants
  if (isSuperAdminOrCeoRole(user.role)) {
    return true;
  }

  // Gestor da unidade só acessa a unidade dele
  if (user.role === RoleEnum.ADMIN_ACADEMIA || user.role === 'manager') {
    return user.academyId === targetAcademyId;
  }

  return false;
}

/**
 * Saudação Executiva Oficial para o Painel Master
 */
export function getExecutiveGreeting(user?: { name?: string; role?: UserRole | string }): string {
  if (user && isCeoRole(user.role)) {
    return 'Olá, CEO Messias! Oss. 🥋';
  }
  return 'Painel de Gestão BJJ ACADEMY';
}
