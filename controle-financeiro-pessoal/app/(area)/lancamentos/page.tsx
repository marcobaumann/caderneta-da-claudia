import LancamentosLista from "@/components/LancamentosLista";
import { listarLancamentos } from "@/lib/lancamentos";

// Server Component async: busca os dados no servidor.
// Só a lista com filtros (LancamentosLista) é Client Component.
export default async function LancamentosPage() {
  const lancamentos = await listarLancamentos();

  return (
    <>
      <h1>Lançamentos</h1>
      <LancamentosLista lancamentos={lancamentos} />
    </>
  );
}
