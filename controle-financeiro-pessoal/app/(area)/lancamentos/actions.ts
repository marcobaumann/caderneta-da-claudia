"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obterUsuarioId } from "@/lib/auth";
import { lerId } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";

// Valores do formulário como texto, para devolver ao campo quando houver erro.
export type ValoresLancamento = {
  descricao: string;
  valor: string;
  tipo: string;
  data: string;
  contaId: string;
  categoriaId: string;
};

export type EstadoLancamento = { erro?: string; valores?: ValoresLancamento };

type DadosValidos = {
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
  contaId: number;
  categoriaId: number;
};

const ERRO_GENERICO = "Não foi possível salvar agora. Tente novamente.";
const ERRO_SESSAO = "Não foi possível identificar o seu usuário. Entre novamente.";
const POSTGRES_FK_VIOLADA = "23503";

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

// Aceita "12.5", "12,50" e "1.234,56". Devolve null se não for um valor positivo
// com até 2 casas que caiba em NUMERIC(10,2).
function lerValor(entrada: string): number | null {
  const limpo = entrada.replace(/\s/g, "");
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  const numero = Number(normalizado);
  return numero > 0 && numero <= 99_999_999.99 ? numero : null;
}

// AAAA-MM-DD e uma data que existe de verdade (rejeita 2025-02-30).
function dataValida(entrada: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada)) return false;
  const data = new Date(`${entrada}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === entrada;
}

function conferir(
  formData: FormData,
): { ok: true; dados: DadosValidos } | { ok: false; estado: EstadoLancamento } {
  const valores = valoresDe(formData);
  const falha = (erro: string) => ({ ok: false as const, estado: { erro, valores } });

  const descricao = valores.descricao.trim();
  if (!descricao) return falha("Preencha a descrição.");
  if (descricao.length > 200) return falha("A descrição pode ter no máximo 200 caracteres.");

  const valor = lerValor(valores.valor);
  if (valor === null) return falha("Informe um valor maior que zero, com até 2 casas decimais.");

  if (valores.tipo !== "entrada" && valores.tipo !== "saida") {
    return falha("Escolha se é entrada ou saída.");
  }
  if (!dataValida(valores.data)) return falha("Informe uma data válida.");

  const contaId = lerId(valores.contaId);
  if (contaId === null) return falha("Escolha a conta.");
  const categoriaId = lerId(valores.categoriaId);
  if (categoriaId === null) return falha("Escolha a categoria.");

  return {
    ok: true,
    dados: { descricao, valor, tipo: valores.tipo, data: valores.data, contaId, categoriaId },
  };
}

function mensagemDoErro(error: { code?: string }): string {
  return error.code === POSTGRES_FK_VIOLADA ? "Conta ou categoria inválida." : ERRO_GENERICO;
}

function atualizarTelas() {
  revalidatePath("/lancamentos");
  revalidatePath("/categorias");
}

export async function criarLancamento(
  _anterior: EstadoLancamento,
  formData: FormData,
): Promise<EstadoLancamento> {
  const conferido = conferir(formData);
  if (!conferido.ok) return conferido.estado;
  const { dados } = conferido;

  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO, valores: valoresDe(formData) };

    const supabase = await createClient();
    const { error } = await supabase.from("lancamentos").insert({
      usuario_id: usuarioId,
      conta_id: dados.contaId,
      categoria_id: dados.categoriaId,
      tipo: dados.tipo,
      valor: dados.valor,
      data_lancamento: dados.data,
      descricao: dados.descricao,
    });
    if (error) return { erro: mensagemDoErro(error), valores: valoresDe(formData) };
  } catch (e) {
    console.error("criarLancamento", e);
    return { erro: ERRO_GENERICO, valores: valoresDe(formData) };
  }

  // redirect() lança uma exceção interna do Next: fica fora do try/catch.
  atualizarTelas();
  redirect("/lancamentos?aviso=criado");
}

// O id vem de .bind(null, id) na página; o RLS e o filtro por usuario_id impedem mexer em dado alheio.
export async function editarLancamento(
  id: number,
  _anterior: EstadoLancamento,
  formData: FormData,
): Promise<EstadoLancamento> {
  const conferido = conferir(formData);
  if (!conferido.ok) return conferido.estado;
  const { dados } = conferido;
  const valores = valoresDe(formData);

  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO, valores };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lancamentos")
      .update({
        conta_id: dados.contaId,
        categoria_id: dados.categoriaId,
        tipo: dados.tipo,
        valor: dados.valor,
        data_lancamento: dados.data,
        descricao: dados.descricao,
      })
      .eq("lancamento_id", id)
      .eq("usuario_id", usuarioId)
      .select("lancamento_id");
    if (error) return { erro: mensagemDoErro(error), valores };
    if (data.length === 0) return { erro: "Lançamento não encontrado.", valores };
  } catch (e) {
    console.error("editarLancamento", e);
    return { erro: ERRO_GENERICO, valores };
  }

  atualizarTelas();
  revalidatePath(`/lancamentos/${id}`);
  redirect("/lancamentos?aviso=editado");
}

export async function excluirLancamento(
  id: number,
  _anterior: EstadoLancamento,
): Promise<EstadoLancamento> {
  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lancamentos")
      .delete()
      .eq("lancamento_id", id)
      .eq("usuario_id", usuarioId)
      .select("lancamento_id");
    if (error) return { erro: "Não foi possível excluir agora. Tente novamente." };
    if (data.length === 0) return { erro: "Lançamento não encontrado (talvez já tenha sido excluído)." };
  } catch (e) {
    console.error("excluirLancamento", e);
    return { erro: "Não foi possível excluir agora. Tente novamente." };
  }

  atualizarTelas();
  redirect("/lancamentos?aviso=excluido");
}

function valoresDe(formData: FormData): ValoresLancamento {
  return {
    descricao: texto(formData, "descricao"),
    valor: texto(formData, "valor"),
    tipo: texto(formData, "tipo"),
    data: texto(formData, "data"),
    contaId: texto(formData, "contaId"),
    categoriaId: texto(formData, "categoriaId"),
  };
}
