import Link from "next/link";

// Layout da área interna: vale para /lancamentos e /dashboard.
// O grupo de rota "(area)" não aparece na URL.
export default function AreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="menu">
        <Link href="/">Início</Link>
        <Link href="/lancamentos">Lançamentos</Link>
        <Link href="/categorias">Categorias</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}
