import Link from "next/link";
import { categorias } from "@/lib/categorias";
import { contarLancamentosPorCategoria } from "@/lib/lancamentos";

export default function CategoriasPage() {
  return (
    <>
      <h1>Categorias</h1>
      <ul className="lista">
        {categorias.map((c) => {
          const total = contarLancamentosPorCategoria(c.id);
          return (
            <li key={c.id} className="card">
              <div>
                <Link href={`/categoria/${c.id}`}>
                  <strong>{c.nome}</strong>
                </Link>
                <div className="muted">{c.descricao}</div>
              </div>
              {total > 0 && (
                <span className="muted">
                  {total} {total === 1 ? "lançamento" : "lançamentos"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
