-- V2: Adiciona coluna de refresh token na tabela de usuários
-- Usado pelo mecanismo de renovação de access token sem re-login.

ALTER TABLE useres
    ADD COLUMN IF NOT EXISTS refresh_token       VARCHAR(512),
    ADD COLUMN IF NOT EXISTS refresh_token_expiry TIMESTAMP;
