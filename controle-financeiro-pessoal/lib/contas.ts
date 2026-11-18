import { obterUsuarioId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Conta = {
  id: number;
  nome: string;
};

type Linha = {
  conta_id: number;
  nome: string;
};

// Filtra explicitamente pelo usuario_id do login atual; o RLS garante a mesma regra por baixo.
export async function listarContas(): Promise<Conta[]> {
  const usuarioId = await obterUsuarioId();
  if (usuarioId === null) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contas")
    .select("conta_id, nome")
    .eq("usuario_id", usuarioId)
    .order("nome", { ascending: true })
    .overrideTypes<Linha[], { merge: false }>();

  if (error) throw new Error(`Falha ao buscar contas: ${error.message}`);
  return data.map((c) => ({ id: c.conta_id, nome: c.nome.trim() }));
}
