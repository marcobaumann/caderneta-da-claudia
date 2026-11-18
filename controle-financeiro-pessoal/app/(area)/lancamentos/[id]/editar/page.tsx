import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BotaoExcluir from "@/components/BotaoExcluir";
import LancamentoForm from "@/components/LancamentoForm";
import { exigirUsuario } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { listarContas } from "@/lib/contas";
import { lerId } from "@/lib/ids";
import { buscarLancamento } from "@/lib/lancamentos";
import { editarLancamento, excluirLancamento } from "../../actions";

export const metadata: Metadata = { title: "Editar lançamento" };

// No Next 15, params é uma Promise.
export default async function EditarLancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();

  const id = lerId((await params).id);
  if (id === null) notFound();

  const [lancamento, contas, categorias] = await Promise.all([
    buscarLancamento(id),
    listarContas(),
    listarCategorias(),
  ]);
  if (!lancamento) notFound();

  return (
    <>
      <p>
        <Link href={`/lancamentos/${id}`}>← Voltar</Link>
      </p>
      <h1>Editar lançamento</h1>
      <LancamentoForm
        acao={editarLancamento.bind(null, id)}
        valoresIniciais={{
          descricao: lancamento.descricao === "(sem descrição)" ? "" : lancamento.descricao,
          valor: lancamento.valor.toFixed(2),
          tipo: lancamento.tipo,
          data: lancamento.data,
          contaId: String(lancamento.contaId),
          categoriaId: lancamento.categoriaId !== undefined ? String(lancamento.categoriaId) : "",
        }}
        contas={contas}
        categorias={categorias}
        rotuloBotao="Salvar alterações"
      />

      <h2>Excluir</h2>
      <BotaoExcluir acao={excluirLancamento.bind(null, id)} />
    </>
  );
}
