import Link from "next/link";
import { formatarData, formatarValor } from "@/lib/formatadores";
import type { TipoLancamento } from "@/lib/lancamentos";

type LancamentoCardProps = {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  data: string;
  categoriaNome?: string;
};

export default function LancamentoCard({
  id,
  descricao,
  valor,
  tipo,
  data,
  categoriaNome,
}: LancamentoCardProps) {
  const sinal = tipo === "entrada" ? "+" : "-";
  const cor = tipo === "entrada" ? "#15803d" : "#b91c1c";

  return (
    <li className="card">
      <div>
        <Link href={`/lancamentos/${id}`}>
          <strong>{descricao}</strong>
        </Link>
        <div className="muted">
          {formatarData(data)}
          {categoriaNome && ` · ${categoriaNome}`}
        </div>
      </div>
      <span style={{ color: cor, fontWeight: 700 }}>
        {sinal} {formatarValor(valor)}
      </span>
    </li>
  );
}
