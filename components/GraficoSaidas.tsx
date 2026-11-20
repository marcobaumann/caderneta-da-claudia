"use client";

import { useState } from "react";
import type { PontoEvolucao } from "@/lib/dashboard";
import { formatarValor } from "@/lib/formatadores";
import type { Mes } from "@/lib/periodo";

type GraficoSaidasProps = {
  pontos: PontoEvolucao[];
  mesSelecionado: Mes; // barra destacada de início
};

// Único Client Component do dashboard: gráfico de barras feito com divs, sem biblioteca.
// O estado guarda qual barra está em destaque (passar o mouse, focar ou tocar troca o valor mostrado).
export default function GraficoSaidas({ pontos, mesSelecionado }: GraficoSaidasProps) {
  const [ativo, setAtivo] = useState<Mes>(mesSelecionado);

  const maior = Math.max(...pontos.map((p) => p.total), 0);
  const destaque = pontos.find((p) => p.mes === ativo) ?? pontos[pontos.length - 1];

  return (
    <div>
      <p className="grafico-destaque" aria-live="polite">
        <strong>{destaque.rotulo}</strong>: {formatarValor(destaque.total)}
      </p>

      <div className="grafico" role="group" aria-label="Saídas mês a mês">
        {pontos.map((p) => {
          const proporcao = maior > 0 ? (p.total / maior) * 100 : 0;
          // Meses com saída nunca ficam invisíveis, mesmo muito menores que o maior.
          const altura = p.total > 0 ? Math.max(proporcao, 2) : 0;

          return (
            <button
              key={p.mes}
              type="button"
              className={`grafico-coluna${p.mes === ativo ? " ativa" : ""}`}
              aria-label={`${p.rotulo}: ${formatarValor(p.total)}`}
              aria-pressed={p.mes === ativo}
              onMouseEnter={() => setAtivo(p.mes)}
              onFocus={() => setAtivo(p.mes)}
              onClick={() => setAtivo(p.mes)}
            >
              <span className="grafico-area">
                <span className="grafico-barra" style={{ height: `${altura}%` }} />
              </span>
              <span className="grafico-rotulo">{p.rotulo}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
