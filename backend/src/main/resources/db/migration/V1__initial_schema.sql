-- V1: Schema inicial — tabelas criadas originalmente pelo Hibernate ddl-auto=update
-- A partir desta versão o schema é gerenciado pelo Flyway.

CREATE TABLE IF NOT EXISTS useres (
    id       BIGSERIAL    PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS workouts (
    id       BIGSERIAL    PRIMARY KEY,
    user_id  BIGINT       NOT NULL REFERENCES useres(id) ON DELETE CASCADE,
    name     VARCHAR(255) NOT NULL,
    code     VARCHAR(2)   NOT NULL,
    schedule VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS workout_tags (
    workout_id BIGINT       NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    tag        VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
    id           BIGSERIAL    PRIMARY KEY,
    workout_id   BIGINT       NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    muscle       VARCHAR(255),
    rest_seconds INTEGER,
    position     INTEGER
);

CREATE TABLE IF NOT EXISTS set_data (
    id          BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT    NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    reps        INTEGER,
    weight      DOUBLE PRECISION,
    done        BOOLEAN,
    prev        DOUBLE PRECISION,
    position    INTEGER
);
