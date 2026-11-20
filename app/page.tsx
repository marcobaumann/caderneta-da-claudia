import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>Caderneta da Claudia</h1>
      <p>Controle financeiro pessoal: anote o que entra e o que sai, sem planilha.</p>
      <p>
        <Link href="/lancamentos">Ver meus lançamentos →</Link>
      </p>
    </main>
  );
}
