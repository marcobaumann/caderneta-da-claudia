import { createClient } from "@/lib/supabase/server";

export type TipoLancamento = "entrada" | "saida";

export type Lancamento = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  data: string; // formato AAAA-MM-DD
  categoriaId?: number;
  categoriaNome?: string;
};

// Colunas conforme schema.sql, com o nome da categoria vindo do join pela FK.
const COLUNAS =
  "lancamento_id, tipo, valor, data_lancamento, descricao, categoria_id, categorias(nome)";

type Linha = {
  lancamento_id: number;
  tipo: TipoLancamento;
  valor: number | string; // numeric pode chegar como string
  data_lancamento: string;
  descricao: string | null;
  categoria_id: number | null;
  categorias: { nome: string } | null;
};

function paraLancamento(l: Linha): Lancamento {
  return {
    id: l.lancamento_id,
    descricao: l.descricao?.trim() || "(sem descrição)",
    valor: Number(l.valor),
    tipo: l.tipo,
    data: l.data_lancamento,
    categoriaId: l.categoria_id ?? undefined,
    categoriaNome: l.categorias?.nome.trim(),
  };
}

// Nenhuma função filtra por usuário no código: o RLS (supabase/rls.sql) só devolve
// as linhas do usuario_id ligado ao login atual.

// Do mais recente para o mais antigo.
export async function listarLancamentos(): Promise<Lancamento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lancamentos")
    .select(COLUNAS)
    .order("data_lancamento", { ascending: false })
    .order("lancamento_id", { ascending: false })
    .overrideTypes<Linha[], { merge: false }>();

  if (error) throw new Error(`Falha ao buscar lançamentos: ${error.message}`);
  return data.map(paraLancamento);
}

export async function buscarLancamento(id: number): Promise<Lancamento | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lancamentos")
    .select(COLUNAS)
    .eq("lancamento_id", id)
    .maybeSingle<Linha>();

  if (error) throw new Error(`Falha ao buscar o lançamento: ${error.message}`);
  return data ? paraLancamento(data) : null;
}

export async function listarLancamentosPorCategoria(categoriaId: number): Promise<Lancamento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lancamentos")
    .select(COLUNAS)
    .eq("categoria_id", categoriaId)
    .order("data_lancamento", { ascending: false })
    .order("lancamento_id", { ascending: false })
    .overrideTypes<Linha[], { merge: false }>();

  if (error) throw new Error(`Falha ao buscar lançamentos da categoria: ${error.message}`);
  return data.map(paraLancamento);
}
