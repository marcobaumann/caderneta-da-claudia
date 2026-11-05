# Dicionário de dados — Caderneta da Cláudia

Banco: `caderneta` (PostgreSQL 14+). Período dos dados: **2025-01-01 a 2025-06-30**.
Volume: 3 usuários, 10 contas, 40 categorias, 14 recorrências, 1.100 lançamentos.

## usuarios

Cada pessoa da casa com acesso próprio ao sistema.

| Coluna | Tipo | Significado | Exemplo |
|---|---|---|---|
| usuario_id | INTEGER PK | Identificador do usuário | 1 |
| nome | TEXT NOT NULL | Nome de exibição | Claudia Marques |
| email | TEXT NOT NULL UNIQUE | E-mail de login, único no sistema | claudia@exemplo.com.br |
| senha_hash | TEXT NOT NULL | Hash fictício da senha (não é hash real) | hash$claudia |
| criado_em | DATE NOT NULL | Data de criação do acesso | 2024-12-20 |

Usuários: 1 Cláudia (maior volume), 2 Paulo, 3 Rafaela (usuário de teste, pouquíssimo movimento).

## contas

Onde o dinheiro fica guardado. Pertence a exatamente um usuário.

| Coluna | Tipo | Significado | Exemplo |
|---|---|---|---|
| conta_id | INTEGER PK | Identificador da conta | 1 |
| usuario_id | INTEGER NOT NULL FK → usuarios | Dono da conta | 1 |
| nome | TEXT NOT NULL | Nome dado pelo usuário (único por usuário) | Conta Corrente Claudia |
| tipo | TEXT NOT NULL | `corrente`, `cartao`, `especie`, `poupanca` | corrente |
| saldo_inicial | NUMERIC(10,2) NOT NULL | Saldo no dia em que a conta entrou no sistema (pode ser 0, nunca nulo) | 48000.00 |
| data_abertura | DATE NOT NULL | Dia em que o saldo inicial foi informado | 2025-01-01 |

> O **saldo atual não é armazenado**: é `saldo_inicial + entradas − saídas`.
> A conta 7 (Carteira Paulo) nasce com apenas R$ 120,00 e é a única que termina negativa.

## categorias

Classificação criada pelo próprio usuário.

| Coluna | Tipo | Significado | Exemplo |
|---|---|---|---|
| categoria_id | INTEGER PK | Identificador da categoria | 1 |
| usuario_id | INTEGER NOT NULL FK → usuarios | Dono da categoria | 1 |
| nome | TEXT NOT NULL | Nome (único por usuário) | Mercado |
| tipo | TEXT NOT NULL | `entrada` ou `saida` | saida |
| cor_hex | TEXT NOT NULL | Cor em `#RRGGBB` | #E53935 |

## recorrencias

Despesa ou receita que repete todo mês. O sistema **não** gera o lançamento sozinho.

| Coluna | Tipo | Significado | Exemplo |
|---|---|---|---|
| recorrencia_id | INTEGER PK | Identificador | 1 |
| usuario_id | INTEGER NOT NULL FK → usuarios | Dono | 1 |
| conta_id | INTEGER NOT NULL FK → contas (conta_id, usuario_id) | Conta prevista | 1 |
| categoria_id | INTEGER NOT NULL FK → categorias (categoria_id, usuario_id) | Categoria prevista | 3 |
| descricao | TEXT NOT NULL | O que é | Aluguel do apartamento |
| valor_previsto | NUMERIC(10,2) NOT NULL > 0 | Valor esperado por mês | 2350.00 |
| dia_do_mes | INTEGER NOT NULL (1..28) | Dia de vencimento | 5 |
| data_inicio | DATE NOT NULL | Primeiro mês válido | 2025-01-01 |
| data_fim | DATE NULL | Último mês válido (nulo = sem fim) | 2025-04-30 |

## lancamentos

Cada gasto ou entrada de dinheiro.

| Coluna | Tipo | Significado | Exemplo |
|---|---|---|---|
| lancamento_id | INTEGER PK | Identificador | 412 |
| usuario_id | INTEGER NOT NULL FK → usuarios | Dono do lançamento | 1 |
| conta_id | INTEGER NOT NULL FK composta (conta_id, usuario_id) | Conta movimentada | 1 |
| categoria_id | INTEGER NOT NULL FK composta (categoria_id, usuario_id) | Categoria | 1 |
| recorrencia_id | INTEGER NULL FK → recorrencias | Recorrência que originou o lançamento (nulo se avulso) | 3 |
| tipo | TEXT NOT NULL | `entrada` ou `saida` | saida |
| valor | NUMERIC(10,2) NOT NULL > 0 | Valor sempre positivo; o sinal vem do `tipo` | 318.45 |
| data_lancamento | DATE NOT NULL | Data do movimento | 2025-05-14 |
| descricao | TEXT NULL | Texto curto (pode vir vazio da planilha antiga) | mercado do mes |

## Sujeira conhecida nos dados (armadilhas)

| O que | Quantos |
|---|---|
| Lançamentos com descrição nula ou só espaços | 18 |
| Grupos de lançamentos duplicados (mesmo usuário, conta, data, valor e descrição) | 7 |
| Categorias quase iguais contendo "mercado" ou "lazer" | 6 |
| Lançamentos cujo `tipo` não bate com o `tipo` da categoria | 9 |
| Contas com saldo calculado negativo no fim do período | 1 (Carteira Paulo, conta 7) |
