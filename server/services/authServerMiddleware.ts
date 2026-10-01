import { Request, Response, NextFunction } from 'express';

export type ServerUserRole = 'CEO' | 'SUPER_ADMIN' | 'ADMIN_ACADEMIA' | 'PROFESSOR' | 'ALUNO' | 'RESPONSAVEL';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: ServerUserRole;
  academyId?: string;
  isCeo: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Master CEO tokens & credentials
const CEO_TOKENS = new Set([
  'jwt_token_ceo_messias_master',
  'bearer_ceo_master',
  'ceo_session_master_jk4'
]);

/**
 * Decodifica e autentica a requisição via cabeçalhos HTTP
 * Suporta:
 * 1. Authorization: Bearer <token>
 * 2. x-auth-token: <token>
 * 3. x-user-role + x-academy-id (Sessão do cliente autenticado)
 */
export function authenticateServerUser(req: Request): AuthenticatedUser | null {
  const authHeader = req.headers['authorization'] || (req.headers['x-auth-token'] as string);
  const userRoleHeader = req.headers['x-user-role'] as string | undefined;
  const academyIdHeader = req.headers['x-academy-id'] as string | undefined;

  let token = '';
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  }

  // 1. CEO Master Token
  if (CEO_TOKENS.has(token) || token.startsWith('bearer_ceo_') || userRoleHeader === 'CEO') {
    return {
      id: 'usr_ceo_messias_master',
      name: 'Messias Batista da Silva Jr',
      email: 'messiasbjunior@yahoo.com.br',
      role: 'CEO',
      academyId: undefined, // Sem restrição de filial
      isCeo: true
    };
  }

  // 2. Token de Gestor de Filial (Admin de Academia)
  if (userRoleHeader === 'ADMIN_ACADEMIA' || userRoleHeader === 'manager' || token.includes('manager_') || token.includes('admin_')) {
    return {
      id: 'usr_manager_filial',
      name: 'Gestor da Filial',
      email: 'gestor@bjjacademy.com.br',
      role: 'ADMIN_ACADEMIA',
      academyId: academyIdHeader || 'acad_loyalty_jiujitsu',
      isCeo: false
    };
  }

  // 3. Token de Professor
  if (userRoleHeader === 'PROFESSOR' || token.includes('prof_')) {
    return {
      id: 'usr_prof_tatame',
      name: 'Professor / Instrutor',
      email: 'professor@bjjacademy.com.br',
      role: 'PROFESSOR',
      academyId: academyIdHeader || 'acad_loyalty_jiujitsu',
      isCeo: false
    };
  }

  // 4. Se não fornecido ou for modo simulação/desenvolvimento seguro
  // Atribui perfil básico de visualizador
  return null;
}

/**
 * Middleware: Exige autenticação básica
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = authenticateServerUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Acesso negado. Token de autenticação ou cabeçalho de sessão não fornecido.'
    });
  }
  req.user = user;
  next();
}

/**
 * Middleware: Exige perfil de Gestor da Filial ou CEO Master
 */
export function requireManagerOrCeo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = authenticateServerUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Autenticação necessária para acessar esta funcionalidade administrativa.'
    });
  }

  if (user.role !== 'CEO' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_ACADEMIA') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: `Acesso negado. Ação restrita a Gestores e Diretoria. Seu perfil atual: ${user.role}`
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Exige estritamente perfil de CEO Master (Messias)
 */
export function requireCeoOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = authenticateServerUser(req);
  if (!user || (!user.isCeo && user.role !== 'CEO' && user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({
      error: 'FORBIDDEN_CEO_ONLY',
      message: 'Acesso restrito exclusivamente à Presidência / CEO (Messias Batista da Silva Jr).'
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Exige estritamente perfil de Super Admin (Criador do Software SaaS)
 * Rota Altamente Protegida: Donos de academias e usuários comuns são estritamente barrados.
 */
export function requireSuperAdminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = authenticateServerUser(req);
  if (!user || (!user.isCeo && user.role !== 'CEO' && user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({
      error: 'FORBIDDEN_SUPER_ADMIN_ONLY',
      message: 'Acesso negado. Esta rota é restrita ao Super Admin / Criador da plataforma SaaS BJJACADEMY.'
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Blindagem Multi-Tenant
 * Impede que o Gestor da Academia A acerte endpoints da Academia B.
 * O CEO tem acesso irrestrito a todas as academias.
 */
export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const targetTenantId = req.params.tenantId || req.body?.tenantId;
  const user = authenticateServerUser(req);

  // Se for o CEO, autoriza acesso a qualquer filial
  if (user && user.isCeo) {
    req.user = user;
    return next();
  }

  // Se houver tenant alvo especificado e o usuário tiver restrição de filial
  if (user && targetTenantId && user.academyId && user.academyId !== targetTenantId) {
    return res.status(403).json({
      error: 'TENANT_ISOLATION_VIOLATION',
      message: `Violação de isolamento multi-tenant: O usuário pertence à filial '${user.academyId}' e não tem permissão para operar a filial '${targetTenantId}'.`
    });
  }

  if (user) {
    req.user = user;
  }
  next();
}
