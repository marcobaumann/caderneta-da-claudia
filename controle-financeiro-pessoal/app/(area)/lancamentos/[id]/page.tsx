import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarCategoria } from "@/lib/categorias";
import { buscarLancamento, formatarData, formatarValor } from "@/lib/lancamentos";

// No Next 15, params é uma Promise.
export default async function LancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lancamento = buscarLancamento(Number(id));

  if (!lancamento) notFound();

  const categoria =
    lancamento.categoriaId !== undefined ? buscarCategoria(lancamento.categoriaId) : undefined;

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
        {categoria ? <Link href={`/categoria/${categoria.id}`}>{categoria.nome}</Link> : "Sem categoria"}
      </p>
    </>
  );
}
