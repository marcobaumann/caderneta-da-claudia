import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <h1>Página não encontrada</h1>
      <p>O que você procurou não existe.</p>
      <Link href="/">Voltar ao início</Link>
    </main>
  );
}
