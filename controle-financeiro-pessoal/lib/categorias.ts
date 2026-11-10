import categoriasJson from "./categorias.json";

export type Categoria = {
  id: number;
  nome: string;
  descricao: string;
};

// Lista fixa de exemplo, vinda de um JSON (ainda sem banco de dados).
export const categorias: Categoria[] = categoriasJson;

export function buscarCategoria(id: number): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}
