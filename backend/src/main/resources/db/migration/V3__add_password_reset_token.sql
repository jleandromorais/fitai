-- V3: Adiciona colunas de reset de senha na tabela de usuários
ALTER TABLE useres
    ADD COLUMN IF NOT EXISTS reset_token       VARCHAR(512),
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
