import Link from "next/link";

export default function CategoriaNaoEncontrada() {
  return (
    <>
      <h1>Categoria não encontrada</h1>
      <p>Não existe categoria com esse número.</p>
      <Link href="/categorias">Voltar para a lista</Link>
    </>
  );
}
