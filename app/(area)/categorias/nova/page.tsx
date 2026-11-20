import type { Metadata } from "next";
import Link from "next/link";
import CategoriaForm from "@/components/CategoriaForm";
import { exigirUsuario } from "@/lib/auth";
import { criarCategoria } from "../actions";

export const metadata: Metadata = { title: "Nova categoria" };

export default async function NovaCategoriaPage() {
  await exigirUsuario();

  return (
    <>
      <p>
        <Link href="/categorias">← Voltar</Link>
      </p>
      <h1>Nova categoria</h1>
      <CategoriaForm
        acao={criarCategoria}
        valoresIniciais={{ nome: "", tipo: "saida", corHex: "#1E88E5" }}
        rotuloBotao="Salvar categoria"
      />
    </>
  );
}
