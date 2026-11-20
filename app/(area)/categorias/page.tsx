import type { Metadata } from "next";
import Link from "next/link";
import Aviso from "@/components/Aviso";
import { listarCategorias } from "@/lib/categorias";

export const metadata: Metadata = { title: "Categorias" };

const AVISOS: Record<string, string> = {
  criada: "Categoria cadastrada com sucesso!",
  editada: "Categoria atualizada com sucesso!",
  excluida: "Categoria excluída com sucesso!",
};

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  // Só mensagens conhecidas: um ?aviso=qualquer-coisa na URL não mostra nada.
  const mensagem = aviso !== undefined && Object.hasOwn(AVISOS, aviso) ? AVISOS[aviso] : undefined;
  const categorias = await listarCategorias();

  return (
    <>
      {mensagem && <Aviso mensagem={mensagem} />}
      <h1>Categorias</h1>
      <p>
        <Link href="/categorias/nova" className="botao">
          + Nova categoria
        </Link>
      </p>
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
