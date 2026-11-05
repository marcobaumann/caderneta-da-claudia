# Requisitos — Caderneta da Cláudia

Relato da cliente transformado em requisitos. **Não há modelo pronto aqui**: o desenho do banco é seu.

## Contexto

Cláudia controlava o dinheiro da família numa planilha com uma aba para cada coisa. Depois de três anos, a planilha ficou lenta e frágil: Paulo apaga fórmulas sem querer e os dois não conseguem ter controles separados. A Caderneta substitui essa planilha.

## R1 — Acesso por pessoa
Cada pessoa da casa tem um acesso próprio, identificado por um e-mail que **não se repete** no sistema, com nome, senha (guardada como hash) e data de criação. Cada pessoa enxerga **apenas os próprios dados**.

## R2 — Contas
Cada pessoa cadastra suas contas: conta corrente, cartão de crédito, dinheiro em espécie e poupança. Toda conta pertence a **uma única pessoa** (não existe conta sem dono nem conta compartilhada) e nasce com um **saldo inicial informado** — pode ser zero, nunca em branco — na data em que entrou no sistema.

## R3 — Categorias
A própria pessoa cria suas categorias, cada uma com nome, uma cor em hexadecimal no formato `#RRGGBB` e a indicação de se é categoria **de entrada** ou **de saída**. Uma mesma pessoa não pode ter duas categorias com o mesmo nome. São de 12 a 18 categorias por pessoa (mercado, aluguel, escola, lazer, transporte, saúde, salário, freelas…).

## R4 — Lançamentos
Todo gasto ou entrada é um lançamento com: valor **sempre positivo**, data, descrição curta ("mercado do mês", "salário", "escola das crianças"), tipo (**entrada** ou **saída**, e só isso), a conta movimentada e a categoria. O que diz se o dinheiro entrou ou saiu é o tipo, nunca o sinal do valor.

## R5 — Saldo
O saldo de uma conta é `saldo inicial + entradas − saídas`. O cliente **não digita** saldo: decida se o sistema guarda esse número ou calcula na hora, e justifique a escolha.

## R6 — Recorrências
Gastos que repetem todo mês (aluguel, luz, internet, escola) ficam cadastrados uma vez: valor previsto, dia do mês (que precisa caber em qualquer mês), conta, categoria, data de início e, às vezes, data de fim. O sistema **não** lança sozinho: a pessoa confirma.

## R7 — Origem do lançamento
Quando uma recorrência é lançada no mês, é preciso saber **qual lançamento veio de qual recorrência**. Lançamentos avulsos não têm origem.

## R8 — Isolamento entre pessoas
Nenhum lançamento pode cruzar fronteiras: a conta e a categoria usadas têm de pertencer ao **mesmo dono** do lançamento. Trocar um id na URL não pode devolver dado de outra pessoa.

## R9 — Histórico preservado
Apagar uma categoria que já foi usada **não pode** apagar o histórico de lançamentos da família.

## R10 — Dinheiro exato
Valores em dinheiro precisam ser exatos, sem erro de arredondamento. Escolha o tipo adequado e justifique.

## R11 — Desempenho
As consultas mais frequentes são "lançamentos de uma pessoa num mês" e "total por categoria no período". Proponha os índices.

## R12 — Evolução prevista
Cláudia quer, no futuro, transferir dinheiro entre contas dela. Avalie o impacto da mudança no modelo que você desenhou.

## Fora de escopo nesta versão
Faturas e parcelamento de cartão, orçamento/meta por categoria, anexos e conciliação bancária, moeda estrangeira e investimentos, recuperação de senha e 2FA.
