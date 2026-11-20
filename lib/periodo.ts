// Funções puras para trabalhar com meses. Um mês é o texto "AAAA-MM", o mesmo formato de ?mes= na URL.
export type Mes = string;

const FORMATO_MES = /^(\d{4})-(0[1-9]|1[0-2])$/;

const NOMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// Valida o ?mes= da URL. Devolve null para qualquer coisa que não seja um mês real (2000 a 2100).
export function lerMes(valor: string | undefined): Mes | null {
  if (valor === undefined || !FORMATO_MES.test(valor)) return null;
  const ano = Number(valor.slice(0, 4));
  return ano >= 2000 && ano <= 2100 ? valor : null;
}

// Mês de hoje no fuso do Brasil (o servidor pode estar em UTC). "sv-SE" formata como AAAA-MM-DD.
export function mesAtual(): Mes {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 7);
}

function partes(mes: Mes): { ano: number; indice: number } {
  return { ano: Number(mes.slice(0, 4)), indice: Number(mes.slice(5, 7)) - 1 };
}

export function somarMeses(mes: Mes, quantidade: number): Mes {
  const { ano, indice } = partes(mes);
  return new Date(Date.UTC(ano, indice + quantidade, 1)).toISOString().slice(0, 7);
}

// Do primeiro ao último dia do mês, como AAAA-MM-DD.
export function intervaloDoMes(mes: Mes): { inicio: string; fim: string } {
  const { ano, indice } = partes(mes);
  const ultimoDia = new Date(Date.UTC(ano, indice + 1, 0)).getUTCDate();
  return { inicio: `${mes}-01`, fim: `${mes}-${String(ultimoDia).padStart(2, "0")}` };
}

// Os `quantidade` meses que terminam em `mes`, do mais antigo para o mais novo.
export function ultimosMeses(mes: Mes, quantidade: number): Mes[] {
  return Array.from({ length: quantidade }, (_, i) => somarMeses(mes, i - (quantidade - 1)));
}

// "2025-06" -> "jun/25"
export function rotuloCurto(mes: Mes): string {
  const { ano, indice } = partes(mes);
  return `${NOMES[indice].slice(0, 3)}/${String(ano).slice(2)}`;
}

// "2025-06" -> "junho de 2025"
export function rotuloLongo(mes: Mes): string {
  const { ano, indice } = partes(mes);
  return `${NOMES[indice]} de ${ano}`;
}
