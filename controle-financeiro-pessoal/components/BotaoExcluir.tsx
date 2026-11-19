"use client";

import { useActionState } from "react";
import type { EstadoAcao } from "@/lib/formularios";

type BotaoExcluirProps = {
  // Server Action de exclusão já com o id embutido (.bind na página).
  acao: (estado: EstadoAcao) => Promise<EstadoAcao>;
  // Pergunta mostrada na confirmação, ex.: "Excluir este lançamento?".
  confirmacao: string;
};

// Pede confirmação antes de enviar; se ela cancelar, a Server Action não roda.
export default function BotaoExcluir({ acao, confirmacao }: BotaoExcluirProps) {
  const [estado, formAction, pendente] = useActionState<EstadoAcao>(acao, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`${confirmacao} Essa ação não pode ser desfeita.`)) {
          e.preventDefault();
        }
      }}
    >
      {estado.erro && (
        <p role="alert" className="erro">
          {estado.erro}
        </p>
      )}
      <button type="submit" className="perigo" disabled={pendente}>
        {pendente ? "Excluindo..." : "Excluir"}
      </button>
    </form>
  );
}
