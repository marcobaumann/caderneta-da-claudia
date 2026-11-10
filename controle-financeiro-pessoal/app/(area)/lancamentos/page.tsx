import LancamentoCard from "@/components/LancamentoCard";
import { lancamentos } from "@/lib/lancamentos";

export default function LancamentosPage() {
  return (
    <>
      <h1>Lançamentos</h1>
      <ul className="lista">
        {lancamentos.map((l) => (
          <LancamentoCard
            key={l.id}
            id={l.id}
            descricao={l.descricao}
            valor={l.valor}
            tipo={l.tipo}
            data={l.data}
          />
        ))}
      </ul>
    </>
  );
}
