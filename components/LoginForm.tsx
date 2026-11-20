"use client";

import { useActionState } from "react";
import { autenticar, type EstadoLogin } from "@/app/login/actions";

// Client Component só para mostrar o estado pendente e as mensagens da Server Action.
// A autenticação em si roda no servidor (app/login/actions.ts).
export default function LoginForm({ next }: { next?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(autenticar, {});

  return (
    <form action={acao}>
      <h2>Entrar ou criar conta</h2>
      {next && <input type="hidden" name="next" value={next} />}

      <p>
        <label>
          E-mail
          <br />
          <input
            type="email"
            name="email"
            defaultValue={estado.email}
            autoComplete="email"
            required
          />
        </label>
      </p>
      <p>
        <label>
          Senha
          <br />
          <input
            type="password"
            name="senha"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>
      </p>

      {estado.erro && (
        <p role="alert" className="erro">
          {estado.erro}
        </p>
      )}
      {estado.aviso && <p role="status">{estado.aviso}</p>}

      {/* O botão clicado envia name="modo" junto com o formulário. */}
      <button type="submit" name="modo" value="entrar" disabled={pendente}>
        {pendente ? "Aguarde..." : "Entrar"}
      </button>{" "}
      <button type="submit" name="modo" value="cadastrar" className="secundario" disabled={pendente}>
        Criar conta
      </button>
    </form>
  );
}
