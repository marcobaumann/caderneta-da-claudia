"use server";

import { redirect } from "next/navigation";
import { obterUsuarioId } from "@/lib/auth";
import { buscarCategoria, listarCategorias } from "@/lib/categorias";
import {
  ERRO_GENERICO,
  ERRO_SESSAO,
  POSTGRES_FK_VIOLADA,
  POSTGRES_NOME_REPETIDO,
  atualizarTudo,
  texto,
  type EstadoAcao,
} from "@/lib/formularios";
import { createClient } from "@/lib/supabase/server";

// Valores do formulário como texto, para devolver ao campo quando houver erro.
export type ValoresCategoria = { nome: string; tipo: string; corHex: string };

export type EstadoCategoria = EstadoAcao & { valores?: ValoresCategoria };

const ERRO_NOME_REPETIDO = "Você já tem uma categoria com esse nome.";

function valoresDe(formData: FormData): ValoresCategoria {
  return {
    nome: texto(formData, "nome"),
    tipo: texto(formData, "tipo"),
    corHex: texto(formData, "corHex"),
  };
}

type Conferido =
  | { ok: true; dados: { nome: string; tipo: "entrada" | "saida"; corHex: string } }
  | { ok: false; estado: EstadoCategoria };

function conferir(formData: FormData): Conferido {
  const valores = valoresDe(formData);
  const falha = (erro: string): Conferido => ({ ok: false, estado: { erro, valores } });

  const nome = valores.nome.trim();
  if (!nome) return falha("Preencha o nome da categoria.");
  if (nome.length > 50) return falha("O nome pode ter no máximo 50 caracteres.");

  if (valores.tipo !== "entrada" && valores.tipo !== "saida") {
    return falha("Escolha se a categoria é de entrada ou de saída.");
  }
  // Mesma regra do CHECK do banco: #RRGGBB.
  if (!/^#[0-9A-Fa-f]{6}$/.test(valores.corHex)) return falha("Escolha uma cor válida.");

  return {
    ok: true,
    dados: { nome, tipo: valores.tipo, corHex: valores.corHex.toUpperCase() },
  };
}

// O UNIQUE do banco só barra nomes idênticos; aqui "Mercado", "mercado" e "Mercádo" contam como iguais.
function normalizar(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

async function nomeEmUso(nome: string, ignorarId?: number): Promise<boolean> {
  const alvo = normalizar(nome);
  const categorias = await listarCategorias();
  return categorias.some((c) => c.id !== ignorarId && normalizar(c.nome) === alvo);
}

function mensagemDoErro(error: { code?: string }): string {
  return error.code === POSTGRES_NOME_REPETIDO ? ERRO_NOME_REPETIDO : ERRO_GENERICO;
}

export async function criarCategoria(
  _anterior: EstadoCategoria,
  formData: FormData,
): Promise<EstadoCategoria> {
  const conferido = conferir(formData);
  if (!conferido.ok) return conferido.estado;
  const { dados } = conferido;
  const valores = valoresDe(formData);

  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO, valores };
    if (await nomeEmUso(dados.nome)) return { erro: ERRO_NOME_REPETIDO, valores };

    const supabase = await createClient();
    const { error } = await supabase.from("categorias").insert({
      usuario_id: usuarioId,
      nome: dados.nome,
      tipo: dados.tipo,
      cor_hex: dados.corHex,
    });
    if (error) return { erro: mensagemDoErro(error), valores };
  } catch (e) {
    console.error("criarCategoria", e);
    return { erro: ERRO_GENERICO, valores };
  }

  // redirect() lança uma exceção interna do Next: fica fora do try/catch.
  atualizarTudo();
  redirect("/categorias?aviso=criada");
}

// O id vem de .bind(null, id) na página; o RLS e o filtro por usuario_id impedem mexer em dado alheio.
export async function editarCategoria(
  id: number,
  _anterior: EstadoCategoria,
  formData: FormData,
): Promise<EstadoCategoria> {
  const conferido = conferir(formData);
  if (!conferido.ok) return conferido.estado;
  const { dados } = conferido;
  const valores = valoresDe(formData);

  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO, valores };

    const atual = await buscarCategoria(id);
    if (!atual) return { erro: "Categoria não encontrada.", valores };

    // Mudar o tipo deixaria os lançamentos existentes contradizendo a categoria.
    if (dados.tipo !== atual.tipo && atual.totalLancamentos > 0) {
      return {
        erro: `Não é possível mudar o tipo: a categoria tem ${atual.totalLancamentos} ${atual.totalLancamentos === 1 ? "lançamento" : "lançamentos"}. Crie uma nova categoria com o outro tipo.`,
        valores,
      };
    }
    // Só confere o nome se ele mudou, para não travar quem edita só a cor.
    if (normalizar(dados.nome) !== normalizar(atual.nome) && (await nomeEmUso(dados.nome, id))) {
      return { erro: ERRO_NOME_REPETIDO, valores };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categorias")
      .update({ nome: dados.nome, tipo: dados.tipo, cor_hex: dados.corHex })
      .eq("categoria_id", id)
      .eq("usuario_id", usuarioId)
      .select("categoria_id");
    if (error) return { erro: mensagemDoErro(error), valores };
    if (data.length === 0) return { erro: "Categoria não encontrada.", valores };
  } catch (e) {
    console.error("editarCategoria", e);
    return { erro: ERRO_GENERICO, valores };
  }

  atualizarTudo();
  redirect("/categorias?aviso=editada");
}

export async function excluirCategoria(
  id: number,
  _anterior: EstadoCategoria,
): Promise<EstadoCategoria> {
  try {
    const usuarioId = await obterUsuarioId();
    if (usuarioId === null) return { erro: ERRO_SESSAO };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categorias")
      .delete()
      .eq("categoria_id", id)
      .eq("usuario_id", usuarioId)
      .select("categoria_id");
    if (error) {
      return {
        erro:
          error.code === POSTGRES_FK_VIOLADA
            ? "Esta categoria está em uso por lançamentos ou recorrências e não pode ser excluída. Mude a categoria desses lançamentos primeiro."
            : "Não foi possível excluir agora. Tente novamente.",
      };
    }
    if (data.length === 0) return { erro: "Categoria não encontrada (talvez já tenha sido excluída)." };
  } catch (e) {
    console.error("excluirCategoria", e);
    return { erro: "Não foi possível excluir agora. Tente novamente." };
  }

  atualizarTudo();
  redirect("/categorias?aviso=excluida");
}
