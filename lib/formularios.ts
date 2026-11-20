import { revalidatePath } from "next/cache";

// Helpers compartilhados pelas Server Actions de lançamentos e categorias.

// Formato mínimo do estado devolvido por uma action (cada formulário acrescenta os seus campos).
export type EstadoAcao = { erro?: string };

export const ERRO_GENERICO = "Não foi possível salvar agora. Tente novamente.";
export const ERRO_SESSAO = "Não foi possível identificar o seu usuário. Entre novamente.";

// Códigos de erro do Postgres.
export const POSTGRES_FK_VIOLADA = "23503";
export const POSTGRES_NOME_REPETIDO = "23505";

export function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

// Lançamentos e categorias aparecem em várias telas (listas, detalhes, dashboard e os selects
// dos formulários), então qualquer mudança invalida o app inteiro em vez de uma rota por vez.
export function atualizarTudo() {
  revalidatePath("/", "layout");
}
