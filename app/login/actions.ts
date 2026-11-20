"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { erro?: string; aviso?: string; email?: string };

// Só aceita caminhos internos ("/algo"), nunca URLs externas ("//site.com", "/\site.com").
function destinoSeguro(valor: FormDataEntryValue | null): string {
  if (typeof valor !== "string") return "/lancamentos";
  const interno = valor.startsWith("/") && !valor.startsWith("//") && !valor.startsWith("/\\");
  return interno ? valor : "/lancamentos";
}

// Uma action para os dois botões do formulário: o campo "modo" diz se é entrar ou cadastrar.
export async function autenticar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const modo = formData.get("modo");
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email.includes("@")) return { erro: "Informe um e-mail válido.", email };
  if (senha.length < 6) return { erro: "A senha precisa ter pelo menos 6 caracteres.", email };

  const supabase = await createClient();

  if (modo === "cadastrar") {
    const origem = (await headers()).get("origin");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: origem ? `${origem}/auth/confirm` : undefined },
    });
    if (error) return { erro: `Não foi possível criar a conta: ${error.message}`, email };
    if (!data.session) {
      // Confirmação de e-mail ligada: ainda não há sessão.
      return { aviso: "Cadastro feito! Confirme pelo e-mail que enviamos e depois entre.", email };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { erro: "E-mail ou senha incorretos.", email };
  }

  // redirect() lança uma exceção interna do Next: precisa ficar fora de try/catch.
  redirect(destinoSeguro(formData.get("next")));
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
