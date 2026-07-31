import { AlinhamentoItem } from "./OpportunityAlinhamento";

export interface AlinhamentoConfigPessoa {
  pessoa: { CODPESSOA: number; NOME: string };
  id_alinhamento: number | null;
  itens: AlinhamentoItem[];
}
