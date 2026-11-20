import { obterUsuarioId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TipoLancamento } from "@/lib/lancamentos";

export type Categoria = {
  id: number;
  nome: string;
  tipo: TipoLancamento;
  corHex: string; // #RRGGBB (garantido por CHECK no banco)
  totalLancamentos: number;
};

type Linha = {
  categoria_id: number;
  nome: string;
  tipo: TipoLancamento;
  cor_hex: string;
  lancamentos: { count: number }[]; // agregado do PostgREST: lancamentos(count)
};

const COLUNAS = "categoria_id, nome, tipo, cor_hex, lancamentos(count)";

function paraCategoria(c: Linha): Categoria {
  return {
    id: c.categoria_id,
    nome: c.nome.trim(),
    tipo: c.tipo,
    corHex: c.cor_hex,
    totalLancamentos: c.lancamentos[0]?.count ?? 0,
  };
}

// Filtra explicitamente pelo usuario_id do login atual; o RLS garante a mesma regra por baixo.
export async function listarCategorias(): Promise<Categoria[]> {
  const usuarioId = await obterUsuarioId();
  if (usuarioId === null) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select(COLUNAS)
    .eq("usuario_id", usuarioId)
    .order("nome", { ascending: true })
    .overrideTypes<Linha[], { merge: false }>();

  if (error) throw new Error(`Falha ao buscar categorias: ${error.message}`);
  return data.map(paraCategoria);
}

export async function buscarCategoria(id: number): Promise<Categoria | null> {
  const usuarioId = await obterUsuarioId();
  if (usuarioId === null) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select(COLUNAS)
    .eq("categoria_id", id)
    .eq("usuario_id", usuarioId)
    .maybeSingle<Linha>();

  if (error) throw new Error(`Falha ao buscar a categoria: ${error.message}`);
  return data ? paraCategoria(data) : null;
}
