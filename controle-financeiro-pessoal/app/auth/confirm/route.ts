import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino do link de confirmação de e-mail enviado pelo Supabase.
// Aceita os dois formatos: "code" (fluxo PKCE, padrão do template) e "token_hash" + "type".
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let confirmado = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmado = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    confirmado = !error;
  }

  redirect(confirmado ? "/lancamentos" : "/login?erro=confirmacao");
}
