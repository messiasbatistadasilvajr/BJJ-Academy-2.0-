-- ============================================================================
-- BJJACADEMY SaaS • SCHEMA DO BANCO DE DADOS DE ASSINATURAS (MULTI-TENANT)
-- Banco: PostgreSQL / Supabase / Neon / Cloud SQL
-- Módulo: Gestão de Assinaturas e Bloqueio Automático por Inadimplência
-- ============================================================================

-- 1. Criação dos tipos enumerados para integridade referencial
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saas_plan_tier') THEN
        CREATE TYPE saas_plan_tier AS ENUM ('BASICO', 'AVANCADO', 'OURO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saas_payment_status') THEN
        CREATE TYPE saas_payment_status AS ENUM ('EM_DIA', 'PENDENTE', 'ATRASADO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saas_payment_method') THEN
        CREATE TYPE saas_payment_method AS ENUM ('PIX', 'BOLETO', 'CARTAO_CREDITO', 'TRANSFERENCIA', 'DINHEIRO');
    END IF;
END $$;

-- 2. Tabela Principal: saas_subscriptions (Assinaturas das Academias Clientes)
CREATE TABLE IF NOT EXISTS saas_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    academy_id VARCHAR(64) NOT NULL UNIQUE,
    academy_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(150),
    responsible_name VARCHAR(255) NOT NULL,
    responsible_email VARCHAR(255) NOT NULL,
    responsible_phone VARCHAR(50),
    responsible_cpf_cnpj VARCHAR(30),
    
    -- Configuração do Plano Contratado
    plan_tier saas_plan_tier NOT NULL DEFAULT 'BASICO',
    plan_name VARCHAR(100) NOT NULL DEFAULT 'Plano Básico (Até 40 Alunos)',
    monthly_fee_brl NUMERIC(10, 2) NOT NULL DEFAULT 99.90,
    max_active_students INT NOT NULL DEFAULT 40,
    
    -- Datas e Vencimento
    billing_due_day INT NOT NULL DEFAULT 10 CHECK (billing_due_day BETWEEN 1 AND 31),
    next_due_date DATE NOT NULL,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Regra de Negócio: Status Financeiro e Bloqueio de Acesso
    payment_status saas_payment_status NOT NULL DEFAULT 'EM_DIA',
    is_access_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_reason TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    reactivated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados de Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices otimizados para busca rápida e rotinas de middleware
CREATE INDEX IF NOT EXISTS idx_saas_subs_academy ON saas_subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_saas_subs_status ON saas_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_saas_subs_suspended ON saas_subscriptions(is_access_suspended);
CREATE INDEX IF NOT EXISTS idx_saas_subs_due_date ON saas_subscriptions(next_due_date);

