import { Product } from "../Product";
import { QuoteItem } from "./QuoteItem";
import { RequisitionItemAttachment } from "./RequisitionItemAttachment";

export interface RequisitionItem {
    id_item_requisicao: number;
    quantidade: number;
    quantidade_solicitada?: number | null;
    quantidade_estoque?: number | null;
    target_price: number | null;
    quantidade_alterada?: number;
    id_requisicao: number;
    id_produto: number;
    observacao: string | null;
    ativo: number;
    oc: string | null;
    data_entrega: string | null;
    quantidade_disponivel: number;
    id_item_cotacao?: number;
    items_cotacao ? : Partial<QuoteItem[]>;
    quantidade_atendida?: number;
    anexos? : RequisitionItemAttachment[];
    produto?: Product
    produto_descricao?: string;
    produto_codigo?: string;
    produto_unidade?: string;
    produto_quantidade_estoque?: number;
    produto_quantidade_disponivel?: number;
    perm_ti?:number
    perm_operacional?:number
    perm_faturamento_direto?:number
    perm_faturamento_dse?:number
}
