"use client";

import { useState } from "react";
import LancamentoCard from "@/components/LancamentoCard";
import { formatarValor } from "@/lib/formatadores";
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

// Minúsculas e sem acentos: "Salário" e "salario" passam a ser equivalentes na busca.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default function LancamentosLista({ lancamentos }: { lancamentos: Lancamento[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const termo = normalizar(busca.trim());
  const visiveis = lancamentos.filter(
    (l) => (filtro === "todos" || l.tipo === filtro) && normalizar(l.descricao).includes(termo),
  );

  // Saldo dos itens visíveis: entradas somam, saídas subtraem.
  // Soma em centavos para evitar erros de ponto flutuante.
  const totalCentavos = visiveis.reduce(
    (soma, l) => soma + (l.tipo === "entrada" ? 1 : -1) * Math.round(l.valor * 100),
    0,
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
        <p className="muted">
          {lancamentos.length === 0
            ? "Nenhum lançamento cadastrado ainda."
            : "Nenhum lançamento corresponde ao filtro."}
        </p>
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
              categoriaNome={l.categoriaNome}
            />
          ))}
        </ul>
      )}

      {visiveis.length > 0 && (
        <p>
          <strong>Total: {formatarValor(totalCentavos / 100)}</strong>
        </p>
      )}
    </>
  );
}
