import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LancamentoCard from "@/components/LancamentoCard";
import { buscarCategoria } from "@/lib/categorias";
import { lerId } from "@/lib/ids";
import { listarLancamentosPorCategoria } from "@/lib/lancamentos";

export const metadata: Metadata = { title: "Categoria" };

// No Next 15, params é uma Promise.
export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const id = lerId((await params).id);
  if (id === null) notFound();

  // As duas buscas não dependem uma da outra: rodam em paralelo.
  const [categoria, lancamentos] = await Promise.all([
    buscarCategoria(id),
    listarLancamentosPorCategoria(id),
  ]);
  if (!categoria) notFound();

  return (
    <>
      <p>
        <Link href="/categorias">← Voltar</Link>
      </p>
      <h1>{categoria.nome}</h1>
      <p>
        <Link href={`/categoria/${categoria.id}/editar`}>Editar</Link>
      </p>
      <p className="muted">{categoria.tipo === "entrada" ? "Entrada" : "Saída"}</p>

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
