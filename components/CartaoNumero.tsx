import { formatarValor } from "@/lib/formatadores";

type CartaoNumeroProps = {
  titulo: string;
  valor: number; // mostrado em reais
  // Linha de apoio abaixo do valor, ex.: o período ou uma data já formatada (dd/mm/aaaa).
  rodape?: string;
  tom?: "entrada" | "saida" | "neutro";
};

// Card reutilizável do dashboard: um título, um valor em reais e uma linha de apoio.
export default function CartaoNumero({ titulo, valor, rodape, tom = "neutro" }: CartaoNumeroProps) {
  return (
    <div className="cartao-numero">
      <span className="muted">{titulo}</span>
      <strong className={`cartao-valor valor ${tom}`}>{formatarValor(valor)}</strong>
      {rodape && <span className="muted">{rodape}</span>}
    </div>
  );
}
