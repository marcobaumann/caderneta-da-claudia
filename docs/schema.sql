-- schema.sql — Caderneta da Claudia (PostgreSQL 14+)
-- Execute antes de dados.sql
--
-- Criar o banco (rodar conectado em outro banco, ex.: postgres):
--   CREATE DATABASE caderneta;
--   \c caderneta

DROP TABLE IF EXISTS lancamentos;
DROP TABLE IF EXISTS recorrencias;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS contas;
DROP TABLE IF EXISTS usuarios;

-- ---------------------------------------------------------------------------
-- usuarios: cada pessoa da casa com acesso proprio
-- ---------------------------------------------------------------------------
CREATE TABLE usuarios (
  usuario_id  INTEGER PRIMARY KEY,
  nome        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  senha_hash  TEXT    NOT NULL,
  criado_em   DATE    NOT NULL
);

-- ---------------------------------------------------------------------------
-- contas: onde o dinheiro fica guardado
-- saldo atual NAO e armazenado: saldo_inicial + entradas - saidas
-- ---------------------------------------------------------------------------
CREATE TABLE contas (
  conta_id       INTEGER       PRIMARY KEY,
  usuario_id     INTEGER       NOT NULL REFERENCES usuarios (usuario_id),
  nome           TEXT          NOT NULL,
  tipo           TEXT          NOT NULL
                 CHECK (tipo IN ('corrente', 'cartao', 'especie', 'poupanca')),
  saldo_inicial  NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_abertura  DATE          NOT NULL,
  CONSTRAINT contas_nome_por_usuario_uk UNIQUE (usuario_id, nome),
  -- alvo das FKs compostas (garante que a conta e do mesmo usuario)
  CONSTRAINT contas_id_usuario_uk       UNIQUE (conta_id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- categorias: classificacao criada pelo proprio usuario
-- ---------------------------------------------------------------------------
CREATE TABLE categorias (
  categoria_id  INTEGER PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios (usuario_id),
  nome          TEXT    NOT NULL,
  tipo          TEXT    NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  cor_hex       TEXT    NOT NULL CHECK (cor_hex ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT categorias_nome_por_usuario_uk UNIQUE (usuario_id, nome),
  CONSTRAINT categorias_id_usuario_uk       UNIQUE (categoria_id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- recorrencias: despesa/receita mensal (nao gera lancamento sozinha)
-- ---------------------------------------------------------------------------
CREATE TABLE recorrencias (
  recorrencia_id  INTEGER       PRIMARY KEY,
  usuario_id      INTEGER       NOT NULL REFERENCES usuarios (usuario_id),
  conta_id        INTEGER       NOT NULL,
  categoria_id    INTEGER       NOT NULL,
  descricao       TEXT          NOT NULL,
  valor_previsto  NUMERIC(10,2) NOT NULL CHECK (valor_previsto > 0),
  dia_do_mes      INTEGER       NOT NULL CHECK (dia_do_mes BETWEEN 1 AND 28),
  data_inicio     DATE          NOT NULL,
  data_fim        DATE          NULL,
  CONSTRAINT recorrencias_periodo_ck CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT recorrencias_conta_fk
    FOREIGN KEY (conta_id, usuario_id) REFERENCES contas (conta_id, usuario_id),
  CONSTRAINT recorrencias_categoria_fk
    FOREIGN KEY (categoria_id, usuario_id) REFERENCES categorias (categoria_id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- lancamentos: cada gasto ou entrada de dinheiro
-- valor sempre positivo; o sinal vem do tipo
-- ---------------------------------------------------------------------------
CREATE TABLE lancamentos (
  lancamento_id    INTEGER       PRIMARY KEY,
  usuario_id       INTEGER       NOT NULL REFERENCES usuarios (usuario_id),
  conta_id         INTEGER       NOT NULL,
  categoria_id     INTEGER       NOT NULL,
  recorrencia_id   INTEGER       NULL REFERENCES recorrencias (recorrencia_id),
  tipo             TEXT          NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor            NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  data_lancamento  DATE          NOT NULL,
  descricao        TEXT          NULL,
  CONSTRAINT lancamentos_conta_fk
    FOREIGN KEY (conta_id, usuario_id) REFERENCES contas (conta_id, usuario_id),
  CONSTRAINT lancamentos_categoria_fk
    FOREIGN KEY (categoria_id, usuario_id) REFERENCES categorias (categoria_id, usuario_id)
);

-- Indices para as consultas mais comuns (extrato por usuario/periodo, saldo por conta)
CREATE INDEX lancamentos_usuario_data_idx ON lancamentos (usuario_id, data_lancamento);
CREATE INDEX lancamentos_conta_idx        ON lancamentos (conta_id);
CREATE INDEX lancamentos_categoria_idx    ON lancamentos (categoria_id);
CREATE INDEX lancamentos_recorrencia_idx  ON lancamentos (recorrencia_id);
