"use client";

// Error boundary da rota /lancamentos: aparece se a busca de dados falhar.
// Precisa ser Client Component (exigência do Next) por receber o `reset`.
export default function LancamentosErro({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <h1>Lançamentos</h1>
      <p>Não foi possível carregar os lançamentos. Tente novamente.</p>
      <button type="button" onClick={() => reset()}>
        Tentar de novo
      </button>
    </>
  );
}
