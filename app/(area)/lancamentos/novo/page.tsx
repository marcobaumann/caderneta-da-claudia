import type { Metadata } from "next";
import Link from "next/link";
import LancamentoForm from "@/components/LancamentoForm";
import { exigirUsuario } from "@/lib/auth";
import { listarCategorias } from "@/lib/categorias";
import { listarContas } from "@/lib/contas";
import { criarLancamento } from "../actions";

export const metadata: Metadata = { title: "Novo lançamento" };

export default async function NovoLancamentoPage() {
  await exigirUsuario();
  const [contas, categorias] = await Promise.all([listarContas(), listarCategorias()]);

  // Data de hoje no fuso do Brasil (o servidor pode estar em UTC). "sv-SE" formata como AAAA-MM-DD.
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

  return (
    <>
      <p>
        <Link href="/lancamentos">← Voltar</Link>
      </p>
      <h1>Novo lançamento</h1>
      <LancamentoForm
        acao={criarLancamento}
        valoresIniciais={{
          descricao: "",
          valor: "",
          tipo: "saida",
          data: hoje,
          contaId: "",
          categoriaId: "",
        }}
        contas={contas}
        categorias={categorias}
        rotuloBotao="Salvar lançamento"
      />
    </>
  );
}
