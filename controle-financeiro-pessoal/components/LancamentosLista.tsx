"use client";

import { useState } from "react";
import LancamentoCard from "@/components/LancamentoCard";
import type { Lancamento } from "@/lib/lancamentos";

type Filtro = "todos" | "entrada" | "saida";

// Cada clique no botão passa para o próximo filtro: tudo → entradas → saídas → tudo.
const PROXIMO: Record<Filtro, Filtro> = {
  todos: "entrada",
  entrada: "saida",
  saida: "todos",
};

const ROTULO: Record<Filtro, string> = {
  todos: "Mostrando: tudo",
  entrada: "Mostrando: só entradas",
  saida: "Mostrando: só saídas",
};

export default function LancamentosLista({ lancamentos }: { lancamentos: Lancamento[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const termo = busca.trim().toLowerCase();
  const visiveis = lancamentos.filter(
    (l) =>
      (filtro === "todos" || l.tipo === filtro) && l.descricao.toLowerCase().includes(termo),
  );

  return (
    <>
      <div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Filtrar por descrição"
          aria-label="Filtrar por descrição"
        />{" "}
        <button type="button" onClick={() => setFiltro(PROXIMO[filtro])}>
          {ROTULO[filtro]}
        </button>
      </div>

      {visiveis.length === 0 ? (
        <p className="muted">Nenhum lançamento encontrado.</p>
      ) : (
        <ul className="lista">
          {visiveis.map((l) => (
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
