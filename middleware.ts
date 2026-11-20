import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes das rotas privadas: renova a sessão e manda quem não está logado para /login.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valida o token no Supabase (getSession() só leria o cookie, sem validar).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Guarda a página pedida para voltar a ela depois do login.
    const destino = request.nextUrl.pathname + request.nextUrl.search;
    url.search = "";
    url.searchParams.set("next", destino);
    return NextResponse.redirect(url);
  }

  return response;
}

// Só as rotas privadas passam pelo middleware; "/", "/login" e arquivos estáticos ficam de fora.
export const config = {
  matcher: [
    "/lancamentos/:path*",
    "/categorias/:path*",
    "/categoria/:path*",
    "/dashboard/:path*",
  ],
};
