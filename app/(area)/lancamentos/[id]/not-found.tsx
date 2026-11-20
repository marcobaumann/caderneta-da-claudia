import Link from "next/link";

export default function LancamentoNaoEncontrado() {
  return (
    <>
      <h1>Lançamento não encontrado</h1>
      <p>Não existe lançamento com esse número.</p>
      <Link href="/lancamentos">Voltar para a lista</Link>
    </>
  );
}
