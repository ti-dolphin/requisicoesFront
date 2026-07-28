

export interface RequisitionItemAttachment {
    id_anexo_item_requisicao: number;
    arquivo: string;
    id_item_requisicao: number;
    nome_arquivo: string;
    // 1 = anexo comum, 2 = nota fiscal
    tipo?: number;
}