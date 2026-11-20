import { sair } from "@/app/login/actions";

// Server Component: o formulário chama a Server Action direto, sem JavaScript no cliente.
export default function BotaoSair() {
  return (
    <form action={sair}>
      <button type="submit">Sair</button>
    </form>
  );
}
