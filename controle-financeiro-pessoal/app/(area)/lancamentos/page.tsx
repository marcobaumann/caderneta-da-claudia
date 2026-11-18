import type { Metadata } from "next";
import Link from "next/link";
import Aviso from "@/components/Aviso";
import LancamentosLista from "@/components/LancamentosLista";
import { exigirUsuario } from "@/lib/auth";
import { listarLancamentos } from "@/lib/lancamentos";

export const metadata: Metadata = { title: "Lançamentos" };

const AVISOS: Record<string, string> = {
  criado: "Lançamento cadastrado com sucesso!",
  editado: "Lançamento atualizado com sucesso!",
  excluido: "Lançamento excluído com sucesso!",
};

// Server Component async: confirma quem está logado; o RLS devolve só os lançamentos dessa pessoa.
// Só a lista com filtros (LancamentosLista) é Client Component.
export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  await exigirUsuario();
  const { aviso } = await searchParams;
  // Só mensagens conhecidas: um ?aviso=qualquer-coisa na URL não mostra nada.
  const mensagem = aviso !== undefined && Object.hasOwn(AVISOS, aviso) ? AVISOS[aviso] : undefined;
  const lancamentos = await listarLancamentos();

  return (
    <>
      {mensagem && <Aviso mensagem={mensagem} />}
      <h1>Lançamentos</h1>
      <p>
        <Link href="/lancamentos/novo" className="botao">
          + Novo lançamento
        </Link>
      </p>
      <LancamentosLista lancamentos={lancamentos} />
    </>
  );
}
