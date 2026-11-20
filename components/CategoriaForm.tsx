"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoCategoria, ValoresCategoria } from "@/app/(area)/categorias/actions";
import SeletorCor from "@/components/SeletorCor";

type CategoriaFormProps = {
  // Server Action já pronta (criar, ou editar com o id embutido via .bind).
  acao: (estado: EstadoCategoria, formData: FormData) => Promise<EstadoCategoria>;
  valoresIniciais: ValoresCategoria;
  rotuloBotao: string;
  // Categoria com lançamentos não pode mudar de tipo (a action também recusa).
  tipoTravado?: boolean;
};

// Client Component só para mostrar o estado pendente e a mensagem de erro da Server Action.
export default function CategoriaForm({ acao, valoresIniciais, rotuloBotao, tipoTravado = false }: CategoriaFormProps) {
  const [estado, formAction, pendente] = useActionState<EstadoCategoria, FormData>(acao, {});
  // Depois de um erro, o formulário volta com o que a pessoa tinha digitado.
  const v = estado.valores ?? valoresIniciais;

  return (
    <form action={formAction}>
      <p>
        <label>
          Nome
          <br />
          <input type="text" name="nome" defaultValue={v.nome} maxLength={50} required />
        </label>
      </p>

      <fieldset className="segmentado" disabled={tipoTravado}>
        <legend>Tipo</legend>
        <label>
          <input type="radio" name="tipo" value="saida" defaultChecked={v.tipo !== "entrada"} />
          <span>Saída</span>
        </label>
        <label>
          <input type="radio" name="tipo" value="entrada" defaultChecked={v.tipo === "entrada"} />
          <span>Entrada</span>
        </label>
        {tipoTravado && (
          <p className="muted">O tipo não pode ser mudado porque a categoria já tem lançamentos.</p>
        )}
      </fieldset>
      {/* Campos desabilitados não são enviados; o valor atual segue num campo oculto. */}
      {tipoTravado && <input type="hidden" name="tipo" value={v.tipo} />}

      <div className="campo">
        <span className="rotulo">Cor</span>
        <SeletorCor name="corHex" valorInicial={v.corHex} />
      </div>

      {estado.erro && (
        <p role="alert" className="erro">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={pendente}>
        {pendente ? "Salvando..." : rotuloBotao}
      </button>{" "}
      <Link href="/categorias">Cancelar</Link>
    </form>
  );
}
