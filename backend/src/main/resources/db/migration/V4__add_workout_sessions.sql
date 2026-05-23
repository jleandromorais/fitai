-- V4: Tabela de histórico de sessões executadas
CREATE TABLE IF NOT EXISTS workout_sessions (
    id                BIGSERIAL    PRIMARY KEY,
    workout_id        BIGINT       NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id           BIGINT       NOT NULL REFERENCES useres(id)   ON DELETE CASCADE,
    executed_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    duration_minutes  INTEGER,
    sets_completed    INTEGER,
    total_volume      DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date
    ON workout_sessions(user_id, executed_at DESC);
