const MAIOR_INTEGER_POSTGRES = 2_147_483_647;

// Converte o [id] da URL em número, ou null se não for um inteiro positivo válido.
// Evita "01", "1.0", "abc" e valores fora do INTEGER do Postgres (que gerariam erro no banco).
export function lerId(valor: string): number | null {
  if (!/^[1-9]\d*$/.test(valor)) return null;
  const numero = Number(valor);
  return numero <= MAIOR_INTEGER_POSTGRES ? numero : null;
}
