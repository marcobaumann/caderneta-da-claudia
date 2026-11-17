import type { Metadata } from "next";
import Link from "next/link";
import { listarCategorias } from "@/lib/categorias";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriasPage() {
  const categorias = await listarCategorias();

  return (
    <>
      <h1>Categorias</h1>
      {categorias.length === 0 ? (
        <p className="muted">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <ul className="lista">
          {categorias.map((c) => (
            <li key={c.id} className="card">
              <div>
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    marginRight: 8,
                    borderRadius: "50%",
                    background: c.corHex,
                  }}
                />
                <Link href={`/categoria/${c.id}`}>
                  <strong>{c.nome}</strong>
                </Link>
                <div className="muted">{c.tipo === "entrada" ? "Entrada" : "Saída"}</div>
              </div>
              {c.totalLancamentos > 0 && (
                <span className="muted">
                  {c.totalLancamentos} {c.totalLancamentos === 1 ? "lançamento" : "lançamentos"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
