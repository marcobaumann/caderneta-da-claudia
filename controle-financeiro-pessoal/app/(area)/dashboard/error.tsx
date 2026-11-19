"use client";

// Error boundary da rota /dashboard: aparece se a busca de dados falhar.
// Precisa ser Client Component (exigência do Next) por receber o `reset`.
export default function DashboardErro({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <h1>Dashboard</h1>
      <p role="alert" className="erro">
        Não foi possível carregar o dashboard. Tente novamente.
      </p>
      <button type="button" onClick={() => reset()}>
        Tentar de novo
      </button>
    </>
  );
}
