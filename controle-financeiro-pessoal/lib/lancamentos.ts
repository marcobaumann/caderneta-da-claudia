export type TipoLancamento = "entrada" | "saida";

export type Lancamento = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  data: string; // formato AAAA-MM-DD
  categoriaId?: number; // opcional: lançamento pode não ter categoria
};

// Lista fixa de exemplo (ainda sem banco de dados).
export const lancamentos: Lancamento[] = [
  { id: 1, descricao: "mercado do mes", valor: 341.43, tipo: "saida", data: "2025-01-01", categoriaId: 1 },
  { id: 2, descricao: "salario", valor: 856.74, tipo: "entrada", data: "2025-01-02", categoriaId: 4 },
  { id: 3, descricao: "aluguel", valor: 1200.00, tipo: "saida", data: "2025-01-03", categoriaId: 2 },
  { id: 4, descricao: "presente", valor: 80.00, tipo: "saida", data: "2025-01-04" }, // sem categoria
];

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
