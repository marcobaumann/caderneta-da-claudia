"use client";

import { useActionState } from "react";
import type { EstadoLancamento } from "@/app/(area)/lancamentos/actions";

type BotaoExcluirProps = {
  // Server Action de exclusão já com o id embutido (.bind na página).
  acao: (estado: EstadoLancamento) => Promise<EstadoLancamento>;
};

// Pede confirmação antes de enviar; se ela cancelar, a Server Action não roda.
export default function BotaoExcluir({ acao }: BotaoExcluirProps) {
  const [estado, formAction, pendente] = useActionState<EstadoLancamento>(acao, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Excluir este lançamento? Essa ação não pode ser desfeita.")) {
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
