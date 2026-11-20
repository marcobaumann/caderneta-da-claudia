import type { Metadata } from "next";
import Link from "next/link";
import CartaoNumero from "@/components/CartaoNumero";
import GraficoSaidas from "@/components/GraficoSaidas";
import { exigirUsuario } from "@/lib/auth";
import { evolucaoDeSaidas, maioresCategoriasDeSaida, resumir } from "@/lib/dashboard";
import { formatarData } from "@/lib/formatadores";
import { listarLancamentosPorPeriodo } from "@/lib/lancamentos";
import {
  intervaloDoMes,
  lerMes,
  mesAtual,
  rotuloLongo,
  somarMeses,
  ultimosMeses,
} from "@/lib/periodo";

export const metadata: Metadata = { title: "Dashboard" };

const MESES_NO_GRAFICO = 6;
const CATEGORIAS_NO_RANKING = 5;

// Server Component: o período vem de /dashboard?mes=AAAA-MM (padrão: mês atual) e é lido aqui.
// Os números são montados no servidor; só o gráfico de barras é Client Component.
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  await exigirUsuario();

  const { mes: mesDaUrl } = await searchParams;
  const mesValido = lerMes(mesDaUrl);
  const hoje = mesAtual();
  const mes = mesValido ?? hoje;

  const periodo = intervaloDoMes(mes);
  const meses = ultimosMeses(mes, MESES_NO_GRAFICO);

  // As duas buscas não dependem uma da outra: rodam em paralelo.
  // 1) todos os lançamentos do mês escolhido (cards e ranking);
  // 2) só as saídas dos últimos meses até ele, para a evolução mês a mês.
  const [doMes, saidasDosMeses] = await Promise.all([
    listarLancamentosPorPeriodo(periodo.inicio, periodo.fim),
    listarLancamentosPorPeriodo(intervaloDoMes(meses[0]).inicio, periodo.fim, "saida"),
  ]);

  const evolucao = evolucaoDeSaidas(saidasDosMeses, meses);
  const temEvolucao = evolucao.some((ponto) => ponto.total > 0);

  const resumo = resumir(doMes);
  const categorias = maioresCategoriasDeSaida(doMes, CATEGORIAS_NO_RANKING);
  const textoPeriodo = `${formatarData(periodo.inicio)} a ${formatarData(periodo.fim)}`;

  return (
    <>
      <h1>Dashboard</h1>

      <div className="periodo">
        <Link href={`/dashboard?mes=${somarMeses(mes, -1)}`} className="botao secundario">
          ← Anterior
        </Link>
        <form method="get" className="periodo-form">
          <input type="month" name="mes" defaultValue={mes} max={hoje} aria-label="Mês" required />
          <button type="submit">Ver</button>
        </form>
        {mes < hoje && (
          <Link href={`/dashboard?mes=${somarMeses(mes, 1)}`} className="botao secundario">
            Próximo →
          </Link>
        )}
      </div>

      <h2 className="periodo-titulo">{rotuloLongo(mes)}</h2>
      {mesDaUrl !== undefined && mesValido === null && (
        <p className="muted">Período inválido na URL; mostrando o mês atual.</p>
      )}

      {doMes.length === 0 ? (
        <p className="muted vazio">Nenhum lançamento em {rotuloLongo(mes)}.</p>
      ) : (
        <>
          <div className="cartoes">
            <CartaoNumero titulo="Entradas do mês" valor={resumo.entradas} rodape={textoPeriodo} tom="entrada" />
            <CartaoNumero titulo="Saídas do mês" valor={resumo.saidas} rodape={textoPeriodo} tom="saida" />
            <CartaoNumero
              titulo="Resultado do mês"
              valor={resumo.resultado}
              rodape={textoPeriodo}
              tom={resumo.resultado >= 0 ? "entrada" : "saida"}
            />
          </div>

          <h2>Categorias que mais gastaram</h2>
          {categorias.length === 0 ? (
            <p className="muted">Nenhuma saída neste mês.</p>
          ) : (
            <ol className="cartoes cartoes-ranking">
              {categorias.map((c, i) => (
                <li key={c.categoriaId ?? "sem-categoria"}>
                  <CartaoNumero
                    titulo={`${i + 1}º · ${c.nome}`}
                    valor={c.total}
                    rodape={`Último gasto em ${formatarData(c.ultimaData)}`}
                    tom="saida"
                  />
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {temEvolucao && (
        <>
          <h2>Saídas mês a mês</h2>
          <GraficoSaidas pontos={evolucao} mesSelecionado={mes} />
        </>
      )}
    </>
  );
}
