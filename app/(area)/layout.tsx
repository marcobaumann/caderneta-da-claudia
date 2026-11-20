import Link from "next/link";
import BotaoSair from "@/components/BotaoSair";

// Layout da área interna: vale para /lancamentos, /categorias e /dashboard.
// O grupo de rota "(area)" não aparece na URL.
export default function AreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="menu">
        <Link href="/">Início</Link>
        <Link href="/lancamentos">Lançamentos</Link>
        <Link href="/categorias">Categorias</Link>
        <Link href="/dashboard">Dashboard</Link>
        <div className="menu-sair">
          <BotaoSair />
        </div>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}
