import Link from "next/link";
import { notFound } from "next/navigation";
import LancamentoCard from "@/components/LancamentoCard";
import { buscarCategoria } from "@/lib/categorias";
import { listarLancamentosPorCategoria } from "@/lib/lancamentos";

// No Next 15, params é uma Promise.
export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoria = buscarCategoria(Number(id));

  if (!categoria) notFound();

  const lancamentos = listarLancamentosPorCategoria(categoria.id);

  return (
    <>
      <p>
        <Link href="/categorias">← Voltar</Link>
      </p>
      <h1>{categoria.nome}</h1>
      <p>{categoria.descricao}</p>

      <h2>Lançamentos</h2>
      {lancamentos.length === 0 ? (
        <p className="muted">Nenhum lançamento nesta categoria.</p>
      ) : (
        <ul className="lista">
          {lancamentos.map((l) => (
            <LancamentoCard
              key={l.id}
              id={l.id}
              descricao={l.descricao}
              valor={l.valor}
              tipo={l.tipo}
              data={l.data}
            />
          ))}
        </ul>
      )}
    </>
  );
}
