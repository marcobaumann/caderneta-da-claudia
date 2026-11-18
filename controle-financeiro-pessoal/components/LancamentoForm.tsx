"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoLancamento, ValoresLancamento } from "@/app/(area)/lancamentos/actions";
import type { Categoria } from "@/lib/categorias";
import type { Conta } from "@/lib/contas";

type LancamentoFormProps = {
  // Server Action já pronta (criar, ou editar com o id embutido via .bind).
  acao: (estado: EstadoLancamento, formData: FormData) => Promise<EstadoLancamento>;
  valoresIniciais: ValoresLancamento;
  contas: Conta[];
  categorias: Categoria[];
  rotuloBotao: string;
};

// Client Component só para mostrar o estado pendente e a mensagem de erro da Server Action.
// A gravação em si roda no servidor (app/(area)/lancamentos/actions.ts).
export default function LancamentoForm({
  acao,
  valoresIniciais,
  contas,
  categorias,
  rotuloBotao,
}: LancamentoFormProps) {
  const [estado, formAction, pendente] = useActionState<EstadoLancamento, FormData>(acao, {});
  // Depois de um erro, o formulário volta com o que a pessoa tinha digitado.
  const v = estado.valores ?? valoresIniciais;

  if (contas.length === 0 || categorias.length === 0) {
    return (
      <p role="alert">
        Para lançar, você precisa ter pelo menos uma conta e uma categoria cadastradas.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <p>
        <label>
          Descrição
          <br />
          <input type="text" name="descricao" defaultValue={v.descricao} maxLength={200} required />
        </label>
      </p>
      <p>
        <label>
          Valor (R$)
          <br />
          <input
            type="number"
            name="valor"
            defaultValue={v.valor}
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
          />
        </label>
      </p>
      <p>
        <label>
          Tipo
          <br />
          <select name="tipo" defaultValue={v.tipo || "saida"} required>
            <option value="saida">Saída</option>
            <option value="entrada">Entrada</option>
          </select>
        </label>
      </p>
      <p>
        <label>
          Data
          <br />
          <input type="date" name="data" defaultValue={v.data} required />
        </label>
      </p>
      <p>
        <label>
          Conta
          <br />
          <select name="contaId" defaultValue={v.contaId} required>
            <option value="">Selecione...</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.nome}
              </option>
            ))}
          </select>
        </label>
      </p>
      <p>
        <label>
          Categoria
          <br />
          <select name="categoriaId" defaultValue={v.categoriaId} required>
            <option value="">Selecione...</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome} ({categoria.tipo === "entrada" ? "entrada" : "saída"})
              </option>
            ))}
          </select>
        </label>
      </p>

      {estado.erro && (
        <p role="alert" className="erro">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={pendente}>
        {pendente ? "Salvando..." : rotuloBotao}
      </button>{" "}
      <Link href="/lancamentos">Cancelar</Link>
    </form>
  );
}
