"use client";

import { useEffect, useState } from "react";

// Aviso de sucesso que some sozinho. O ?aviso=... da URL é removido logo ao aparecer,
// para não reaparecer se a página for recarregada.
export default function Aviso({ mensagem }: { mensagem: string }) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
    const timer = setTimeout(() => setVisivel(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visivel) return null;

  return (
    <div role="status" className="aviso">
      <span>{mensagem}</span>
      <button type="button" className="aviso-fechar" aria-label="Fechar aviso" onClick={() => setVisivel(false)}>
        ×
      </button>
    </div>
  );
}
