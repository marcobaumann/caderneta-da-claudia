export type TipoLancamento = "entrada" | "saida";

export type Lancamento = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  data: string; // formato AAAA-MM-DD
  categoriaId?: number; // opcional: lançamento pode não ter categoria
};

// Dados de exemplo (ainda sem banco de dados).
const lancamentos: Lancamento[] = [
  { id: 1, descricao: "mercado do mes", valor: 341.43, tipo: "saida", data: "2025-01-01", categoriaId: 1 },
  { id: 2, descricao: "salario", valor: 856.74, tipo: "entrada", data: "2025-01-02", categoriaId: 4 },
  { id: 3, descricao: "conta de luz", valor: 89.05, tipo: "saida", data: "2025-01-03", categoriaId: 2 },
  { id: 4, descricao: "padaria", valor: 123.97, tipo: "saida", data: "2025-01-04", categoriaId: 1 },
  { id: 5, descricao: "aluguel", valor: 2350.0, tipo: "saida", data: "2025-01-05", categoriaId: 2 },
  { id: 6, descricao: "freela", valor: 1200.0, tipo: "entrada", data: "2025-01-06", categoriaId: 4 },
];

// Simula uma busca de dados: espera 300ms e devolve os lançamentos.
export async function listarLancamentos(): Promise<Lancamento[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return lancamentos;
}

export function buscarLancamento(id: number): Lancamento | undefined {
  return lancamentos.find((l) => l.id === id);
}

export function listarLancamentosPorCategoria(categoriaId: number): Lancamento[] {
  return lancamentos.filter((l) => l.categoriaId === categoriaId);
}

export function contarLancamentosPorCategoria(categoriaId: number): number {
  return listarLancamentosPorCategoria(categoriaId).length;
}

export function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
