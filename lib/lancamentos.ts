import { createClient } from "@/lib/supabase/server";

export type TipoLancamento = "entrada" | "saida";

export type Lancamento = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  data: string; // formato AAAA-MM-DD
  contaId: number;
  categoriaId?: number;
  categoriaNome?: string;
};

// Colunas conforme schema.sql, com o nome da categoria vindo do join pela FK.
const COLUNAS =
  "lancamento_id, tipo, valor, data_lancamento, descricao, conta_id, categoria_id, categorias(nome)";

type Linha = {
  lancamento_id: number;
  tipo: TipoLancamento;
  valor: number | string; // numeric pode chegar como string
  data_lancamento: string;
  descricao: string | null;
  conta_id: number;
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
    contaId: l.conta_id,
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

// O Supabase devolve no máximo 1000 linhas por consulta; busca em páginas para não truncar sem avisar.
const TAMANHO_PAGINA = 1000;

// Só os lançamentos entre `inicio` e `fim` (AAAA-MM-DD, ambos inclusos), opcionalmente de um tipo.
// O filtro por data roda no banco; o RLS limita ao usuário logado.
export async function listarLancamentosPorPeriodo(
  inicio: string,
  fim: string,
  tipo?: TipoLancamento,
): Promise<Lancamento[]> {
  const supabase = await createClient();
  const lancamentos: Lancamento[] = [];

  for (let de = 0; ; de += TAMANHO_PAGINA) {
    let consulta = supabase
      .from("lancamentos")
      .select(COLUNAS)
      .gte("data_lancamento", inicio)
      .lte("data_lancamento", fim);
    if (tipo) consulta = consulta.eq("tipo", tipo);

    // A ordem precisa ser estável (desempate pelo id) para as páginas não se repetirem.
    const { data, error } = await consulta
      .order("data_lancamento", { ascending: false })
      .order("lancamento_id", { ascending: false })
      .range(de, de + TAMANHO_PAGINA - 1)
      .overrideTypes<Linha[], { merge: false }>();

    if (error) throw new Error(`Falha ao buscar lançamentos do período: ${error.message}`);
    lancamentos.push(...data.map(paraLancamento));
    if (data.length < TAMANHO_PAGINA) return lancamentos;
  }
}
