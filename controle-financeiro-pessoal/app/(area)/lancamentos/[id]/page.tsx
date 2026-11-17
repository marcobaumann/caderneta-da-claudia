import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarValor } from "@/lib/formatadores";
import { lerId } from "@/lib/ids";
import { buscarLancamento } from "@/lib/lancamentos";

export const metadata: Metadata = { title: "Lançamento" };

// No Next 15, params é uma Promise.
export default async function LancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const id = lerId((await params).id);
  if (id === null) notFound();

  const lancamento = await buscarLancamento(id);
  if (!lancamento) notFound();

  return (
    <>
      <p>
        <Link href="/lancamentos">← Voltar</Link>
      </p>
      <h1>{lancamento.descricao}</h1>
      <p>Tipo: {lancamento.tipo === "entrada" ? "Entrada" : "Saída"}</p>
      <p>Valor: {formatarValor(lancamento.valor)}</p>
      <p>Data: {formatarData(lancamento.data)}</p>
      <p>
        Categoria:{" "}
        {lancamento.categoriaId !== undefined && lancamento.categoriaNome ? (
          <Link href={`/categoria/${lancamento.categoriaId}`}>{lancamento.categoriaNome}</Link>
        ) : (
          "Sem categoria"
        )}
      </p>
    </>
  );
}
