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
      <span className={`valor ${tipo}`}>
        {sinal} {formatarValor(valor)}
      </span>
    </li>
  );
}
