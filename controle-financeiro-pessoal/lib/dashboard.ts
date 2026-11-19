import type { Lancamento } from "@/lib/lancamentos";
import { rotuloCurto, type Mes } from "@/lib/periodo";

// Cálculos do dashboard: funções puras sobre o tipo Lancamento (definido só em lib/lancamentos.ts).
// Somas em centavos inteiros para evitar erros de ponto flutuante.

export type ResumoMes = { entradas: number; saidas: number; resultado: number };

export type CategoriaGasto = {
  categoriaId?: number;
  nome: string;
  total: number;
  ultimaData: string; // AAAA-MM-DD do gasto mais recente na categoria
};

export type PontoEvolucao = { mes: Mes; rotulo: string; total: number };

function emCentavos(valor: number): number {
  return Math.round(valor * 100);
}

export function resumir(lancamentos: Lancamento[]): ResumoMes {
  let entradas = 0;
  let saidas = 0;
  for (const l of lancamentos) {
    if (l.tipo === "entrada") entradas += emCentavos(l.valor);
    else saidas += emCentavos(l.valor);
  }
  return { entradas: entradas / 100, saidas: saidas / 100, resultado: (entradas - saidas) / 100 };
}

// As categorias com mais saídas, da maior para a menor.
export function maioresCategoriasDeSaida(lancamentos: Lancamento[], limite: number): CategoriaGasto[] {
  const porCategoria = new Map<number | "sem", { nome: string; centavos: number; ultimaData: string; categoriaId?: number }>();

  for (const l of lancamentos) {
    if (l.tipo !== "saida") continue;
    const chave = l.categoriaId ?? "sem";
    const atual = porCategoria.get(chave) ?? {
      nome: l.categoriaNome ?? "Sem categoria",
      centavos: 0,
      ultimaData: l.data,
      categoriaId: l.categoriaId,
    };
    atual.centavos += emCentavos(l.valor);
    if (l.data > atual.ultimaData) atual.ultimaData = l.data; // AAAA-MM-DD compara como texto
    porCategoria.set(chave, atual);
  }

  return [...porCategoria.values()]
    .sort((a, b) => b.centavos - a.centavos || a.nome.localeCompare(b.nome, "pt-BR"))
    .slice(0, limite)
    .map((c) => ({
      categoriaId: c.categoriaId,
      nome: c.nome,
      total: c.centavos / 100,
      ultimaData: c.ultimaData,
    }));
}

// Total de saídas em cada um dos meses pedidos (meses sem saída aparecem com 0).
export function evolucaoDeSaidas(lancamentos: Lancamento[], meses: Mes[]): PontoEvolucao[] {
  const porMes = new Map<Mes, number>(meses.map((mes) => [mes, 0]));

  for (const l of lancamentos) {
    if (l.tipo !== "saida") continue;
    const mes = l.data.slice(0, 7);
    const atual = porMes.get(mes);
    if (atual !== undefined) porMes.set(mes, atual + emCentavos(l.valor));
  }

  return meses.map((mes) => ({
    mes,
    rotulo: rotuloCurto(mes),
    total: (porMes.get(mes) ?? 0) / 100,
  }));
}
