"use client";

import { useId, useState } from "react";

const PALETA = [
  "#E53935", "#F4511E", "#FB8C00", "#FDD835", "#7CB342", "#43A047", "#00897B",
  "#00ACC1", "#1E88E5", "#3949AB", "#8E24AA", "#D81B60", "#6D4C41", "#546E7A",
];

type SeletorCorProps = {
  name: string; // nome do campo enviado no formulário (#RRGGBB)
  valorInicial: string;
};

// Seletor de cor: paleta de cores prontas + uma cor livre (seletor nativo do navegador).
// A paleta usa radios nativos (Tab entra no grupo, setas trocam de cor, leitor de tela anuncia
// "1 de 14"). O valor escolhido vai num campo oculto, então funciona direto com a Server Action.
export default function SeletorCor({ name, valorInicial }: SeletorCorProps) {
  const [cor, setCor] = useState(valorInicial.toUpperCase());
  const grupo = useId();
  const livre = !PALETA.includes(cor);

  return (
    <div className="seletor-cor">
      <input type="hidden" name={name} value={cor} />

      <div role="radiogroup" aria-label="Cor da categoria" className="cores">
        {PALETA.map((c) => (
          <label
            key={c}
            className={`cor${c === cor ? " ativa" : ""}`}
            style={{ background: c }}
            title={c}
          >
            <input
              type="radio"
              name={`${grupo}-paleta`}
              value={c}
              checked={c === cor}
              onChange={() => setCor(c)}
              aria-label={c}
            />
          </label>
        ))}

        <label
          className={`cor cor-livre${livre ? " ativa" : ""}`}
          style={livre ? { background: cor } : undefined}
          title="Escolher outra cor"
        >
          <input
            type="color"
            value={cor.toLowerCase()}
            onChange={(e) => setCor(e.target.value.toUpperCase())}
            aria-label="Escolher outra cor"
          />
        </label>
      </div>

      <div className="cor-previa">
        <span className="cor-amostra" style={{ background: cor }} aria-hidden />
        <span>{cor}</span>
      </div>
    </div>
  );
}