-- 3. Tabela de Histórico de Faturas e Pagamentos Recebidos (Audit Trail)
CREATE TABLE IF NOT EXISTS saas_payment_records (
    id VARCHAR(64) PRIMARY KEY,
    subscription_id VARCHAR(64) NOT NULL REFERENCES saas_subscriptions(id) ON DELETE CASCADE,
    academy_id VARCHAR(64) NOT NULL,
    amount_paid_brl NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payment_method saas_payment_method NOT NULL DEFAULT 'PIX',
    reference_month VARCHAR(7) NOT NULL, -- Ex: '2026-10'
    transaction_code VARCHAR(120),
    receipt_url TEXT,
    notes TEXT,
    registered_by VARCHAR(120) NOT NULL DEFAULT 'Super Admin (Criador)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saas_payments_sub ON saas_payment_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_academy ON saas_payment_records(academy_id);

-- 4. Função & Trigger: Atualização automática do timestamp 'updated_at'
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_saas_subscriptions ON saas_subscriptions;
CREATE TRIGGER set_timestamp_saas_subscriptions
BEFORE UPDATE ON saas_subscriptions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 5. Função de Banco de Dados: Rotina de Bloqueio Automático por Inadimplência
-- Bloqueia o acesso quando o pagamento estiver 'ATRASADO'
CREATE OR REPLACE FUNCTION fn_check_and_lock_overdue_academies()
RETURNS TABLE (
    locked_academy_id VARCHAR(64),
    locked_academy_name VARCHAR(255),
    overdue_days INT
) AS $$
BEGIN
    RETURN QUERY
    UPDATE saas_subscriptions
    SET 
        payment_status = 'ATRASADO',
        is_access_suspended = TRUE,
        suspension_reason = 'Bloqueio Automático: Mensalidade SaaS vencida e não regularizada.',
        suspended_at = COALESCE(suspended_at, NOW())
    WHERE 
        payment_status <> 'EM_DIA'
        AND next_due_date < CURRENT_DATE
        AND is_access_suspended = FALSE
    RETURNING 
        academy_id, 
        academy_name, 
        (CURRENT_DATE - next_due_date)::INT;
END;
$$ LANGUAGE plpgsql;

-- 6. Inserção de Dados Iniciais de Demonstração (Seed)
INSERT INTO saas_subscriptions (
    id, academy_id, academy_name, branch_name, responsible_name, 
    responsible_email, responsible_phone, responsible_cpf_cnpj,
    plan_tier, plan_name, monthly_fee_brl, max_active_students,
    billing_due_day, next_due_date, last_payment_date,
    payment_status, is_access_suspended, suspension_reason
) VALUES 
(
    'sub_loyalty_001', 'acad_loyalty_jiujitsu', 'Loyalty Jiu-Jitsu', 'Matriz Oficial • CE',
    'Messias Batista da Silva Junior', 'contato@loyaltyjiujitsu.com.br', '(85) 98765-4321', '58.087.630/0001-78',
    'OURO', 'Plano Ouro (Enterprise)', 249.90, 999999,
    10, CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '20 days',
    'EM_DIA', FALSE, NULL
),
(
    'sub_gracie_002', 'acad_gracie_barra_sp', 'Gracie Barra Jardins', 'Unidade Jardins • SP',
    'Prof. Carlos Eduardo Gracie', 'carlos.gracie@gbjardins.com.br', '(11) 98111-2233', '12.345.678/0001-90',
    'AVANCADO', 'Plano Avançado (Até 150 Alunos)', 149.90, 150,
    5, CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '25 days',
    'EM_DIA', FALSE, NULL
),
(
    'sub_alliance_003', 'acad_alliance_campinas', 'Alliance Campinas', 'Taquaral • SP',
    'Mestre Fernando Ramos', 'fernando@alliancecampinas.com.br', '(19) 97222-3344', '23.456.789/0001-01',
    'BASICO', 'Plano Básico (Até 40 Alunos)', 99.90, 40,
    15, CURRENT_DATE - INTERVAL '6 days', NOW() - INTERVAL '36 days',
    'ATRASADO', TRUE, 'Inadimplência - Fatura SaaS em atraso há 6 dias. Professores e alunos bloqueados.'
),
(
    'sub_checkmat_004', 'acad_checkmat_santos', 'Checkmat Baixada', 'Gonzaga • Santos',
    'Prof. Rodrigo Martins', 'contato@checkmatsantos.com.br', '(13) 99333-4455', '34.567.890/0001-12',
    'AVANCADO', 'Plano Avançado (Até 150 Alunos)', 149.90, 150,
    10, CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '29 days',
    'PENDENTE', FALSE, NULL
),
(
    'sub_novauniao_005', 'acad_nova_uniao_bh', 'Nova União Minas', 'Savassi • BH',
    'Prof. Leandro Barbosa', 'leandro@novauniaominas.com.br', '(31) 98444-5566', '45.678.901/0001-23',
    'BASICO', 'Plano Básico (Até 40 Alunos)', 99.90, 40,
    20, CURRENT_DATE - INTERVAL '12 days', NOW() - INTERVAL '42 days',
    'ATRASADO', TRUE, 'Suspensão por inadimplência prolongada (12 dias de atraso).'
)
ON CONFLICT (id) DO NOTHING;
