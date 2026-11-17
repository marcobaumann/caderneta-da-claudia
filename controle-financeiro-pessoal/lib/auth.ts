import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// cache() do React: várias chamadas na mesma requisição (página, layout, componentes)
// fazem só uma ida ao Supabase.
export const obterUsuario = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// usuario_id (INTEGER do schema) do login atual, via usuarios.auth_id.
// null se não há login ou se o login ainda não foi ligado a uma linha de usuarios.
export const obterUsuarioId = cache(async (): Promise<number | null> => {
  const user = await obterUsuario();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("usuario_id")
    .eq("auth_id", user.id)
    .maybeSingle<{ usuario_id: number }>();

  if (error) throw new Error(`Falha ao buscar o usuário: ${error.message}`);
  return data?.usuario_id ?? null;
});

// Para páginas privadas: devolve o usuário logado ou manda para /login.
// O middleware já barra antes; esta é a segunda barreira, perto do dado.
export async function exigirUsuario() {
  const user = await obterUsuario();
  if (!user) redirect("/login");
  return user;
}
