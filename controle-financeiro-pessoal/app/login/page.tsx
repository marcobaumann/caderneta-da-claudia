import type { Metadata } from "next";
import Link from "next/link";
import BotaoSair from "@/components/BotaoSair";
import LoginForm from "@/components/LoginForm";
import { obterUsuario } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };

type Props = { searchParams: Promise<{ next?: string; erro?: string }> };

// Server Component: mostra o formulário ou, se já há alguém logado, o botão de sair.
export default async function LoginPage({ searchParams }: Props) {
  const [{ next, erro }, user] = await Promise.all([searchParams, obterUsuario()]);

  return (
    <main className="container">
      <h1>Caderneta da Cláudia</h1>

      {erro === "confirmacao" && (
        <p role="alert" className="erro">
          Não foi possível confirmar o e-mail. O link pode ter expirado: crie a conta de novo ou
          tente entrar.
        </p>
      )}

      {user ? (
        <>
          <p>Você está logada como {user.email}.</p>
          <p>
            <Link href="/lancamentos">Ir para os lançamentos</Link>
          </p>
          <BotaoSair />
        </>
      ) : (
        <LoginForm next={next} />
      )}
    </main>
  );
}
