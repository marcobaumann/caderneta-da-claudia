import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BotaoExcluir from "@/components/BotaoExcluir";
import CategoriaForm from "@/components/CategoriaForm";
import { exigirUsuario } from "@/lib/auth";
import { buscarCategoria } from "@/lib/categorias";
import { lerId } from "@/lib/ids";
import { editarCategoria, excluirCategoria } from "../../../categorias/actions";

export const metadata: Metadata = { title: "Editar categoria" };

// No Next 15, params é uma Promise.
export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();

  const id = lerId((await params).id);
  if (id === null) notFound();

  const categoria = await buscarCategoria(id);
  if (!categoria) notFound();

  const total = categoria.totalLancamentos;

  return (
    <>
      <p>
        <Link href={`/categoria/${id}`}>← Voltar</Link>
      </p>
      <h1>Editar categoria</h1>
      <CategoriaForm
        acao={editarCategoria.bind(null, id)}
        valoresIniciais={{ nome: categoria.nome, tipo: categoria.tipo, corHex: categoria.corHex }}
        rotuloBotao="Salvar alterações"
        tipoTravado={total > 0}
      />

      <h2>Excluir</h2>
      <p className="muted">
        {total > 0
          ? `Esta categoria tem ${total} ${total === 1 ? "lançamento" : "lançamentos"} e não poderá ser excluída enquanto estiver em uso.`
          : "Só pode ser excluída se não estiver em uso por lançamentos nem por recorrências."}
      </p>
      <BotaoExcluir acao={excluirCategoria.bind(null, id)} confirmacao="Excluir esta categoria?" />
    </>
  );
}
