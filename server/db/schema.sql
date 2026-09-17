-- =================================================================
-- BJJACADEMY - DDL POSTGRESQL MULTI-TENANT & ASAAS SUBCONTAS / SPLIT
-- Script de Migração SQL Direta
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE saas_plan_tipo AS ENUM ('BRONZE', 'PRATA', 'OURO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('ATIVO', 'INATIVO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA TENANTS (ACADEMIAS)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    plano_tipo saas_plan_tipo NOT NULL DEFAULT 'BRONZE',
    limite_alunos INT NOT NULL DEFAULT 40,
    status tenant_status NOT NULL DEFAULT 'ATIVO',
    
    -- Subcontas Asaas & Chaves de API
    asaas_api_key VARCHAR(255),
    asaas_wallet_id VARCHAR(100),
    asaas_customer_id VARCHAR(100),
    asaas_subscription_id VARCHAR(100),
    
    -- Controle de Carência & Inadimplência
    overdue_since TIMESTAMP WITH TIME ZONE NULL,
    blocked_at TIMESTAMP WITH TIME ZONE NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA STUDENTS (ALUNOS)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    status student_status NOT NULL DEFAULT 'ATIVO',
    
    faixa VARCHAR(30) DEFAULT 'white',
    graus INT DEFAULT 0,
    asaas_customer_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ÍNDICES DE ALTA PERFORMANCE PARA O DATABASE TIER
CREATE INDEX IF NOT EXISTS idx_students_tenant_status ON students (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants (status);
CREATE INDEX IF NOT EXISTS idx_tenants_plano ON tenants (plano_tipo);

-- 5. FUNCTION & TRIGGER DO BANCO DE DADOS (OPCIONAL NO NÍVEL DE BANCO)
-- Garante a nível de banco que nenhum INSERT ultrapasse o limite_alunos
CREATE OR REPLACE FUNCTION check_tenant_student_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_limite INT;
    v_ativos INT;
    v_plano saas_plan_tipo;
    v_status tenant_status;
BEGIN
    -- Se o aluno que está sendo inserido não for ATIVO, permite inserção sem validar cota
    IF NEW.status != 'ATIVO' THEN
        RETURN NEW;
    END IF;

    -- Busca configuração do Tenant
    SELECT limite_alunos, plano_tipo, status
    INTO v_limite, v_plano, v_status
    FROM tenants
    WHERE id = NEW.tenant_id;

    -- Valida se a academia não está bloqueada por inadimplência
    IF v_status = 'BLOQUEADO' THEN
        RAISE EXCEPTION 'ACADEMY_BLOCKED: A academia está com acesso bloqueado no sistema por pendência financeira no plano SaaS.'
            USING ERRCODE = 'P0002';
    END IF;

    -- Conta quantos alunos ativos a academia possui atualmente
    SELECT COUNT(*)
    INTO v_ativos
    FROM students
    WHERE tenant_id = NEW.tenant_id AND status = 'ATIVO';

    -- Se já atingiu ou ultrapassou o teto permitido
    IF v_ativos >= v_limite THEN
        RAISE EXCEPTION 'LIMIT_REACHED: Limite de % alunos ativos atingido para o plano %. Faça upgrade para matricular novos alunos.',
            v_limite, v_plano
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_student_limit ON students;
CREATE TRIGGER trg_check_student_limit
BEFORE INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION check_tenant_student_limit();
