import type { Metadata } from "next";
import LancamentosLista from "@/components/LancamentosLista";
import { exigirUsuario } from "@/lib/auth";
import { listarLancamentos } from "@/lib/lancamentos";

export const metadata: Metadata = { title: "Lançamentos" };

// Server Component async: confirma quem está logado; o RLS devolve só os lançamentos dessa pessoa.
// Só a lista com filtros (LancamentosLista) é Client Component.
export default async function LancamentosPage() {
  await exigirUsuario();
  const lancamentos = await listarLancamentos();

  return (
    <>
      <h1>Lançamentos</h1>
      <LancamentosLista lancamentos={lancamentos} />
    </>
  );
}
